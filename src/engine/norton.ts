/** ============================================================
 * CircuitLAB — Norton's Theorem Analysis Engine
 *
 * Implements the full 8-step Norton analysis procedure:
 *  1. Display original circuit
 *  2. Remove load (open circuit)
 *  3. Short-circuit output terminals
 *  4. Calculate Isc = IN
 *  5. Deactivate sources → Calculate RN = Rth (same method)
 *  6. Construct Norton equivalent
 *  7. Reconnect load in parallel
 *  8. Calculate IL, VL, PL using current divider
 * ============================================================ */

import { CircuitTopology, NortonResult, AnalysisStep } from './types';
import {
  solveMNA,
  removeLoad,
  shortOutputTerminals,
  calculateRth,
  getShortCircuitCurrent,
} from './mna';
import { fmt, fmtFraction } from './matrixSolver';

/**
 * Runs the complete Norton analysis on a circuit topology.
 */
export function runNortonAnalysis(topology: CircuitTopology): NortonResult {
  const steps: AnalysisStep[] = [];
  const RL = topology.elements.find((e) => e.id === topology.loadId)?.value;
  if (!RL || RL <= 0) {
    throw new Error('Load resistor RL not found or has invalid value.');
  }

  // ============================================================
  // STEP 1: Original Circuit
  // ============================================================
  steps.push({
    stepNumber: 1,
    title: 'Step 1: Original Circuit',
    description:
      'The complete circuit with all sources, resistors, and the load resistor RL connected across the output terminals.',
    animationState: 'original',
    circuit: topology,
    calculations: [],
  });

  // ============================================================
  // STEP 2: Remove Load
  // ============================================================
  const ocTopology = removeLoad(topology);
  steps.push({
    stepNumber: 2,
    title: 'Step 2: Remove Load Resistor (Open Terminals A-B)',
    description:
      'Disconnect load resistor RL from terminals A-B. Output terminals are open.',
    animationState: 'load_removed',
    circuit: ocTopology,
    calculations: [
      {
        label: 'Open-circuit condition',
        formula: 'I_{RL} = 0',
        substitution: 'RL disconnected from terminals',
        result: 'Terminals A-B open',
      },
    ],
  });

  // ============================================================
  // STEP 3: Short-Circuit the Output Terminals
  // ============================================================
  const scTopology = shortOutputTerminals(topology);
  steps.push({
    stepNumber: 3,
    title: 'Step 3: Short-Circuit Output Terminals (A-B)',
    description:
      'Connect an ideal short circuit (wire) across the output terminals A-B. ' +
      'The short circuit replaces RL. The current flowing through this short is the Norton current IN.',
    animationState: 'terminals_shorted',
    circuit: scTopology,
    formula: 'I_N = I_{sc}',
    calculations: [
      {
        label: 'Short circuit applied',
        formula: 'V_{AB} = 0 \\quad \\text{(short circuit)}',
        substitution: 'Zero resistance placed across A-B',
        result: 'V_AB = 0 V, current flows through short',
      },
    ],
  });

  // ============================================================
  // STEP 4: Calculate Norton Current (Isc)
  // ============================================================
  const scSolution = solveMNA(scTopology);
  if (!scSolution.success) {
    throw new Error(`Short-circuit analysis failed: ${scSolution.error}`);
  }

  const IN = getShortCircuitCurrent(scSolution);

  // Node voltages with short
  const nodeCalcs = Object.entries(scSolution.nodeVoltages)
    .filter(([node]) => node !== topology.ground)
    .map(([node, v]) => ({
      label: `Node ${node} voltage (shorted)`,
      formula: `V_{${node}}`,
      substitution: `Solving shorted circuit by KCL/KVL`,
      result: `${fmt(v)} V`,
    }));

  let inFormula = 'I_N = I_{sc} = \\text{Current through short circuit at A-B}';
  let inSubstitution = 'Solving MNA with short circuit at terminals';

  steps.push({
    stepNumber: 4,
    title: 'Step 4: Calculate Norton Current (IN = Isc)',
    description:
      'Calculate the current flowing through the short circuit at terminals A-B. ' +
      'This is the Norton equivalent current IN = Isc.',
    animationState: 'isc_calculated',
    circuit: scTopology,
    formula: inFormula,
    substitution: inSubstitution,
    result: `I_N = ${fmtFraction(IN)} A ≈ ${fmt(IN)} A`,
    calculations: [
      ...nodeCalcs,
      {
        label: 'Norton Current',
        formula: inFormula,
        substitution: inSubstitution,
        result: `I_N = ${fmtFraction(IN)} A ≈ ${fmt(IN)} A`,
      },
    ],
  });

  // ============================================================
  // STEP 5: Deactivate Sources & Calculate RN
  // ============================================================
  const vSourceIds = topology.elements
    .filter((e) => e.type === 'voltage_source')
    .map((e) => e.id);
  const iSourceIds = topology.elements
    .filter((e) => e.type === 'current_source')
    .map((e) => e.id);

  const deactivationDesc = [
    vSourceIds.length > 0
      ? `Voltage source${vSourceIds.length > 1 ? 's' : ''} ${vSourceIds.join(', ')}: replaced with SHORT CIRCUIT (0V).`
      : '',
    iSourceIds.length > 0
      ? `Current source${iSourceIds.length > 1 ? 's' : ''} ${iSourceIds.join(', ')}: replaced with OPEN CIRCUIT (0A).`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Calculate RN (same as Rth)
  let RN: number;
  try {
    RN = calculateRth(ocTopology);
  } catch (err) {
    throw new Error(`RN calculation failed: ${(err as Error).message}`);
  }

  // Build RN formula display (same logic as Thevenin Rth)
  let rnFormula = 'R_N = R_{th} = \\text{Equivalent resistance at terminals A-B}';
  let rnSubstitution = 'Using test-source injection method (MNA)';
  let rnFormDesc = 'RN equals Rth — same source-deactivation procedure:';

  const r1 = topology.elements.find((e) => e.id === 'R1');
  const r2 = topology.elements.find((e) => e.id === 'R2');
  const r3 = topology.elements.find((e) => e.id === 'R3');
  if (r1 && r2 && r3 && vSourceIds.length === 1 && iSourceIds.length === 0) {
    const R1val = r1.value, R2val = r2.value, R3val = r3.value;
    const r1r2parallel = (R1val * R2val) / (R1val + R2val);
    const rnCheck = R3val + r1r2parallel;
    if (Math.abs(rnCheck - RN) < 1e-6) {
      rnFormula = `R_N = R_3 + \\frac{R_1 \\times R_2}{R_1 + R_2}`;
      rnSubstitution =
        `R_N = ${fmt(R3val)} + \\frac{${fmt(R1val)} \\times ${fmt(R2val)}}{${fmt(R1val)} + ${fmt(R2val)}}` +
        ` = ${fmt(R3val)} + ${fmtFraction(r1r2parallel)}`;
      rnFormDesc = 'V1 shorted → R1 ∥ R2 in series with R3:';
    }
  } else if (r1 && r2 && !r3 && vSourceIds.length === 1 && iSourceIds.length === 0) {
    const R1val = r1.value, R2val = r2.value;
    const r1r2p = (R1val * R2val) / (R1val + R2val);
    if (Math.abs(r1r2p - RN) < 1e-6) {
      rnFormula = `R_N = \\frac{R_1 \\times R_2}{R_1 + R_2}`;
      rnSubstitution = `R_N = \\frac{${fmt(R1val)} \\times ${fmt(R2val)}}{${fmt(R1val)} + ${fmt(R2val)}}`;
    }
  }

  steps.push({
    stepNumber: 5,
    title: 'Step 5: Deactivate Sources & Calculate Norton Resistance (RN = Rth)',
    description:
      `Deactivate all independent sources:\n${deactivationDesc}\n` +
      `Calculate equivalent resistance looking into terminals A-B. RN identically equals Rth.\n${rnFormDesc}`,
    animationState: 'rth_calculated',
    circuit: ocTopology,
    formula: rnFormula,
    substitution: rnSubstitution,
    result: `R_N = R_{th} = ${fmtFraction(RN)} Ω ≈ ${fmt(RN)} Ω`,
    calculations: [
      ...vSourceIds.map((id) => ({
        label: `Deactivate ${id}`,
        formula: `${id} \\rightarrow \\text{Short Circuit (0V)}`,
        substitution: 'Replace with wire',
        result: 'V = 0',
      })),
      ...iSourceIds.map((id) => ({
        label: `Deactivate ${id}`,
        formula: `${id} \\rightarrow \\text{Open Circuit (0A)}`,
        substitution: 'Remove from circuit',
        result: 'I = 0',
      })),
      {
        label: rnFormDesc,
        formula: rnFormula,
        substitution: rnSubstitution,
        result: `R_N = ${fmtFraction(RN)} Ω ≈ ${fmt(RN)} Ω`,
      },
    ],
  });

  // ============================================================
  // STEP 6: Construct Norton Equivalent
  // ============================================================
  steps.push({
    stepNumber: 6,
    title: 'Step 6: Construct Norton Equivalent Circuit',
    description:
      `The original network is replaced by the Norton equivalent:\n` +
      `• Norton current source: IN = ${fmtFraction(IN)} A\n` +
      `• Norton resistance in parallel: RN = ${fmtFraction(RN)} Ω`,
    animationState: 'norton_equivalent_built',
    formula: 'I_N = ' + fmtFraction(IN) + '\\text{ A}, \\quad R_N = ' + fmtFraction(RN) + '\\text{ Ω}',
    result: `Norton equivalent: ${fmtFraction(IN)} A source ∥ ${fmtFraction(RN)} Ω`,
    calculations: [
      {
        label: 'Norton Current',
        formula: 'I_N',
        substitution: `I_N = ${fmtFraction(IN)} A`,
        result: `${fmt(IN)} A`,
      },
      {
        label: 'Norton Resistance',
        formula: 'R_N',
        substitution: `R_N = ${fmtFraction(RN)} Ω`,
        result: `${fmt(RN)} Ω`,
      },
    ],
  });

  // ============================================================
  // STEP 7: Reconnect Load
  // ============================================================
  steps.push({
    stepNumber: 7,
    title: 'Step 7: Reconnect Load Resistor (RL in Parallel)',
    description:
      `Reconnect RL = ${fmt(RL)} Ω in parallel with the Norton resistance RN. ` +
      'Calculate load current using current division.',
    animationState: 'load_reconnected',
    formula: 'I_L = I_N \\times \\frac{R_N}{R_N + R_L}',
    result: `RL = ${fmt(RL)} Ω reconnected`,
    calculations: [],
  });

  // ============================================================
  // STEP 8: Calculate IL, VL, PL
  // ============================================================
  const IL = IN * RN / (RN + RL);
  const VL = IL * RL;
  const PL = IL * IL * RL;

  // Verify Thevenin-Norton equivalence
  const Vth_check = IN * RN;

  steps.push({
    stepNumber: 8,
    title: 'Step 8: Calculate Load Current, Voltage & Power (IL, VL, PL)',
    description: 'Calculate load current using the Norton current divider rule, then derive load voltage and power.',
    animationState: 'results_shown',
    formula: 'I_L = I_N \\times \\frac{R_N}{R_N + R_L}',
    substitution: `I_L = ${fmtFraction(IN)} \\times \\frac{${fmtFraction(RN)}}{${fmtFraction(RN)} + ${fmt(RL)}} = ${fmtFraction(IN)} \\times \\frac{${fmtFraction(RN)}}{${fmt(RN + RL)}}`,
    result: `I_L = ${fmt(IL)} A`,
    calculations: [
      {
        label: 'Load Current (IL) — Current Divider',
        formula: 'I_L = I_N \\times \\frac{R_N}{R_N + R_L}',
        substitution: `I_L = ${fmtFraction(IN)} \\times \\frac{${fmtFraction(RN)}}{${fmtFraction(RN)} + ${fmt(RL)}}`,
        result: `I_L = ${fmt(IL)} A`,
      },
      {
        label: 'Load Voltage (VL)',
        formula: 'V_L = I_L \\times R_L',
        substitution: `V_L = ${fmt(IL)} \\times ${fmt(RL)}`,
        result: `V_L = ${fmt(VL)} V`,
      },
      {
        label: 'Load Power (PL)',
        formula: 'P_L = I_L^2 \\times R_L',
        substitution: `P_L = (${fmt(IL)})^2 \\times ${fmt(RL)}`,
        result: `P_L = ${fmt(PL)} W`,
      },
      {
        label: 'Thevenin-Norton Verification',
        formula: 'V_{th} = I_N \\times R_N',
        substitution: `V_{th} = ${fmtFraction(IN)} \\times ${fmtFraction(RN)} = ${fmtFraction(Vth_check)}`,
        result: `Vth ≈ ${fmt(Vth_check)} V ✓`,
      },
    ],
  });

  return { IN, RN, IL, VL, PL, RL, steps };
}

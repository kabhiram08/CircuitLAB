/** ============================================================
 * CircuitLAB — Thevenin's Theorem Analysis Engine
 *
 * Implements the full 8-step Thevenin analysis procedure:
 *  1. Display original circuit
 *  2. Remove load resistor (open circuit)
 *  3. Calculate Voc = Vth
 *  4. Deactivate independent sources
 *  5. Calculate Rth (test-source method via MNA)
 *  6. Construct Thevenin equivalent
 *  7. Reconnect load
 *  8. Calculate IL, VL, PL
 *
 * All intermediate calculations are shown with formulas.
 * ============================================================ */

import { CircuitTopology, TheveninResult, AnalysisStep } from './types';
import {
  solveMNA,
  removeLoad,
  calculateRth,
  getOutputVoltage,
} from './mna';
import { fmt, fmtFraction } from './matrixSolver';

/**
 * Runs the complete Thevenin analysis on a circuit topology.
 * Returns all steps with formulas and the final result.
 */
export function runTheveninAnalysis(topology: CircuitTopology): TheveninResult {
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
      'The complete circuit with all sources, resistors, and the load resistor RL connected across the output terminals A-B.',
    animationState: 'original',
    circuit: topology,
    calculations: [],
  });

  // ============================================================
  // STEP 2: Remove Load Resistor
  // ============================================================
  const ocTopology = removeLoad(topology);
  steps.push({
    stepNumber: 2,
    title: 'Step 2: Remove Load Resistor (Open Circuit)',
    description:
      'Disconnect the load resistor RL from terminals A-B. The output terminals are now open-circuited. ' +
      'No current flows through RL. The voltage across the open terminals will be measured next.',
    animationState: 'load_removed',
    circuit: ocTopology,
    calculations: [
      {
        label: 'Open-circuit condition',
        formula: 'I_{RL} = 0 \\quad \\text{(terminals open)}',
        substitution: 'No current flows through RL',
        result: 'Terminals A-B are open',
      },
    ],
  });

  // ============================================================
  // STEP 3: Calculate Open-Circuit Voltage (Vth)
  // ============================================================
  const ocSolution = solveMNA(ocTopology);
  if (!ocSolution.success) {
    throw new Error(`Open-circuit analysis failed: ${ocSolution.error}`);
  }

  const Vth = getOutputVoltage(
    ocSolution,
    topology.outputNodePos,
    topology.outputNodeNeg
  );

  // Build node voltage display
  const nodeCalcs = Object.entries(ocSolution.nodeVoltages)
    .filter(([node]) => node !== topology.ground)
    .map(([node, v]) => ({
      label: `Node ${node} voltage`,
      formula: `V_{${node}}`,
      substitution: `Solving circuit by KVL/KCL`,
      result: `${fmt(v)} V`,
    }));

  // For simple voltage-divider cases, show the divider formula
  const hasVS = ocTopology.elements.some((e) => e.type === 'voltage_source');
  const hasCS = ocTopology.elements.some((e) => e.type === 'current_source');

  let vthFormula = 'V_{th} = V_{oc} = V_{A} - V_{B}';
  let vthSubstitution = `V_{th} = V(${topology.outputNodePos}) - V(${topology.outputNodeNeg})`;
  let vthFormDesc = '';

  // Detect voltage divider (circuit 2 special case — show the textbook formula)
  if (topology.elements.filter((e) => e.type === 'voltage_source').length === 1 && !hasCS) {
    // Try to identify divider: find resistors in series path and shunt
    const vs = topology.elements.find((e) => e.type === 'voltage_source')!;
    // Check circuit 2 pattern: VS → R1 → (R2 to GND) → R3 → output
    const r1 = topology.elements.find((e) => e.id === 'R1');
    const r2 = topology.elements.find((e) => e.id === 'R2');
    if (r1 && r2) {
      const VsVal = vs.value;
      const R1val = r1.value;
      const R2val = r2.value;
      const VdividerResult = VsVal * R2val / (R1val + R2val);
      if (Math.abs(VdividerResult - Vth) < 1e-6) {
        vthFormula = `V_{th} = V_S \\times \\frac{R_2}{R_1 + R_2}`;
        vthSubstitution = `V_{th} = ${fmt(VsVal)} \\times \\frac{${fmt(R2val)}}{${fmt(R1val)} + ${fmt(R2val)}} = ${fmt(VsVal)} \\times \\frac{${fmt(R2val)}}{${fmt(R1val + R2val)}}`;
        vthFormDesc = 'Using voltage divider rule (R3 carries no current in open-circuit condition):';
      }
    }
  }

  steps.push({
    stepNumber: 3,
    title: 'Step 3: Calculate Open-Circuit Voltage (Vth = Voc)',
    description:
      'Calculate the voltage across the open terminals A-B. ' +
      'This is the Thevenin equivalent voltage Vth = Voc. ' +
      (hasCS
        ? 'Using KCL/nodal analysis since the circuit contains current sources.'
        : 'Using KVL and Ohm\'s Law.'),
    animationState: 'oc_calculated',
    circuit: ocTopology,
    formula: vthFormula,
    substitution: vthSubstitution,
    result: `V_{th} = ${fmt(Vth)} V = ${fmtFraction(Vth)} V`,
    calculations: [
      ...nodeCalcs,
      {
        label: vthFormDesc || 'Thevenin Voltage',
        formula: vthFormula,
        substitution: vthSubstitution,
        result: `V_{th} = ${fmtFraction(Vth)} V ≈ ${fmt(Vth)} V`,
      },
    ],
  });

  // ============================================================
  // STEP 4 & 5: Deactivate Sources → Calculate Rth
  // ============================================================
  // Determine what sources exist for the deactivation description
  const vSourceIds = topology.elements
    .filter((e) => e.type === 'voltage_source')
    .map((e) => e.id);
  const iSourceIds = topology.elements
    .filter((e) => e.type === 'current_source')
    .map((e) => e.id);

  const deactivationDesc = [
    vSourceIds.length > 0
      ? `Voltage source${vSourceIds.length > 1 ? 's' : ''} ${vSourceIds.join(', ')}: replaced with SHORT CIRCUIT (wire).`
      : '',
    iSourceIds.length > 0
      ? `Current source${iSourceIds.length > 1 ? 's' : ''} ${iSourceIds.join(', ')}: replaced with OPEN CIRCUIT (removed).`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  steps.push({
    stepNumber: 4,
    title: 'Step 4: Deactivate Independent Sources',
    description:
      `To find Rth, all independent sources are deactivated:\n${deactivationDesc}\n` +
      'This leaves only the passive resistor network.',
    animationState: 'sources_deactivated',
    circuit: ocTopology,
    calculations: vSourceIds
      .map((id) => ({
        label: `Deactivate ${id}`,
        formula: `${id} \\rightarrow \\text{Short Circuit (0V)}`,
        substitution: 'Replace voltage source with wire',
        result: 'V = 0, R = 0',
      }))
      .concat(
        iSourceIds.map((id) => ({
          label: `Deactivate ${id}`,
          formula: `${id} \\rightarrow \\text{Open Circuit (0A)}`,
          substitution: 'Remove current source from circuit',
          result: 'I = 0, R = ∞',
        }))
      ),
  });

  // Calculate Rth using test-source method
  let Rth: number;
  try {
    Rth = calculateRth(ocTopology);
  } catch (err) {
    throw new Error(`Rth calculation failed: ${(err as Error).message}`);
  }

  // Build Rth formula display
  const resistors = ocTopology.elements.filter((e) => e.type === 'resistor');
  let rthFormula = 'R_{th} = \\text{Equivalent resistance at terminals A-B}';
  let rthSubstitution = `Inject V_{test} = 1A test current, measure V_{test}: R_{th} = V_{test}/I_{test}`;
  let rthFormDesc = 'Test-source method (MNA with 1A injection):';

  // For circuit 2: show the textbook series-parallel formula
  if (topology.elements.length <= 6) {
    const r1 = topology.elements.find((e) => e.id === 'R1');
    const r2 = topology.elements.find((e) => e.id === 'R2');
    const r3 = topology.elements.find((e) => e.id === 'R3');
    if (r1 && r2 && r3 && vSourceIds.length === 1 && iSourceIds.length === 0) {
      // Circuit 2 pattern: Rth = R3 + (R1 || R2)
      const R1val = r1.value, R2val = r2.value, R3val = r3.value;
      const r1r2parallel = (R1val * R2val) / (R1val + R2val);
      const rthCheck = R3val + r1r2parallel;
      if (Math.abs(rthCheck - Rth) < 1e-6) {
        rthFormula = `R_{th} = R_3 + \\frac{R_1 \\times R_2}{R_1 + R_2}`;
        rthSubstitution =
          `R_{th} = ${fmt(R3val)} + \\frac{${fmt(R1val)} \\times ${fmt(R2val)}}{${fmt(R1val)} + ${fmt(R2val)}}` +
          ` = ${fmt(R3val)} + \\frac{${fmt(R1val * R2val)}}{${fmt(R1val + R2val)}}` +
          ` = ${fmt(R3val)} + ${fmtFraction(r1r2parallel)}`;
        rthFormDesc = 'V1 shorted → R1 ∥ R2 in series with R3:';
      }
    } else if (r1 && r2 && !r3 && vSourceIds.length === 1) {
      // Circuit 1 pattern: Rth = R1 || R2
      const R1val = r1.value, R2val = r2.value;
      const r1r2parallel = (R1val * R2val) / (R1val + R2val);
      if (Math.abs(r1r2parallel - Rth) < 1e-6) {
        rthFormula = `R_{th} = \\frac{R_1 \\times R_2}{R_1 + R_2}`;
        rthSubstitution =
          `R_{th} = \\frac{${fmt(R1val)} \\times ${fmt(R2val)}}{${fmt(R1val)} + ${fmt(R2val)}} = \\frac{${fmt(R1val * R2val)}}{${fmt(R1val + R2val)}}`;
        rthFormDesc = 'V1 shorted → R1 in series with R2 gives parallel combination at terminals:';
      }
    }
  }

  steps.push({
    stepNumber: 5,
    title: 'Step 5: Calculate Thevenin Resistance (Rth)',
    description:
      `With all independent sources deactivated, calculate the equivalent resistance looking into the output terminals.\n${rthFormDesc}`,
    animationState: 'rth_calculated',
    circuit: ocTopology,
    formula: rthFormula,
    substitution: rthSubstitution,
    result: `R_{th} = ${fmtFraction(Rth)} Ω ≈ ${fmt(Rth)} Ω`,
    calculations: [
      ...resistors.map((r) => ({
        label: `${r.id} = ${fmt(r.value)} Ω`,
        formula: `${r.id}`,
        substitution: `${r.id} = ${fmt(r.value)} Ω (unchanged)`,
        result: `${fmt(r.value)} Ω`,
      })),
      {
        label: rthFormDesc,
        formula: rthFormula,
        substitution: rthSubstitution,
        result: `R_{th} = ${fmtFraction(Rth)} Ω ≈ ${fmt(Rth)} Ω`,
      },
    ],
  });

  // ============================================================
  // STEP 6: Construct Thevenin Equivalent
  // ============================================================
  steps.push({
    stepNumber: 6,
    title: 'Step 6: Construct Thevenin Equivalent Circuit',
    description:
      `The original complex network is replaced by its Thevenin equivalent:\n` +
      `• Thevenin voltage source: Vth = ${fmtFraction(Vth)} V\n` +
      `• Thevenin resistance in series: Rth = ${fmtFraction(Rth)} Ω`,
    animationState: 'equivalent_built',
    formula: 'V_{th} = ' + fmtFraction(Vth) + '\\text{ V}, \\quad R_{th} = ' + fmtFraction(Rth) + '\\text{ Ω}',
    result: `Equivalent: ${fmtFraction(Vth)} V source + ${fmtFraction(Rth)} Ω in series`,
    calculations: [
      {
        label: 'Thevenin Voltage',
        formula: 'V_{th}',
        substitution: `V_{th} = ${fmtFraction(Vth)} V`,
        result: `${fmt(Vth)} V`,
      },
      {
        label: 'Thevenin Resistance',
        formula: 'R_{th}',
        substitution: `R_{th} = ${fmtFraction(Rth)} Ω`,
        result: `${fmt(Rth)} Ω`,
      },
    ],
  });

  // ============================================================
  // STEP 7: Reconnect Load
  // ============================================================
  steps.push({
    stepNumber: 7,
    title: 'Step 7: Reconnect Load Resistor (RL)',
    description:
      `Reconnect RL = ${fmt(RL)} Ω across the output terminals of the Thevenin equivalent circuit. ` +
      `The simplified circuit: Vth in series with Rth and RL.`,
    animationState: 'load_reconnected',
    formula: 'I_L = \\frac{V_{th}}{R_{th} + R_L}',
    result: `RL = ${fmt(RL)} Ω reconnected`,
    calculations: [
      {
        label: 'Load Resistance',
        formula: 'R_L',
        substitution: `R_L = ${fmt(RL)} Ω`,
        result: `${fmt(RL)} Ω`,
      },
    ],
  });

  // ============================================================
  // STEP 8: Calculate IL, VL, PL
  // ============================================================
  const IL = Vth / (Rth + RL);
  const VL = IL * RL;
  const PL = IL * IL * RL;

  steps.push({
    stepNumber: 8,
    title: 'Step 8: Calculate Load Current, Voltage & Power (IL, VL, PL)',
    description:
      'Calculate the load current using the Thevenin equivalent circuit, then derive load voltage and power.',
    animationState: 'results_shown',
    formula: 'I_L = \\frac{V_{th}}{R_{th} + R_L}',
    substitution: `I_L = \\frac{${fmtFraction(Vth)}}{${fmtFraction(Rth)} + ${fmt(RL)}} = \\frac{${fmtFraction(Vth)}}{${fmtFraction(Rth + RL)}}`,
    result: `I_L = ${fmt(IL)} A`,
    calculations: [
      {
        label: 'Load Current (IL)',
        formula: 'I_L = \\frac{V_{th}}{R_{th} + R_L}',
        substitution: `I_L = \\frac{${fmtFraction(Vth)}}{${fmtFraction(Rth)} + ${fmt(RL)}} = \\frac{${fmtFraction(Vth)}}{${fmt(Rth + RL)}}`,
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
        substitution: `P_L = (${fmt(IL)})^2 \\times ${fmt(RL)} = ${fmt(IL * IL)} \\times ${fmt(RL)}`,
        result: `P_L = ${fmt(PL)} W`,
      },
    ],
  });

  return { Vth, Rth, IL, VL, PL, RL, steps };
}

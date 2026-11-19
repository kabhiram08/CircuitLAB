/** ============================================================
 * CircuitLAB — Modified Nodal Analysis (MNA) Engine
 *
 * Implements the MNA formulation for DC resistive networks:
 *
 *  [G  B] [v]   [i]
 *  [C  D] [j] = [e]
 *
 * Where:
 *  G = conductance matrix (n×n, n = non-ground nodes)
 *  B = voltage source incidence matrix (n×m, m = voltage sources)
 *  C = B^T (for independent voltage sources)
 *  D = 0 matrix
 *  v = node voltage vector
 *  j = current through voltage sources
 *  i = current injection from current sources
 *  e = voltage source values
 *
 * Supports:
 *  - Independent DC voltage sources
 *  - Independent DC current sources
 *  - Resistors
 *  - Open circuits (infinite resistance — handled by simply not adding an element)
 *  - Short circuits (zero-resistance — treated as V=0 voltage source)
 * ============================================================ */

import { CircuitTopology, MNASolution, CircuitElement } from './types';
import {
  gaussianElimination,
  zeroMatrix,
  zeroVector,
  EPSILON,
} from './matrixSolver';

/**
 * Solves a DC resistive circuit using Modified Nodal Analysis.
 *
 * @param topology - The circuit topology to solve
 * @returns MNASolution with node voltages and branch currents
 */
export function solveMNA(topology: CircuitTopology): MNASolution {
  const { nodes, ground, elements } = topology;

  // --- Build node index map (excluding ground) ---
  const nodeIndex: { [label: string]: number } = {};
  let nIdx = 0;
  for (const n of nodes) {
    if (n !== ground) {
      nodeIndex[n] = nIdx++;
    }
  }
  const numNodes = nIdx; // number of non-ground nodes

  // --- Identify voltage sources (including shorts treated as 0V sources) ---
  const voltageSources = elements.filter(
    (e) => e.type === 'voltage_source' || e.type === 'short'
  );
  const numVS = voltageSources.length;

  // --- Total MNA matrix size ---
  const size = numNodes + numVS;

  if (size === 0) {
    // Trivial circuit: ground only
    return {
      nodeVoltages: { [ground]: 0 },
      branchCurrents: {},
      success: true,
    };
  }

  // --- Build G matrix, B matrix, i vector, e vector ---
  const G = zeroMatrix(size);
  const rhs = zeroVector(size);

  // Helper: get node index (-1 for ground)
  const nIdx2 = (label: string): number =>
    label === ground ? -1 : nodeIndex[label];

  // --- Stamp resistors into G ---
  for (const el of elements) {
    if (el.type !== 'resistor') continue;
    if (el.value <= 0 || !isFinite(el.value)) {
      throw new Error(
        `Resistor ${el.id} has invalid value ${el.value} Ω. Resistance must be positive and finite.`
      );
    }
    const g = 1 / el.value; // conductance
    const p = nIdx2(el.nodePos);
    const n = nIdx2(el.nodeNeg);

    if (p >= 0) G[p][p] += g;
    if (n >= 0) G[n][n] += g;
    if (p >= 0 && n >= 0) {
      G[p][n] -= g;
      G[n][p] -= g;
    }
  }

  // --- Stamp voltage sources (B and C blocks) ---
  voltageSources.forEach((el, vsIdx) => {
    const row = numNodes + vsIdx;
    const col = numNodes + vsIdx;
    const p = nIdx2(el.nodePos);
    const n = nIdx2(el.nodeNeg);

    // B: n×m block — column vsIdx
    if (p >= 0) {
      G[p][col] += 1;    // B
      G[row][p] += 1;    // C = B^T
    }
    if (n >= 0) {
      G[n][col] -= 1;    // B
      G[row][n] -= 1;    // C = B^T
    }

    // e: voltage source value (short = 0, voltage_source = value)
    rhs[row] = el.type === 'short' ? 0 : el.value;
  });

  // --- Stamp current sources into RHS ---
  for (const el of elements) {
    if (el.type !== 'current_source') continue;
    // Positive convention: current flows from nodeNeg into nodePos through the source
    // (conventional: current enters positive terminal from outside circuit)
    // Here: current source pushes current OUT of its positive terminal into the network
    const p = nIdx2(el.nodePos);
    const n = nIdx2(el.nodeNeg);
    if (p >= 0) rhs[p] += el.value;
    if (n >= 0) rhs[n] -= el.value;
  }

  // --- Solve ---
  let x: number[];
  try {
    x = gaussianElimination(G, rhs);
  } catch (err) {
    return {
      nodeVoltages: {},
      branchCurrents: {},
      success: false,
      error: (err as Error).message,
    };
  }

  // --- Extract results ---
  const nodeVoltages: { [label: string]: number } = { [ground]: 0 };
  for (const [label, idx] of Object.entries(nodeIndex)) {
    nodeVoltages[label] = x[idx];
  }

  const branchCurrents: { [id: string]: number } = {};
  voltageSources.forEach((el, vsIdx) => {
    branchCurrents[el.id] = x[numNodes + vsIdx];
  });

  return { nodeVoltages, branchCurrents, success: true };
}

/**
 * Calculates the equivalent resistance seen at the output terminals
 * using the test-source method (after deactivating independent sources).
 *
 * Method:
 *  1. Deactivate all independent voltage sources (replace with short circuits)
 *  2. Deactivate all independent current sources (replace with open circuits)
 *  3. Inject a 1A test current source at the output terminals
 *  4. Solve MNA → Rth = V_test / 1A = voltage at output terminals
 *
 * This is mathematically equivalent to the textbook source-deactivation method.
 *
 * @param topology - Original topology (with load removed)
 * @returns Rth in ohms
 */
export function calculateRth(topology: CircuitTopology): number {
  const { elements, outputNodePos, outputNodeNeg, ground, nodes } = topology;

  // Build deactivated elements list
  const deactivatedElements: CircuitElement[] = elements
    .filter((e) => e.id !== topology.loadId) // load already removed
    .map((el) => {
      if (el.type === 'voltage_source') {
        // Replace voltage source with short circuit
        return { ...el, type: 'short' as const, value: 0 };
      }
      if (el.type === 'current_source') {
        // Replace current source with open circuit (simply omit)
        return null;
      }
      return el;
    })
    .filter((el): el is CircuitElement => el !== null);

  // Add 1A test current source at output terminals
  // Current flows from outputNodeNeg to outputNodePos through external circuit
  const testSource: CircuitElement = {
    id: '__test__',
    type: 'current_source',
    nodePos: outputNodePos,
    nodeNeg: outputNodeNeg,
    value: 1, // 1A test current
  };
  deactivatedElements.push(testSource);

  const testTopology: CircuitTopology = {
    ...topology,
    elements: deactivatedElements,
    loadId: '', // no load
  };

  const solution = solveMNA(testTopology);
  if (!solution.success) {
    throw new Error(`Rth calculation failed: ${solution.error}`);
  }

  // Vtest = V(outputNodePos) - V(outputNodeNeg)
  const Vpos = solution.nodeVoltages[outputNodePos] ?? 0;
  const Vneg = solution.nodeVoltages[outputNodeNeg] ?? 0;
  const Vtest = Vpos - Vneg;

  // Rth = Vtest / Itest = Vtest / 1A
  const Rth = Vtest;

  if (Rth < -EPSILON) {
    // Negative Rth indicates active element — should not occur for passive networks
    throw new Error(
      `Computed Rth = ${Rth.toFixed(6)} Ω is negative. ` +
      `Check that the circuit contains only passive elements (resistors) after source deactivation.`
    );
  }

  return Math.max(0, Rth); // clamp tiny negatives from floating-point to 0
}

/**
 * Removes the load element from a topology, returning the open-circuit topology.
 */
export function removeLoad(topology: CircuitTopology): CircuitTopology {
  return {
    ...topology,
    elements: topology.elements.filter((e) => e.id !== topology.loadId),
  };
}

/**
 * Shortens the output terminals (for Norton Isc calculation).
 * Replaces the load with an ideal short circuit.
 */
export function shortOutputTerminals(topology: CircuitTopology): CircuitTopology {
  const withoutLoad = removeLoad(topology);
  const shortElement: CircuitElement = {
    id: '__short__',
    type: 'short',
    nodePos: topology.outputNodePos,
    nodeNeg: topology.outputNodeNeg,
    value: 0,
  };
  return {
    ...withoutLoad,
    elements: [...withoutLoad.elements, shortElement],
    loadId: '__short__',
  };
}

/**
 * Returns the voltage across the output terminals (Voc) from an MNA solution.
 */
export function getOutputVoltage(
  solution: MNASolution,
  outputNodePos: string,
  outputNodeNeg: string
): number {
  const Vpos = solution.nodeVoltages[outputNodePos] ?? 0;
  const Vneg = solution.nodeVoltages[outputNodeNeg] ?? 0;
  return Vpos - Vneg;
}

/**
 * Returns the short-circuit current through the __short__ element.
 *
 * MNA convention for voltage sources:
 *   The branch variable j = current entering the positive terminal of the VS
 *   from OUTSIDE the VS (i.e., from the network into V+).
 *
 * Short circuit is stamped with nodePos = outputNodePos, nodeNeg = outputNodeNeg.
 * So j = current entering outputNodePos through the short element.
 * This current flows FROM the network INTO the short's positive terminal.
 * In the external circuit this is the same as: current leaves the network's
 * positive output terminal, flows into short (j), and returns via negative terminal.
 * This is exactly the conventional Norton current direction: OUT of the network's
 * positive terminal into the short.
 *
 * Therefore IN = +branchCurrents['__short__']
 */
export function getShortCircuitCurrent(solution: MNASolution): number {
  const iShort = solution.branchCurrents['__short__'] ?? 0;
  return iShort;
}

/** ============================================================
 * CircuitLAB — Six Predefined Circuit Configurations
 *
 * Each configuration has:
 *  - Explicit node list with ground
 *  - All elements with node connections
 *  - Output terminal specification
 *  - Load resistor identification
 *  - Default values matching textbook examples
 *  - SVG layout hint
 *
 * Faculty Reference Problem is Circuit 2 (index 1):
 *  V1=10V, R1=2Ω, R2=4Ω, R3=3Ω, RL=1Ω
 *  Expected: Vth=20/3 V, Rth=13/3 Ω, IL=1.25 A
 * ============================================================ */

import { CircuitConfig, CircuitTopology, ComponentValues } from './types';

// ============================================================
// Circuit 1: Single Voltage Source — Series and Parallel Resistors
//
// Topology:
//  V1(+) → Node A → R1 → Node B → R2(shunt to GND)
//                                → RL(output to GND)
//  V1(-) → GND
//
// Nodes: GND, A, B
// Elements: V1(GND→A), R1(A→B), R2(B→GND), RL(B→GND)
// Output: B to GND
// ============================================================
const circuit1: CircuitConfig = {
  id: 1,
  name: 'Single VS — Series & Parallel Resistors',
  description:
    'A DC voltage source with a series resistor R1, a shunt resistor R2 to ground, and a load RL connected across the output terminals.',
  defaultValues: { V1: 12, R1: 3, R2: 6, RL: 4 },
  buildTopology(values: ComponentValues): CircuitTopology {
    const { V1, R1, R2, RL } = values;
    return {
      nodes: ['GND', 'A', 'B'],
      ground: 'GND',
      elements: [
        { id: 'V1', type: 'voltage_source', nodePos: 'A', nodeNeg: 'GND', value: V1, label: `V1 = ${V1}V` },
        { id: 'R1', type: 'resistor', nodePos: 'A', nodeNeg: 'B', value: R1, label: `R1 = ${R1}Ω` },
        { id: 'R2', type: 'resistor', nodePos: 'B', nodeNeg: 'GND', value: R2, label: `R2 = ${R2}Ω` },
        { id: 'RL', type: 'resistor', nodePos: 'B', nodeNeg: 'GND', value: RL, label: `RL = ${RL}Ω` },
      ],
      outputNodePos: 'B',
      outputNodeNeg: 'GND',
      loadId: 'RL',
    };
  },
  svgLayout: { templateId: 1 },
};

// ============================================================
// Circuit 2: Single VS — Series-Parallel Ladder (Faculty Reference)
//
// Topology:
//  V1(+) → R1 → Node A → R3 → Node B (output+)
//                       R2(shunt: A → GND)
//  V1(-) → GND (output-)
//
// Nodes: GND, A, B
// Elements: V1(GND→VA), R1(VA→A), R2(A→GND), R3(A→B), RL(B→GND)
// But we merge VA into the source positive terminal:
//
// Actually to be precise, using internal node structure:
//  Source positive terminal directly connects to R1 input.
//  Let's call it node "S" = source output = V1 value above GND.
//
// Revised topology (matches handwritten circuit):
//  V1: GND → S (VS of V1 volts, positive at S)
//  R1: S → A
//  R2: A → GND (shunt)
//  R3: A → B
//  RL: B → GND
//
// Nodes: GND, S, A, B
// But S=V1 is fully determined by V1 (not an independent node after MNA stamps V1).
// MNA handles this correctly.
// ============================================================
const circuit2: CircuitConfig = {
  id: 2,
  name: 'Ladder Network (Faculty Reference Problem)',
  description:
    'The faculty reference circuit: 10V source, R1=2Ω series, R2=4Ω shunt at node A, R3=3Ω to output. Expected Vth=6.667V, Rth=4.333Ω, IL=1.25A.',
  defaultValues: { V1: 10, R1: 2, R2: 4, R3: 3, RL: 1 },
  buildTopology(values: ComponentValues): CircuitTopology {
    const { V1, R1, R2, R3, RL } = values;
    return {
      nodes: ['GND', 'S', 'A', 'B'],
      ground: 'GND',
      elements: [
        { id: 'V1', type: 'voltage_source', nodePos: 'S', nodeNeg: 'GND', value: V1, label: `V1 = ${V1}V` },
        { id: 'R1', type: 'resistor', nodePos: 'S', nodeNeg: 'A', value: R1, label: `R1 = ${R1}Ω` },
        { id: 'R2', type: 'resistor', nodePos: 'A', nodeNeg: 'GND', value: R2, label: `R2 = ${R2}Ω` },
        { id: 'R3', type: 'resistor', nodePos: 'A', nodeNeg: 'B', value: R3, label: `R3 = ${R3}Ω` },
        { id: 'RL', type: 'resistor', nodePos: 'B', nodeNeg: 'GND', value: RL, label: `RL = ${RL}Ω` },
      ],
      outputNodePos: 'B',
      outputNodeNeg: 'GND',
      loadId: 'RL',
    };
  },
  svgLayout: { templateId: 2 },
};

// ============================================================
// Circuit 3: Two Voltage Sources in Series
//
// Topology (aiding: both push current in same direction):
//  GND → V1 → S1 → V2 → S2 → R1 → A → RL → GND
//                                   ↓
//                                  R2 → GND
//
// For aiding: polarity of V2 is same direction as V1
// For opposing: V2 polarity flipped (subtract)
//
// Simplified (merge into effective source):
//  Effective_V = V1 + V2 (aiding) or V1 - V2 (opposing)
//  But we implement as two separate voltage sources so MNA handles it.
//
// Nodes: GND, S1, S2, A, B
//  V1: GND → S1
//  V2: S1 → S2  (aiding) or S2 → S1 (opposing — flip nodePos/nodeNeg)
//  R1: S2 → A
//  R2: A → GND (shunt)
//  RL: A → GND (output)
// ============================================================
const circuit3: CircuitConfig = {
  id: 3,
  name: 'Two Voltage Sources in Series',
  description:
    'Two DC voltage sources in series with resistors and a load. Toggle aiding/opposing polarity.',
  defaultValues: { V1: 12, V2: 6, R1: 4, R2: 8, RL: 6, polarity: 1 },
  buildTopology(values: ComponentValues): CircuitTopology {
    const { V1, V2, R1, R2, RL } = values;
    const aiding = (values.polarity ?? 1) >= 0;
    // V2 node connections based on polarity
    const v2NodePos = aiding ? 'S2' : 'S1';
    const v2NodeNeg = aiding ? 'S1' : 'S2';
    return {
      nodes: ['GND', 'S1', 'S2', 'A'],
      ground: 'GND',
      elements: [
        { id: 'V1', type: 'voltage_source', nodePos: 'S1', nodeNeg: 'GND', value: V1, label: `V1 = ${V1}V` },
        { id: 'V2', type: 'voltage_source', nodePos: v2NodePos, nodeNeg: v2NodeNeg, value: V2, label: `V2 = ${V2}V (${aiding ? 'aiding' : 'opposing'})` },
        { id: 'R1', type: 'resistor', nodePos: 'S2', nodeNeg: 'A', value: R1, label: `R1 = ${R1}Ω` },
        { id: 'R2', type: 'resistor', nodePos: 'A', nodeNeg: 'GND', value: R2, label: `R2 = ${R2}Ω` },
        { id: 'RL', type: 'resistor', nodePos: 'A', nodeNeg: 'GND', value: RL, label: `RL = ${RL}Ω` },
      ],
      outputNodePos: 'A',
      outputNodeNeg: 'GND',
      loadId: 'RL',
    };
  },
  svgLayout: { templateId: 3 },
};

// ============================================================
// Circuit 4: Two Voltage Sources in Separate Branches
//
// Topology:
//  V1 branch: GND → V1(+) → R1 → Node A
//  V2 branch: GND → V2(+) → R2 → Node A
//  R3: A → B (series to output)
//  RL: B → GND (output load)
//
// Nodes: GND, S1, S2, A, B
//  V1: GND → S1
//  V2: GND → S2
//  R1: S1 → A
//  R2: S2 → A
//  R3: A → B
//  RL: B → GND
//
// This is electrically valid: two Thevenin branches feeding node A
// ============================================================
const circuit4: CircuitConfig = {
  id: 4,
  name: 'Two Voltage Sources — Separate Branches',
  description:
    'Two independent DC voltage sources each with series resistance feeding a common network with load.',
  defaultValues: { V1: 20, V2: 10, R1: 5, R2: 10, R3: 4, RL: 8 },
  buildTopology(values: ComponentValues): CircuitTopology {
    const { V1, V2, R1, R2, R3, RL } = values;
    return {
      nodes: ['GND', 'S1', 'S2', 'A', 'B'],
      ground: 'GND',
      elements: [
        { id: 'V1', type: 'voltage_source', nodePos: 'S1', nodeNeg: 'GND', value: V1, label: `V1 = ${V1}V` },
        { id: 'V2', type: 'voltage_source', nodePos: 'S2', nodeNeg: 'GND', value: V2, label: `V2 = ${V2}V` },
        { id: 'R1', type: 'resistor', nodePos: 'S1', nodeNeg: 'A', value: R1, label: `R1 = ${R1}Ω` },
        { id: 'R2', type: 'resistor', nodePos: 'S2', nodeNeg: 'A', value: R2, label: `R2 = ${R2}Ω` },
        { id: 'R3', type: 'resistor', nodePos: 'A', nodeNeg: 'B', value: R3, label: `R3 = ${R3}Ω` },
        { id: 'RL', type: 'resistor', nodePos: 'B', nodeNeg: 'GND', value: RL, label: `RL = ${RL}Ω` },
      ],
      outputNodePos: 'B',
      outputNodeNeg: 'GND',
      loadId: 'RL',
    };
  },
  svgLayout: { templateId: 4 },
};

// ============================================================
// Circuit 5: Multiple Current Sources and Parallel Resistors
//
// Topology:
//  Node A is the common positive bus. Ground is negative bus.
//  I1: current source, GND → A (pushes current into A)
//  I2: current source, GND → A or A → GND based on direction
//  R1: A → GND (parallel branch 1)
//  R2: A → GND (parallel branch 2)
//  RL: A → GND (output)
//
// All in parallel between node A and GND.
// ============================================================
const circuit5: CircuitConfig = {
  id: 5,
  name: 'Multiple Current Sources — Parallel Resistors',
  description:
    'Two independent DC current sources and parallel resistive branches with a load. Current source directions can be changed.',
  defaultValues: { I1: 4, I2: 2, R1: 6, R2: 12, RL: 4, dir1: 1, dir2: 1 },
  buildTopology(values: ComponentValues): CircuitTopology {
    const { I1, I2, R1, R2, RL } = values;
    const dir1 = (values.dir1 ?? 1) >= 0 ? 1 : -1;
    const dir2 = (values.dir2 ?? 1) >= 0 ? 1 : -1;
    return {
      nodes: ['GND', 'A'],
      ground: 'GND',
      elements: [
        {
          id: 'I1',
          type: 'current_source',
          // dir1=+1: current flows from GND to A (into node A, conventional)
          nodePos: dir1 > 0 ? 'A' : 'GND',
          nodeNeg: dir1 > 0 ? 'GND' : 'A',
          value: I1,
          label: `I1 = ${I1}A`,
        },
        {
          id: 'I2',
          type: 'current_source',
          nodePos: dir2 > 0 ? 'A' : 'GND',
          nodeNeg: dir2 > 0 ? 'GND' : 'A',
          value: I2,
          label: `I2 = ${I2}A`,
        },
        { id: 'R1', type: 'resistor', nodePos: 'A', nodeNeg: 'GND', value: R1, label: `R1 = ${R1}Ω` },
        { id: 'R2', type: 'resistor', nodePos: 'A', nodeNeg: 'GND', value: R2, label: `R2 = ${R2}Ω` },
        { id: 'RL', type: 'resistor', nodePos: 'A', nodeNeg: 'GND', value: RL, label: `RL = ${RL}Ω` },
      ],
      outputNodePos: 'A',
      outputNodeNeg: 'GND',
      loadId: 'RL',
    };
  },
  svgLayout: { templateId: 5 },
};

// ============================================================
// Circuit 6: Mixed Voltage and Current Sources
//
// Topology:
//  V1 provides voltage at node S above GND.
//  R1: S → A (series resistor)
//  I1: current source between node A and GND (upward = into A)
//  R2: A → GND (shunt)
//  R3: A → B (series to output)
//  RL: B → GND (load)
//
// Nodes: GND, S, A, B
//  V1: GND → S
//  R1: S → A
//  I1: GND → A (current into A, positive direction)
//  R2: A → GND
//  R3: A → B
//  RL: B → GND
// ============================================================
const circuit6: CircuitConfig = {
  id: 6,
  name: 'Mixed VS + CS Network',
  description:
    'A network with an independent DC voltage source, an independent DC current source, resistors and a load.',
  defaultValues: { V1: 15, I1: 2, R1: 3, R2: 6, R3: 2, RL: 5, dirI: 1 },
  buildTopology(values: ComponentValues): CircuitTopology {
    const { V1, I1, R1, R2, R3, RL } = values;
    const dirI = (values.dirI ?? 1) >= 0 ? 1 : -1;
    return {
      nodes: ['GND', 'S', 'A', 'B'],
      ground: 'GND',
      elements: [
        { id: 'V1', type: 'voltage_source', nodePos: 'S', nodeNeg: 'GND', value: V1, label: `V1 = ${V1}V` },
        { id: 'R1', type: 'resistor', nodePos: 'S', nodeNeg: 'A', value: R1, label: `R1 = ${R1}Ω` },
        {
          id: 'I1',
          type: 'current_source',
          nodePos: dirI > 0 ? 'A' : 'GND',
          nodeNeg: dirI > 0 ? 'GND' : 'A',
          value: I1,
          label: `I1 = ${I1}A`,
        },
        { id: 'R2', type: 'resistor', nodePos: 'A', nodeNeg: 'GND', value: R2, label: `R2 = ${R2}Ω` },
        { id: 'R3', type: 'resistor', nodePos: 'A', nodeNeg: 'B', value: R3, label: `R3 = ${R3}Ω` },
        { id: 'RL', type: 'resistor', nodePos: 'B', nodeNeg: 'GND', value: RL, label: `RL = ${RL}Ω` },
      ],
      outputNodePos: 'B',
      outputNodeNeg: 'GND',
      loadId: 'RL',
    };
  },
  svgLayout: { templateId: 6 },
};

export const circuitConfigs: CircuitConfig[] = [
  circuit1,
  circuit2,
  circuit3,
  circuit4,
  circuit5,
  circuit6,
];

export function getCircuitConfig(id: number): CircuitConfig {
  const cfg = circuitConfigs.find((c) => c.id === id);
  if (!cfg) throw new Error(`Circuit configuration ${id} not found.`);
  return cfg;
}

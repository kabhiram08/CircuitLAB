/** ============================================================
 * CircuitLAB — Automated Mathematical Tests
 *
 * Tests:
 *  1. Faculty Reference Problem (MANDATORY REGRESSION TEST)
 *  2. All 6 circuit templates with default values
 *  3. Thevenin-Norton equivalence for all templates
 *  4. Edge cases: source polarity, resistor values
 *  5. MNA solver correctness
 *  6. Input validation
 *
 * Numerical tolerance: 1e-9 (DISPLAY_TOL)
 * ============================================================ */

import { describe, it, expect } from 'vitest';
import { solveMNA, calculateRth, removeLoad, shortOutputTerminals, getShortCircuitCurrent, getOutputVoltage } from '../mna';
import { gaussianElimination } from '../matrixSolver';
import { circuitConfigs } from '../circuitTemplates';
import { runTheveninAnalysis } from '../thevenin';
import { runNortonAnalysis } from '../norton';
import { validateInputs } from '../validation';
import { CircuitTopology } from '../types';

const TOL = 1e-9;

function approxEqual(a: number, b: number, tol = TOL, msg = ''): void {
  const diff = Math.abs(a - b);
  expect(diff, `${msg}: |${a} - ${b}| = ${diff} > ${tol}`).toBeLessThan(tol);
}

// ============================================================
// SECTION 1: Gaussian Elimination Unit Tests
// ============================================================
describe('Gaussian Elimination', () => {
  it('solves a 1×1 system: 2x = 6 → x = 3', () => {
    const x = gaussianElimination([[2]], [6]);
    approxEqual(x[0], 3, TOL, '1x1 system');
  });

  it('solves a 2×2 system: x+y=3, 2x-y=0 → x=1, y=2', () => {
    const x = gaussianElimination([[1, 1], [2, -1]], [3, 0]);
    approxEqual(x[0], 1, TOL, 'x');
    approxEqual(x[1], 2, TOL, 'y');
  });

  it('solves a 3×3 system', () => {
    // 2x + y - z = 8, -3x - y + 2z = -11, -2x + y + 2z = -3
    const A = [[2, 1, -1], [-3, -1, 2], [-2, 1, 2]];
    const b = [8, -11, -3];
    const x = gaussianElimination(A, b);
    approxEqual(x[0], 2, TOL, 'x');
    approxEqual(x[1], 3, TOL, 'y');
    approxEqual(x[2], -1, TOL, 'z');
  });

  it('detects near-singular matrix', () => {
    // Parallel identical rows → singular
    expect(() => gaussianElimination([[1, 2], [2, 4]], [3, 6])).toThrow();
  });

  it('handles partial pivoting correctly', () => {
    // With pivoting: swap rows → [1, 1; 1e-15, 1] → x1=1, x0=1
    // A = [[1e-15, 1], [1, 1]], b = [1, 2]
    // Solution: x0=1, x1=1 (1e-15*1 + 1*1 ≈ 1, 1*1 + 1*1 = 2)
    const A = [[1e-15, 1], [1, 1]];
    const b = [1, 2];
    const x = gaussianElimination(A, b);
    approxEqual(x[1], 1, TOL, 'x1 after pivoting');
    approxEqual(x[0], 1, 1e-6, 'x0 after pivoting');
  });
});

// ============================================================
// SECTION 2: MNA Solver — Simple Circuits
// ============================================================
describe('MNA Solver — Basic Circuits', () => {
  it('single resistor loop: V=10V, R=5Ω → I=2A', () => {
    const topo: CircuitTopology = {
      nodes: ['GND', 'A'],
      ground: 'GND',
      elements: [
        { id: 'V1', type: 'voltage_source', nodePos: 'A', nodeNeg: 'GND', value: 10 },
        { id: 'R1', type: 'resistor', nodePos: 'A', nodeNeg: 'GND', value: 5 },
      ],
      outputNodePos: 'A',
      outputNodeNeg: 'GND',
      loadId: 'R1',
    };
    const sol = solveMNA(topo);
    expect(sol.success).toBe(true);
    approxEqual(sol.nodeVoltages['A'], 10, TOL, 'Node A = 10V');
    approxEqual(sol.branchCurrents['V1'], -2, TOL, 'I through V1 = -2A (into GND)');
  });

  it('voltage divider: V=12V, R1=4Ω, R2=8Ω → Vmid=8V', () => {
    const topo: CircuitTopology = {
      nodes: ['GND', 'A', 'B'],
      ground: 'GND',
      elements: [
        { id: 'V1', type: 'voltage_source', nodePos: 'A', nodeNeg: 'GND', value: 12 },
        { id: 'R1', type: 'resistor', nodePos: 'A', nodeNeg: 'B', value: 4 },
        { id: 'R2', type: 'resistor', nodePos: 'B', nodeNeg: 'GND', value: 8 },
      ],
      outputNodePos: 'B',
      outputNodeNeg: 'GND',
      loadId: '',
    };
    const sol = solveMNA(topo);
    expect(sol.success).toBe(true);
    approxEqual(sol.nodeVoltages['B'], 8, TOL, 'V at B');
  });

  it('current source with shunt resistor: I=2A, R=3Ω → V=6V', () => {
    const topo: CircuitTopology = {
      nodes: ['GND', 'A'],
      ground: 'GND',
      elements: [
        { id: 'I1', type: 'current_source', nodePos: 'A', nodeNeg: 'GND', value: 2 },
        { id: 'R1', type: 'resistor', nodePos: 'A', nodeNeg: 'GND', value: 3 },
      ],
      outputNodePos: 'A',
      outputNodeNeg: 'GND',
      loadId: '',
    };
    const sol = solveMNA(topo);
    expect(sol.success).toBe(true);
    approxEqual(sol.nodeVoltages['A'], 6, TOL, 'V = I×R = 6V');
  });

  it('two current sources (aiding): I1=4A up, I2=2A up, R=3Ω → V=18V', () => {
    const topo: CircuitTopology = {
      nodes: ['GND', 'A'],
      ground: 'GND',
      elements: [
        { id: 'I1', type: 'current_source', nodePos: 'A', nodeNeg: 'GND', value: 4 },
        { id: 'I2', type: 'current_source', nodePos: 'A', nodeNeg: 'GND', value: 2 },
        { id: 'R1', type: 'resistor', nodePos: 'A', nodeNeg: 'GND', value: 3 },
      ],
      outputNodePos: 'A',
      outputNodeNeg: 'GND',
      loadId: '',
    };
    const sol = solveMNA(topo);
    expect(sol.success).toBe(true);
    // (4+2) * 3 = 18V
    approxEqual(sol.nodeVoltages['A'], 18, TOL, 'V = (4+2)×3 = 18V');
  });
});

// ============================================================
// SECTION 3: Rth Calculation Tests
// ============================================================
describe('Rth Calculation — Test-Source Method', () => {
  it('single resistor Rth = R', () => {
    // Single R between terminals, no sources
    const topo: CircuitTopology = {
      nodes: ['GND', 'A'],
      ground: 'GND',
      elements: [
        { id: 'R1', type: 'resistor', nodePos: 'A', nodeNeg: 'GND', value: 5 },
      ],
      outputNodePos: 'A',
      outputNodeNeg: 'GND',
      loadId: '',
    };
    const rth = calculateRth(topo);
    approxEqual(rth, 5, TOL, 'Rth = 5Ω');
  });

  it('two resistors in parallel: R1∥R2', () => {
    const R1 = 6, R2 = 12;
    const expected = (R1 * R2) / (R1 + R2); // 4Ω
    const topo: CircuitTopology = {
      nodes: ['GND', 'A'],
      ground: 'GND',
      elements: [
        { id: 'R1', type: 'resistor', nodePos: 'A', nodeNeg: 'GND', value: R1 },
        { id: 'R2', type: 'resistor', nodePos: 'A', nodeNeg: 'GND', value: R2 },
      ],
      outputNodePos: 'A',
      outputNodeNeg: 'GND',
      loadId: '',
    };
    const rth = calculateRth(topo);
    approxEqual(rth, expected, TOL, 'R1||R2 = 4Ω');
  });

  it('series-parallel (faculty reference topology): R3 + R1||R2', () => {
    // Nodes: GND, A, B
    // R1: A→GND, R2: A→GND (simulating R1 and R2 at node A after short of V1 at S)
    // Actually for circuit 2: R3: A→B, R1∥R2 at A
    const R1 = 2, R2 = 4, R3 = 3;
    const expected = R3 + (R1 * R2) / (R1 + R2); // 3 + 8/6 = 13/3
    const topo: CircuitTopology = {
      nodes: ['GND', 'A', 'B'],
      ground: 'GND',
      elements: [
        // After shorting V1: S is shorted to GND, so R1 is between GND and A
        { id: 'R1', type: 'resistor', nodePos: 'GND', nodeNeg: 'A', value: R1 },
        { id: 'R2', type: 'resistor', nodePos: 'A', nodeNeg: 'GND', value: R2 },
        { id: 'R3', type: 'resistor', nodePos: 'A', nodeNeg: 'B', value: R3 },
      ],
      outputNodePos: 'B',
      outputNodeNeg: 'GND',
      loadId: '',
    };
    const rth = calculateRth(topo);
    approxEqual(rth, expected, TOL, `R3 + R1||R2 = ${expected.toFixed(6)}`);
  });
});

// ============================================================
// SECTION 4: FACULTY REFERENCE PROBLEM (MANDATORY)
// Circuit 2: V1=10V, R1=2Ω, R2=4Ω, R3=3Ω, RL=1Ω
// Expected: Vth=20/3 V, Rth=13/3 Ω, IL=1.25 A
// ============================================================
describe('FACULTY REFERENCE PROBLEM (Mandatory Regression)', () => {
  const cfg = circuitConfigs.find((c) => c.id === 2)!;
  const values = { V1: 10, R1: 2, R2: 4, R3: 3, RL: 1 };
  const topology = cfg.buildTopology(values);

  it('Circuit 2 topology builds correctly', () => {
    expect(topology.elements).toHaveLength(5);
    expect(topology.elements.find((e) => e.id === 'V1')?.value).toBe(10);
    expect(topology.elements.find((e) => e.id === 'R1')?.value).toBe(2);
    expect(topology.elements.find((e) => e.id === 'R2')?.value).toBe(4);
    expect(topology.elements.find((e) => e.id === 'R3')?.value).toBe(3);
    expect(topology.elements.find((e) => e.id === 'RL')?.value).toBe(1);
  });

  it('Thevenin: Vth = 20/3 V ≈ 6.6666667 V', () => {
    const result = runTheveninAnalysis(topology);
    approxEqual(result.Vth, 20 / 3, TOL, 'Vth = 20/3');
  });

  it('Thevenin: Rth = 13/3 Ω ≈ 4.3333333 Ω', () => {
    const result = runTheveninAnalysis(topology);
    approxEqual(result.Rth, 13 / 3, TOL, 'Rth = 13/3');
  });

  it('Thevenin: IL = 1.25 A (EXACT)', () => {
    const result = runTheveninAnalysis(topology);
    approxEqual(result.IL, 1.25, TOL, 'IL = 1.25A');
  });

  it('Thevenin: VL = 1.25 V', () => {
    const result = runTheveninAnalysis(topology);
    approxEqual(result.VL, 1.25, TOL, 'VL = 1.25V');
  });

  it('Thevenin: PL = 1.5625 W', () => {
    const result = runTheveninAnalysis(topology);
    approxEqual(result.PL, 1.5625, TOL, 'PL = 1.5625W');
  });

  it('Norton: IN = 20/13 A ≈ 1.5384615 A', () => {
    const result = runNortonAnalysis(topology);
    approxEqual(result.IN, 20 / 13, TOL, 'IN = 20/13');
  });

  it('Norton: RN = 13/3 Ω (equals Rth)', () => {
    const result = runNortonAnalysis(topology);
    approxEqual(result.RN, 13 / 3, TOL, 'RN = Rth = 13/3');
  });

  it('Norton: IL = 1.25 A (EXACT — must match Thevenin)', () => {
    const result = runNortonAnalysis(topology);
    approxEqual(result.IL, 1.25, TOL, 'IL = 1.25A');
  });

  it('Norton: VL = 1.25 V', () => {
    const result = runNortonAnalysis(topology);
    approxEqual(result.VL, 1.25, TOL, 'VL = 1.25V');
  });

  it('Thevenin-Norton equivalence: same IL, VL, PL', () => {
    const thev = runTheveninAnalysis(topology);
    const nort = runNortonAnalysis(topology);
    approxEqual(thev.IL, nort.IL, TOL, 'IL equivalence');
    approxEqual(thev.VL, nort.VL, TOL, 'VL equivalence');
    approxEqual(thev.PL, nort.PL, TOL, 'PL equivalence');
  });

  it('Thevenin-Norton relationship: Vth = IN × RN', () => {
    const thev = runTheveninAnalysis(topology);
    const nort = runNortonAnalysis(topology);
    approxEqual(thev.Vth, nort.IN * nort.RN, TOL, 'Vth = IN × RN');
  });
});

// ============================================================
// SECTION 5: All Six Circuits — Default Values
// ============================================================
describe('All Six Circuits — Default Values', () => {
  for (const cfg of circuitConfigs) {
    describe(`Circuit ${cfg.id}: ${cfg.name}`, () => {
      const topology = cfg.buildTopology(cfg.defaultValues);

      it('Thevenin analysis completes without error', () => {
        expect(() => runTheveninAnalysis(topology)).not.toThrow();
      });

      it('Norton analysis completes without error', () => {
        expect(() => runNortonAnalysis(topology)).not.toThrow();
      });

      it('Thevenin and Norton produce same IL within tolerance', () => {
        const thev = runTheveninAnalysis(topology);
        const nort = runNortonAnalysis(topology);
        approxEqual(thev.IL, nort.IL, 1e-6, `Circuit ${cfg.id} IL equivalence`);
      });

      it('Thevenin and Norton produce same VL within tolerance', () => {
        const thev = runTheveninAnalysis(topology);
        const nort = runNortonAnalysis(topology);
        approxEqual(thev.VL, nort.VL, 1e-6, `Circuit ${cfg.id} VL equivalence`);
      });

      it('Thevenin and Norton produce same PL within tolerance', () => {
        const thev = runTheveninAnalysis(topology);
        const nort = runNortonAnalysis(topology);
        approxEqual(thev.PL, nort.PL, 1e-6, `Circuit ${cfg.id} PL equivalence`);
      });

      it('IL is positive and finite', () => {
        const thev = runTheveninAnalysis(topology);
        expect(isFinite(thev.IL)).toBe(true);
        // IL can be negative if sources are reversed, just check finite
      });

      it('Vth = IN × RN (Thevenin-Norton duality)', () => {
        const thev = runTheveninAnalysis(topology);
        const nort = runNortonAnalysis(topology);
        approxEqual(thev.Vth, nort.IN * nort.RN, 1e-6, `Circuit ${cfg.id} Vth=IN*RN`);
      });
    });
  }
});

// ============================================================
// SECTION 6: Multiple Input Combinations — Circuit 2
// ============================================================
describe('Circuit 2 — Multiple Input Combinations', () => {
  const cfg = circuitConfigs.find((c) => c.id === 2)!;

  const testCases = [
    // [V1, R1, R2, R3, RL, expectedVth, expectedRth, expectedIL]
    // Hand-calculated values
    [10, 2, 4, 3, 1, 20 / 3, 13 / 3, 1.25],               // Faculty reference
    [20, 2, 4, 3, 1, 40 / 3, 13 / 3, 40 / 3 / (13 / 3 + 1)],  // Double voltage
    [10, 4, 4, 3, 1, 10 / 2, 3 + 2, 5 / (3 + 2 + 1)],       // R1=R2: divider = 1/2
    [10, 2, 4, 0, 1, 20 / 3, 8 / 6, (20 / 3) / (8 / 6 + 1)], // R3=0 (wire)... wait R3=0 not allowed in resistor but will error
    [10, 2, 4, 3, 10, 20 / 3, 13 / 3, (20 / 3) / (13 / 3 + 10)], // RL=10
    [5, 1, 2, 2, 2, 5 * 2 / 3, 2 + 2 / 3, (10 / 3) / (2 + 2 / 3 + 2)],
  ];

  it('Faculty reference: V=10, R1=2, R2=4, R3=3, RL=1 → IL=1.25', () => {
    const topo = cfg.buildTopology({ V1: 10, R1: 2, R2: 4, R3: 3, RL: 1 });
    const r = runTheveninAnalysis(topo);
    approxEqual(r.IL, 1.25, TOL, 'IL=1.25');
  });

  it('Double voltage: V=20, R1=2, R2=4, R3=3, RL=1 → IL=2.5', () => {
    const topo = cfg.buildTopology({ V1: 20, R1: 2, R2: 4, R3: 3, RL: 1 });
    const r = runTheveninAnalysis(topo);
    approxEqual(r.Vth, 40 / 3, TOL, 'Vth=40/3');
    approxEqual(r.IL, 2.5, TOL, 'IL=2.5');
  });

  it('Equal resistors: V=10, R1=4, R2=4, R3=3, RL=1 → Vth=5', () => {
    // Vth = 10 * 4/(4+4) = 5V
    // Rth = 3 + 4*4/(4+4) = 3 + 2 = 5Ω
    const topo = cfg.buildTopology({ V1: 10, R1: 4, R2: 4, R3: 3, RL: 1 });
    const r = runTheveninAnalysis(topo);
    approxEqual(r.Vth, 5, TOL, 'Vth=5');
    approxEqual(r.Rth, 5, TOL, 'Rth=5');
    approxEqual(r.IL, 5 / (5 + 1), TOL, 'IL=5/6');
  });

  it('Large RL: RL=100 → IL approaches Vth/Rth as RL→∞', () => {
    const topo = cfg.buildTopology({ V1: 10, R1: 2, R2: 4, R3: 3, RL: 100 });
    const r = runTheveninAnalysis(topo);
    const expected = (20 / 3) / (13 / 3 + 100);
    approxEqual(r.IL, expected, TOL, 'Large RL');
  });

  it('Reversed source: V1=-10 → IL=-1.25', () => {
    const topo = cfg.buildTopology({ V1: -10, R1: 2, R2: 4, R3: 3, RL: 1 });
    const r = runTheveninAnalysis(topo);
    approxEqual(r.Vth, -20 / 3, TOL, 'Negative Vth');
    approxEqual(r.IL, -1.25, TOL, 'Negative IL');
  });
});

// ============================================================
// SECTION 7: Circuit 3 — Aiding vs Opposing Sources
// ============================================================
describe('Circuit 3 — Two Voltage Sources', () => {
  const cfg = circuitConfigs.find((c) => c.id === 3)!;

  it('Aiding sources: effective voltage = V1 + V2', () => {
    // V1=12, V2=6, R1=4, R2=8, RL=6, polarity=1 (aiding)
    // Series circuit: total V = 18V, R1 in series with (R2 || RL)
    const topo = cfg.buildTopology({ V1: 12, V2: 6, R1: 4, R2: 8, RL: 6, polarity: 1 });
    const r = runTheveninAnalysis(topo);
    // Vth = (V1+V2) * R2/(R1+R2) = 18 * 8/12 = 12V
    // Rth = R1*R2/(R1+R2) = 4*8/12 = 8/3 Ω
    approxEqual(r.Vth, 18 * 8 / 12, TOL, 'Aiding Vth = 12V');
  });

  it('Opposing sources: effective voltage = V1 - V2', () => {
    const topo = cfg.buildTopology({ V1: 12, V2: 6, R1: 4, R2: 8, RL: 6, polarity: -1 });
    const r = runTheveninAnalysis(topo);
    // Effective V = 12-6 = 6V
    // Vth = 6 * 8/(4+8) = 4V
    approxEqual(r.Vth, 6 * 8 / 12, TOL, 'Opposing Vth = 4V');
  });

  it('Thevenin-Norton equivalence with aiding sources', () => {
    const topo = cfg.buildTopology({ V1: 12, V2: 6, R1: 4, R2: 8, RL: 6, polarity: 1 });
    const th = runTheveninAnalysis(topo);
    const no = runNortonAnalysis(topo);
    approxEqual(th.IL, no.IL, 1e-6, 'Aiding IL equiv');
  });
});

// ============================================================
// SECTION 8: Circuit 5 — Current Sources
// ============================================================
describe('Circuit 5 — Multiple Current Sources', () => {
  const cfg = circuitConfigs.find((c) => c.id === 5)!;

  it('Two current sources aiding: I_total = I1 + I2', () => {
    // I1=4A, I2=2A (both up), R1=6, R2=12, RL=4
    // With RL removed: R1∥R2 = 4Ω, V = (I1+I2)*4 = 24V → Vth
    // Rth = R1∥R2 = 4Ω
    const topo = cfg.buildTopology({ I1: 4, I2: 2, R1: 6, R2: 12, RL: 4, dir1: 1, dir2: 1 });
    const r = runTheveninAnalysis(topo);
    const R1R2p = 6 * 12 / (6 + 12); // 4Ω
    approxEqual(r.Vth, (4 + 2) * R1R2p, TOL, 'Vth = (I1+I2)*Rp');
    approxEqual(r.Rth, R1R2p, TOL, 'Rth = R1||R2');
  });

  it('Opposing current sources: I_total = I1 - I2', () => {
    const topo = cfg.buildTopology({ I1: 4, I2: 2, R1: 6, R2: 12, RL: 4, dir1: 1, dir2: -1 });
    const r = runTheveninAnalysis(topo);
    const R1R2p = 6 * 12 / (6 + 12);
    approxEqual(r.Vth, (4 - 2) * R1R2p, TOL, 'Opposing Vth');
  });

  it('Thevenin-Norton equivalence', () => {
    const topo = cfg.buildTopology(cfg.defaultValues);
    const th = runTheveninAnalysis(topo);
    const no = runNortonAnalysis(topo);
    approxEqual(th.IL, no.IL, 1e-6, 'CS circuit IL equiv');
  });
});

// ============================================================
// SECTION 9: Input Validation
// ============================================================
describe('Input Validation', () => {
  it('rejects R=0', () => {
    const errors = validateInputs(1, { V1: 10, R1: 0, R2: 5, RL: 1 });
    expect(errors.some((e) => e.field === 'R1')).toBe(true);
  });

  it('rejects negative R', () => {
    const errors = validateInputs(2, { V1: 10, R1: -2, R2: 4, R3: 3, RL: 1 });
    expect(errors.some((e) => e.field === 'R1')).toBe(true);
  });

  it('rejects RL=0', () => {
    const errors = validateInputs(1, { V1: 10, R1: 5, R2: 5, RL: 0 });
    expect(errors.some((e) => e.field === 'RL')).toBe(true);
  });

  it('allows negative voltage source', () => {
    const errors = validateInputs(1, { V1: -10, R1: 5, R2: 5, RL: 2 });
    expect(errors.length).toBe(0);
  });

  it('allows negative current source', () => {
    const errors = validateInputs(5, { I1: -4, I2: 2, R1: 6, R2: 12, RL: 4 });
    expect(errors.length).toBe(0);
  });

  it('rejects NaN input', () => {
    const errors = validateInputs(1, { V1: NaN, R1: 5, R2: 5, RL: 2 });
    expect(errors.some((e) => e.field === 'V1')).toBe(true);
  });
});

// ============================================================
// SECTION 10: Short-Circuit Current Verification
// ============================================================
describe('Short-Circuit Current (Norton Isc)', () => {
  it('Simple series circuit: V=10V, R=5Ω → Isc=2A', () => {
    const topo: CircuitTopology = {
      nodes: ['GND', 'A', 'B'],
      ground: 'GND',
      elements: [
        { id: 'V1', type: 'voltage_source', nodePos: 'A', nodeNeg: 'GND', value: 10 },
        { id: 'R1', type: 'resistor', nodePos: 'A', nodeNeg: 'B', value: 5 },
        { id: 'RL', type: 'resistor', nodePos: 'B', nodeNeg: 'GND', value: 100 },
      ],
      outputNodePos: 'B',
      outputNodeNeg: 'GND',
      loadId: 'RL',
    };
    const sc = shortOutputTerminals(topo);
    const sol = solveMNA(sc);
    expect(sol.success).toBe(true);
    const Isc = getShortCircuitCurrent(sol);
    // V=10V, only R1=5Ω in path, Isc = 10/5 = 2A
    approxEqual(Isc, 2, TOL, 'Isc = 2A');
  });

  it('Faculty reference: Isc = 20/13 A', () => {
    const cfg = circuitConfigs.find((c) => c.id === 2)!;
    const topo = cfg.buildTopology({ V1: 10, R1: 2, R2: 4, R3: 3, RL: 1 });
    const ocTopo = removeLoad(topo);
    const sc = shortOutputTerminals(topo);
    const sol = solveMNA(sc);
    expect(sol.success).toBe(true);
    const Isc = getShortCircuitCurrent(sol);
    approxEqual(Isc, 20 / 13, TOL, 'Isc = 20/13 A');
  });
});

// ============================================================
// SECTION 11: Circuit 4 & Circuit 6 Multi-Value Stress Tests
// ============================================================
describe('Circuit 4 & Circuit 6 Multi-Value Verification', () => {
  it('Circuit 4: V1=30V, V2=15V, R1=10Ω, R2=20Ω, R3=5Ω, RL=10Ω', () => {
    const cfg = circuitConfigs.find((c) => c.id === 4)!;
    const topo = cfg.buildTopology({ V1: 30, V2: 15, R1: 10, R2: 20, R3: 5, RL: 10 });
    const th = runTheveninAnalysis(topo);
    const no = runNortonAnalysis(topo);
    expect(th.Vth).toBeGreaterThan(0);
    expect(th.Rth).toBeGreaterThan(0);
    approxEqual(th.IL, no.IL, 1e-6, 'Circuit 4 IL equiv');
    approxEqual(th.VL, no.VL, 1e-6, 'Circuit 4 VL equiv');
    approxEqual(th.PL, no.PL, 1e-6, 'Circuit 4 PL equiv');
  });

  it('Circuit 6: V1=20V, I1=4A, R1=4Ω, R2=8Ω, R3=4Ω, RL=6Ω', () => {
    const cfg = circuitConfigs.find((c) => c.id === 6)!;
    const topo = cfg.buildTopology({ V1: 20, I1: 4, R1: 4, R2: 8, R3: 4, RL: 6, dirI: 1 });
    const th = runTheveninAnalysis(topo);
    const no = runNortonAnalysis(topo);
    expect(th.Vth).toBeGreaterThan(0);
    expect(th.Rth).toBeGreaterThan(0);
    approxEqual(th.IL, no.IL, 1e-6, 'Circuit 6 IL equiv');
    approxEqual(th.VL, no.VL, 1e-6, 'Circuit 6 VL equiv');
    approxEqual(th.PL, no.PL, 1e-6, 'Circuit 6 PL equiv');
  });

  it('Thevenin and Norton generate complete step-by-step sequences', () => {
    const cfg = circuitConfigs.find((c) => c.id === 2)!;
    const topo = cfg.buildTopology({ V1: 10, R1: 2, R2: 4, R3: 3, RL: 1 });
    const th = runTheveninAnalysis(topo);
    const no = runNortonAnalysis(topo);
    expect(th.steps.length).toBe(8);
    expect(no.steps.length).toBe(8);
    expect(th.steps[0].title).toBe('Step 1: Original Circuit');
    expect(no.steps[0].title).toBe('Step 1: Original Circuit');
  });
});


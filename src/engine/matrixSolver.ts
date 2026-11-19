/** ============================================================
 * CircuitLAB — Gaussian Elimination with Partial Pivoting
 * Solves Ax = b for DC circuit MNA matrices.
 *
 * Requirements:
 *  - Partial pivoting for numerical stability
 *  - Singular matrix detection (rank deficiency → error)
 *  - Numerical tolerance: EPSILON = 1e-12
 * ============================================================ */

export const EPSILON = 1e-12;
export const DISPLAY_TOL = 1e-9; // tolerance for Th=Norton equivalence checks

/**
 * Solves the linear system Ax = b using Gaussian elimination with
 * partial pivoting. Throws if the matrix is singular or near-singular.
 *
 * @param A - n×n coefficient matrix (will be modified in place — pass a copy)
 * @param b - n-vector right-hand side (will be modified in place)
 * @returns x - solution vector of length n
 */
export function gaussianElimination(A: number[][], b: number[]): number[] {
  const n = A.length;
  if (n === 0) return [];

  // Augmented matrix [A | b]
  const M: number[][] = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    // --- Partial pivoting: find row with largest absolute value in this column ---
    let maxVal = Math.abs(M[col][col]);
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      const v = Math.abs(M[row][col]);
      if (v > maxVal) {
        maxVal = v;
        maxRow = row;
      }
    }

    // Check for singular or near-singular matrix
    if (maxVal < EPSILON) {
      throw new Error(
        `Matrix is singular or near-singular at column ${col}. ` +
        `Check for floating nodes, contradictory sources, or disconnected branches.`
      );
    }

    // Swap rows
    if (maxRow !== col) {
      [M[col], M[maxRow]] = [M[maxRow], M[col]];
    }

    // Eliminate below
    const pivot = M[col][col];
    for (let row = col + 1; row < n; row++) {
      const factor = M[row][col] / pivot;
      for (let j = col; j <= n; j++) {
        M[row][j] -= factor * M[col][j];
      }
      M[row][col] = 0; // explicitly zero to avoid floating point drift
    }
  }

  // Back substitution
  const x = new Array(n).fill(0);
  for (let row = n - 1; row >= 0; row--) {
    let sum = M[row][n]; // RHS
    for (let j = row + 1; j < n; j++) {
      sum -= M[row][j] * x[j];
    }
    x[row] = sum / M[row][row];
  }

  return x;
}

/**
 * Copies a 2D array (deep copy of number[][]).
 */
export function copyMatrix(A: number[][]): number[][] {
  return A.map(row => [...row]);
}

/**
 * Copies a 1D array.
 */
export function copyVector(v: number[]): number[] {
  return [...v];
}

/**
 * Creates an n×n zero matrix.
 */
export function zeroMatrix(n: number): number[][] {
  return Array.from({ length: n }, () => new Array(n).fill(0));
}

/**
 * Creates a zero vector of length n.
 */
export function zeroVector(n: number): number[] {
  return new Array(n).fill(0);
}

/**
 * Rounds a number to a given number of significant figures for display.
 */
export function roundSig(x: number, sig = 7): number {
  if (!isFinite(x) || x === 0) return x;
  const d = Math.ceil(Math.log10(Math.abs(x)));
  const power = sig - d;
  const magnitude = Math.pow(10, power);
  return Math.round(x * magnitude) / magnitude;
}

/**
 * Formats a number for display (up to 7 significant figures, trims trailing zeros).
 */
export function fmt(x: number, digits = 6): string {
  if (!isFinite(x)) return x > 0 ? '+∞' : x < 0 ? '-∞' : 'NaN';
  // Use toPrecision but strip trailing zeros
  const s = parseFloat(x.toPrecision(digits)).toString();
  return s;
}

/**
 * Formats a fraction string like "20/3" if the number is close to a simple fraction.
 */
export function fmtFraction(x: number): string {
  // Try denominators up to 20
  for (let d = 1; d <= 20; d++) {
    const n = Math.round(x * d);
    if (Math.abs(n / d - x) < EPSILON * 100) {
      if (d === 1) return `${n}`;
      return `${n}/${d}`;
    }
  }
  return fmt(x);
}

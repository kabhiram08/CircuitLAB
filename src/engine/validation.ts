/** ============================================================
 * CircuitLAB — Input Validation
 * ============================================================ */

import { ComponentValues, ValidationError } from './types';

/** Component metadata for validation */
interface ComponentSpec {
  id: string;
  label: string;
  type: 'voltage' | 'current' | 'resistance' | 'direction';
  min?: number;
  max?: number;
}

/** Per-circuit component specs */
const circuitSpecs: { [circuitId: number]: ComponentSpec[] } = {
  1: [
    { id: 'V1', label: 'V1 (Voltage Source)', type: 'voltage' },
    { id: 'R1', label: 'R1', type: 'resistance' },
    { id: 'R2', label: 'R2', type: 'resistance' },
    { id: 'RL', label: 'RL (Load)', type: 'resistance' },
  ],
  2: [
    { id: 'V1', label: 'V1 (Voltage Source)', type: 'voltage' },
    { id: 'R1', label: 'R1', type: 'resistance' },
    { id: 'R2', label: 'R2', type: 'resistance' },
    { id: 'R3', label: 'R3', type: 'resistance' },
    { id: 'RL', label: 'RL (Load)', type: 'resistance' },
  ],
  3: [
    { id: 'V1', label: 'V1', type: 'voltage' },
    { id: 'V2', label: 'V2', type: 'voltage' },
    { id: 'R1', label: 'R1', type: 'resistance' },
    { id: 'R2', label: 'R2', type: 'resistance' },
    { id: 'RL', label: 'RL (Load)', type: 'resistance' },
  ],
  4: [
    { id: 'V1', label: 'V1', type: 'voltage' },
    { id: 'V2', label: 'V2', type: 'voltage' },
    { id: 'R1', label: 'R1', type: 'resistance' },
    { id: 'R2', label: 'R2', type: 'resistance' },
    { id: 'R3', label: 'R3', type: 'resistance' },
    { id: 'RL', label: 'RL (Load)', type: 'resistance' },
  ],
  5: [
    { id: 'I1', label: 'I1 (Current Source 1)', type: 'current' },
    { id: 'I2', label: 'I2 (Current Source 2)', type: 'current' },
    { id: 'R1', label: 'R1', type: 'resistance' },
    { id: 'R2', label: 'R2', type: 'resistance' },
    { id: 'RL', label: 'RL (Load)', type: 'resistance' },
  ],
  6: [
    { id: 'V1', label: 'V1 (Voltage Source)', type: 'voltage' },
    { id: 'I1', label: 'I1 (Current Source)', type: 'current' },
    { id: 'R1', label: 'R1', type: 'resistance' },
    { id: 'R2', label: 'R2', type: 'resistance' },
    { id: 'R3', label: 'R3', type: 'resistance' },
    { id: 'RL', label: 'RL (Load)', type: 'resistance' },
  ],
};

export function validateInputs(
  circuitId: number,
  values: ComponentValues
): ValidationError[] {
  const errors: ValidationError[] = [];
  const specs = circuitSpecs[circuitId] ?? [];

  for (const spec of specs) {
    const val = values[spec.id];

    if (val === undefined || val === null || isNaN(val)) {
      errors.push({ field: spec.id, message: `${spec.label} must be a number.` });
      continue;
    }

    if (!isFinite(val)) {
      errors.push({ field: spec.id, message: `${spec.label} must be finite.` });
      continue;
    }

    if (spec.type === 'resistance') {
      if (val <= 0) {
        errors.push({
          field: spec.id,
          message: `${spec.label} must be greater than 0 Ω. Resistance cannot be zero or negative.`,
        });
      }
      if (val > 1e9) {
        errors.push({ field: spec.id, message: `${spec.label} is unreasonably large (> 1GΩ).` });
      }
    }

    if (spec.type === 'voltage' && Math.abs(val) > 1e6) {
      errors.push({ field: spec.id, message: `${spec.label} is unreasonably large (> 1MV).` });
    }

    if (spec.type === 'current' && Math.abs(val) > 1e6) {
      errors.push({ field: spec.id, message: `${spec.label} is unreasonably large (> 1MA).` });
    }
  }

  return errors;
}

export function getDefaultValues(circuitId: number): ComponentValues {
  const defaults: { [id: number]: ComponentValues } = {
    1: { V1: 12, R1: 3, R2: 6, RL: 4 },
    2: { V1: 10, R1: 2, R2: 4, R3: 3, RL: 1 },
    3: { V1: 12, V2: 6, R1: 4, R2: 8, RL: 6, polarity: 1 },
    4: { V1: 20, V2: 10, R1: 5, R2: 10, R3: 4, RL: 8 },
    5: { I1: 4, I2: 2, R1: 6, R2: 12, RL: 4, dir1: 1, dir2: 1 },
    6: { V1: 15, I1: 2, R1: 3, R2: 6, R3: 2, RL: 5, dirI: 1 },
  };
  return { ...(defaults[circuitId] ?? {}) };
}

export function getComponentSpecs(circuitId: number): ComponentSpec[] {
  return circuitSpecs[circuitId] ?? [];
}

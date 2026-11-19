import React from 'react';
import { ComponentValues, ValidationError } from '../engine/types';
import { getComponentSpecs, getDefaultValues } from '../engine/validation';
import { RotateCcwIcon, AlertCircleIcon, SparklesIcon } from './Icons';

interface InputPanelProps {
  circuitId: number;
  values: ComponentValues;
  onChange: (newValues: ComponentValues) => void;
  errors: ValidationError[];
}

export const InputPanel: React.FC<InputPanelProps> = ({
  circuitId,
  values,
  onChange,
  errors,
}) => {
  const specs = getComponentSpecs(circuitId);

  const handleValueChange = (field: string, raw: string) => {
    const num = raw === '' ? NaN : parseFloat(raw);
    onChange({
      ...values,
      [field]: num,
    });
  };

  const handleReset = () => {
    onChange(getDefaultValues(circuitId));
  };

  const handleLoadExample = () => {
    // Provide a customized example per circuit configuration
    const examples: { [id: number]: ComponentValues } = {
      1: { V1: 24, R1: 6, R2: 12, RL: 8 },
      2: { V1: 10, R1: 2, R2: 4, R3: 3, RL: 1 }, // Faculty reference benchmark!
      3: { V1: 18, V2: 9, R1: 6, R2: 12, RL: 4, polarity: 1 },
      4: { V1: 30, V2: 15, R1: 10, R2: 20, R3: 5, RL: 10 },
      5: { I1: 6, I2: 3, R1: 8, R2: 24, RL: 6, dir1: 1, dir2: 1 },
      6: { V1: 20, I1: 4, R1: 4, R2: 8, R3: 4, RL: 6, dirI: 1 },
    };
    onChange(examples[circuitId] ?? getDefaultValues(circuitId));
  };

  const getFieldError = (field: string) =>
    errors.find((e) => e.field === field)?.message;

  return (
    <div className="bg-[#242427] border border-white/10 rounded-xl p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Circuit Parameters</span>
            <span className="text-xs text-yellow-400 font-mono font-normal">
              (Live Inputs)
            </span>
          </h3>
          <p className="text-xs text-gray-400">
            Modify component values and polarities for real-time recalculation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadExample}
            className="btn-outline-gold text-xs px-2.5 py-1.5 flex items-center gap-1"
            title="Load optimized example values"
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>Load Example</span>
          </button>
          <button
            onClick={handleReset}
            className="btn-ghost text-xs px-2.5 py-1.5 flex items-center gap-1"
            title="Reset to default values"
          >
            <RotateCcwIcon className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Component Inputs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {specs.map((spec) => {
          const val = values[spec.id];
          const err = getFieldError(spec.id);
          const isLoad = spec.id === 'RL';

          return (
            <div key={spec.id} className="space-y-1">
              <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                <span className={isLoad ? 'text-green-400 font-bold' : ''}>
                  {spec.id} {isLoad ? '(Load)' : ''}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  {spec.type === 'voltage' ? 'V' : spec.type === 'current' ? 'A' : 'Ω'}
                </span>
              </label>

              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={isNaN(val) ? '' : val}
                  onChange={(e) => handleValueChange(spec.id, e.target.value)}
                  className={`input-gold ${
                    isLoad
                      ? 'border-green-500/50 focus:border-green-400 focus:ring-green-400/20 text-green-300'
                      : ''
                  } ${err ? 'border-red-500/80 focus:border-red-400' : ''}`}
                  placeholder="Value"
                />
                <span className="absolute right-3 top-2 text-xs font-mono text-gray-400 pointer-events-none">
                  {spec.type === 'voltage' ? 'V' : spec.type === 'current' ? 'A' : 'Ω'}
                </span>
              </div>

              {err && (
                <p className="text-[11px] text-red-400 flex items-center gap-1">
                  <AlertCircleIcon className="w-3 h-3 flex-shrink-0" />
                  <span>{err}</span>
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Direction & Polarity Switches for applicable circuits */}
      {circuitId === 3 && (
        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-gray-300 font-semibold">V2 Polarity:</span>
          <div className="flex gap-2">
            <button
              onClick={() => onChange({ ...values, polarity: 1 })}
              className={`px-3 py-1 text-xs rounded-md font-semibold transition-all ${
                (values.polarity ?? 1) >= 0
                  ? 'bg-yellow-500 text-gray-950 shadow-md shadow-yellow-500/20'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              Aiding (+V2)
            </button>
            <button
              onClick={() => onChange({ ...values, polarity: -1 })}
              className={`px-3 py-1 text-xs rounded-md font-semibold transition-all ${
                (values.polarity ?? 1) < 0
                  ? 'bg-yellow-500 text-gray-950 shadow-md shadow-yellow-500/20'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              Opposing (−V2)
            </button>
          </div>
        </div>
      )}

      {circuitId === 5 && (
        <div className="pt-2 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center justify-between bg-black/20 p-2 rounded-lg">
            <span className="text-gray-300">I1 Flow Direction:</span>
            <button
              onClick={() => onChange({ ...values, dir1: (values.dir1 ?? 1) > 0 ? -1 : 1 })}
              className="px-2.5 py-1 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-bold"
            >
              {(values.dir1 ?? 1) > 0 ? '↑ Upward (to Bus A)' : '↓ Downward (to GND)'}
            </button>
          </div>
          <div className="flex items-center justify-between bg-black/20 p-2 rounded-lg">
            <span className="text-gray-300">I2 Flow Direction:</span>
            <button
              onClick={() => onChange({ ...values, dir2: (values.dir2 ?? 1) > 0 ? -1 : 1 })}
              className="px-2.5 py-1 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-bold"
            >
              {(values.dir2 ?? 1) > 0 ? '↑ Upward (to Bus A)' : '↓ Downward (to GND)'}
            </button>
          </div>
        </div>
      )}

      {circuitId === 6 && (
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
          <span className="text-gray-300">I1 Current Source Direction:</span>
          <button
            onClick={() => onChange({ ...values, dirI: (values.dirI ?? 1) > 0 ? -1 : 1 })}
            className="px-3 py-1 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-bold"
          >
            {(values.dirI ?? 1) > 0 ? '↑ Upward (into Node A)' : '↓ Downward (from Node A)'}
          </button>
        </div>
      )}
    </div>
  );
};

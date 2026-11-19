import React from 'react';
import { circuitConfigs } from '../engine/circuitTemplates';
import { SparklesIcon } from './Icons';

interface CircuitSelectorProps {
  selectedId: number;
  onSelect: (id: number) => void;
}

export const CircuitSelector: React.FC<CircuitSelectorProps> = ({ selectedId, onSelect }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-200 uppercase tracking-wider flex items-center gap-2">
          <span>Select Predefined Circuit</span>
          <span className="text-xs text-yellow-400 font-mono">(6 Topologies)</span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {circuitConfigs.map((cfg) => {
          const isSelected = cfg.id === selectedId;
          const isFacultyRef = cfg.id === 2;

          return (
            <button
              key={cfg.id}
              onClick={() => onSelect(cfg.id)}
              className={`text-left p-3.5 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-yellow-500/15 border-yellow-500 shadow-lg shadow-yellow-500/10'
                  : 'bg-[#242427] border-white/10 hover:border-yellow-500/40 hover:bg-[#2a2a2e]'
              }`}
            >
              {/* Faculty Reference Ribbon */}
              {isFacultyRef && (
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                  <SparklesIcon className="w-3 h-3 text-amber-400" />
                  <span>REFERENCE</span>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                      isSelected ? 'bg-yellow-500 text-gray-950' : 'bg-white/10 text-gray-300'
                    }`}
                  >
                    {cfg.id}
                  </span>
                  <span className={`text-sm font-bold truncate pr-16 ${isSelected ? 'text-yellow-400' : 'text-white'}`}>
                    {cfg.name}
                  </span>
                </div>

                <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                  {cfg.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-400">
                <span>Default:</span>
                <span className="text-yellow-300/90 font-semibold truncate max-w-[200px]">
                  {Object.entries(cfg.defaultValues)
                    .filter(([k]) => !['polarity', 'dir1', 'dir2', 'dirI'].includes(k))
                    .map(([k, v]) => `${k}=${v}`)
                    .slice(0, 3)
                    .join(', ')}
                  ...
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

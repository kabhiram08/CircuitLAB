import React from 'react';
import { fmt, fmtFraction } from '../engine/matrixSolver';
import { DownloadIcon, CheckIcon, ZapIcon } from './Icons';

interface ResultsPanelProps {
  theorem: 'thevenin' | 'norton';
  vth: number;
  rth: number;
  inVal: number;
  rn: number;
  il: number;
  vl: number;
  pl: number;
  rl: number;
  onDownloadPDF: () => void;
  isGeneratingPDF?: boolean;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  theorem,
  vth,
  rth,
  inVal,
  rn,
  il,
  vl,
  pl,
  rl,
  onDownloadPDF,
  isGeneratingPDF = false,
}) => {
  return (
    <div className="bg-[#242427] border border-white/10 rounded-xl p-5 shadow-lg space-y-4">
      {/* Title & Download Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Simulation Results &amp; Summary</span>
            <span className="text-xs text-yellow-400 font-mono">(Final Output)</span>
          </h3>
          <p className="text-xs text-gray-400">
            Calculated equivalent circuit parameters and load responses
          </p>
        </div>

        <button
          onClick={onDownloadPDF}
          disabled={isGeneratingPDF}
          className="btn-gold text-xs px-3.5 py-2 flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          {isGeneratingPDF ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
              <span>Generating PDF...</span>
            </>
          ) : (
            <>
              <DownloadIcon className="w-4 h-4" />
              <span>Download PDF Report</span>
            </>
          )}
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Equivalent Source Card */}
        {theorem === 'thevenin' ? (
          <div className="bg-[#18181b] border border-yellow-500/30 rounded-xl p-3.5">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Thevenin Voltage (Vth)
            </span>
            <div className="mt-1 text-xl font-bold font-mono text-yellow-400">
              {fmt(vth)} <span className="text-sm font-sans font-normal text-gray-400">V</span>
            </div>
            <span className="text-xs text-gray-400 font-mono block mt-0.5">
              Exact: {fmtFraction(vth)} V
            </span>
          </div>
        ) : (
          <div className="bg-[#18181b] border border-amber-500/30 rounded-xl p-3.5">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Norton Current (IN)
            </span>
            <div className="mt-1 text-xl font-bold font-mono text-amber-400">
              {fmt(inVal)} <span className="text-sm font-sans font-normal text-gray-400">A</span>
            </div>
            <span className="text-xs text-gray-400 font-mono block mt-0.5">
              Exact: {fmtFraction(inVal)} A
            </span>
          </div>
        )}

        {/* Equivalent Resistance Card */}
        <div className="bg-[#18181b] border border-yellow-500/30 rounded-xl p-3.5">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
            {theorem === 'thevenin' ? "Thevenin Res. (Rth)" : "Norton Res. (RN)"}
          </span>
          <div className="mt-1 text-xl font-bold font-mono text-yellow-400">
            {fmt(theorem === 'thevenin' ? rth : rn)} <span className="text-sm font-sans font-normal text-gray-400">Ω</span>
          </div>
          <span className="text-xs text-gray-400 font-mono block mt-0.5">
            Exact: {fmtFraction(theorem === 'thevenin' ? rth : rn)} Ω
          </span>
        </div>

        {/* Load Current Card */}
        <div className="bg-[#18181b] border border-green-500/30 rounded-xl p-3.5">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
            Load Current (IL)
          </span>
          <div className="mt-1 text-xl font-bold font-mono text-green-400">
            {fmt(il)} <span className="text-sm font-sans font-normal text-gray-400">A</span>
          </div>
          <span className="text-xs text-gray-400 font-mono block mt-0.5">
            Across RL = {fmt(rl)} Ω
          </span>
        </div>

        {/* Load Power Card */}
        <div className="bg-[#18181b] border border-sky-500/30 rounded-xl p-3.5">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
            Load Power (PL)
          </span>
          <div className="mt-1 text-xl font-bold font-mono text-sky-400">
            {fmt(pl)} <span className="text-sm font-sans font-normal text-gray-400">W</span>
          </div>
          <span className="text-xs text-gray-400 font-mono block mt-0.5">
            VL = {fmt(vl)} V
          </span>
        </div>
      </div>

      {/* Thevenin-Norton Duality Verification Box */}
      <div className="bg-gradient-to-r from-yellow-500/10 via-amber-500/5 to-transparent border border-yellow-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <ZapIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-yellow-400 flex items-center gap-1.5">
              <span>Thevenin-Norton Source Transformation Duality</span>
              <CheckIcon className="w-4 h-4 text-green-400" />
            </h4>
            <p className="text-xs text-gray-300 font-mono mt-1">
              Vth = IN × RN ⟹ ({fmt(inVal)} A) × ({fmt(rn)} Ω) = {fmt(inVal * rn)} V
              {Math.abs(vth - inVal * rn) < 1e-6 && ' (Verified ✓)'}
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-gray-400 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5 self-start sm:self-auto">
          Rth = RN = {fmt(rth)} Ω
        </div>
      </div>
    </div>
  );
};

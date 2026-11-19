import React from 'react';
import { ZapIcon } from './Icons';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#141416] py-8 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
              <ZapIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-white">CircuitLAB</span>
              <span className="text-xs text-gray-500 ml-2">
                Interactive Thevenin &amp; Norton Simulator
              </span>
            </div>
          </div>

          {/* Compact Academic Identity Section */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs bg-[#1c1c1f] px-4 py-2 rounded-lg border border-yellow-500/25">
            <span className="font-semibold text-yellow-400">KDNSP Abhiram</span>
            <span className="text-gray-600">•</span>
            <span className="font-mono text-gray-200">26211A05N2</span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-300">CSE D</span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-400">BVRIT Narsapur</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          <p>© {new Date().getFullYear()} CircuitLAB. Professional Deterministic DC Network Simulation.</p>
          <p className="text-yellow-400/80">Reference Problem: Circuit 2 (IL = 1.25 A Verified)</p>
        </div>
      </div>
    </footer>
  );
};

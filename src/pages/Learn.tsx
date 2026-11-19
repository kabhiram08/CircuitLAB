import React from 'react';
import {
  THEVENIN_STATEMENT,
  NORTON_STATEMENT,
  THEVENIN_THEORY,
  NORTON_THEORY,
  FACULTY_REFERENCE_PROBLEM,
  COMPARISON_TABLE,
} from '../data/educationalContent';
import {
  BookOpenIcon,
  CpuIcon,
  ZapIcon,
  SparklesIcon,
  CheckIcon,
} from '../components/Icons';

export const Learn: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 pb-16">
      {/* Page Header */}
      <div className="border-b border-white/10 pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 text-xs font-semibold">
          <BookOpenIcon className="w-3.5 h-3.5" />
          <span>Educational &amp; Theoretical Reference</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Learning Mode &amp; Theoretical Foundations
        </h1>
        <p className="text-sm sm:text-base text-gray-400 max-w-3xl">
          Comprehensive curriculum notes, mathematical working principles, and complete solutions
          aligned with foundational Basic Electrical Engineering principles.
        </p>
      </div>

      {/* 1. FACULTY STATEMENTS SECTION */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-6 rounded bg-yellow-400" />
          <span>Formal Theorem Statements (Verbatim)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Thevenin Statement */}
          <div className="bg-[#242427] border-l-4 border-yellow-500 rounded-r-xl p-6 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm">
              <CpuIcon className="w-5 h-5" />
              <span>THEVENIN'S THEOREM STATEMENT</span>
            </div>
            <p className="text-gray-200 text-sm leading-relaxed italic font-serif whitespace-pre-line bg-[#18181b] p-4 rounded-lg border border-white/5">
              "{THEVENIN_STATEMENT}"
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              <p>• Equivalent: Single voltage source Vth</p>
              <p>• Resistance: Single resistance Rth in series</p>
              <p>• Load: Connected in series across terminals</p>
            </div>
          </div>

          {/* Norton Statement */}
          <div className="bg-[#242427] border-l-4 border-amber-500 rounded-r-xl p-6 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <ZapIcon className="w-5 h-5" />
              <span>NORTON'S THEOREM STATEMENT</span>
            </div>
            <p className="text-gray-200 text-sm leading-relaxed italic font-serif whitespace-pre-line bg-[#18181b] p-4 rounded-lg border border-white/5">
              "{NORTON_STATEMENT}"
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              <p>• Equivalent: Single current source IN</p>
              <p>• Resistance: Single resistance RN in parallel</p>
              <p>• Load: Connected in parallel across terminals</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FACULTY SOLVED REFERENCE PROBLEM */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span className="w-2 h-6 rounded bg-yellow-400" />
            <span>Standard Reference Problem (Full Worked Solution)</span>
          </h2>
          <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs font-bold font-mono">
            REFERENCE BENCHMARK
          </span>
        </div>

        <div className="bg-[#242427] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white text-yellow-400">
              {FACULTY_REFERENCE_PROBLEM.title}
            </h3>
            <p className="text-sm text-gray-300 mt-2 leading-relaxed">
              {FACULTY_REFERENCE_PROBLEM.circuitDescription}
            </p>

            {/* Given Parameters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
              {Object.entries(FACULTY_REFERENCE_PROBLEM.givenValues).map(([k, v]) => (
                <div key={k} className="bg-[#18181b] border border-white/10 rounded-lg p-2.5 text-center">
                  <span className="text-xs text-gray-400 block">{k}</span>
                  <span className="text-sm font-bold font-mono text-yellow-300">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Side-by-side Full Worked Solutions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
            {/* Thevenin Solution */}
            <div className="space-y-4 bg-[#1b1b1e] p-5 rounded-xl border border-yellow-500/20">
              <h4 className="text-base font-bold text-yellow-400 flex items-center gap-2">
                <CpuIcon className="w-5 h-5" />
                <span>Thevenin Method Solution</span>
              </h4>

              <div className="space-y-3 text-xs text-gray-300">
                <div className="p-3 bg-[#141416] rounded-lg border border-white/5 space-y-1">
                  <span className="font-bold text-white block">Step 1: Disconnect Load</span>
                  <p>{FACULTY_REFERENCE_PROBLEM.theveninSolution.step1}</p>
                </div>

                <div className="p-3 bg-[#141416] rounded-lg border border-white/5 space-y-1">
                  <span className="font-bold text-white block">Step 2: Calculate Vth (Voc)</span>
                  <p>{FACULTY_REFERENCE_PROBLEM.theveninSolution.step2}</p>
                  <p className="text-yellow-400 font-mono font-bold pt-1">
                    Vth = 10 × (4 / 6) = 20/3 V = 6.6666667 V
                  </p>
                </div>

                <div className="p-3 bg-[#141416] rounded-lg border border-white/5 space-y-1">
                  <span className="font-bold text-white block">Step 3: Calculate Rth (Deactivate Sources)</span>
                  <p>{FACULTY_REFERENCE_PROBLEM.theveninSolution.step3}</p>
                  <p className="text-yellow-400 font-mono font-bold pt-1">
                    Rth = 3 + (2 × 4)/(2 + 4) = 3 + 8/6 = 13/3 Ω = 4.3333333 Ω
                  </p>
                </div>

                <div className="p-3 bg-[#141416] rounded-lg border border-white/5 space-y-1">
                  <span className="font-bold text-white block">Step 4: Reconnect RL &amp; Calculate IL</span>
                  <p>{FACULTY_REFERENCE_PROBLEM.theveninSolution.step4}</p>
                  <div className="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded text-green-400 font-mono font-bold text-center">
                    IL = 1.25 A | VL = 1.25 V | PL = 1.5625 W
                  </div>
                </div>
              </div>
            </div>

            {/* Norton Solution */}
            <div className="space-y-4 bg-[#1b1b1e] p-5 rounded-xl border border-amber-500/20">
              <h4 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <ZapIcon className="w-5 h-5" />
                <span>Norton Method Solution</span>
              </h4>

              <div className="space-y-3 text-xs text-gray-300">
                <div className="p-3 bg-[#141416] rounded-lg border border-white/5 space-y-1">
                  <span className="font-bold text-white block">Step 1: Short Output Terminals</span>
                  <p>{FACULTY_REFERENCE_PROBLEM.nortonSolution.step1}</p>
                </div>

                <div className="p-3 bg-[#141416] rounded-lg border border-white/5 space-y-1">
                  <span className="font-bold text-white block">Step 2: Calculate IN (Isc)</span>
                  <p>{FACULTY_REFERENCE_PROBLEM.nortonSolution.step2}</p>
                  <p className="text-amber-400 font-mono font-bold pt-1">
                    IN = 20/13 A = 1.5384615 A
                  </p>
                </div>

                <div className="p-3 bg-[#141416] rounded-lg border border-white/5 space-y-1">
                  <span className="font-bold text-white block">Step 3: Calculate RN (Same as Rth)</span>
                  <p>{FACULTY_REFERENCE_PROBLEM.nortonSolution.step3}</p>
                  <p className="text-amber-400 font-mono font-bold pt-1">
                    RN = Rth = 13/3 Ω = 4.3333333 Ω
                  </p>
                </div>

                <div className="p-3 bg-[#141416] rounded-lg border border-white/5 space-y-1">
                  <span className="font-bold text-white block">Step 4: Reconnect RL &amp; Current Division</span>
                  <p>{FACULTY_REFERENCE_PROBLEM.nortonSolution.step4}</p>
                  <div className="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded text-green-400 font-mono font-bold text-center">
                    IL = 1.25 A | VL = 1.25 V | PL = 1.5625 W
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Duality Verification Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 flex items-center gap-3">
            <SparklesIcon className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div className="text-xs text-gray-200">
              <strong className="text-yellow-400 font-mono">Duality Check: </strong>
              {FACULTY_REFERENCE_PROBLEM.dualityCheck}
            </div>
          </div>
        </div>
      </section>

      {/* 3. THEVENIN VS NORTON COMPARISON TABLE */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-6 rounded bg-yellow-400" />
          <span>Thevenin's vs Norton's Theorem Comparison</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse bg-[#242427] rounded-xl overflow-hidden border border-white/10 shadow-lg">
            <thead>
              <tr className="bg-[#18181b] border-b border-white/10 text-gray-300">
                <th className="p-4 font-bold">Feature / Parameter</th>
                <th className="p-4 font-bold text-yellow-400">Thevenin's Theorem</th>
                <th className="p-4 font-bold text-amber-400">Norton's Theorem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {COMPARISON_TABLE.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-semibold text-white">{row.parameter}</td>
                  <td className="p-4 font-mono text-yellow-200">{row.thevenin}</td>
                  <td className="p-4 font-mono text-amber-200">{row.norton}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. KEY FORMULAS & PROCEDURAL SUMMARY */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-6 rounded bg-yellow-400" />
          <span>Key Electrical Formulas &amp; Reference Rules</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Deactivation Rules Card */}
          <div className="bg-[#242427] border border-white/10 rounded-xl p-5 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-yellow-400">⚡</span>
              <span>Source Deactivation Rules</span>
            </h3>
            <div className="space-y-2 text-xs text-gray-300">
              <div className="p-3 bg-[#18181b] rounded-lg border border-sky-500/30">
                <span className="font-bold text-sky-400 block">Independent Voltage Source (Vs):</span>
                <p className="mt-1">
                  Replace with a <strong>SHORT CIRCUIT (0 V)</strong>. An ideal voltage source has 0 Ω internal impedance, so killing its potential difference produces a direct wire.
                </p>
              </div>
              <div className="p-3 bg-[#18181b] rounded-lg border border-amber-500/30">
                <span className="font-bold text-amber-400 block">Independent Current Source (Is):</span>
                <p className="mt-1">
                  Replace with an <strong>OPEN CIRCUIT (0 A)</strong>. An ideal current source has infinite internal impedance, so killing its current output creates a physical break.
                </p>
              </div>
            </div>
          </div>

          {/* Core Laws Card */}
          <div className="bg-[#242427] border border-white/10 rounded-xl p-5 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-yellow-400">📐</span>
              <span>Governing Circuit Laws</span>
            </h3>
            <div className="space-y-2 text-xs font-mono text-gray-300">
              <div className="p-2.5 bg-[#18181b] rounded-lg border border-white/5 flex justify-between">
                <span>Ohm's Law:</span>
                <span className="text-yellow-300 font-bold">V = I · R</span>
              </div>
              <div className="p-2.5 bg-[#18181b] rounded-lg border border-white/5 flex justify-between">
                <span>Kirchhoff's Current Law (KCL):</span>
                <span className="text-yellow-300 font-bold">Σ I_in = Σ I_out</span>
              </div>
              <div className="p-2.5 bg-[#18181b] rounded-lg border border-white/5 flex justify-between">
                <span>Kirchhoff's Voltage Law (KVL):</span>
                <span className="text-yellow-300 font-bold">Σ V_loop = 0</span>
              </div>
              <div className="p-2.5 bg-[#18181b] rounded-lg border border-white/5 flex justify-between">
                <span>Source Transformation:</span>
                <span className="text-yellow-300 font-bold">Vth = IN · Rth (RN = Rth)</span>
              </div>
              <div className="p-2.5 bg-[#18181b] rounded-lg border border-white/5 flex justify-between">
                <span>Load Power Formula:</span>
                <span className="text-yellow-300 font-bold">PL = IL² · RL = VL · IL</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

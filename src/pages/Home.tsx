import React from 'react';
import { Link } from 'react-router-dom';
import {
  ZapIcon,
  CpuIcon,
  BookOpenIcon,
  ArrowRightIcon,
  SparklesIcon,
  CheckIcon,
  LayersIcon,
} from '../components/Icons';
import { THEVENIN_STATEMENT, NORTON_STATEMENT } from '../data/educationalContent';

export const Home: React.FC = () => {
  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-8 sm:pt-16 sm:pb-12 border-b border-white/10 bg-gradient-to-b from-[#1c1c20] to-[#141416]">
        {/* Subtle circuit background pattern */}
        <div className="absolute inset-0 bg-circuit-pattern opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-semibold tracking-wide">
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>Professional DC Network Simulation &amp; Analysis Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Interactive <span className="gold-text">Thevenin's &amp; Norton's</span> Theorem Simulator
          </h1>

          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Welcome to <strong className="text-white">CircuitLAB</strong> — a genuine DC electrical circuit simulation platform.
            Explore network transformations step by step with mathematically deterministic calculations,
            animated circuit reductions, and downloadable comprehensive PDF reports.
          </p>

          {/* Quick Metrics / Features */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-mono text-gray-300">
            <div className="flex items-center gap-2 bg-black/40 px-3.5 py-1.5 rounded-lg border border-white/10">
              <CheckIcon className="w-4 h-4 text-yellow-400" />
              <span>Gaussian Elimination MNA Engine</span>
            </div>
            <div className="flex items-center gap-2 bg-black/40 px-3.5 py-1.5 rounded-lg border border-white/10">
              <CheckIcon className="w-4 h-4 text-yellow-400" />
              <span>6 Predefined Circuit Configurations</span>
            </div>
            <div className="flex items-center gap-2 bg-black/40 px-3.5 py-1.5 rounded-lg border border-white/10">
              <CheckIcon className="w-4 h-4 text-yellow-400" />
              <span>Standard Reference Problem: IL = 1.25 A Verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* TWO THEOREM SELECTION CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Select a Theorem to Simulate</h2>
          <p className="text-sm text-gray-400 mt-2">
            Choose between Thevenin's voltage-source series equivalent or Norton's current-source parallel equivalent
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* CARD 1: THEVENIN'S THEOREM */}
          <div className="card group hover:border-yellow-500/60 transition-all duration-300 p-8 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#242427] to-[#1c1c1f]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-bl-full pointer-events-none group-hover:bg-yellow-500/10 transition-colors" />

            <div className="space-y-4">
              <div className="w-14 h-14 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center border border-yellow-500/30 shadow-lg shadow-yellow-500/10 group-hover:scale-105 transition-transform">
                <CpuIcon className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-yellow-400">Card 1</span>
                <h3 className="text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors">
                  THEVENIN'S THEOREM
                </h3>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed">
                Simplify a complex linear bilateral electrical network into an equivalent voltage source and series resistance.
              </p>

              {/* Faculty Definition Snippet */}
              <div className="bg-[#18181b] border-l-2 border-yellow-500 p-3 rounded-r-lg text-xs text-gray-300 italic">
                "{THEVENIN_STATEMENT.split('\n\n')[0].replace("Thevenin's Theorem Statement : ", '')}"
              </div>

              <div className="space-y-1.5 text-xs text-gray-400 font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">▶</span>
                  <span>Calculates Open-Circuit Voltage: Voc = Vth</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">▶</span>
                  <span>Deactivates Independent Sources to find Rth</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">▶</span>
                  <span>Calculates IL = Vth / (Rth + RL)</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10">
              <Link
                to="/thevenin"
                className="btn-gold w-full justify-center group-hover:shadow-yellow-500/30"
              >
                <span>Launch Thevenin Simulator</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* CARD 2: NORTON'S THEOREM */}
          <div className="card group hover:border-amber-500/60 transition-all duration-300 p-8 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#242427] to-[#1c1c1f]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:bg-amber-500/10 transition-colors" />

            <div className="space-y-4">
              <div className="w-14 h-14 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-transform">
                <ZapIcon className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Card 2</span>
                <h3 className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">
                  NORTON'S THEOREM
                </h3>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed">
                Simplify a complex linear bilateral electrical network into an equivalent current source and parallel resistance.
              </p>

              {/* Faculty Definition Snippet */}
              <div className="bg-[#18181b] border-l-2 border-amber-500 p-3 rounded-r-lg text-xs text-gray-300 italic">
                "{NORTON_STATEMENT.split('\n\n')[0].replace("Norton's Theorem Statement : ", '')}"
              </div>

              <div className="space-y-1.5 text-xs text-gray-400 font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">▶</span>
                  <span>Calculates Short-Circuit Current: Isc = IN</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">▶</span>
                  <span>Deactivates Independent Sources: RN = Rth</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">▶</span>
                  <span>Calculates IL via Current Divider: IN × [RN / (RN + RL)]</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10">
              <Link
                to="/norton"
                className="w-full justify-center inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-950 hover:from-amber-300 hover:to-yellow-400 transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5"
              >
                <span>Launch Norton Simulator</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FACULTY REFERENCE PROBLEM HIGHLIGHT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#242427] via-[#2a2a2e] to-[#242427] border border-yellow-500/30 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 text-xs font-bold font-mono">
                  VERIFIED BENCHMARK
                </span>
                <span className="text-xs text-gray-400">Standard Ladder Reference Circuit (Circuit 2)</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Pre-calibrated with the Standard Reference Circuit
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Topology: 10 V source, R1 = 2 Ω series, R2 = 4 Ω shunt to ground at junction A, R3 = 3 Ω to output B, and RL = 1 Ω load.
                Both Thevenin and Norton theorems mathematically yield the exact expected load current:
              </p>
              <div className="flex flex-wrap gap-4 pt-1 font-mono text-xs">
                <span className="bg-[#18181b] px-3 py-1.5 rounded-lg border border-white/10 text-yellow-300">
                  Vth = 20/3 V = 6.667 V
                </span>
                <span className="bg-[#18181b] px-3 py-1.5 rounded-lg border border-white/10 text-yellow-300">
                  Rth = 13/3 Ω = 4.333 Ω
                </span>
                <span className="bg-[#18181b] px-3 py-1.5 rounded-lg border border-green-500/40 text-green-400 font-bold">
                  Expected IL = 1.25 A (Exact ✓)
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Link
                to="/thevenin"
                className="btn-outline-gold text-xs px-4 py-2.5 text-center"
              >
                Verify in Thevenin
              </Link>
              <Link
                to="/norton"
                className="btn-outline-gold text-xs px-4 py-2.5 text-center"
              >
                Verify in Norton
              </Link>
              <Link
                to="/learn"
                className="btn-gold text-xs px-4 py-2.5 text-center"
              >
                Read Full Solution
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SIX PREDEFINED CONFIGURATIONS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <LayersIcon className="w-6 h-6 text-yellow-400" />
            <span>Six Mathematically Well-Defined Circuit Templates</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            No drawing required — immediately enter component values into any supported topology
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { id: 1, title: 'Circuit 1: Single Voltage Source', desc: 'Series and parallel resistors with load' },
            { id: 2, title: 'Circuit 2: Series-Parallel Ladder', desc: 'Reference ladder network with junction A & B' },
            { id: 3, title: 'Circuit 3: Two Voltage Sources in Series', desc: 'Aiding and opposing source polarity toggle' },
            { id: 4, title: 'Circuit 4: Two VS in Separate Branches', desc: 'Two independent sources feeding common node' },
            { id: 5, title: 'Circuit 5: Multiple Current Sources', desc: 'Two independent current sources with reversible flow' },
            { id: 6, title: 'Circuit 6: Mixed VS and CS Network', desc: 'Simultaneous independent voltage and current sources' },
          ].map((c) => (
            <div key={c.id} className="bg-[#242427] border border-white/10 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-xs font-bold">
                  {c.id}
                </span>
                <span className="text-sm font-bold text-white">{c.title}</span>
              </div>
              <p className="text-xs text-gray-400">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ZapIcon, BookOpenIcon, CpuIcon } from './Icons';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#161618]/90 backdrop-blur-md border-b border-yellow-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-gray-950 font-bold shadow-lg shadow-yellow-500/20 group-hover:scale-105 transition-transform">
            <ZapIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-yellow-400 transition-colors">
                Circuit<span className="text-yellow-400">LAB</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                Pro Sim
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden sm:block">
              Interactive Thevenin &amp; Norton Simulator
            </p>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isActive('/')
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Home
          </Link>

          <Link
            to="/thevenin"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              isActive('/thevenin')
                ? 'bg-yellow-500 text-gray-950 font-semibold shadow-md shadow-yellow-500/20'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <CpuIcon className="w-4 h-4" />
            <span>Thevenin's Theorem</span>
          </Link>

          <Link
            to="/norton"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              isActive('/norton')
                ? 'bg-amber-500 text-gray-950 font-semibold shadow-md shadow-amber-500/20'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <ZapIcon className="w-4 h-4" />
            <span>Norton's Theorem</span>
          </Link>

          <Link
            to="/learn"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              isActive('/learn')
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpenIcon className="w-4 h-4" />
            <span>Learning Mode</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

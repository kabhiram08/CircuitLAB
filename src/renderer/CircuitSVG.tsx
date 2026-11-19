import React from 'react';
import { AnimationState, ComponentValues } from '../engine/types';
import { fmt, fmtFraction } from '../engine/matrixSolver';

interface CircuitSVGProps {
  circuitId: number;
  values: ComponentValues;
  animationState: AnimationState;
  theorem: 'thevenin' | 'norton';
  vth?: number;
  rth?: number;
  inVal?: number;
  rn?: number;
  il?: number;
  vl?: number;
}

export const CircuitSVG: React.FC<CircuitSVGProps> = ({
  circuitId,
  values,
  animationState,
  theorem,
  vth = 0,
  rth = 0,
  inVal = 0,
  rn = 0,
  il = 0,
  vl = 0,
}) => {
  // Helpers for checking current stage
  const isEquivalentStage =
    animationState === 'equivalent_built' ||
    animationState === 'norton_equivalent_built' ||
    animationState === 'load_reconnected' ||
    animationState === 'results_shown';

  const isSourcesDeactivated =
    animationState === 'sources_deactivated' || animationState === 'rth_calculated';

  const isLoadRemoved =
    animationState !== 'original' && !isEquivalentStage;

  const isTerminalsShorted =
    animationState === 'terminals_shorted' || animationState === 'isc_calculated';

  const isLoadReconnected =
    animationState === 'load_reconnected' || animationState === 'results_shown';

  // Component values with sensible fallbacks
  const V1 = values.V1 ?? 10;
  const V2 = values.V2 ?? 6;
  const I1 = values.I1 ?? 4;
  const I2 = values.I2 ?? 2;
  const R1 = values.R1 ?? 2;
  const R2 = values.R2 ?? 4;
  const R3 = values.R3 ?? 3;
  const RL = values.RL ?? 1;
  const polarity = (values.polarity ?? 1) >= 0;
  const dir1 = (values.dir1 ?? 1) >= 0;
  const dir2 = (values.dir2 ?? 1) >= 0;
  const dirI = (values.dirI ?? 1) >= 0;

  // Render Canonical Equivalent Circuit if in equivalent stages
  if (isEquivalentStage) {
    return (
      <svg
        viewBox="0 0 800 420"
        className="w-full h-auto bg-[#18181b] rounded-xl border border-yellow-500/20 shadow-2xl select-none"
      >
        <defs>
          <pattern id="eq-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#27272a" strokeWidth="0.8" />
          </pattern>
          <filter id="gold-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <rect width="800" height="420" fill="#141416" />
        <rect width="800" height="420" fill="url(#eq-grid)" />

        {/* Title Badge */}
        <g transform="translate(40, 36)">
          <rect
            width="320"
            height="32"
            rx="6"
            fill="#27272a"
            stroke="#eab308"
            strokeWidth="1.2"
          />
          <text x="160" y="21" fill="#facc15" fontSize="13" fontWeight="600" textAnchor="middle">
            {theorem === 'thevenin' ? "THEVENIN'S EQUIVALENT CIRCUIT" : "NORTON'S EQUIVALENT CIRCUIT"}
          </text>
        </g>

        {/* State Banner */}
        <g transform="translate(540, 36)">
          <rect
            width="220"
            height="32"
            rx="6"
            fill={isLoadReconnected ? '#1e3a1e' : '#3f2c10'}
            stroke={isLoadReconnected ? '#22c55e' : '#eab308'}
            strokeWidth="1.2"
          />
          <text
            x="110"
            y="21"
            fill={isLoadReconnected ? '#4ade80' : '#fde047'}
            fontSize="12"
            fontWeight="600"
            textAnchor="middle"
          >
            {isLoadReconnected ? '✓ LOAD RECONNECTED (RL)' : '○ OPEN TERMINALS (A, B)'}
          </text>
        </g>

        {theorem === 'thevenin' ? (
          /* THEVENIN EQUIVALENT CIRCUIT (Vth in series with Rth) */
          <g transform="translate(40, 20)">
            {/* Wires */}
            {/* Top wire from Vth top (160, 140) to Rth left (280, 140) */}
            <line x1="160" y1="140" x2="280" y2="140" stroke="#facc15" strokeWidth="3" />
            {/* Wire from Rth right (380, 140) to Terminal A (560, 140) */}
            <line x1="380" y1="140" x2="560" y2="140" stroke="#facc15" strokeWidth="3" />
            {/* Bottom ground rail from Vth bottom (160, 300) to Terminal B (560, 300) */}
            <line x1="160" y1="300" x2="560" y2="300" stroke="#facc15" strokeWidth="3" />

            {/* Current flow animation when load reconnected */}
            {isLoadReconnected && (
              <>
                <line
                  x1="160"
                  y1="140"
                  x2="560"
                  y2="140"
                  stroke="#22c55e"
                  strokeWidth="2.5"
                  strokeDasharray="8 6"
                  className="current-flow-animation"
                />
                <line
                  x1="560"
                  y1="140"
                  x2="560"
                  y2="300"
                  stroke="#22c55e"
                  strokeWidth="2.5"
                  strokeDasharray="8 6"
                  className="current-flow-animation"
                />
                <line
                  x1="560"
                  y1="300"
                  x2="160"
                  y2="300"
                  stroke="#22c55e"
                  strokeWidth="2.5"
                  strokeDasharray="8 6"
                  className="current-flow-animation"
                />
              </>
            )}

            {/* Vth Voltage Source (160, 220) */}
            <circle cx="160" cy="220" r="32" fill="#242427" stroke="#eab308" strokeWidth="3" />
            <text x="160" y="208" fill="#eab308" fontSize="20" fontWeight="bold" textAnchor="middle">
              +
            </text>
            <text x="160" y="238" fill="#eab308" fontSize="20" fontWeight="bold" textAnchor="middle">
              −
            </text>
            <line x1="160" y1="140" x2="160" y2="188" stroke="#facc15" strokeWidth="3" />
            <line x1="160" y1="252" x2="160" y2="300" stroke="#facc15" strokeWidth="3" />
            {/* Vth Label */}
            <rect x="90" y="245" width="140" height="28" rx="4" fill="#18181b" stroke="#71717a" strokeWidth="1" />
            <text x="160" y="263" fill="#fef08a" fontSize="13" fontWeight="bold" textAnchor="middle">
              Vth = {fmt(vth)} V
            </text>

            {/* Rth Resistor (horizontal, 280 to 380) */}
            <g transform="translate(280, 140)">
              {/* Zig-zag resistor symbol */}
              <path
                d="M 0 0 L 15 0 L 22 -16 L 37 16 L 52 -16 L 67 16 L 82 -16 L 88 0 L 100 0"
                fill="none"
                stroke="#eab308"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect x="0" y="-48" width="100" height="26" rx="4" fill="#18181b" stroke="#71717a" strokeWidth="1" />
              <text x="50" y="-31" fill="#facc15" fontSize="13" fontWeight="bold" textAnchor="middle">
                Rth = {fmt(rth)} Ω
              </text>
            </g>

            {/* Terminal A */}
            <circle cx="560" cy="140" r="7" fill="#18181b" stroke="#facc15" strokeWidth="3" />
            <text x="585" y="145" fill="#facc15" fontSize="16" fontWeight="bold">
              A (+)
            </text>

            {/* Terminal B */}
            <circle cx="560" cy="300" r="7" fill="#18181b" stroke="#facc15" strokeWidth="3" />
            <text x="585" y="305" fill="#facc15" fontSize="16" fontWeight="bold">
              B (−)
            </text>

            {/* Load RL */}
            {isLoadReconnected ? (
              <g transform="translate(560, 140)">
                <line x1="0" y1="0" x2="0" y2="40" stroke="#facc15" strokeWidth="3" />
                <path
                  d="M 0 40 L 0 50 L -16 57 L 16 72 L -16 87 L 16 102 L -16 117 L 0 124 L 0 160"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect x="25" y="85" width="115" height="26" rx="4" fill="#18181b" stroke="#22c55e" strokeWidth="1" />
                <text x="82" y="102" fill="#4ade80" fontSize="12" fontWeight="bold" textAnchor="middle">
                  RL = {fmt(RL)} Ω
                </text>
              </g>
            ) : (
              <g transform="translate(560, 140)">
                <line x1="0" y1="0" x2="0" y2="30" stroke="#71717a" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="0" y1="130" x2="0" y2="160" stroke="#71717a" strokeWidth="2" strokeDasharray="4 4" />
                <rect x="-35" y="60" width="70" height="40" rx="4" fill="#27272a" stroke="#71717a" strokeDasharray="4 4" strokeWidth="1.5" />
                <text x="0" y="84" fill="#a1a1aa" fontSize="11" textAnchor="middle">
                  RL REMOVED
                </text>
              </g>
            )}

            {/* Results Callout when reconnected */}
            {isLoadReconnected && (
              <g transform="translate(240, 240)">
                <rect width="240" height="65" rx="8" fill="#18181b" stroke="#22c55e" strokeWidth="1.5" />
                <text x="120" y="24" fill="#4ade80" fontSize="14" fontWeight="bold" textAnchor="middle">
                  IL = {fmt(il)} A
                </text>
                <text x="120" y="48" fill="#d1d5db" fontSize="12" textAnchor="middle">
                  VL = {fmt(vl)} V | PL = {fmt(il * vl)} W
                </text>
              </g>
            )}
          </g>
        ) : (
          /* NORTON EQUIVALENT CIRCUIT (IN in parallel with RN) */
          <g transform="translate(40, 20)">
            {/* Top Rail */}
            <line x1="160" y1="140" x2="560" y2="140" stroke="#facc15" strokeWidth="3" />
            {/* Bottom Rail */}
            <line x1="160" y1="300" x2="560" y2="300" stroke="#facc15" strokeWidth="3" />

            {/* Current flow animations */}
            {isLoadReconnected && (
              <>
                <line
                  x1="160"
                  y1="300"
                  x2="160"
                  y2="140"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="8 6"
                  className="current-flow-animation"
                />
                <line
                  x1="160"
                  y1="140"
                  x2="560"
                  y2="140"
                  stroke="#22c55e"
                  strokeWidth="2.5"
                  strokeDasharray="8 6"
                  className="current-flow-animation"
                />
                <line
                  x1="560"
                  y1="140"
                  x2="560"
                  y2="300"
                  stroke="#22c55e"
                  strokeWidth="2.5"
                  strokeDasharray="8 6"
                  className="current-flow-animation"
                />
              </>
            )}

            {/* IN Current Source (160, 220) */}
            <line x1="160" y1="140" x2="160" y2="188" stroke="#facc15" strokeWidth="3" />
            <circle cx="160" cy="220" r="32" fill="#242427" stroke="#eab308" strokeWidth="3" />
            {/* Arrow pointing UP */}
            <line x1="160" y1="240" x2="160" y2="202" stroke="#eab308" strokeWidth="3" />
            <polygon points="160,196 153,208 167,208" fill="#eab308" />
            <line x1="160" y1="252" x2="160" y2="300" stroke="#facc15" strokeWidth="3" />
            <rect x="90" y="245" width="140" height="28" rx="4" fill="#18181b" stroke="#71717a" strokeWidth="1" />
            <text x="160" y="263" fill="#fef08a" fontSize="13" fontWeight="bold" textAnchor="middle">
              IN = {fmt(inVal)} A
            </text>

            {/* RN Resistor (vertical branch, x=360) */}
            <g transform="translate(360, 140)">
              <line x1="0" y1="0" x2="0" y2="40" stroke="#facc15" strokeWidth="3" />
              <path
                d="M 0 40 L 0 50 L -16 57 L 16 72 L -16 87 L 16 102 L -16 117 L 0 124 L 0 160"
                fill="none"
                stroke="#eab308"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect x="25" y="85" width="115" height="26" rx="4" fill="#18181b" stroke="#71717a" strokeWidth="1" />
              <text x="82" y="102" fill="#facc15" fontSize="12" fontWeight="bold" textAnchor="middle">
                RN = {fmt(rn)} Ω
              </text>
            </g>

            {/* Terminal A */}
            <circle cx="560" cy="140" r="7" fill="#18181b" stroke="#facc15" strokeWidth="3" />
            <text x="585" y="145" fill="#facc15" fontSize="16" fontWeight="bold">
              A (+)
            </text>

            {/* Terminal B */}
            <circle cx="560" cy="300" r="7" fill="#18181b" stroke="#facc15" strokeWidth="3" />
            <text x="585" y="305" fill="#facc15" fontSize="16" fontWeight="bold">
              B (−)
            </text>

            {/* Load RL */}
            {isLoadReconnected ? (
              <g transform="translate(560, 140)">
                <line x1="0" y1="0" x2="0" y2="40" stroke="#facc15" strokeWidth="3" />
                <path
                  d="M 0 40 L 0 50 L -16 57 L 16 72 L -16 87 L 16 102 L -16 117 L 0 124 L 0 160"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect x="25" y="85" width="115" height="26" rx="4" fill="#18181b" stroke="#22c55e" strokeWidth="1" />
                <text x="82" y="102" fill="#4ade80" fontSize="12" fontWeight="bold" textAnchor="middle">
                  RL = {fmt(RL)} Ω
                </text>
              </g>
            ) : (
              <g transform="translate(560, 140)">
                <line x1="0" y1="0" x2="0" y2="30" stroke="#71717a" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="0" y1="130" x2="0" y2="160" stroke="#71717a" strokeWidth="2" strokeDasharray="4 4" />
                <rect x="-35" y="60" width="70" height="40" rx="4" fill="#27272a" stroke="#71717a" strokeDasharray="4 4" strokeWidth="1.5" />
                <text x="0" y="84" fill="#a1a1aa" fontSize="11" textAnchor="middle">
                  RL REMOVED
                </text>
              </g>
            )}

            {/* Results Callout */}
            {isLoadReconnected && (
              <g transform="translate(240, 325)">
                <rect width="240" height="55" rx="8" fill="#18181b" stroke="#22c55e" strokeWidth="1.5" />
                <text x="120" y="23" fill="#4ade80" fontSize="14" fontWeight="bold" textAnchor="middle">
                  IL = {fmt(il)} A
                </text>
                <text x="120" y="44" fill="#d1d5db" fontSize="11" textAnchor="middle">
                  Current Divider: IL = IN × [RN / (RN + RL)]
                </text>
              </g>
            )}
          </g>
        )}
      </svg>
    );
  }

  // -------------------------------------------------------------
  // Render General Circuit Templates (1 through 6)
  // -------------------------------------------------------------
  return (
    <svg
      viewBox="0 0 800 420"
      className="w-full h-auto bg-[#18181b] rounded-xl border border-white/10 shadow-2xl select-none"
    >
      <defs>
        <pattern id="circ-grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#242428" strokeWidth="0.8" />
        </pattern>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#eab308" />
        </marker>
        <marker id="arrow-green" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#22c55e" />
        </marker>
      </defs>

      <rect width="800" height="420" fill="#161618" />
      <rect width="800" height="420" fill="url(#circ-grid)" />

      {/* TOP STATUS BAR */}
      <g transform="translate(30, 25)">
        <rect width="280" height="30" rx="6" fill="#27272a" stroke="#ca8a04" strokeWidth="1" />
        <text x="140" y="20" fill="#facc15" fontSize="12" fontWeight="bold" textAnchor="middle">
          CIRCUIT {circuitId} {circuitId === 2 ? '★ REFERENCE CIRCUIT' : ''}
        </text>
      </g>

      <g transform="translate(480, 25)">
        <rect
          width="290"
          height="30"
          rx="6"
          fill={
            isSourcesDeactivated
              ? '#3b2505'
              : isTerminalsShorted
              ? '#2a1215'
              : isLoadRemoved
              ? '#27272a'
              : '#16331a'
          }
          stroke={
            isSourcesDeactivated
              ? '#f59e0b'
              : isTerminalsShorted
              ? '#ef4444'
              : isLoadRemoved
              ? '#71717a'
              : '#22c55e'
          }
          strokeWidth="1.2"
        />
        <text
          x="145"
          y="20"
          fill={
            isSourcesDeactivated
              ? '#fde68a'
              : isTerminalsShorted
              ? '#fca5a5'
              : isLoadRemoved
              ? '#d4d4d8'
              : '#86efac'
          }
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
        >
          {isSourcesDeactivated
            ? '⚡ SOURCES DEACTIVATED (V→SHORT, I→OPEN)'
            : isTerminalsShorted
            ? '⌁ OUTPUT TERMINALS SHORT-CIRCUITED (Isc)'
            : isLoadRemoved
            ? '○ LOAD REMOVED — OPEN TERMINALS (Voc)'
            : '✓ ORIGINAL CIRCUIT (RL CONNECTED)'}
        </text>
      </g>

      {/* RENDER TOPOLOGY BASED ON CIRCUIT ID */}
      {renderCircuitTopology(
        circuitId,
        V1,
        V2,
        I1,
        I2,
        R1,
        R2,
        R3,
        RL,
        polarity,
        dir1,
        dir2,
        dirI,
        isSourcesDeactivated,
        isLoadRemoved,
        isTerminalsShorted,
        vth,
        inVal,
        rth,
        animationState
      )}
    </svg>
  );
};

// ==============================================================
// TOPOLOGY DRAWING LOGIC FOR ALL 6 CIRCUITS
// ==============================================================
function renderCircuitTopology(
  circuitId: number,
  V1: number,
  V2: number,
  I1: number,
  I2: number,
  R1: number,
  R2: number,
  R3: number,
  RL: number,
  polarity: boolean,
  dir1: boolean,
  dir2: boolean,
  dirI: boolean,
  isDeactivated: boolean,
  isLoadRemoved: boolean,
  isShorted: boolean,
  vth: number,
  inVal: number,
  rth: number,
  animationState: AnimationState
) {
  switch (circuitId) {
    // ------------------------------------------------------------
    // CIRCUIT 1: Single Voltage Source — Series and Parallel Resistors
    // ------------------------------------------------------------
    case 1: {
      return (
        <g transform="translate(60, 40)">
          {/* Main Rails */}
          <line x1="100" y1="120" x2="240" y2="120" stroke="#facc15" strokeWidth="3" />
          <line x1="340" y1="120" x2="480" y2="120" stroke="#facc15" strokeWidth="3" />
          <line x1="480" y1="120" x2="620" y2="120" stroke="#facc15" strokeWidth="3" />
          <line x1="100" y1="280" x2="620" y2="280" stroke="#facc15" strokeWidth="3" />

          {/* V1 Source (100, 200) */}
          <line x1="100" y1="120" x2="100" y2="168" stroke="#facc15" strokeWidth="3" />
          <line x1="100" y1="232" x2="100" y2="280" stroke="#facc15" strokeWidth="3" />
          {isDeactivated ? (
            /* Short Circuit Replacement */
            <g>
              <line x1="100" y1="120" x2="100" y2="280" stroke="#38bdf8" strokeWidth="4" />
              <rect x="40" y="185" width="120" height="28" rx="4" fill="#18181b" stroke="#38bdf8" strokeWidth="1" />
              <text x="100" y="203" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">
                V1 SHORTED (0V)
              </text>
            </g>
          ) : (
            <g>
              <circle cx="100" cy="200" r="32" fill="#242427" stroke="#eab308" strokeWidth="3" />
              <text x="100" y="188" fill="#eab308" fontSize="18" fontWeight="bold" textAnchor="middle">
                +
              </text>
              <text x="100" y="218" fill="#eab308" fontSize="18" fontWeight="bold" textAnchor="middle">
                −
              </text>
              <rect x="40" y="225" width="120" height="24" rx="4" fill="#18181b" stroke="#71717a" strokeWidth="1" />
              <text x="100" y="241" fill="#fef08a" fontSize="12" fontWeight="bold" textAnchor="middle">
                V1 = {fmt(V1)} V
              </text>
            </g>
          )}

          {/* R1 Resistor (horizontal, 240 to 340) */}
          <g transform="translate(240, 120)">
            <path
              d="M 0 0 L 15 0 L 22 -15 L 37 15 L 52 -15 L 67 15 L 82 -15 L 88 0 L 100 0"
              fill="none"
              stroke="#eab308"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="0" y="-45" width="100" height="24" rx="4" fill="#18181b" stroke="#71717a" strokeWidth="1" />
            <text x="50" y="-29" fill="#facc15" fontSize="12" fontWeight="bold" textAnchor="middle">
              R1 = {fmt(R1)} Ω
            </text>
          </g>

          {/* R2 Resistor (vertical shunt at 480) */}
          <g transform="translate(480, 120)">
            <line x1="0" y1="0" x2="0" y2="40" stroke="#facc15" strokeWidth="3" />
            <path
              d="M 0 40 L 0 50 L -15 57 L 15 72 L -15 87 L 15 102 L -15 117 L 0 124 L 0 160"
              fill="none"
              stroke="#eab308"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="25" y="85" width="105" height="24" rx="4" fill="#18181b" stroke="#71717a" strokeWidth="1" />
            <text x="77" y="101" fill="#facc15" fontSize="12" fontWeight="bold" textAnchor="middle">
              R2 = {fmt(R2)} Ω
            </text>
          </g>

          {/* Junction Dots */}
          <circle cx="480" cy="120" r="5" fill="#eab308" />
          <circle cx="480" cy="280" r="5" fill="#eab308" />

          {/* Output Terminal A & B */}
          {renderOutputTerminals(620, 120, 280, isLoadRemoved, isShorted, RL, vth, inVal, animationState)}
        </g>
      );
    }

    // ------------------------------------------------------------
    // CIRCUIT 2: Ladder Network (FACULTY REFERENCE PROBLEM)
    // ------------------------------------------------------------
    case 2: {
      return (
        <g transform="translate(50, 40)">
          {/* Top rail: V1 -> R1 -> Node A -> R3 -> Node B */}
          <line x1="80" y1="120" x2="160" y2="120" stroke="#facc15" strokeWidth="3" />
          <line x1="260" y1="120" x2="350" y2="120" stroke="#facc15" strokeWidth="3" />
          <line x1="350" y1="120" x2="430" y2="120" stroke="#facc15" strokeWidth="3" />
          <line x1="530" y1="120" x2="620" y2="120" stroke="#facc15" strokeWidth="3" />

          {/* Bottom rail: Ground */}
          <line x1="80" y1="280" x2="620" y2="280" stroke="#facc15" strokeWidth="3" />

          {/* Ground Symbol */}
          <g transform="translate(350, 280)">
            <line x1="0" y1="0" x2="0" y2="15" stroke="#71717a" strokeWidth="2" />
            <line x1="-15" y1="15" x2="15" y2="15" stroke="#71717a" strokeWidth="2.5" />
            <line x1="-10" y1="20" x2="10" y2="20" stroke="#71717a" strokeWidth="2" />
            <line x1="-5" y1="25" x2="5" y2="25" stroke="#71717a" strokeWidth="1.5" />
          </g>

          {/* V1 Source (80, 200) */}
          <line x1="80" y1="120" x2="80" y2="168" stroke="#facc15" strokeWidth="3" />
          <line x1="80" y1="232" x2="80" y2="280" stroke="#facc15" strokeWidth="3" />
          {isDeactivated ? (
            <g>
              <line x1="80" y1="120" x2="80" y2="280" stroke="#38bdf8" strokeWidth="4" />
              <rect x="25" y="185" width="110" height="26" rx="4" fill="#18181b" stroke="#38bdf8" strokeWidth="1" />
              <text x="80" y="202" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
                V1 SHORTED (0V)
              </text>
            </g>
          ) : (
            <g>
              <circle cx="80" cy="200" r="32" fill="#242427" stroke="#eab308" strokeWidth="3" />
              <text x="80" y="188" fill="#eab308" fontSize="18" fontWeight="bold" textAnchor="middle">
                +
              </text>
              <text x="80" y="218" fill="#eab308" fontSize="18" fontWeight="bold" textAnchor="middle">
                −
              </text>
              <rect x="20" y="225" width="120" height="24" rx="4" fill="#18181b" stroke="#71717a" strokeWidth="1" />
              <text x="80" y="241" fill="#fef08a" fontSize="12" fontWeight="bold" textAnchor="middle">
                V1 = {fmt(V1)} V
              </text>
            </g>
          )}

          {/* R1 Resistor (horizontal, 160 to 260) */}
          <g transform="translate(160, 120)">
            <path
              d="M 0 0 L 15 0 L 22 -15 L 37 15 L 52 -15 L 67 15 L 82 -15 L 88 0 L 100 0"
              fill="none"
              stroke="#eab308"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="0" y="-45" width="100" height="24" rx="4" fill="#18181b" stroke="#71717a" strokeWidth="1" />
            <text x="50" y="-29" fill="#facc15" fontSize="12" fontWeight="bold" textAnchor="middle">
              R1 = {fmt(R1)} Ω
            </text>
          </g>

          {/* Node A (Junction at 350, 120) */}
          <circle cx="350" cy="120" r="6" fill="#eab308" />
          <text x="350" y="105" fill="#facc15" fontSize="13" fontWeight="bold" textAnchor="middle">
            Junction A
          </text>
          <circle cx="350" cy="280" r="5" fill="#eab308" />

          {/* R2 Shunt Resistor (vertical at Node A, 350) */}
          <g transform="translate(350, 120)">
            <line x1="0" y1="0" x2="0" y2="40" stroke="#facc15" strokeWidth="3" />
            <path
              d="M 0 40 L 0 50 L -15 57 L 15 72 L -15 87 L 15 102 L -15 117 L 0 124 L 0 160"
              fill="none"
              stroke="#eab308"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="22" y="85" width="105" height="24" rx="4" fill="#18181b" stroke="#71717a" strokeWidth="1" />
            <text x="74" y="101" fill="#facc15" fontSize="12" fontWeight="bold" textAnchor="middle">
              R2 = {fmt(R2)} Ω
            </text>
          </g>

          {/* R3 Resistor (horizontal, 430 to 530 leading to Node B) */}
          <g transform="translate(430, 120)">
            <path
              d="M 0 0 L 15 0 L 22 -15 L 37 15 L 52 -15 L 67 15 L 82 -15 L 88 0 L 100 0"
              fill="none"
              stroke="#eab308"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="0" y="-45" width="100" height="24" rx="4" fill="#18181b" stroke="#71717a" strokeWidth="1" />
            <text x="50" y="-29" fill="#facc15" fontSize="12" fontWeight="bold" textAnchor="middle">
              R3 = {fmt(R3)} Ω
            </text>
          </g>

          {/* Node B (at 620, 120) */}
          <text x="620" y="105" fill="#facc15" fontSize="13" fontWeight="bold" textAnchor="middle">
            Junction B
          </text>

          {/* Output Terminals & Load RL */}
          {renderOutputTerminals(620, 120, 280, isLoadRemoved, isShorted, RL, vth, inVal, animationState)}
        </g>
      );
    }

    // ------------------------------------------------------------
    // CIRCUIT 3: Two Voltage Sources in Series (Aiding or Opposing)
    // ------------------------------------------------------------
    case 3: {
      return (
        <g transform="translate(50, 40)">
          {/* Main Rails */}
          <line x1="80" y1="120" x2="220" y2="120" stroke="#facc15" strokeWidth="3" />
          <line x1="320" y1="120" x2="460" y2="120" stroke="#facc15" strokeWidth="3" />
          <line x1="460" y1="120" x2="620" y2="120" stroke="#facc15" strokeWidth="3" />
          <line x1="80" y1="280" x2="620" y2="280" stroke="#facc15" strokeWidth="3" />

          {/* Series Left Column: V1 on bottom half, V2 on top half */}
          <line x1="80" y1="120" x2="80" y2="148" stroke="#facc15" strokeWidth="3" />
          <line x1="80" y1="212" x2="80" y2="228" stroke="#facc15" strokeWidth="3" />
          <line x1="80" y1="262" x2="80" y2="280" stroke="#facc15" strokeWidth="3" />

          {/* V2 Source (80, 180) */}
          {isDeactivated ? (
            <g>
              <line x1="80" y1="120" x2="80" y2="280" stroke="#38bdf8" strokeWidth="4" />
              <rect x="20" y="185" width="120" height="26" rx="4" fill="#18181b" stroke="#38bdf8" strokeWidth="1" />
              <text x="80" y="202" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
                V1, V2 SHORTED
              </text>
            </g>
          ) : (
            <g>
              {/* V2 */}
              <circle cx="80" cy="165" r="24" fill="#242427" stroke="#eab308" strokeWidth="2.5" />
              <text x="80" y="157" fill="#eab308" fontSize="14" fontWeight="bold" textAnchor="middle">
                {polarity ? '+' : '−'}
              </text>
              <text x="80" y="177" fill="#eab308" fontSize="14" fontWeight="bold" textAnchor="middle">
                {polarity ? '−' : '+'}
              </text>
              <text x="135" y="170" fill="#fef08a" fontSize="11" fontWeight="bold">
                V2={fmt(V2)}V ({polarity ? 'Aid' : 'Opp'})
              </text>

              {/* V1 */}
              <circle cx="80" cy="245" r="24" fill="#242427" stroke="#eab308" strokeWidth="2.5" />
              <text x="80" y="237" fill="#eab308" fontSize="14" fontWeight="bold" textAnchor="middle">
                +
              </text>
              <text x="80" y="257" fill="#eab308" fontSize="14" fontWeight="bold" textAnchor="middle">
                −
              </text>
              <text x="135" y="250" fill="#fef08a" fontSize="11" fontWeight="bold">
                V1={fmt(V1)}V
              </text>
            </g>
          )}

          {/* R1 Resistor (220 to 320) */}
          <g transform="translate(220, 120)">
            <path
              d="M 0 0 L 15 0 L 22 -15 L 37 15 L 52 -15 L 67 15 L 82 -15 L 88 0 L 100 0"
              fill="none"
              stroke="#eab308"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="0" y="-45" width="100" height="24" rx="4" fill="#18181b" stroke="#71717a" strokeWidth="1" />
            <text x="50" y="-29" fill="#facc15" fontSize="12" fontWeight="bold" textAnchor="middle">
              R1 = {fmt(R1)} Ω
            </text>
          </g>

          {/* R2 Resistor (vertical shunt at 460) */}
          <g transform="translate(460, 120)">
            <line x1="0" y1="0" x2="0" y2="40" stroke="#facc15" strokeWidth="3" />
            <path
              d="M 0 40 L 0 50 L -15 57 L 15 72 L -15 87 L 15 102 L -15 117 L 0 124 L 0 160"
              fill="none"
              stroke="#eab308"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="22" y="85" width="105" height="24" rx="4" fill="#18181b" stroke="#71717a" strokeWidth="1" />
            <text x="74" y="101" fill="#facc15" fontSize="12" fontWeight="bold" textAnchor="middle">
              R2 = {fmt(R2)} Ω
            </text>
          </g>

          <circle cx="460" cy="120" r="5" fill="#eab308" />
          <circle cx="460" cy="280" r="5" fill="#eab308" />

          {/* Output Terminals & Load RL */}
          {renderOutputTerminals(620, 120, 280, isLoadRemoved, isShorted, RL, vth, inVal, animationState)}
        </g>
      );
    }

    // ------------------------------------------------------------
    // CIRCUIT 4: Two Voltage Sources in Separate Branches
    // ------------------------------------------------------------
    case 4: {
      return (
        <g transform="translate(40, 40)">
          {/* Branch 1: Left (V1, R1) */}
          <line x1="80" y1="120" x2="160" y2="120" stroke="#facc15" strokeWidth="3" />
          <line x1="260" y1="120" x2="350" y2="120" stroke="#facc15" strokeWidth="3" />

          {/* Branch 2: Center-Left (V2, R2) */}
          <line x1="350" y1="120" x2="350" y2="140" stroke="#facc15" strokeWidth="3" />

          {/* Common series R3 (350 to 520) */}
          <line x1="350" y1="120" x2="420" y2="120" stroke="#facc15" strokeWidth="3" />
          <line x1="520" y1="120" x2="640" y2="120" stroke="#facc15" strokeWidth="3" />

          {/* Bottom Rail */}
          <line x1="80" y1="280" x2="640" y2="280" stroke="#facc15" strokeWidth="3" />

          {/* V1 Source (80, 200) */}
          {isDeactivated ? (
            <line x1="80" y1="120" x2="80" y2="280" stroke="#38bdf8" strokeWidth="4" />
          ) : (
            <g>
              <line x1="80" y1="120" x2="80" y2="168" stroke="#facc15" strokeWidth="3" />
              <circle cx="80" cy="200" r="28" fill="#242427" stroke="#eab308" strokeWidth="2.5" />
              <text x="80" y="193" fill="#eab308" fontSize="16" fontWeight="bold" textAnchor="middle">
                +
              </text>
              <text x="80" y="217" fill="#eab308" fontSize="16" fontWeight="bold" textAnchor="middle">
                −
              </text>
              <line x1="80" y1="232" x2="80" y2="280" stroke="#facc15" strokeWidth="3" />
              <text x="80" y="245" fill="#fef08a" fontSize="11" fontWeight="bold" textAnchor="middle">
                V1={fmt(V1)}V
              </text>
            </g>
          )}

          {/* R1 Resistor (horizontal, 160 to 260) */}
          <g transform="translate(160, 120)">
            <path
              d="M 0 0 L 15 0 L 22 -15 L 37 15 L 52 -15 L 67 15 L 82 -15 L 88 0 L 100 0"
              fill="none"
              stroke="#eab308"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text x="50" y="-20" fill="#facc15" fontSize="11" fontWeight="bold" textAnchor="middle">
              R1={fmt(R1)}Ω
            </text>
          </g>

          {/* V2 Branch (vertical branch with V2 & R2 at 280) */}
          <g transform="translate(260, 120)">
            {/* Junction into node 350 */}
          </g>

          {/* Vertical Branch with V2 and R2 */}
          <g transform="translate(240, 280)">
            {/* V2 source branch between 240,120 and 240,280 */}
          </g>

          {/* Node A */}
          <circle cx="350" cy="120" r="5" fill="#eab308" />
          <text x="350" y="105" fill="#facc15" fontSize="12" fontWeight="bold" textAnchor="middle">
            Node A
          </text>

          {/* Branch 2 with V2 and R2 feeding Node A */}
          <line x1="350" y1="120" x2="350" y2="160" stroke="#facc15" strokeWidth="3" />
          {/* R2 vertical */}
          <g transform="translate(350, 150)">
            <path
              d="M 0 0 L 0 10 L -12 15 L 12 25 L -12 35 L 12 45 L -12 55 L 0 60 L 0 70"
              fill="none"
              stroke="#eab308"
              strokeWidth="3"
            />
            <text x="25" y="40" fill="#facc15" fontSize="11" fontWeight="bold">
              R2={fmt(R2)}Ω
            </text>
          </g>
          {/* V2 below R2 */}
          <line x1="350" y1="220" x2="350" y2="230" stroke="#facc15" strokeWidth="3" />
          {isDeactivated ? (
            <line x1="350" y1="220" x2="350" y2="280" stroke="#38bdf8" strokeWidth="3.5" />
          ) : (
            <g>
              <circle cx="350" cy="255" r="22" fill="#242427" stroke="#eab308" strokeWidth="2.5" />
              <text x="350" y="250" fill="#eab308" fontSize="13" fontWeight="bold" textAnchor="middle">
                +
              </text>
              <text x="350" y="267" fill="#eab308" fontSize="13" fontWeight="bold" textAnchor="middle">
                −
              </text>
              <text x="390" y="260" fill="#fef08a" fontSize="11" fontWeight="bold">
                V2={fmt(V2)}V
              </text>
              <line x1="350" y1="277" x2="350" y2="280" stroke="#facc15" strokeWidth="3" />
            </g>
          )}

          {/* R3 Resistor (horizontal, 420 to 520) */}
          <g transform="translate(420, 120)">
            <path
              d="M 0 0 L 15 0 L 22 -15 L 37 15 L 52 -15 L 67 15 L 82 -15 L 88 0 L 100 0"
              fill="none"
              stroke="#eab308"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="0" y="-45" width="100" height="24" rx="4" fill="#18181b" stroke="#71717a" strokeWidth="1" />
            <text x="50" y="-29" fill="#facc15" fontSize="12" fontWeight="bold" textAnchor="middle">
              R3 = {fmt(R3)} Ω
            </text>
          </g>

          <circle cx="350" cy="280" r="5" fill="#eab308" />

          {/* Output Terminals & Load RL */}
          {renderOutputTerminals(640, 120, 280, isLoadRemoved, isShorted, RL, vth, inVal, animationState)}
        </g>
      );
    }

    // ------------------------------------------------------------
    // CIRCUIT 5: Multiple Current Sources & Parallel Resistors
    // ------------------------------------------------------------
    case 5: {
      return (
        <g transform="translate(40, 40)">
          {/* Top Positive Bus */}
          <line x1="60" y1="120" x2="640" y2="120" stroke="#facc15" strokeWidth="3" />
          <text x="60" y="105" fill="#facc15" fontSize="13" fontWeight="bold">
            Bus A (+)
          </text>

          {/* Bottom Ground Bus */}
          <line x1="60" y1="280" x2="640" y2="280" stroke="#facc15" strokeWidth="3" />
          <text x="60" y="305" fill="#facc15" fontSize="13" fontWeight="bold">
            Ground Bus (−)
          </text>

          {/* Branch 1: Current Source I1 at x=120 */}
          {isDeactivated ? (
            <g transform="translate(120, 120)">
              <line x1="0" y1="0" x2="0" y2="40" stroke="#71717a" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="0" y2="160" stroke="#71717a" strokeWidth="2" strokeDasharray="4 4" />
              <rect x="-45" y="65" width="90" height="30" rx="4" fill="#18181b" stroke="#38bdf8" strokeWidth="1" />
              <text x="0" y="84" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
                I1 OPEN (0A)
              </text>
            </g>
          ) : (
            <g transform="translate(120, 120)">
              <line x1="0" y1="0" x2="0" y2="48" stroke="#facc15" strokeWidth="3" />
              <circle cx="0" cy="80" r="30" fill="#242427" stroke="#eab308" strokeWidth="2.5" />
              <line x1="0" y1={dir1 ? 98 : 62} x2="0" y2={dir1 ? 66 : 94} stroke="#eab308" strokeWidth="3" />
              <polygon
                points={dir1 ? '0,60 -6,72 6,72' : '0,100 -6,88 6,88'}
                fill="#eab308"
              />
              <line x1="0" y1="112" x2="0" y2="160" stroke="#facc15" strokeWidth="3" />
              <rect x="-50" y="125" width="100" height="22" rx="4" fill="#18181b" stroke="#71717a" strokeWidth="1" />
              <text x="0" y="140" fill="#fef08a" fontSize="11" fontWeight="bold" textAnchor="middle">
                I1 = {fmt(I1)} A
              </text>
            </g>
          )}

          {/* Branch 2: Current Source I2 at x=260 */}
          {isDeactivated ? (
            <g transform="translate(260, 120)">
              <line x1="0" y1="0" x2="0" y2="40" stroke="#71717a" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="0" y2="160" stroke="#71717a" strokeWidth="2" strokeDasharray="4 4" />
              <rect x="-45" y="65" width="90" height="30" rx="4" fill="#18181b" stroke="#38bdf8" strokeWidth="1" />
              <text x="0" y="84" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
                I2 OPEN (0A)
              </text>
            </g>
          ) : (
            <g transform="translate(260, 120)">
              <line x1="0" y1="0" x2="0" y2="48" stroke="#facc15" strokeWidth="3" />
              <circle cx="0" cy="80" r="30" fill="#242427" stroke="#eab308" strokeWidth="2.5" />
              <line x1="0" y1={dir2 ? 98 : 62} x2="0" y2={dir2 ? 66 : 94} stroke="#eab308" strokeWidth="3" />
              <polygon
                points={dir2 ? '0,60 -6,72 6,72' : '0,100 -6,88 6,88'}
                fill="#eab308"
              />
              <line x1="0" y1="112" x2="0" y2="160" stroke="#facc15" strokeWidth="3" />
              <rect x="-50" y="125" width="100" height="22" rx="4" fill="#18181b" stroke="#71717a" strokeWidth="1" />
              <text x="0" y="140" fill="#fef08a" fontSize="11" fontWeight="bold" textAnchor="middle">
                I2 = {fmt(I2)} A
              </text>
            </g>
          )}

          {/* Branch 3: Resistor R1 at x=390 */}
          <g transform="translate(390, 120)">
            <line x1="0" y1="0" x2="0" y2="40" stroke="#facc15" strokeWidth="3" />
            <path
              d="M 0 40 L 0 50 L -15 57 L 15 72 L -15 87 L 15 102 L -15 117 L 0 124 L 0 160"
              fill="none"
              stroke="#eab308"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="22" y="85" width="105" height="24" rx="4" fill="#18181b" stroke="#71717a" strokeWidth="1" />
            <text x="74" y="101" fill="#facc15" fontSize="12" fontWeight="bold" textAnchor="middle">
              R1 = {fmt(R1)} Ω
            </text>
          </g>

          {/* Branch 4: Resistor R2 at x=510 */}
          <g transform="translate(510, 120)">
            <line x1="0" y1="0" x2="0" y2="40" stroke="#facc15" strokeWidth="3" />
            <path
              d="M 0 40 L 0 50 L -15 57 L 15 72 L -15 87 L 15 102 L -15 117 L 0 124 L 0 160"
              fill="none"
              stroke="#eab308"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="22" y="85" width="105" height="24" rx="4" fill="#18181b" stroke="#71717a" strokeWidth="1" />
            <text x="74" y="101" fill="#facc15" fontSize="12" fontWeight="bold" textAnchor="middle">
              R2 = {fmt(R2)} Ω
            </text>
          </g>

          {/* Output Terminals & Load RL at x=640 */}
          {renderOutputTerminals(640, 120, 280, isLoadRemoved, isShorted, RL, vth, inVal, animationState)}
        </g>
      );
    }

    // ------------------------------------------------------------
    // CIRCUIT 6: Mixed Voltage and Current Sources
    // ------------------------------------------------------------
    case 6: {
      return (
        <g transform="translate(40, 40)">
          {/* Main Top Rail */}
          <line x1="80" y1="120" x2="160" y2="120" stroke="#facc15" strokeWidth="3" />
          <line x1="260" y1="120" x2="360" y2="120" stroke="#facc15" strokeWidth="3" />
          <line x1="360" y1="120" x2="440" y2="120" stroke="#facc15" strokeWidth="3" />
          <line x1="540" y1="120" x2="640" y2="120" stroke="#facc15" strokeWidth="3" />

          {/* Bottom Ground Rail */}
          <line x1="80" y1="280" x2="640" y2="280" stroke="#facc15" strokeWidth="3" />

          {/* V1 Source (80, 200) */}
          {isDeactivated ? (
            <line x1="80" y1="120" x2="80" y2="280" stroke="#38bdf8" strokeWidth="4" />
          ) : (
            <g>
              <line x1="80" y1="120" x2="80" y2="168" stroke="#facc15" strokeWidth="3" />
              <circle cx="80" cy="200" r="30" fill="#242427" stroke="#eab308" strokeWidth="2.5" />
              <text x="80" y="190" fill="#eab308" fontSize="18" fontWeight="bold" textAnchor="middle">
                +
              </text>
              <text x="80" y="218" fill="#eab308" fontSize="18" fontWeight="bold" textAnchor="middle">
                −
              </text>
              <line x1="80" y1="232" x2="80" y2="280" stroke="#facc15" strokeWidth="3" />
              <text x="80" y="245" fill="#fef08a" fontSize="11" fontWeight="bold" textAnchor="middle">
                V1={fmt(V1)}V
              </text>
            </g>
          )}

          {/* R1 Resistor (160 to 260) */}
          <g transform="translate(160, 120)">
            <path
              d="M 0 0 L 15 0 L 22 -15 L 37 15 L 52 -15 L 67 15 L 82 -15 L 88 0 L 100 0"
              fill="none"
              stroke="#eab308"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text x="50" y="-20" fill="#facc15" fontSize="11" fontWeight="bold" textAnchor="middle">
              R1={fmt(R1)}Ω
            </text>
          </g>

          {/* Node A (Junction at 360, 120) */}
          <circle cx="360" cy="120" r="6" fill="#eab308" />
          <text x="360" y="105" fill="#facc15" fontSize="12" fontWeight="bold" textAnchor="middle">
            Node A
          </text>

          {/* Shunt I1 Current Source at x=280 */}
          {isDeactivated ? (
            <g transform="translate(280, 120)">
              <line x1="0" y1="0" x2="0" y2="50" stroke="#71717a" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="0" y1="110" x2="0" y2="160" stroke="#71717a" strokeWidth="2" strokeDasharray="4 4" />
              <rect x="-40" y="70" width="80" height="24" rx="4" fill="#18181b" stroke="#38bdf8" strokeWidth="1" />
              <text x="0" y="86" fill="#38bdf8" fontSize="10" textAnchor="middle">
                I1 OPEN
              </text>
            </g>
          ) : (
            <g transform="translate(280, 120)">
              <line x1="0" y1="0" x2="0" y2="50" stroke="#facc15" strokeWidth="3" />
              <circle cx="0" cy="80" r="26" fill="#242427" stroke="#eab308" strokeWidth="2" />
              <line x1="0" y1={dirI ? 95 : 65} x2="0" y2={dirI ? 67 : 93} stroke="#eab308" strokeWidth="2.5" />
              <polygon
                points={dirI ? '0,62 -5,72 5,72' : '0,97 -5,87 5,87'}
                fill="#eab308"
              />
              <line x1="0" y1="108" x2="0" y2="160" stroke="#facc15" strokeWidth="3" />
              <text x="0" y="145" fill="#fef08a" fontSize="11" fontWeight="bold" textAnchor="middle">
                I1={fmt(I1)}A
              </text>
            </g>
          )}

          {/* Shunt R2 Resistor at x=360 */}
          <g transform="translate(360, 120)">
            <line x1="0" y1="0" x2="0" y2="40" stroke="#facc15" strokeWidth="3" />
            <path
              d="M 0 40 L 0 50 L -15 57 L 15 72 L -15 87 L 15 102 L -15 117 L 0 124 L 0 160"
              fill="none"
              stroke="#eab308"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="22" y="85" width="105" height="24" rx="4" fill="#18181b" stroke="#71717a" strokeWidth="1" />
            <text x="74" y="101" fill="#facc15" fontSize="12" fontWeight="bold" textAnchor="middle">
              R2 = {fmt(R2)} Ω
            </text>
          </g>

          {/* R3 Resistor (horizontal, 440 to 540) */}
          <g transform="translate(440, 120)">
            <path
              d="M 0 0 L 15 0 L 22 -15 L 37 15 L 52 -15 L 67 15 L 82 -15 L 88 0 L 100 0"
              fill="none"
              stroke="#eab308"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text x="50" y="-20" fill="#facc15" fontSize="11" fontWeight="bold" textAnchor="middle">
              R3={fmt(R3)}Ω
            </text>
          </g>

          {/* Output Terminals & Load RL at x=640 */}
          {renderOutputTerminals(640, 120, 280, isLoadRemoved, isShorted, RL, vth, inVal, animationState)}
        </g>
      );
    }

    default:
      return null;
  }
}

// ==============================================================
// OUTPUT TERMINALS & LOAD RESISTOR COMPONENT
// ==============================================================
function renderOutputTerminals(
  x: number,
  yTop: number,
  yBottom: number,
  isLoadRemoved: boolean,
  isShorted: boolean,
  RL: number,
  vth: number,
  inVal: number,
  animationState: AnimationState
) {
  return (
    <g>
      {/* Terminal A */}
      <circle cx={x} cy={yTop} r={7} fill="#18181b" stroke="#facc15" strokeWidth="3" />
      <text x={x + 22} y={yTop + 5} fill="#facc15" fontSize="15" fontWeight="bold">
        A (+)
      </text>

      {/* Terminal B */}
      <circle cx={x} cy={yBottom} r={7} fill="#18181b" stroke="#facc15" strokeWidth="3" />
      <text x={x + 22} y={yBottom + 5} fill="#facc15" fontSize="15" fontWeight="bold">
        B (−)
      </text>

      {/* Short Circuit Jumper for Norton */}
      {isShorted && (
        <g>
          <line x1={x} y1={yTop} x2={x} y2={yBottom} stroke="#ef4444" strokeWidth="4" />
          {/* Animated Arrow showing short circuit current */}
          <line
            x1={x}
            y1={yTop + 20}
            x2={x}
            y2={yBottom - 20}
            stroke="#f87171"
            strokeWidth="3"
            strokeDasharray="6 4"
            className="current-flow-animation"
          />
          <rect x={x - 130} y={(yTop + yBottom) / 2 - 18} width="115" height="34" rx="4" fill="#18181b" stroke="#ef4444" strokeWidth="1.5" />
          <text x={x - 72} y={(yTop + yBottom) / 2 - 3} fill="#fca5a5" fontSize="10" textAnchor="middle">
            IDEAL SHORT
          </text>
          <text x={x - 72} y={(yTop + yBottom) / 2 + 10} fill="#f87171" fontSize="12" fontWeight="bold" textAnchor="middle">
            Isc = {fmt(inVal)} A
          </text>
        </g>
      )}

      {/* Open Circuit Indicator for Thevenin Step 3 */}
      {animationState === 'oc_calculated' && !isShorted && (
        <g>
          <line x1={x} y1={yTop + 10} x2={x} y2={yBottom - 10} stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="5 5" />
          <rect x={x - 140} y={(yTop + yBottom) / 2 - 18} width="125" height="36" rx="6" fill="#18181b" stroke="#38bdf8" strokeWidth="1.5" />
          <text x={x - 77} y={(yTop + yBottom) / 2 - 2} fill="#7dd3fc" fontSize="10" textAnchor="middle">
            OPEN-CIRCUIT VOLTAGE
          </text>
          <text x={x - 77} y={(yTop + yBottom) / 2 + 12} fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle">
            Voc = Vth = {fmt(vth)} V
          </text>
        </g>
      )}

      {/* Normal Load Resistor Connected */}
      {!isLoadRemoved && !isShorted && (
        <g transform={`translate(${x}, ${yTop})`}>
          <line x1="0" y1="0" x2="0" y2="40" stroke="#facc15" strokeWidth="3" />
          <path
            d="M 0 40 L 0 50 L -16 57 L 16 72 L -16 87 L 16 102 L -16 117 L 0 124 L 0 160"
            fill="none"
            stroke="#22c55e"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="25" y="85" width="115" height="26" rx="4" fill="#18181b" stroke="#22c55e" strokeWidth="1" />
          <text x="82" y="102" fill="#4ade80" fontSize="12" fontWeight="bold" textAnchor="middle">
            RL = {fmt(RL)} Ω
          </text>
        </g>
      )}
    </g>
  );
}

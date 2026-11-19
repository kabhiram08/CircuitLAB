/** ============================================================
 * CircuitLAB — Type Definitions
 * All circuit topology, analysis result and simulation step types.
 * ============================================================ */

// ---- Node representation ----
export interface NodeMap {
  [nodeLabel: string]: number; // node label → index (0 = ground)
}

// ---- Circuit element types ----
export type ElementType = 'resistor' | 'voltage_source' | 'current_source' | 'short' | 'open';

export interface CircuitElement {
  id: string;           // e.g. "R1", "V1", "I1"
  type: ElementType;
  nodePos: string;      // positive terminal node label
  nodeNeg: string;      // negative terminal node label
  value: number;        // Ω for resistors, V for voltage sources, A for current sources
  label?: string;       // display label
}

// ---- Circuit topology definition ----
export interface CircuitTopology {
  nodes: string[];              // all node labels (ground = "0" or "GND")
  ground: string;               // ground node label
  elements: CircuitElement[];   // all elements
  outputNodePos: string;        // positive output terminal (where load connects)
  outputNodeNeg: string;        // negative output terminal
  loadId: string;               // element id of load resistor
}

// ---- User-editable component values ----
export interface ComponentValues {
  [id: string]: number;         // id → value  (must match element ids)
}

// ---- Six predefined circuit configurations ----
export interface CircuitConfig {
  id: number;
  name: string;
  description: string;
  defaultValues: ComponentValues;
  buildTopology: (values: ComponentValues) => CircuitTopology;
  // SVG layout hint — used by renderer
  svgLayout: SVGLayoutHint;
}

// ---- SVG layout hint ----
export interface SVGLayoutHint {
  templateId: number;
  // Per-element position overrides are handled inside each SVG template
}

// ---- Analysis step (for step-by-step display) ----
export interface AnalysisStep {
  stepNumber: number;
  title: string;
  description: string;
  formula?: string;         // LaTeX-style formula string
  substitution?: string;    // numeric substitution
  result?: string;          // numeric result with units
  circuit?: CircuitTopology; // circuit state at this step (for animation)
  animationState?: AnimationState;
  calculations?: StepCalculation[];
}

export interface StepCalculation {
  label: string;
  formula: string;
  substitution: string;
  result: string;
}

// ---- Animation state keys ----
export type AnimationState =
  | 'original'
  | 'load_removed'
  | 'oc_calculated'
  | 'sources_deactivated'
  | 'rth_calculated'
  | 'equivalent_built'
  | 'load_reconnected'
  | 'results_shown'
  // Norton-specific
  | 'terminals_shorted'
  | 'isc_calculated'
  | 'norton_equivalent_built';

// ---- Thevenin analysis result ----
export interface TheveninResult {
  Vth: number;           // Thevenin voltage (V)
  Rth: number;           // Thevenin resistance (Ω)
  IL: number;            // Load current (A)
  VL: number;            // Load voltage (V)
  PL: number;            // Load power (W)
  RL: number;            // Load resistance (Ω)
  steps: AnalysisStep[];
}

// ---- Norton analysis result ----
export interface NortonResult {
  IN: number;            // Norton current (A)
  RN: number;            // Norton resistance (Ω)
  IL: number;            // Load current (A)
  VL: number;            // Load voltage (V)
  PL: number;            // Load power (W)
  RL: number;            // Load resistance (Ω)
  steps: AnalysisStep[];
}

// ---- Validation error ----
export interface ValidationError {
  field: string;
  message: string;
}

// ---- MNA solution ----
export interface MNASolution {
  nodeVoltages: { [nodeLabel: string]: number };  // node label → voltage wrt ground
  branchCurrents: { [elementId: string]: number }; // voltage source id → current through it (+ into pos terminal)
  success: boolean;
  error?: string;
}

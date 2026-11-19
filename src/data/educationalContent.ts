/** ============================================================
 * CircuitLAB — Educational Content
 * 
 * Verbatim Faculty Theorem Statements & Complete Academic Curriculum
 * Tailored for Undergraduate Basic Electrical Engineering (BEE) Semester 1
 * ============================================================ */

export const THEVENIN_STATEMENT = `Thevenin's Theorem Statement : In any linear bilateral complex circuit, having 'n' number of elements, can be replaced with a simple circuit having only one voltage source called Thevenin's voltage source and one equivalent resistance called Thevenin's resistance.

This can be connected in series with the load resistor.`;

export const NORTON_STATEMENT = `Norton's Theorem Statement : in any linear bilateral complex circuit, having 'n' number of elements, can be replaced with a simple circuit having only one current source called Norton's current source and one equivalent resistance called Norton's resistance.

These can be connected in parallel with load resistor.`;

export interface TheoremTheory {
  title: string;
  statement: string;
  summary: string;
  workingPrinciple: string;
  keyTerminology: { term: string; definition: string }[];
  formulas: { name: string; latex: string; explanation: string }[];
  stepProcedure: { step: number; title: string; detail: string }[];
}

export const THEVENIN_THEORY: TheoremTheory = {
  title: "Thevenin's Theorem",
  statement: THEVENIN_STATEMENT,
  summary:
    "Allows any linear bilateral DC network connected to a designated load resistor (RL) to be modeled as an equivalent ideal voltage generator (Vth) connected in series with an internal equivalent resistance (Rth).",
  workingPrinciple:
    "Linearity and the principle of superposition ensure that the voltage-current relationship at any pair of output terminals is a straight line: V = Voc - I * Req. Therefore, two parameters—the open-circuit voltage Voc (the V-intercept) and the looking-in resistance Req (the inverse slope)—completely describe the external terminal behavior for any arbitrary load.",
  keyTerminology: [
    {
      term: "Linear Bilateral Network",
      definition:
        "A network composed of components whose V-I characteristic is a straight line through the origin and conducts equally well in both polarities (resistors, independent sources).",
    },
    {
      term: "Thevenin Voltage (Vth = Voc)",
      definition:
        "The open-circuit potential difference measured across output terminals A-B when the load resistor RL is physically removed.",
    },
    {
      term: "Thevenin Resistance (Rth)",
      definition:
        "The equivalent input resistance looking back into open terminals A-B with all independent voltage sources short-circuited (0 V) and all independent current sources open-circuited (0 A).",
    },
    {
      term: "Load Current (IL)",
      definition:
        "The current flowing through the load resistor when reconnected to the Thevenin equivalent circuit: IL = Vth / (Rth + RL).",
    },
  ],
  formulas: [
    {
      name: "Open-Circuit Voltage (Thevenin Voltage)",
      latex: "V_{th} = V_{oc} = V_A - V_B \\quad [\\text{with } R_L \\text{ removed}]",
      explanation: "Calculated via Kirchhoff's Voltage/Current Laws across open terminals.",
    },
    {
      name: "Thevenin Resistance (Source Deactivation)",
      latex: "R_{th} = R_{eq(A-B)} \\quad [V_S \\to 0\\text{ (short)}, \\; I_S \\to 0\\text{ (open)}]",
      explanation: "Looking-in resistance from load terminals with all independent sources killed.",
    },
    {
      name: "Load Current",
      latex: "I_L = \\frac{V_{th}}{R_{th} + R_L}",
      explanation: "Ohm's Law applied to the single-loop equivalent circuit.",
    },
    {
      name: "Load Voltage & Power",
      latex: "V_L = I_L \\cdot R_L, \\qquad P_L = I_L^2 \\cdot R_L = \\frac{V_L^2}{R_L}",
      explanation: "Terminal voltage drop across load and active electrical power dissipated.",
    },
  ],
  stepProcedure: [
    {
      step: 1,
      title: "Identify & Isolate Load Resistor (RL)",
      detail:
        "Select the load component RL across output terminals A and B, and temporarily disconnect it from the network.",
    },
    {
      step: 2,
      title: "Calculate Open-Circuit Voltage (Vth = Voc)",
      detail:
        "Analyze the active remaining network with terminals A-B open. Determine the potential difference V_AB = V_A - V_B using Mesh/Nodal analysis or voltage divider rules.",
    },
    {
      step: 3,
      title: "Deactivate All Independent Sources",
      detail:
        "Replace every ideal voltage source with a short circuit (solid conductor) and every ideal current source with an open circuit (break/gap).",
    },
    {
      step: 4,
      title: "Compute Thevenin Resistance (Rth)",
      detail:
        "Calculate the equivalent looking-in resistance at terminals A-B using series-parallel reduction or test-source injection.",
    },
    {
      step: 5,
      title: "Construct Thevenin Equivalent & Connect RL",
      detail:
        "Draw the simplified series circuit containing single voltage source Vth, series resistor Rth, and load RL across terminals A-B.",
    },
    {
      step: 6,
      title: "Calculate Load Response (IL, VL, PL)",
      detail:
        "Apply Ohm's Law: IL = Vth / (Rth + RL), VL = IL * RL, and PL = IL^2 * RL.",
    },
  ],
};

export const NORTON_THEORY: TheoremTheory = {
  title: "Norton's Theorem",
  statement: NORTON_STATEMENT,
  summary:
    "The dual of Thevenin's theorem. It states that any linear bilateral DC network connected to a designated load resistor (RL) can be modeled as an equivalent ideal current generator (IN) connected in parallel with an internal equivalent resistance (RN).",
  workingPrinciple:
    "By Source Transformation duality, a real voltage source (Vth in series with Rth) is mathematically identical to a real current source (IN in parallel with RN = Rth), where IN = Vth / Rth. Norton's theorem directly evaluates this short-circuit current.",
  keyTerminology: [
    {
      term: "Norton Current (IN = Isc)",
      definition:
        "The short-circuit current that flows directly through an ideal zero-resistance jumper placed across terminals A-B after removing RL.",
    },
    {
      term: "Norton Resistance (RN)",
      definition:
        "The internal shunt resistance of the Norton equivalent circuit. It is identical in value and calculation procedure to Thevenin resistance: RN = Rth.",
    },
    {
      term: "Current Divider Rule",
      definition:
        "The mathematical formula used to split total Norton current between parallel branches RN and RL: IL = IN * [RN / (RN + RL)].",
    },
  ],
  formulas: [
    {
      name: "Short-Circuit Current (Norton Current)",
      latex: "I_N = I_{sc} = I_{A \\to B} \\quad [\\text{terminals A-B short-circuited}]",
      explanation: "Current flowing through an ideal short wire connecting terminals A and B.",
    },
    {
      name: "Norton Resistance",
      latex: "R_N = R_{th} = R_{eq(A-B)} \\quad [\\text{sources deactivated}]",
      explanation: "Looking-in resistance from load terminals with sources killed. Exactly equals Rth.",
    },
    {
      name: "Load Current (Current Division)",
      latex: "I_L = I_N \\cdot \\frac{R_N}{R_N + R_L}",
      explanation: "Current division between parallel branches RN and RL.",
    },
    {
      name: "Thevenin-Norton Source Transformation Duality",
      latex: "V_{th} = I_N \\cdot R_N, \\qquad I_N = \\frac{V_{th}}{R_{th}}, \\qquad R_N = R_{th}",
      explanation: "Fundamental relationship proving absolute equivalence between both models.",
    },
  ],
  stepProcedure: [
    {
      step: 1,
      title: "Remove Load Resistor (RL)",
      detail:
        "Disconnect load resistor RL from output terminals A and B.",
    },
    {
      step: 2,
      title: "Short-Circuit Output Terminals A-B",
      detail:
        "Place an ideal short circuit (0 Ω connection) across terminals A and B.",
    },
    {
      step: 3,
      title: "Calculate Short-Circuit Current (IN = Isc)",
      detail:
        "Compute the current flowing through this short circuit from terminal A to B using Nodal/Mesh analysis.",
    },
    {
      step: 4,
      title: "Deactivate Independent Sources & Find RN",
      detail:
        "Replace voltage sources with shorts and current sources with open circuits. Calculate RN = Rth looking into terminals A-B.",
    },
    {
      step: 5,
      title: "Construct Norton Equivalent & Reconnect RL",
      detail:
        "Draw an ideal current source IN directed toward terminal A in parallel with Norton resistor RN and load RL.",
    },
    {
      step: 6,
      title: "Calculate Load Response (IL, VL, PL)",
      detail:
        "Compute IL = IN * [RN / (RN + RL)], VL = IL * RL, and PL = IL^2 * RL.",
    },
  ],
};

export const FACULTY_REFERENCE_PROBLEM = {
  title: "Standard Reference Benchmark Problem (Circuit 2)",
  circuitDescription:
    "A 10 V independent DC voltage source connected to series resistor R1 = 2 Ω, meeting junction A with shunt resistor R2 = 4 Ω to ground. Resistor R3 = 3 Ω extends from junction A to output node B, with load resistor RL = 1 Ω connected between node B and ground.",
  givenValues: {
    V1: "10 V",
    R1: "2 Ω",
    R2: "4 Ω",
    R3: "3 Ω",
    RL: "1 Ω",
  },
  theveninSolution: {
    step1: "Remove load resistor RL across terminals A-B.",
    step2:
      "Since terminals A-B are open, zero current flows through R3. Therefore, Vth = Voc = V(junction A) across R2. By voltage division: Vth = 10 * [4 / (2 + 4)] = 10 * (4 / 6) = 40/6 = 20/3 V = 6.6666667 V.",
    step3:
      "Deactivate 10 V source (replace with short circuit). Looking into terminals A-B: Rth = R3 + (R1 || R2) = 3 + (2 * 4) / (2 + 4) = 3 + 8/6 = 3 + 4/3 = 13/3 Ω = 4.3333333 Ω.",
    step4:
      "Reconnect load RL = 1 Ω: IL = Vth / (Rth + RL) = (20/3) / (13/3 + 1) = (20/3) / (16/3) = 20 / 16 = 1.25 A.",
    finalIL: "1.25 A",
    finalVL: "1.25 V",
    finalPL: "1.5625 W",
  },
  nortonSolution: {
    step1: "Remove load resistor RL and apply a solid short circuit across terminals A-B to ground.",
    step2:
      "With B shorted to ground, R3 is directly in parallel with R2. Parallel combination: R2 || R3 = (4 * 3) / (4 + 3) = 12/7 Ω. Total resistance seen by source: R_total = R1 + (R2 || R3) = 2 + 12/7 = 26/7 Ω. Total source current: I_total = 10 / (26/7) = 70/26 = 35/13 A. Current dividing into R3 (the shorted branch): IN = Isc = I_total * [R2 / (R2 + R3)] = (35/13) * [4 / (4 + 3)] = (35/13) * (4/7) = (5 * 4) / 13 = 20/13 A = 1.5384615 A.",
    step3:
      "RN = Rth = 13/3 Ω = 4.3333333 Ω.",
    step4:
      "Reconnect RL = 1 Ω in parallel with RN: IL = IN * [RN / (RN + RL)] = (20/13) * [(13/3) / (13/3 + 1)] = (20/13) * [(13/3) / (16/3)] = (20/13) * (13/16) = 20 / 16 = 1.25 A.",
    finalIL: "1.25 A",
    finalVL: "1.25 V",
    finalPL: "1.5625 W",
  },
  dualityCheck:
    "Vth = IN * RN = (20/13 A) * (13/3 Ω) = 20/3 V = 6.6666667 V. Exactly matches Thevenin voltage!",
};

export const COMPARISON_TABLE = [
  {
    parameter: "Equivalent Generator",
    thevenin: "Ideal Voltage Source (Vth)",
    norton: "Ideal Current Source (IN)",
  },
  {
    parameter: "Internal Resistance Position",
    thevenin: "Connected in SERIES with Vth",
    norton: "Connected in PARALLEL with IN",
  },
  {
    parameter: "Resistance Value",
    thevenin: "Rth = Req looking into open terminals",
    norton: "RN = Rth (identically equal)",
  },
  {
    parameter: "Load Connection",
    thevenin: "RL connected in series with Rth",
    norton: "RL connected in parallel with RN",
  },
  {
    parameter: "Load Current Formula",
    thevenin: "IL = Vth / (Rth + RL)",
    norton: "IL = IN * [RN / (RN + RL)]",
  },
  {
    parameter: "Primary Method",
    thevenin: "Mesh/KVL analysis (finds Voc)",
    norton: "Nodal/KCL analysis (finds Isc)",
  },
  {
    parameter: "Duality Relationship",
    thevenin: "Vth = IN * RN",
    norton: "IN = Vth / Rth",
  },
];

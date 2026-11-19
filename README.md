# CircuitLAB — Interactive Thevenin's & Norton's Theorem Simulator

> **Academic Project Context:** Undergraduate Basic Electrical Engineering (BEE) Semester 1 evaluation project (10 Marks Live Demonstration).

CircuitLAB is a genuine, mathematically rigorous, interactive DC electrical circuit simulator designed for live academic demonstration. It enables students and faculty members to enter arbitrary component values across six predefined circuit topologies, execute step-by-step circuit reductions, watch animated topological transformations, view intermediate mathematical calculations, and download comprehensive academic PDF reports.

---

## 🌟 Key Features

1. **Deterministic Electrical Calculation Engine:**
   - Pure TypeScript Modified Nodal Analysis (MNA) with Gaussian Elimination and partial pivoting.
   - Exact source deactivation (Voltage source $\rightarrow$ $0\text{ V}$ short circuit, Current source $\rightarrow$ $0\text{ A}$ open circuit).
   - Test-source method ($1\text{ A}$ current injection) for calculating equivalent resistance ($R_{th} = R_N$).
   - Absolute Thevenin-Norton duality verification ($V_{th} = I_N \times R_N$).

2. **Faculty Reference Benchmark (Circuit 2):**
   - Circuit topology: $10\text{ V}$ DC source, $R_1 = 2\ \Omega$, $R_2 = 4\ \Omega$ (shunt to GND at junction A), $R_3 = 3\ \Omega$ (junction A to B), and $R_L = 1\ \Omega$.
   - **Thevenin results:** $V_{th} = \frac{20}{3}\text{ V} \approx 6.667\text{ V}$, $R_{th} = \frac{13}{3}\ \Omega \approx 4.333\ \Omega$, $I_L = \mathbf{1.25\text{ A}}$ (Exact).
   - **Norton results:** $I_N = \frac{20}{13}\text{ A} \approx 1.538\text{ A}$, $R_N = \frac{13}{3}\ \Omega$, $I_L = \mathbf{1.25\text{ A}}$ (Exact).
   - Serves as the primary regression test in the automated test suite.

3. **Six Predefined Circuit Configurations:**
   - **Circuit 1:** Single voltage source — series resistor $R_1$, shunt resistor $R_2$, load $R_L$.
   - **Circuit 2:** Single voltage source — ladder network (Faculty Reference Problem).
   - **Circuit 3:** Two independent voltage sources in series with aiding/opposing polarity toggle.
   - **Circuit 4:** Two independent voltage sources in separate branches feeding common node network.
   - **Circuit 5:** Multiple independent current sources and parallel resistors with reversible current directions.
   - **Circuit 6:** Mixed independent voltage and current source network.

4. **Interactive SVG Circuit Transformations:**
   - Crisp IEEE standard schematic symbols with dynamic current flow animations.
   - Visual removal of load resistor $R_L$ with highlighted open terminals $A$ and $B$.
   - Measurement of open-circuit voltage ($V_{oc} = V_{th}$).
   - Short-circuiting of output terminals with animated $I_{sc}$ ammeter jumper.
   - Visual source deactivation (voltage sources become short wires; current sources become open breaks).
   - Smooth transition into canonical Thevenin ($V_{th}$ in series with $R_{th}$) or Norton ($I_N$ in parallel with $R_N$) equivalent circuits.
   - Reconnection of $R_L$ with calculated load response: $I_L$, $V_L$, $P_L$.

5. **Automated Academic PDF Reports:**
   - Offline, client-side PDF generation using `jspdf` and `jspdf-autotable`.
   - Complete report with circuit details, user component parameters, step-by-step mathematical working, formulas, substitutions, and Thevenin-Norton duality verification.

6. **Educational Learning Mode:**
   - Verbatim faculty-provided statements for Thevenin's and Norton's theorems.
   - Step-by-step procedures, required formulas, governing circuit laws, and Thevenin vs Norton comparative table.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js (v18 or higher) installed on your system.

### Installation

```bash
# Clone the repository
git clone https://github.com/kabhiram08/CircuitLAB.git
cd CircuitLAB

# Install dependencies (pnpm / npm)
pnpm install
# or
npm install
```

### Running Local Development Server

```bash
# Start Vite development server
pnpm dev
# or
npm run dev
```

Open your browser at `http://localhost:5173`.

### Running Automated Mathematical Tests

To execute the 88 comprehensive automated unit and regression tests:

```bash
pnpm test
# or
npm test
```

### Building for Production / Offline Demonstration

```bash
# Type check and build production distribution
pnpm build
# or
npm run build

# Preview the built distribution locally
pnpm preview
# or
npm run preview
```

---

## 📁 Project Architecture

```
CircuitLAB/
├── src/
│   ├── engine/
│   │   ├── types.ts              # Core circuit, step, and result type definitions
│   │   ├── matrixSolver.ts       # Gaussian elimination with partial pivoting (EPSILON=1e-12)
│   │   ├── mna.ts                # Modified Nodal Analysis (MNA) & test-source Rth engine
│   │   ├── circuitTemplates.ts   # Six predefined mathematically sound circuit topologies
│   │   ├── thevenin.ts           # 8-step Thevenin analysis with formulas & substitutions
│   │   ├── norton.ts             # 8-step Norton analysis with current division & verification
│   │   ├── validation.ts         # Numeric and electrical parameter input validation
│   │   └── __tests__/
│   │       └── calculations.test.ts # 88 automated Vitest tests (Faculty Ref regression, etc.)
│   ├── renderer/
│   │   └── CircuitSVG.tsx        # Topology-aware SVG circuit renderer with animations
│   ├── components/
│   │   ├── Navbar.tsx            # Sticky header with BEE Sem 1 badge & route tabs
│   │   ├── Footer.tsx            # Academic demonstration footer
│   │   ├── Icons.tsx             # Reusable SVG icon set
│   │   ├── CircuitSelector.tsx   # 6-card interactive template selector
│   │   ├── InputPanel.tsx        # Live component parameter editor with validation
│   │   ├── StepDisplay.tsx       # Step stepper, player controls, and math working
│   │   └── ResultsPanel.tsx      # Equivalent metrics, duality check & PDF download
│   ├── pages/
│   │   ├── Home.tsx              # Landing page with theorem selection cards
│   │   ├── Thevenin.tsx          # Full Thevenin simulation workspace
│   │   ├── Norton.tsx            # Full Norton simulation workspace
│   │   └── Learn.tsx             # Curriculum module with verbatim faculty statements
│   ├── utils/
│   │   └── pdfGenerator.ts       # Local PDF report generator
│   ├── App.tsx                   # Main router setup
│   ├── main.tsx                  # React DOM entrypoint
│   └── index.css                 # Black & Gold styling, animations, and Tailwind directives
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

---

## 🎓 Faculty Evaluation Checklist

- [x] **Faculty Statement Preservation:** Verbatim statements displayed in Thevenin, Norton, and Learn sections.
- [x] **Faculty Reference Problem:** Circuit 2 pre-calibrated with $V = 10\text{ V}, R_1 = 2\ \Omega, R_2 = 4\ \Omega, R_3 = 3\ \Omega, R_L = 1\ \Omega \implies I_L = 1.25\text{ A}$.
- [x] **Deterministic MNA Engine:** No hardcoded or AI approximations. Solves generalized linear systems using Gaussian elimination with partial pivoting.
- [x] **Source Deactivation Method:** Strictly replaces voltage sources with short circuits ($0\text{ V}$) and current sources with open circuits ($0\text{ A}$). Evaluates $R_{th}$ using test-source injection.
- [x] **Step-by-Step Mathematical Transparency:** Complete intermediate formulas, substitutions, and results.
- [x] **Animated SVG Transformations:** Real-time visual feedback for load removal, source deactivation, shorting, and equivalent network reconstruction.
- [x] **Offline PDF Export:** Generates complete academic reports locally in the browser.
- [x] **88 Passing Automated Tests:** 100% test pass rate across all 6 templates and boundary cases.

---

## 👤 Author & Academic Details

- **Student Name:** KDNSP Abhiram
- **Roll Number:** 26211A05N2
- **Branch:** Computer Science & Engineering (CSE D)
- **Institution:** BVRIT Narsapur
- **GitHub:** [@kabhiram08](https://github.com/kabhiram08)

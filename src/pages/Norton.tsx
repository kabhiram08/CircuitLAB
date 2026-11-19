import React, { useMemo, useState } from 'react';
import { getCircuitConfig } from '../engine/circuitTemplates';
import { runTheveninAnalysis } from '../engine/thevenin';
import { runNortonAnalysis } from '../engine/norton';
import { validateInputs, getDefaultValues } from '../engine/validation';
import { ComponentValues } from '../engine/types';
import { CircuitSelector } from '../components/CircuitSelector';
import { InputPanel } from '../components/InputPanel';
import { CircuitSVG } from '../renderer/CircuitSVG';
import { StepDisplay } from '../components/StepDisplay';
import { ResultsPanel } from '../components/ResultsPanel';
import { generatePDFReport } from '../utils/pdfGenerator';
import { NORTON_STATEMENT } from '../data/educationalContent';
import { ZapIcon, AlertCircleIcon } from '../components/Icons';

export const Norton: React.FC = () => {
  // Circuit 2 is the default (Faculty Reference Problem)
  const [selectedCircuitId, setSelectedCircuitId] = useState<number>(2);
  const [values, setValues] = useState<ComponentValues>(() => getDefaultValues(2));
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

  // Switch circuit template
  const handleCircuitSelect = (id: number) => {
    setSelectedCircuitId(id);
    setValues(getDefaultValues(id));
    setCurrentStepIndex(0);
  };

  // Input validation
  const validationErrors = useMemo(() => {
    return validateInputs(selectedCircuitId, values);
  }, [selectedCircuitId, values]);

  const hasErrors = validationErrors.length > 0;

  // Run Deterministic Calculation Engine
  const { theveninResult, nortonResult, calcError } = useMemo(() => {
    if (hasErrors) {
      return { theveninResult: null, nortonResult: null, calcError: null };
    }
    try {
      const cfg = getCircuitConfig(selectedCircuitId);
      const topology = cfg.buildTopology(values);
      const th = runTheveninAnalysis(topology);
      const no = runNortonAnalysis(topology);
      return { theveninResult: th, nortonResult: no, calcError: null };
    } catch (err) {
      return {
        theveninResult: null,
        nortonResult: null,
        calcError: (err as Error).message,
      };
    }
  }, [selectedCircuitId, values, hasErrors]);

  const steps = nortonResult?.steps ?? [];
  const currentStep = steps[currentStepIndex] ?? steps[0];
  const animationState = currentStep?.animationState ?? 'original';

  // Handle PDF Generation
  const handleDownloadPDF = () => {
    if (!theveninResult || !nortonResult) return;
    setIsGeneratingPDF(true);
    try {
      const cfg = getCircuitConfig(selectedCircuitId);
      generatePDFReport({
        theorem: 'norton',
        circuitId: selectedCircuitId,
        circuitName: cfg.name,
        circuitDescription: cfg.description,
        values,
        steps: nortonResult.steps,
        vth: theveninResult.Vth,
        rth: theveninResult.Rth,
        inVal: nortonResult.IN,
        rn: nortonResult.RN,
        il: nortonResult.IL,
        vl: nortonResult.VL,
        pl: nortonResult.PL,
        rl: values.RL ?? 1,
      });
    } catch (err) {
      console.error('PDF Generation failed:', err);
      alert('Failed to generate PDF. Check console for details.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Faculty Statement */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <ZapIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Norton's Theorem Simulator
              </h1>
              <p className="text-xs sm:text-sm text-gray-400">
                Interactive step-by-step reduction into equivalent current source and parallel resistance
              </p>
            </div>
          </div>

          <span className="theorem-badge norton self-start sm:self-auto">
            IN &amp; Parallel RN Equivalent
          </span>
        </div>

        {/* Verbatim Faculty Theorem Statement */}
        <div className="bg-[#242427] border-l-4 border-amber-500 rounded-r-xl p-4 shadow-md space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
            FORMAL THEOREM STATEMENT (VERBATIM):
          </span>
          <p className="text-xs sm:text-sm text-gray-200 leading-relaxed italic whitespace-pre-line font-serif">
            "{NORTON_STATEMENT}"
          </p>
        </div>
      </div>

      {/* 1. Circuit Template Selector */}
      <CircuitSelector
        selectedId={selectedCircuitId}
        onSelect={handleCircuitSelect}
      />

      {/* 2. Interactive Input Panel */}
      <InputPanel
        circuitId={selectedCircuitId}
        values={values}
        onChange={setValues}
        errors={validationErrors}
      />

      {/* Errors or Calculation Failure Alert */}
      {calcError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm flex items-center gap-2">
          <AlertCircleIcon className="w-5 h-5 flex-shrink-0" />
          <span>Calculation Error: {calcError}</span>
        </div>
      )}

      {/* 3. Main Simulation Area: Animated Circuit SVG & Stepper */}
      {nortonResult && (
        <div className="space-y-6">
          {/* Circuit Canvas */}
          <div className="circuit-panel p-2 sm:p-4 bg-[#141416]">
            <CircuitSVG
              circuitId={selectedCircuitId}
              values={values}
              animationState={animationState}
              theorem="norton"
              vth={theveninResult?.Vth ?? 0}
              rth={theveninResult?.Rth ?? nortonResult.RN}
              inVal={nortonResult.IN}
              rn={nortonResult.RN}
              il={nortonResult.IL}
              vl={nortonResult.VL}
            />
          </div>

          {/* Stepper Controller */}
          <StepDisplay
            steps={steps}
            currentStepIndex={currentStepIndex}
            onStepChange={setCurrentStepIndex}
            theorem="norton"
          />

          {/* Results & PDF Summary */}
          <ResultsPanel
            theorem="norton"
            vth={theveninResult?.Vth ?? 0}
            rth={theveninResult?.Rth ?? nortonResult.RN}
            inVal={nortonResult.IN}
            rn={nortonResult.RN}
            il={nortonResult.IL}
            vl={nortonResult.VL}
            pl={nortonResult.PL}
            rl={nortonResult.RL}
            onDownloadPDF={handleDownloadPDF}
            isGeneratingPDF={isGeneratingPDF}
          />
        </div>
      )}
    </div>
  );
};

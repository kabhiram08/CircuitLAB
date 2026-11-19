import React, { useEffect, useState } from 'react';
import { AnalysisStep } from '../engine/types';
import {
  PlayIcon,
  PauseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  RotateCcwIcon,
  CheckIcon,
} from './Icons';

interface StepDisplayProps {
  steps: AnalysisStep[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  theorem: 'thevenin' | 'norton';
}

export const StepDisplay: React.FC<StepDisplayProps> = ({
  steps,
  currentStepIndex,
  onStepChange,
  theorem,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Auto-play timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying) {
      timer = setInterval(() => {
        onStepChange(
          currentStepIndex < steps.length - 1 ? currentStepIndex + 1 : 0
        );
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentStepIndex, steps.length, onStepChange]);

  const step = steps[currentStepIndex] ?? steps[0];

  const handlePrev = () => {
    setIsPlaying(false);
    if (currentStepIndex > 0) {
      onStepChange(currentStepIndex - 1);
    }
  };

  const handleNext = () => {
    setIsPlaying(false);
    if (currentStepIndex < steps.length - 1) {
      onStepChange(currentStepIndex + 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    onStepChange(0);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="bg-[#242427] border border-white/10 rounded-xl p-5 shadow-lg space-y-4">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
          <h3 className="text-base font-bold text-white truncate">{step.title}</h3>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={handleReset}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            title="Reset Animation"
          >
            <RotateCcwIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all"
            title="Previous Step"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <button
            onClick={togglePlay}
            className="btn-gold px-3.5 py-1.5 text-xs flex items-center gap-1.5"
            title={isPlaying ? 'Pause' : 'Play Walkthrough'}
          >
            {isPlaying ? (
              <>
                <PauseIcon className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <PlayIcon className="w-3.5 h-3.5" />
                <span>Play Auto</span>
              </>
            )}
          </button>
          <button
            onClick={handleNext}
            disabled={currentStepIndex === steps.length - 1}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all"
            title="Next Step"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step Progress Pill Timeline */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {steps.map((s, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurr = idx === currentStepIndex;

          return (
            <button
              key={idx}
              onClick={() => {
                setIsPlaying(false);
                onStepChange(idx);
              }}
              className={`flex-1 min-w-[28px] h-2 rounded-full transition-all ${
                isCurr
                  ? 'bg-yellow-400 shadow-md shadow-yellow-500/30 h-2.5'
                  : isDone
                  ? 'bg-yellow-600/70 hover:bg-yellow-500/80'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              title={`Step ${idx + 1}: ${s.title}`}
            />
          );
        })}
      </div>

      {/* Description */}
      <div className="text-sm text-gray-300 leading-relaxed bg-[#1b1b1e] p-3.5 rounded-lg border border-white/5">
        <p className="whitespace-pre-line">{step.description}</p>
      </div>

      {/* Mathematical Calculations Breakdown */}
      {step.calculations && step.calculations.length > 0 && (
        <div className="space-y-2 pt-1">
          <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">
            Mathematical Working &amp; Substitutions:
          </h4>

          <div className="grid grid-cols-1 gap-2">
            {step.calculations.map((calc, i) => (
              <div
                key={i}
                className="bg-[#18181b] border border-yellow-500/20 rounded-lg p-3 space-y-1 font-mono text-xs"
              >
                <div className="flex items-center justify-between text-gray-400">
                  <span className="font-sans font-semibold text-gray-300">{calc.label}</span>
                  <span className="text-yellow-400 font-bold">{calc.result}</span>
                </div>
                {calc.formula && (
                  <div className="text-yellow-300/90 pl-2 border-l-2 border-yellow-500/40">
                    Formula: {calc.formula}
                  </div>
                )}
                {calc.substitution && (
                  <div className="text-gray-400 pl-2 border-l-2 border-white/20">
                    Sub: {calc.substitution}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Primary Step Result Banner */}
      {step.result && (
        <div className="result-block flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
              <CheckIcon className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Step Result:
            </span>
          </div>
          <span className="font-mono text-sm font-bold text-yellow-400">
            {step.result}
          </span>
        </div>
      )}
    </div>
  );
};

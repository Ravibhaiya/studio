// src/components/screens/FractionsConfigScreen.tsx
'use client';
import { useState } from 'react';
import type { Mode, FractionAnswerType } from '@/lib/types';
import { createRipple } from '@/lib/ui-helpers';

interface FractionsConfigScreenProps {
  onStart: (mode: Mode) => void;
  config: {
    selected: FractionAnswerType[];
    timer?: number;
  };
  setConfig: (newConfig: {
    selected: FractionAnswerType[];
    timer?: number;
  }) => void;
}

export default function FractionsConfigScreen({
  onStart,
  config,
  setConfig,
}: FractionsConfigScreenProps) {
  const [configError, setConfigError] = useState('');

  const handleSelectionChange = () => {
    if (configError) setConfigError('');
  };

  const handleTypeSelection = (answerType: FractionAnswerType) => {
    const newSelection = config.selected.includes(answerType)
      ? config.selected.filter((t) => t !== answerType)
      : [...config.selected, answerType];
    setConfig({ ...config, selected: newSelection });
    handleSelectionChange();
  };

  const handleTimerChange = (value: string) => {
    const timerValue =
      value === '' || parseInt(value, 10) === 0
        ? undefined
        : parseInt(value, 10);
    setConfig({ ...config, timer: timerValue });
  };

  const handleStartClick = () => {
    if (config.selected.length > 0) {
      setConfigError('');
      onStart('fractions');
    } else {
      setConfigError(
        'Please select at least one answer type (Fraction or Decimal).'
      );
    }
  };

  return (
    <div
      id="fractions-config-screen"
      className="screen active flex-col sm:px-6 md:px-8 lg:px-12"
    >
      <div className="flex-grow">
        <p className="body-large text-[var(--md-sys-color-on-surface-variant)] mb-2">
          Answer Type:
        </p>
        <div id="fractions-chips" className="flex flex-wrap gap-2 mb-6">
          {(['fraction', 'decimal'] as FractionAnswerType[]).map((type) => (
            <button
              key={type}
              onClick={() => handleTypeSelection(type)}
              onMouseDown={createRipple}
              className={`choice-chip ripple-surface label-large ${
                config.selected.includes(type) ? 'selected' : ''
              }`}
            >
              <span className="material-symbols-outlined">done</span>
              <span>{type === 'fraction' ? 'Fraction' : 'Decimal'}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-shrink-0 mt-6">
        <div className="text-field !mt-0">
          <input
            type="number"
            id="fractions-timer-input"
            placeholder=" "
            autoComplete="off"
            className="text-center title-medium"
            value={config.timer === undefined ? '' : config.timer}
            onChange={(e) => handleTimerChange(e.target.value)}
          />
          <label htmlFor="fractions-timer-input" className="body-large">
            Seconds per question
          </label>
        </div>
        <p className="label-medium text-center text-[var(--md-sys-color-on-surface-variant)] mt-2">
          Enter 0 or leave blank for no timer.
        </p>
      </div>
      <div className="min-h-[24px] text-center my-2">
        {configError && (
          <span className="body-medium text-red-600">{configError}</span>
        )}
      </div>
      <div className="flex justify-end pt-2 flex-shrink-0">
        <button
          onClick={handleStartClick}
          className="filled-button ripple-surface"
          onMouseDown={createRipple}
        >
          <span className="label-large">Start Practice</span>
        </button>
      </div>
    </div>
  );
}

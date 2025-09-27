
// src/components/screens/PracticeConfigScreen.tsx
'use client';
import { useState } from 'react';
import type { Mode } from '@/lib/types';
import { createRipple } from '@/lib/ui-helpers';

interface PracticeConfigScreenProps {
  onStart: (mode: Mode) => void;
  config: {
    digits1: number[];
    digits2: number[];
    timer?: number;
  };
  setConfig: (newConfig: {
    digits1: number[];
    digits2: number[];
    timer?: number;
  }) => void;
}

export default function PracticeConfigScreen({
  onStart,
  config,
  setConfig,
}: PracticeConfigScreenProps) {
  const [configError, setConfigError] = useState('');

  const handleSelectionChange = () => {
    if (configError) setConfigError('');
  };

  const handleDigitSelection = (
    group: 'digits1' | 'digits2',
    digit: number
  ) => {
    const currentSelection = config[group];
    const newSelection = currentSelection.includes(digit)
      ? currentSelection.filter((d) => d !== digit)
      : [...currentSelection, digit];
    setConfig({ ...config, [group]: newSelection });
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
    if (config.digits1.length > 0 && config.digits2.length > 0) {
      setConfigError('');
      onStart('practice');
    } else {
      setConfigError('Please select the number of digits for both numbers.');
    }
  };

  return (
    <div
      id="practice-config-screen"
      className="screen active flex-col sm:px-6 md:px-8 lg:px-12"
    >
      <div className="flex-grow">
        <p className="body-large text-[var(--md-sys-color-on-surface-variant)] mb-2">
          Digits in first number:
        </p>
        <div id="digits1-chips" className="flex flex-wrap gap-2 mb-6">
          {[2, 3, 4, 5].map((digit) => (
            <button
              key={`d1-${digit}`}
              onClick={() => handleDigitSelection('digits1', digit)}
              onMouseDown={createRipple}
              className={`choice-chip ripple-surface label-large ${
                config.digits1.includes(digit) ? 'selected' : ''
              }`}
            >
              <span className="material-symbols-outlined">done</span>
              <span>{digit}</span>
            </button>
          ))}
        </div>
        <p className="body-large text-[var(--md-sys-color-on-surface-variant)] mb-2">
          Digits in second number:
        </p>
        <div id="digits2-chips" className="flex flex-wrap gap-2">
          {[2, 3, 4, 5].map((digit) => (
            <button
              key={`d2-${digit}`}
              onClick={() => handleDigitSelection('digits2', digit)}
              onMouseDown={createRipple}
              className={`choice-chip ripple-surface label-large ${
                config.digits2.includes(digit) ? 'selected' : ''
              }`}
            >
              <span className="material-symbols-outlined">done</span>
              <span>{digit}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-shrink-0 mt-6">
        <div className="text-field !mt-0">
          <input
            type="number"
            id="practice-timer-input"
            placeholder=" "
            autoComplete="off"
            className="text-center title-medium"
            value={config.timer === undefined ? '' : config.timer}
            onChange={(e) => handleTimerChange(e.target.value)}
          />
          <label htmlFor="practice-timer-input" className="body-large">
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

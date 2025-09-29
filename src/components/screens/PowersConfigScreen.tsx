// src/components/screens/PowersConfigScreen.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import type { Mode, PowerType } from '@/lib/types';
import { useRipple } from '@/hooks/useRipple';

interface PowersConfig {
  selected: PowerType[];
  rangeMax: number;
  timer?: number;
}

interface PowersConfigScreenProps {
  onStart: (mode: Mode, config: PowersConfig) => void;
}

const TIMER_STORAGE_KEY = 'math-tools-timer-powers';

export default function PowersConfigScreen({ onStart }: PowersConfigScreenProps) {
  const [selected, setSelected] = useState<PowerType[]>([]);
  const [rangeMax, setRangeMax] = useState(30);
  const [timer, setTimer] = useState<number | undefined>(10);
  const [configError, setConfigError] = useState('');

  const sliderRef = useRef<HTMLInputElement>(null);
  const sliderLabelRef = useRef<HTMLSpanElement>(null);
  const createRipple = useRipple();

  useEffect(() => {
    try {
      const storedTimer = localStorage.getItem(TIMER_STORAGE_KEY);
      if (storedTimer !== null) {
        setTimer(JSON.parse(storedTimer));
      }
    } catch (error) {
      console.error('Failed to read timer from localStorage', error);
    }
  }, []);

  useEffect(() => {
    if (sliderRef.current && sliderLabelRef.current) {
      const slider = sliderRef.current;
      const valueLabel = sliderLabelRef.current;
      const min = parseInt(slider.min);
      const max = parseInt(slider.max);
      const value = parseInt(slider.value);
      const percent = ((value - min) / (max - min)) * 100;
      const thumbWidth = 20;
      valueLabel.style.left = `calc(${percent}% + (${
        (thumbWidth / 2) - (percent / 100) * thumbWidth
      }px))`;
    }
  }, [rangeMax]);

  const handleSelectionChange = () => {
    if (configError) setConfigError('');
  };

  const handlePowerSelection = (powerType: PowerType) => {
    const newSelection = selected.includes(powerType)
      ? selected.filter((p) => p !== powerType)
      : [...selected, powerType];
    setSelected(newSelection);
    handleSelectionChange();
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setRangeMax(value);
  };

  const handleTimerChange = (value: string) => {
    const timerValue =
      value === '' || parseInt(value, 10) === 0
        ? undefined
        : parseInt(value, 10);
    setTimer(timerValue);
    try {
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timerValue));
    } catch (error) {
      console.error('Failed to save timer to localStorage', error);
    }
  };

  const handleStartClick = () => {
    if (selected.length > 0) {
      setConfigError('');
      onStart('powers', { selected, rangeMax, timer });
    } else {
      setConfigError(
        'Please select at least one practice type (e.g., Squares, Cubes).'
      );
    }
  };

  const hasCubeSelection =
    selected.includes('cubes') || selected.includes('cube_roots');
  const isPowerRangeAbove20 = rangeMax > 20;

  return (
    <div
      id="powers-config-screen"
      className="screen active flex-col sm:px-6 md:px-8 lg:px-12"
    >
      <div className="flex-grow">
        <p className="body-large text-[var(--md-sys-color-on-surface-variant)] mb-2">
          Practice Types:
        </p>
        <div id="powers-chips" className="flex flex-wrap gap-2 mb-6">
          {(
            ['squares', 'cubes', 'square_roots', 'cube_roots'] as PowerType[]
          ).map((type) => (
            <button
              key={type}
              onClick={() => handlePowerSelection(type)}
              onMouseDown={createRipple}
              className={`choice-chip ripple-surface label-large ${
                selected.includes(type) ? 'selected' : ''
              }`}
            >
              <span className="material-symbols-outlined">done</span>
              <span>
                {
                  {
                    squares: 'Squares (x²)',
                    cubes: 'Cubes (x³)',
                    square_roots: 'Square Roots (√x)',
                    cube_roots: 'Cube Roots (³√x)',
                  }[type]
                }
              </span>
            </button>
          ))}
        </div>
        <p className="body-large text-[var(--md-sys-color-on-surface-variant)] mb-2">
          Number Range:
        </p>
        <div className="range-slider-wrapper">
          <span id="slider-value-label" ref={sliderLabelRef}>
            {rangeMax}
          </span>
          <input
            type="range"
            id="powers-range-slider"
            min="2"
            max="30"
            value={rangeMax}
            onChange={handleSliderChange}
            ref={sliderRef}
          />
          <div className="flex justify-between mt-2 body-medium text-[var(--md-sys-color-on-surface-variant)]">
            <span>2</span>
            <span>30</span>
          </div>
        </div>
        <p
          id="powers-helper-note"
          className={`label-medium text-center text-[var(--md-sys-color-on-surface-variant)] mt-2 ${
            !(hasCubeSelection && isPowerRangeAbove20) ? 'hidden' : ''
          }`}
        >
          Note: Cube and cube root questions will only be generated for numbers
          up to 20.
        </p>
      </div>
      <div className="flex-shrink-0 mt-6">
        <div className="text-field !mt-0">
          <input
            type="number"
            id="powers-timer-input"
            placeholder=" "
            autoComplete="off"
            className="text-center title-medium"
            value={timer === undefined ? '' : timer}
            onChange={(e) => handleTimerChange(e.target.value)}
          />
          <label htmlFor="powers-timer-input" className="body-large">
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

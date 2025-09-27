// src/components/screens/TableSelectionScreen.tsx
'use client';
import { useState, useEffect } from 'react';
import type { Mode } from '@/lib/types';
import { createRipple } from '@/lib/ui-helpers';

const TIMER_KEY = 'math_tools_timer_tables';

interface TableSelectionScreenProps {
  onStart: (mode: Mode) => void;
}

export default function TableSelectionScreen({
  onStart,
}: TableSelectionScreenProps) {
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [timer, setTimer] = useState<number | undefined>(10);
  const [configError, setConfigError] = useState('');

  useEffect(() => {
    const savedTimer = localStorage.getItem(TIMER_KEY);
    if (savedTimer !== null) {
      const timerValue =
        savedTimer === 'null' ? undefined : parseInt(savedTimer, 10);
      setTimer(timerValue);
    }
  }, []);

  const handleSelectionChange = () => {
    if (configError) setConfigError('');
  };

  const handleTableSelection = (table: number) => {
    setSelectedTables((prev) =>
      prev.includes(table) ? prev.filter((n) => n !== table) : [...prev, table]
    );
    handleSelectionChange();
  };

  const handleTimerChange = (value: string) => {
    const timerValue =
      value === '' || parseInt(value, 10) === 0
        ? undefined
        : parseInt(value, 10);
    const storageValue = timerValue === undefined ? 'null' : timerValue.toString();
    setTimer(timerValue);
    localStorage.setItem(TIMER_KEY, storageValue);
  };

  const handleStartClick = () => {
    if (selectedTables.length > 0) {
      setConfigError('');
      // We pass 'tables' and the selected tables up to the parent
      // This is a placeholder for a more robust state management solution
      localStorage.setItem('math_tools_selected_tables', JSON.stringify(selectedTables));
      onStart('tables');
    } else {
      setConfigError('Please select at least one multiplication table to practice.');
    }
  };

  return (
    <div
      id="table-selection-screen"
      className="screen active flex-col sm:px-6 md:px-8 lg:px-12"
    >
      <div className="text-center mb-4 flex-shrink-0">
        <p className="body-large text-[var(--md-sys-color-on-surface-variant)]">
          Choose the tables you want to practice.
        </p>
      </div>
      <div
        id="number-grid"
        className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3 flex-grow overflow-y-auto"
      >
        {Array.from({ length: 29 }, (_, i) => i + 2).map((num) => (
          <button
            key={num}
            onClick={() => handleTableSelection(num)}
            onMouseDown={createRipple}
            className={`number-chip ripple-surface label-large ${
              selectedTables.includes(num) ? 'selected' : ''
            }`}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="flex-shrink-0 mt-4">
        <div className="text-field !mt-0">
          <input
            type="number"
            id="tables-timer-input"
            placeholder=" "
            autoComplete="off"
            className="text-center title-medium"
            value={timer === undefined ? '' : timer}
            onChange={(e) => handleTimerChange(e.target.value)}
          />
          <label htmlFor="tables-timer-input" className="body-large">
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
          <span className="label-large">Start</span>
        </button>
      </div>
    </div>
  );
}

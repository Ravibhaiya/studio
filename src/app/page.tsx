// src/app/page.tsx
'use client';
import { useState } from 'react';
import type {
  Page,
  Mode,
  PowerType,
  FractionAnswerType,
} from '@/lib/types';

import HomeScreen from '@/components/screens/HomeScreen';
import TableSelectionScreen from '@/components/screens/TableSelectionScreen';
import PracticeConfigScreen from '@/components/screens/PracticeConfigScreen';
import PowersConfigScreen from '@/components/screens/PowersConfigScreen';
import FractionsConfigScreen from '@/components/screens/FractionsConfigScreen';
import ExecutionScreen from '@/components/screens/ExecutionScreen';

interface PracticeConfig {
  tables: {
    selected: number[];
    timer?: number;
  };
  practice: {
    digits1: number[];
    digits2: number[];
    timer?: number;
  };
  powers: {
    selected: PowerType[];
    rangeMax: number;
    timer?: number;
  };
  fractions: {
    selected: FractionAnswerType[];
    timer?: number;
  };
}

export default function Home() {
  const [page, setPage] = useState<Page>('home');
  const [mode, setMode] = useState<Mode>('');
  const [config, setConfig] = useState<PracticeConfig>({
    tables: { selected: [], timer: 10 },
    practice: { digits1: [], digits2: [], timer: 10 },
    powers: { selected: [], rangeMax: 30, timer: 10 },
    fractions: { selected: [], timer: 10 },
  });

  const pageTitles: Record<Page, string> = {
    home: 'Math Tools',
    'table-selection': 'Multiplication Tables',
    'practice-config': 'Multiplication Practice',
    'powers-config': 'Powers & Roots',
    'fractions-config': 'Fractions & Decimals',
    execution: 'Practice',
  };

  const handleBack = () => {
    if (page === 'execution') {
      const prevPage =
        mode === 'tables'
          ? 'table-selection'
          : mode === 'practice'
            ? 'practice-config'
            : mode === 'powers'
              ? 'powers-config'
              : 'fractions-config';
      setPage(prevPage);
    } else if (
      [
        'table-selection',
        'practice-config',
        'powers-config',
        'fractions-config',
      ].includes(page)
    ) {
      setPage('home');
    }
  };

  const navigateTo = (targetPage: Page) => {
    setPage(targetPage);
  };

  const startPractice = (execMode: Mode) => {
    setMode(execMode);
    setPage('execution');
  };

  return (
    <main id="app-container">
      <header id="top-app-bar">
        <button
          id="back-btn"
          className="icon-button ripple-surface"
          onClick={handleBack}
          style={{ display: page === 'home' ? 'none' : 'inline-flex' }}
        >
          <span className="material-symbols-outlined text-gray-700">
            arrow_back
          </span>
        </button>
        <h1 id="app-title" className="title-large text-gray-800">
          {pageTitles[page]}
        </h1>
      </header>

      {page === 'home' && <HomeScreen navigateTo={navigateTo} />}
      {page === 'table-selection' && (
        <TableSelectionScreen
          onStart={startPractice}
          config={config.tables}
          setConfig={(newConfig) =>
            setConfig((prev) => ({ ...prev, tables: newConfig }))
          }
        />
      )}
      {page === 'practice-config' && (
        <PracticeConfigScreen
          onStart={startPractice}
          config={config.practice}
          setConfig={(newConfig) =>
            setConfig((prev) => ({ ...prev, practice: newConfig }))
          }
        />
      )}
      {page === 'powers-config' && (
        <PowersConfigScreen
          onStart={startPractice}
          config={config.powers}
          setConfig={(newConfig) =>
            setConfig((prev) => ({ ...prev, powers: newConfig }))
          }
        />
      )}
      {page === 'fractions-config' && (
        <FractionsConfigScreen
          onStart={startPractice}
          config={config.fractions}
          setConfig={(newConfig) =>
            setConfig((prev) => ({ ...prev, fractions: newConfig }))
          }
        />
      )}
      {page === 'execution' && (
        <ExecutionScreen
          mode={mode}
          config={config[mode as NonNullable<Mode>]}
        />
      )}
    </main>
  );
}

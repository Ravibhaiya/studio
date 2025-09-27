'use client';
import { useState } from 'react';
import type { Page, Mode } from '@/lib/types';

import HomeScreen from '@/components/screens/HomeScreen';
import TableSelectionScreen from '@/components/screens/TableSelectionScreen';
import PracticeConfigScreen from '@/components/screens/PracticeConfigScreen';
import PowersConfigScreen from '@/components/screens/PowersConfigScreen';
import ExecutionScreen from '@/components/screens/ExecutionScreen';

export default function Home() {
  const [page, setPage] = useState<Page>('home');
  const [mode, setMode] = useState<Mode>('');

  const pageTitles: Record<Page, string> = {
    home: 'Math Tools',
    'table-selection': 'Multiplication Tables',
    'practice-config': 'Multiplication Practice',
    'powers-config': 'Powers & Roots',
    execution: 'Practice',
  };

  const handleBack = () => {
    if (page === 'execution') {
      const prevPage =
        mode === 'tables'
          ? 'table-selection'
          : mode === 'practice'
            ? 'practice-config'
            : 'powers-config';
      setPage(prevPage);
    } else if (
      ['table-selection', 'practice-config', 'powers-config'].includes(page)
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
        <TableSelectionScreen onStart={startPractice} />
      )}
      {page === 'practice-config' && (
        <PracticeConfigScreen onStart={startPractice} />
      )}
      {page === 'powers-config' && (
        <PowersConfigScreen onStart={startPractice} />
      )}
      {page === 'execution' && <ExecutionScreen mode={mode} />}
    </main>
  );
}

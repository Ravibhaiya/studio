// src/components/screens/HomeScreen.tsx
'use client';
import type { Page } from '@/lib/types';
import { useRipple } from '@/hooks/useRipple';

interface HomeScreenProps {
  navigateTo: (page: Page) => void;
}

export default function HomeScreen({ navigateTo }: HomeScreenProps) {
  const createRipple = useRipple();
  return (
    <div id="home-screen" className="screen active">
      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => navigateTo('table-selection')}
          className="app-card ripple-surface"
          onMouseDown={createRipple}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--md-sys-color-primary-container)]">
              <span className="material-symbols-outlined text-[var(--md-sys-color-on-primary-container)]">
                close
              </span>
            </div>
            <div>
              <p className="title-medium">Multiplication Tables</p>
              <p className="body-medium text-[var(--md-sys-color-on-surface-variant)]">
                Practice your times tables
              </p>
            </div>
          </div>
        </button>
        <button
          onClick={() => navigateTo('practice-config')}
          className="app-card ripple-surface"
          onMouseDown={createRipple}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--md-sys-color-secondary-container)]">
              <span className="material-symbols-outlined text-[var(--md-sys-color-on-secondary-container)]">
                calculate
              </span>
            </div>
            <div>
              <p className="title-medium">Multiplication Practice</p>
              <p className="body-medium text-[var(--md-sys-color-on-surface-variant)]">
                Solve multi-digit problems
              </p>
            </div>
          </div>
        </button>
        <button
          onClick={() => navigateTo('powers-config')}
          className="app-card ripple-surface"
          onMouseDown={createRipple}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--md-sys-color-tertiary-container)]">
              <span className="material-symbols-outlined text-[var(--md-sys-color-on-tertiary-container)]">
                superscript
              </span>
            </div>
            <div>
              <p className="title-medium">Powers &amp; Roots</p>
              <p className="body-medium text-[var(--md-sys-color-on-surface-variant)]">
                Practice squares, cubes, and roots
              </p>
            </div>
          </div>
        </button>
        <button
          onClick={() => navigateTo('fractions-config')}
          className="app-card ripple-surface"
          onMouseDown={createRipple}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--md-sys-color-error-container)]">
              <span className="material-symbols-outlined text-[var(--md-sys-color-on-error-container)]">
                candlestick_chart
              </span>
            </div>
            <div>
              <p className="title-medium">Fractions &amp; Decimals</p>
              <p className="body-medium text-[var(--md-sys-color-on-surface-variant)]">
                Convert between fractions and percentages
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

// src/lib/types.ts

export type Page =
  | 'home'
  | 'table-selection'
  | 'practice-config'
  | 'powers-config'
  | 'fractions-config'
  | 'execution';

export type Mode = '' | 'tables' | 'practice' | 'powers' | 'fractions';

export type NonNullableMode = 'tables' | 'practice' | 'powers' | 'fractions';

export type PowerType = 'squares' | 'cubes' | 'square_roots' | 'cube_roots';

export type FractionAnswerType = 'fraction' | 'decimal';

export interface PracticeConfig {
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

export type ExecutionConfig =
  | PracticeConfig['tables']
  | PracticeConfig['practice']
  | PracticeConfig['powers']
  | PracticeConfig['fractions'];

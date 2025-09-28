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

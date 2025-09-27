
// src/lib/types.ts

export type Page =
  | 'home'
  | 'table-selection'
  | 'practice-config'
  | 'powers-config'
  | 'execution';

export type Mode = '' | 'tables' | 'practice' | 'powers';

export type NonNullableMode = 'tables' | 'practice' | 'powers';

export type PowerType = 'squares' | 'cubes' | 'square_roots' | 'cube_roots';

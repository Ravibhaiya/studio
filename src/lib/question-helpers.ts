// src/lib/question-helpers.ts

import type { PowerType, FractionAnswerType } from '@/lib/types';
import { FRACTION_DATA } from '@/lib/fraction-data';

interface Question {
  question: string;
  answer: string | number;
  hint?: string;
  answerType?: FractionAnswerType;
}

export const generateTablesQuestion = (config: {
  selected: number[];
}): Question => {
  const { selected } = config;
  const table = selected[Math.floor(Math.random() * selected.length)];
  const multiplier = Math.floor(Math.random() * 10) + 1;
  return {
    question: `${table} &times; ${multiplier}`,
    answer: table * multiplier,
  };
};

export const generatePracticeQuestion = (config: {
  digits1: number[];
  digits2: number[];
}): Question => {
  const { digits1, digits2 } = config;
  const d1 = digits1[Math.floor(Math.random() * digits1.length)];
  const d2 = digits2[Math.floor(Math.random() * digits2.length)];
  const generateRandomNumber = (digits: number) => {
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  const num1 = generateRandomNumber(d1);
  const num2 = generateRandomNumber(d2);
  return {
    question: `${num1} &times; ${num2}`,
    answer: num1 * num2,
  };
};

export const generatePowersQuestion = (config: {
  selected: PowerType[];
  rangeMax: number;
}): Question | null => {
  const { selected, rangeMax } = config;
  const powerMode = selected[Math.floor(Math.random() * selected.length)];
  const minRange = 2;
  let maxNum = rangeMax;

  if (powerMode === 'cubes' || powerMode === 'cube_roots') {
    maxNum = Math.min(rangeMax, 20);
  }

  if (minRange > maxNum) return null;

  const n = Math.floor(Math.random() * (maxNum - minRange + 1)) + minRange;
  let question = '';
  let answer = 0;

  switch (powerMode) {
    case 'squares':
      question = `${n}<sup>2</sup>`;
      answer = n * n;
      break;
    case 'cubes':
      question = `${n}<sup>3</sup>`;
      answer = n * n * n;
      break;
    case 'square_roots':
      question = `&radic;${(n * n).toLocaleString()}`;
      answer = n;
      break;
    case 'cube_roots':
      question = `<sup>3</sup>&radic;${(n * n * n).toLocaleString()}`;
      answer = n;
      break;
  }
  return { question, answer };
};

export const generateFractionsQuestion = (config: {
  selected: FractionAnswerType[];
}): Question => {
  const { selected } = config;
  const answerType = selected[Math.floor(Math.random() * selected.length)];
  const randomFraction =
    FRACTION_DATA[Math.floor(Math.random() * FRACTION_DATA.length)];

  if (answerType === 'fraction') {
    return {
      question: randomFraction.percentageQuestion,
      answer: randomFraction.fractionAnswer,
      hint: 'Answer as a fraction (e.g. 1/2)',
      answerType: 'fraction',
    };
  } else {
    // answerType is 'decimal'
    return {
      question: randomFraction.fractionQuestion,
      answer: randomFraction.decimalAnswer,
      hint: 'Answer as a percentage',
      answerType: 'decimal',
    };
  }
};

// src/lib/fraction-data.ts

interface FractionInfo {
  percentageQuestion: string; // e.g., <math>...</math> for "33 1/3 %"
  fractionQuestion: string; // e.g., <math>...</math> for "1/3"
  fractionAnswer: string; // e.g., "1/3"
  decimalAnswer: string; // e.g., "33.33"
}

const buildFraction = (
  numerator: number,
  denominator: number
): FractionInfo => {
  const percentageValue = (numerator / denominator) * 100;
  let percentageString = '';

  const wholePart = Math.floor(percentageValue);
  const remainder = percentageValue - wholePart;

  if (remainder > 0.001) {
    let num = 1;
    let den = 1;
    let found = false;

    // Common fractions
    const fractions = [
        {r: 1/2, n: 1, d: 2}, {r: 1/3, n: 1, d: 3}, {r: 2/3, n: 2, d: 3},
        {r: 1/4, n: 1, d: 4}, {r: 3/4, n: 3, d: 4}, {r: 1/5, n: 1, d: 5},
        {r: 2/5, n: 2, d: 5}, {r: 3/5, n: 3, d: 5}, {r: 4/5, n: 4, d: 5},
        {r: 1/6, n: 1, d: 6}, {r: 5/6, n: 5, d: 6}, {r: 1/7, n: 1, d: 7},
        {r: 1/8, n: 1, d: 8}, {r: 3/8, n: 3, d: 8}, {r: 5/8, n: 5, d: 8},
        {r: 7/8, n: 7, d: 8}, {r: 1/9, n: 1, d: 9},
    ];

    for (const f of fractions) {
        if (Math.abs(remainder - f.r) < 0.01) {
            num = f.n;
            den = f.d;
            found = true;
            break;
        }
    }

    if (found) {
      percentageString = `<math><mrow>${
        wholePart > 0 ? `<mn>${wholePart}</mn>` : ''
      }<mfrac><mn>${num}</mn><mn>${den}</mn></mfrac><mo>%</mo></mrow></math>`;
    } else {
      percentageString = `<math><mrow><mn>${percentageValue
        .toFixed(2)
        .replace(/\.00$/, '')}</mn><mo>%</mo></mrow></math>`;
    }
  } else {
    percentageString = `<math><mrow><mn>${wholePart}</mn><mo>%</mo></mrow></math>`;
  }

  const fractionQuestionString = `<math><mfrac><mn>${numerator}</mn><mn>${denominator}</mn></mfrac></math>`;

  return {
    percentageQuestion: percentageString,
    fractionQuestion: fractionQuestionString,
    fractionAnswer: `${numerator}/${denominator}`,
    decimalAnswer: percentageValue.toFixed(2),
  };
};

export const FRACTION_DATA: FractionInfo[] = [
  // 1/2 to 1/20
  ...Array.from({ length: 19 }, (_, i) => buildFraction(1, i + 2)),
  // Extras
  buildFraction(1, 25),
  buildFraction(1, 40),
  buildFraction(1, 50),
];

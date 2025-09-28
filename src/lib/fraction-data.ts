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

  // Create a simplified fraction string for the percentage text
  // e.g., 0.333... becomes 1/3
  if (remainder > 0.001) {
    let num = 1;
    let den = 1;
    if (Math.abs(remainder - 1 / 3) < 0.01) {
      den = 3;
    } else if (Math.abs(remainder - 2 / 3) < 0.01) {
      num = 2;
      den = 3;
    } else if (Math.abs(remainder - 1 / 2) < 0.01) {
      den = 2;
    } else if (Math.abs(remainder - 1 / 4) < 0.01) {
      den = 4;
    } else if (Math.abs(remainder - 3 / 4) < 0.01) {
      num = 3;
      den = 4;
    } else if (Math.abs(remainder - 1 / 5) < 0.01) {
      den = 5;
    } else if (Math.abs(remainder - 2 / 5) < 0.01) {
      num = 2;
      den = 5;
    } else if (Math.abs(remainder - 3 / 5) < 0.01) {
      num = 3;
      den = 5;
    } else if (Math.abs(remainder - 4 / 5) < 0.01) {
      num = 4;
      den = 5;
    } else if (Math.abs(remainder - 1 / 6) < 0.01) {
      den = 6;
    } else if (Math.abs(remainder - 5 / 6) < 0.01) {
      num = 5;
      den = 6;
    } else if (Math.abs(remainder - 1 / 7) < 0.01) {
      den = 7;
    } else if (Math.abs(remainder - 1 / 8) < 0.01) {
      den = 8;
    } else if (Math.abs(remainder - 1 / 9) < 0.01) {
      den = 9;
    }

    if (den > 1) {
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

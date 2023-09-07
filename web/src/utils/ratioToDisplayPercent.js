export const ratioToPercent = ({ numerator, denominator }) =>
  (numerator.value * 100n) / denominator.value;

export const ratioToDisplayPercent = (ratio) =>
  `${Number(ratioToPercent(ratio))}%`;

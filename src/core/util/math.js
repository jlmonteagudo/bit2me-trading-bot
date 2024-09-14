export const truncateFloat = (number, maxDecimals) => {
  const power = Math.pow(10, maxDecimals);
  return Math.trunc(number * power) / power;
};

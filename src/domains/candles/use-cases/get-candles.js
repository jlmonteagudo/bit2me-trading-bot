import { connector } from '../../../conector/index.js';

export const getCandles = async (symbol, interval, numberOfCandles) => {
  const endTime = new Date().getTime();
  const intervalMilliseconds = interval * numberOfCandles * 60 * 1000;
  const startTime = endTime - intervalMilliseconds;

  return connector.getCandles(
    symbol,
    interval,
    startTime,
    endTime
  );
};

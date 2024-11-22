import { calculateMostPerformantMarketsWithEMAAndRSI } from './calculate-most-performant-markets-with-ema-and-rsi.js';

const CHECK_INTERVAL_MILISECONDS = 60000;

export const checkMostPerformantMarkets = () => {
  calculateMostPerformantMarketsWithEMAAndRSI();
  setInterval(calculateMostPerformantMarketsWithEMAAndRSI, CHECK_INTERVAL_MILISECONDS);
};

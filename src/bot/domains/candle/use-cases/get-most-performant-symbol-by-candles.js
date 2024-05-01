import { logger } from '../../../core/log/logger.js';
import * as connector from '../../../../conector/bit2me.js';
import * as firebaseLogger from '../../../core/log/firebase-logger.js';
import { CandleEnum } from '../enums/candle.enum.js';
import { getPercentagePriceVariation } from '../utils.js';

export const getMostPerformantSymbolByCandles = async (
  symbols,
  interval,
  startTime,
  endTime
) => {
  const promises = symbols.map((symbol) =>
    getCandleIntervalSummary(symbol, interval, startTime, endTime)
  );

  const candleIntervalSummaries = (await Promise.all(promises)).filter(
    (summary) => !!summary
  );

  logCandleIntervalSummaries(candleIntervalSummaries);

  const positiveCandleIntervalSummaries = candleIntervalSummaries.filter(
    (summary) => summary.areAllCandlesPositive
  );

  if (positiveCandleIntervalSummaries.length <= 0) return undefined;

  const mostPerformantSymbol = positiveCandleIntervalSummaries.reduce(
    (mostPerformant, current) => {
      return current.intervalPercentagePriceVariation >
        mostPerformant.intervalPercentagePriceVariation
        ? current
        : mostPerformant;
    },
    positiveCandleIntervalSummaries[0]
  );

  return mostPerformantSymbol;
};

const getCandleIntervalSummary = async (
  symbol,
  interval,
  startTime,
  endTime
) => {
  const candles = await connector.getCandles(
    symbol,
    interval,
    startTime,
    endTime
  );

  if (!candles.length) return undefined;

  const candleIntervalSummary = {
    symbol,
    areAllCandlesPositive: areAllCandlesPositive(candles),
    intervalPercentagePriceVariation:
      getIntervalPercentagePriceVariation(candles),
  };

  return candleIntervalSummary;
};

const areAllCandlesPositive = (candles) =>
  candles.reduce((isPositive, candle) => {
    return isPositive && getPercentagePriceVariation(candle) > 0;
  }, true);

const getIntervalPercentagePriceVariation = (candles) => {
  const firstCandle = candles[0];
  const lastCandle = candles[candles.length - 1];

  return (
    ((lastCandle[CandleEnum.Close] - firstCandle[CandleEnum.Open]) /
      firstCandle[CandleEnum.Open]) *
    100
  );
};

const logCandleIntervalSummaries = (candleIntervalSummaries) => {
  candleIntervalSummaries.forEach((summary) =>
    logger.info(JSON.stringify(summary))
  );

  firebaseLogger.log('entry-point', JSON.stringify(candleIntervalSummaries));
};

import { logger } from '../../bot/core/logger.js';
import { config } from './config.js';
import { getMostPerformantSymbolByCandles } from '../../bot/domains/candle/index.js';

export const getEntryPositionSymbol = async () => {
  logger.info('Checking if has an entry point');

  const symbols = config.symbols;
  const endTime = new Date().getTime();
  const intervalMilliseconds =
    config.candleInterval * config.numberOfCandles * 60 * 1000;
  const startTime = endTime - intervalMilliseconds;

  const mostPerformantSymbol = await getMostPerformantSymbolByCandles(
    symbols,
    config.candleInterval,
    startTime,
    endTime
  );

  console.log({ mostPerformantSymbol });

  return mostPerformantSymbol?.symbol;
};

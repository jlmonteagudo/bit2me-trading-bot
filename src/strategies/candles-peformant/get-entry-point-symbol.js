import { logger } from '../../bot/core/logger.js';
import { config } from './config.js';
import * as candleDomain from '../../bot/domains/candle/index.js';

export const getEntryPositionSymbol = async () => {
  const symbols = config.symbols;
  const endTime = new Date().getTime();
  const intervalMilliseconds =
    config.candleInterval * config.numberOfCandles * 60 * 1000;
  const startTime = endTime - intervalMilliseconds;

  logger.info(`Symbols: ${symbols.join(',')}`);

  const mostPerformantSymbol =
    await candleDomain.getMostPerformantSymbolByCandles(
      symbols,
      config.candleInterval,
      startTime,
      endTime
    );

  return mostPerformantSymbol?.symbol;
};

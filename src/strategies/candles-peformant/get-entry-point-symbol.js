import { logger } from '../../bot/core/logger.js';
import * as candleDomain from '../../bot/domains/candle/index.js';
import * as config from './config.js';

export const getEntryPositionSymbol = async () => {
  const strategyConfig = config.getConfig();
  const symbols = strategyConfig.symbols;
  const endTime = new Date().getTime();
  const intervalMilliseconds =
    strategyConfig.candleInterval * strategyConfig.numberOfCandles * 60 * 1000;
  const startTime = endTime - intervalMilliseconds;

  logger.info(`Symbols: ${symbols.join(',')}`);

  const mostPerformantSymbol =
    await candleDomain.getMostPerformantSymbolByCandles(
      symbols,
      strategyConfig.candleInterval,
      startTime,
      endTime
    );

  return mostPerformantSymbol?.symbol;
};

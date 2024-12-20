import { logger } from '../../core/logger/logger.js';
import * as connector from '../../conector/bit2me.js';
import { sleep } from '../../core/util/sleep.js';
import { CandleEnum } from '../candles/enums/candle.enum.js';
import { ema, rsi } from 'indicatorts';
import { savePerformantMarkets } from './repository/trading-strategies.repository.js';
import { getSettings } from '../settings/index.js';

const CANDLES_INTERVAL = 5;
const NUMBER_OF_CANDLES = 100;

export const calculateMostPerformantMarketsWithEMAAndRSI = async () => {
  const tickers = await getTickers();
  const performantTickers = [];

  logger.info(`Calculating most performant markets with EMA and RSI for ${tickers.length} tickers`);

  for (const ticker of tickers) {
    logger.info(`Analyzing market ${ticker.symbol}`);
    const candles = await getCandles(ticker.symbol);
    const isPerformant = await isMarketPerformant(candles);
    if (isPerformant) performantTickers.push(ticker);
    await sleep(250);
  }

  await savePerformantMarkets(performantTickers);

  logger.info(`Found ${performantTickers.length} performant markets: ${JSON.stringify(performantTickers.map(t => t.symbol))}`);
};

const isMarketPerformant = async (candles) => {
  const settings = getSettings();
  const closes = candles.map(candle => candle[CandleEnum.Close]);
  const emaFast = ema(closes, { period: settings.emaFastPeriod });
  const emaSlow = ema(closes, { period: settings.emaSlowPeriod });
  const rsiStrategy = rsi(closes, { period: settings.rsiPeriod });
  const lastIndex = closes.length - 1;
  const isEmaFastAboveEmaSlow = emaFast[lastIndex] > emaSlow[lastIndex];
  const isRsiAbove50 = rsiStrategy[lastIndex] > 50;

  return isEmaFastAboveEmaSlow && isRsiAbove50;
};

const getTickers = async () => {
  const settings = getSettings();
  const seenBases = new Set();

  return (await connector.getTickers())
    .filter((ticker) => {
      const quote = ticker.symbol.split('/')[1];
      return ticker.quoteVolume > settings.quoteVolumeLimit &&
        ticker.percentage > 0 &&
        quote === settings.quoteCurrency;
    })
    .sort((a, b) => b.percentage - a.percentage)
    .filter(ticker => {
      const base = ticker.symbol.split('/')[0];

      if (!seenBases.has(base)) {
        seenBases.add(base);
        return true;
      }

      return false;
    });
}

const getCandles = async (symbol) => {
  const endTime = new Date().getTime();
  const intervalMilliseconds = CANDLES_INTERVAL * NUMBER_OF_CANDLES * 60 * 1000;
  const startTime = endTime - intervalMilliseconds;

  return connector.getCandles(
    symbol,
    CANDLES_INTERVAL,
    startTime,
    endTime
  );
};


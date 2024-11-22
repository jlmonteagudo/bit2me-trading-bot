import { logger } from '../../core/logger/logger.js';
import * as connector from '../../conector/bit2me.js';
import { sleep } from '../../core/util/sleep.js';
import { CandleEnum } from '../candles/enums/candle.enum.js';
import { ema, rsi } from 'indicatorts';
import { savePerformantMarkets } from './repository/trading-strategies.repository.js';

const QUOTE_VOLUME_LIMIT = 1_000_000;
const CANDLES_INTERVAL = 5;
const NUMBER_OF_CANDLES = 100;
const ALLOWED_QUOTES = ['EUR', 'USDT']

export const calculateMostPerformantMarketsWithEMAAndRSI = async () => {
  const tickers = await getTickers();
  const performantTickers = [];

  logger.info(`Calculating most performant markets with EMA and RSI for ${tickers.length} tickers`);

  for (const ticker of tickers) {
    const candles = await getCandles(ticker.symbol);
    const isPerformant = await isMarketPerformant(candles);
    if (isPerformant) performantTickers.push(ticker);
    await sleep(250);
  }

  await savePerformantMarkets(performantTickers);

  logger.info(`Found ${performantTickers.length} performant markets`);
};

const isMarketPerformant = async (candles) => {
  const closes = candles.map(candle => candle[CandleEnum.Close]);
  const ema9 = ema(closes, { period: 9 });
  const ema21 = ema(closes, { period: 21 });
  const rsi14 = rsi(closes, { period: 14 });
  const lastIndex = closes.length - 1;
  const isEma9AboveEma21 = ema9[lastIndex] > ema21[lastIndex];
  const isRsiAbove50 = rsi14[lastIndex] > 50;

  return isEma9AboveEma21 && isRsiAbove50;
};

const getTickers = async () => {
  const seenBases = new Set();

  return (await connector.getTickers())
    .filter((ticker) => {
      const quote = ticker.symbol.split('/')[1];
      return ticker.quoteVolume > QUOTE_VOLUME_LIMIT &&
        ticker.percentage > 0 &&
        ALLOWED_QUOTES.includes(quote);
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


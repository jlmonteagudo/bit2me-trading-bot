import { connector } from '../../conector/index.js';
import { CandleEnum } from '../candles/enums/candle.enum.js';

const QUOTE_VOLUME_LIMIT = 1_000_000;
const LIMIT_NUMBER_OF_MARKETS = 10;
const CANDLES_INTERVAL = 5;
const NUMBER_OF_CANDLES = 100;

export const getMostPerformantMarketsWithCandles = async () => {
  const tickers = (await connector.getTickers())
    .filter((ticker) => ticker.quoteVolume > QUOTE_VOLUME_LIMIT)
    .sort((a, b) => b.percentage - a.percentage);

  const uniqueBaseTickers = [];
  const seenBases = new Set();

  for (const ticker of tickers) {
    const baseCurrency = ticker.symbol.split('/')[0];

    if (!seenBases.has(baseCurrency)) {
      uniqueBaseTickers.push({ symbol: ticker.symbol, percentage: ticker.percentage });
      seenBases.add(baseCurrency);
    }

    if (uniqueBaseTickers.length >= LIMIT_NUMBER_OF_MARKETS) break;
  }

  for (const ticker of uniqueBaseTickers) {
    ticker.candles = await getCandles(ticker.symbol);
    ticker.lastThreeCandlesChange = getLastThreeCandlesChange(ticker.candles);
  }

  return uniqueBaseTickers;
};

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

const getLastThreeCandlesChange = (candles) => {
  if (candles.length < 3) return null;

  const [thirdLast, secondLast, last] = candles.slice(-3);
  const change = ((last[CandleEnum.Close] - thirdLast[CandleEnum.Close]) / thirdLast[CandleEnum.Close]) * 100;

  return change;
};

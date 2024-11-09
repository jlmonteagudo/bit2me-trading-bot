import * as connector from '../../../conector/bit2me.js';

const QUOTE_VOLUME_LIMIT = 1_000_000;
const LIMIT_NUMBER_OF_MARKETS = 10;
const CANDLES_INTERVAL = 5;
const NUMBER_OF_CANDLES = 100;

export const getMostPerformantMarketsWithCandles = async () => {
  const tickers = (await connector.getTickers())
    .filter((ticker) => ticker.quoteVolume > QUOTE_VOLUME_LIMIT)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, LIMIT_NUMBER_OF_MARKETS)
    .map((ticker) => ({ symbol: ticker.symbol, percentage: ticker.percentage }));

  for (const ticker of tickers) ticker.candles = await getCandles(ticker.symbol);

  return tickers;
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

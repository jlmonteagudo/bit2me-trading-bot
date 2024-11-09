import { getMostPerformantMarketsWithCandles } from '../src/domains/candles/use-cases/get-most-performant-markets-with-candles.js';

const markets = await getMostPerformantMarketsWithCandles();

console.log('MARKETS: ', markets);

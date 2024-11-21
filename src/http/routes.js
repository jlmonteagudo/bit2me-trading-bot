import { getCandles } from '../domains/candles/use-cases/get-candles.js';
import { getMostPerformantMarketsWithCandles } from '../domains/candles/use-cases/get-most-performant-markets-with-candles.js';

export const setupRoutes = (app) => {
  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.get('/candles', async (req, res) => {
    const { symbol, interval, numberOfCandles } = req.query;
    const candles = await getCandles(symbol, interval, numberOfCandles);
    res.send(candles);
  });

  app.get('/most-performant-markets', async (req, res) => {
    const markets = await getMostPerformantMarketsWithCandles();
    res.send(markets);
  });
};

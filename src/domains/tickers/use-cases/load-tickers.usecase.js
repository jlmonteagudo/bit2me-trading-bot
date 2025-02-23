import { connector } from '../../../conector/index.js';
import { saveTickers } from '../repository/tickers.repository.js';

export const loadTickers = async () => {
  try {
    const tickers = await connector.getTickers();
    await saveTickers(tickers);
  } catch (error) {
    logger.error('Error loading tickers: ', error.message);
  }
};

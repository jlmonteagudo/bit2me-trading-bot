import { db, DB_PATH } from '../../../core/firebase/index.js';

const TICKERS_PATH = `${DB_PATH}/tickers`;

export const saveTickers = async (tickers) => {
  return db.ref(TICKERS_PATH).set(JSON.stringify(tickers));
};

import * as connector from '../../../conector/bit2me.js';
import * as firebase from '../../firebase/index.js';

export const loadTickers = async () => {
  const tickers = await connector.getTickers();
  await saveTickers(tickers);
};

const saveTickers = async (tickers) => {
  return firebase.tickers.set(JSON.stringify(tickers));
};

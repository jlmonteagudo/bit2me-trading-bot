import * as connector from '../../../conector/bit2me.js';
import { saveBalances } from '../repository/balances.repository.js';

const WATCH_INTERVAL_MILISECONDS = 60_000;

export const watchBalances = () => {
  loadBalances();
  setInterval(loadBalances, WATCH_INTERVAL_MILISECONDS);
};


export const loadBalances = async () => {
  try {
    const balances = await connector.getBalance();
    await saveBalances(balances);
  } catch (error) {
    logger.error('Error loading balances: ', error.message);
  }
};

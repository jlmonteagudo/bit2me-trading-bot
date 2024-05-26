import * as connector from '../../../conector/bit2me.js';
import * as firebase from '../../firebase/index.js';
import { logger } from '../../core/log/logger.js';

let balances = [];

export const loadBalances = async () => {
  try {
    balances = await connector.getBalance();
    await saveBalances(balances);
  } catch (error) {
    logger.error('Error loading balances: ', error.message);
  }
};

const saveBalances = async (balances) => {
  return firebase.balances.set(JSON.stringify(balances));
};

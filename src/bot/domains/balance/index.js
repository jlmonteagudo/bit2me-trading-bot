import * as connector from '../../../conector/bit2me.js';
import * as firebase from '../../firebase/index.js';

let balances = [];

export const loadBalances = async () => {
  balances = await connector.getBalance();
  await saveBalances(balances);
};

const saveBalances = async (balances) => {
  return firebase.balances.set(JSON.stringify(balances));
};

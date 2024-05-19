import * as connector from '../../../conector/bit2me.js';
import * as firebase from '../../firebase/index.js';

let balances = [];

export const loadBalances = async () => {
  balances = await connector.getBalance();
  await saveBalances(balances);
};

export const getBalanceBySymbol = (symbol) => {
  const symbolBalance = balances.find((balance) => balance.currency === symbol);
  if (!symbolBalance) return 0;
  return symbolBalance.balance;
};

const saveBalances = async (balances) => {
  return firebase.balances.set(JSON.stringify(balances));
};

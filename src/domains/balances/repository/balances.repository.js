import { db, DB_PATH } from '../../../core/firebase/index.js';

const BALANCES_PATH = `${DB_PATH}/balances`;

export const saveBalances = async (balances) => {
  return db.ref(BALANCES_PATH).set(JSON.stringify(balances));
};

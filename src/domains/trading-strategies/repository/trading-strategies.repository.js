import { db, DB_PATH } from '../../../core/firebase/index.js';

const PERFORMANT_MARKETS_PATH = `${DB_PATH}/performant-markets`;

export const savePerformantMarkets = async (markets) => {
  try {
    await db.ref(PERFORMANT_MARKETS_PATH).set(markets);
  } catch (error) {
    console.error('Error saving performant markets', error);
  }
};

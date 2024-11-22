import { db, DB_PATH } from '../../../core/firebase/index.js';

const POSITIONS_PATH = `${DB_PATH}/positions`;

export const createPosition = async (position) => {
  const ref = db.ref(POSITIONS_PATH).push(position);
  const snapshot = await ref.once('value');

  return {
    id: ref.key,
    ...snapshot.val()
  }
};

export const getPosition = async (id) => {
  const positionSnapshot = await db.ref(POSITIONS_PATH).child(id).get();

  return {
    id,
    ...positionSnapshot.val()
  }
};

export const getCurrentPosition = async () => {
  const positionSnapshotPromise = await db.ref(POSITIONS_PATH).orderByChild('status').equalTo('open').get();
  const positionSnapshot = positionSnapshotPromise.val();

  if (!positionSnapshot) return null;

  const id = Object.keys(positionSnapshot)[0];
  const payload = positionSnapshot[id];
  const currentPosition = { id, ...payload };

  return currentPosition;
};

export const updatePosition = async (position) => {
  const update = {
    exitAveragePrice: position.exitAveragePrice,
    exitQuoteAmount: position.exitQuoteAmount,
    profit: position.profit,
    ...(position.profitPercentage !== undefined && { profitPercentage: position.profitPercentage }),
    ...(position.exitAt !== undefined && { exitAt: position.exitAt }),
    status: position.status,
    takeProfitCost: position.takeProfitCost,
    stopLossCost: position.stopLossCost
  }

  await db.ref(POSITIONS_PATH).child(position.id).update(update);
};

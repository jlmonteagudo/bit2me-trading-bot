import { db, DB_PATH } from '../../../core/firebase/index.js';

const PRODUCTION_POSITIONS_PATH = `${DB_PATH}/production/positions`;
const SIMULATION_POSITIONS_PATH = `${DB_PATH}/simulation/positions`;

const getPositionsPath = (isSimulation) => {
  if (isSimulation) return SIMULATION_POSITIONS_PATH;
  return PRODUCTION_POSITIONS_PATH;
}

export const createPosition = async (position, isSimulation) => {
  const path = getPositionsPath(isSimulation);
  return db.ref(path).push(position);
};

export const getPosition = async (id, isSimulation) => {
  const path = getPositionsPath(isSimulation);
  const positionSnapshot = await db.ref(path).child(id).get();
  return {
    id,
    ...positionSnapshot.val()
  }
};

export const updatePosition = async (position, isSimulation) => {
  const path = getPositionsPath(isSimulation);

  await db.ref(path).child(position.id).update({
    exitAveragePrice: position.exitAveragePrice,
    exitQuoteAmount: position.exitQuoteAmount,
    profit: position.profit,
    exitAt: position.exitAt,
    status: position.status
  });
};

import { db, DB_PATH } from '../../../core/firebase/index.js';
import { createPosition as simulationCreatePosition } from '../use-cases/simulation-create-position.js'

const COMMAND_CREATE_POSITION = `${DB_PATH}/commands/createPosition`;

export const listenCreatePosition = () => {
  db.ref(COMMAND_CREATE_POSITION).on('value', async (snapshot) => {
    db.ref(COMMAND_CREATE_POSITION).remove();
    const newPosition = snapshot.val();

    if (!newPosition) return;

    if (newPosition.simulation) await simulationCreatePosition(newPosition.symbol, newPosition.quoteOrderAmount);
    else throw new Error('Creating a new production position not implemented yet');
  });
};

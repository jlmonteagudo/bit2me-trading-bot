import { db, DB_PATH } from '../../../core/firebase/index.js';
import { closePosition as simulationClosePosition } from '../use-cases/simulation-close-position.js'

const COMMAND_CLOSE_POSITION = `${DB_PATH}/commands/closePosition`;

export const listenClosePosition = () => {
  db.ref(COMMAND_CLOSE_POSITION).on('value', async (snapshot) => {
    db.ref(COMMAND_CLOSE_POSITION).remove();
    const closePosition = snapshot.val();

    if (!closePosition) return;

    if (closePosition.simulation) await simulationClosePosition(closePosition.id);
    else throw new Error('Closing a production position not implemented yet');
  });
};

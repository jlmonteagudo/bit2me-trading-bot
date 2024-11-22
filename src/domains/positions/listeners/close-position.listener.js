import { db, DB_PATH } from '../../../core/firebase/index.js';
import { closePosition } from '../use-cases/close-position.js'

const COMMAND_CLOSE_POSITION = `${DB_PATH}/commands/closePosition`;

export const listenClosePosition = () => {
  db.ref(COMMAND_CLOSE_POSITION).on('value', async (snapshot) => {
    db.ref(COMMAND_CLOSE_POSITION).remove();
    const commandClosePosition = snapshot.val();

    if (!commandClosePosition) return;

    await closePosition(commandClosePosition.id);
  });
};

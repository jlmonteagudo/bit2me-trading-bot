import { db, DB_PATH } from '../../../core/firebase/index.js';
import { createPosition } from '../use-cases/create-position.js'

const COMMAND_CREATE_POSITION = `${DB_PATH}/commands/createPosition`;

export const listenCreatePosition = () => {
  db.ref(COMMAND_CREATE_POSITION).on('value', async (snapshot) => {
    db.ref(COMMAND_CREATE_POSITION).remove();
    const newPosition = snapshot.val();

    if (!newPosition) return;

    await createPosition(newPosition.symbol, newPosition.quoteOrderAmount);
  });
};

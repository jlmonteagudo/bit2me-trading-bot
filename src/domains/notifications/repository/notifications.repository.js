import { db, DB_PATH } from '../../../core/firebase/index.js';

const NOTIFICATIONS_PATH = `${DB_PATH}/notifications`;

export const getNotificationsDB = () => {
  return db.ref(NOTIFICATIONS_PATH);
};

export const disableNotifyEntrySignals = async () => {
  await db.ref(NOTIFICATIONS_PATH).child('notifyEntrySignal').set(false);
};

import { db, DB_PATH } from '../../../core/firebase/index.js';

const SETTINGS_PATH = `${DB_PATH}/settings`;

export const getSettingsDB = () => {
  return db.ref(SETTINGS_PATH);
};

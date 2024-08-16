import * as firebase from '../firebase/index.js';
import { logger } from '../../../bot/core/log/logger.js';

let settings;

export const initialize = () => {
  const SETTINGS_SIMULATION = `${firebase.DB_PATH}/settings-simulation`;

  firebase.db.ref(SETTINGS_SIMULATION).on('value', (data) => {
    settings = data.val();
    logger.info(`Settings simulation: ${JSON.stringify(settings)}`);
  });
};

export const getSettings = () => {
  return settings;
}

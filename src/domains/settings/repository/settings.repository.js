import { db, DB_PATH } from '../../../core/firebase/index.js';

const PRODUCTION_SETTINGS_PATH = `${DB_PATH}/production/settings`;
const SIMULATION_SETTINGS_PATH = `${DB_PATH}/simulation/settings`;

const getSettingsPath = (isSimulation) => {
  if (isSimulation) return SIMULATION_SETTINGS_PATH;
  return PRODUCTION_SETTINGS_PATH;
}

export const getSettingsDB = (isSimulation) => {
  const path = getSettingsPath(isSimulation);
  return db.ref(path);
}

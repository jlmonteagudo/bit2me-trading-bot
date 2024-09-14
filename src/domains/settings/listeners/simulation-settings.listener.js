import { logger } from '../../../core/logger/logger.js';
import { getSettingsDB } from '../repository/settings.repository.js';
import { setSettings } from '../use-cases/get-settings.usecase.js';

export const listen = () => {
  const simulationDB = getSettingsDB(true);

  simulationDB.on('value', (data) => {
    const settings = data.val();
    setSettings(settings, true);
    logger.info(`Simulation Settings: ${JSON.stringify(settings)}`);
  });
}

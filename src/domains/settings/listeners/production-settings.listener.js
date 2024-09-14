import { logger } from '../../../core/logger/logger.js';
import { getSettingsDB } from '../repository/settings.repository.js';
import { setSettings } from '../use-cases/get-settings.usecase.js';

export const listen = () => {
  const productionDB = getSettingsDB(false);

  productionDB.on('value', (data) => {
    const settings = data.val();
    setSettings(settings, false);
    logger.info(`Production Settings: ${JSON.stringify(settings)}`);
  });
}

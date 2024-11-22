import { logger } from '../../../core/logger/logger.js';
import { getSettingsDB } from '../repository/settings.repository.js';
import { setSettings } from '../use-cases/get-settings.usecase.js';

export const listenSettingsUpdated = () => {
  const settingsDB = getSettingsDB(true);

  settingsDB.on('value', (data) => {
    const settings = data.val();
    setSettings(settings, true);
    logger.info(`Settings: ${JSON.stringify(settings)}`);
  });
}

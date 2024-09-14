import { listenCreatePosition } from './domains/positions/listeners/create-position.listener.js'
import { listenClosePosition } from './domains/positions/listeners/close-position.listener.js'
import { listenSettingsUpdated as productionListenSettingsUpdated } from './domains/settings/listeners/production-settings.listener.js';
import { listenSettingsUpdated as simulationListenSettingsUpdated } from './domains/settings/listeners/simulation-settings.listener.js';

export const initialize = () => {
  listenCreatePosition();
  listenClosePosition();
  productionListenSettingsUpdated();
  simulationListenSettingsUpdated();
};

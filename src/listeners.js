import { listenCreatePosition } from './domains/positions/listeners/create-position.listener.js'
import { listenClosePosition } from './domains/positions/listeners/close-position.listener.js'
import { listenNewPositionOpen } from './domains/positions/listeners/new-position-open.listener.js';
import { listenSettingsUpdated } from './domains/settings/listeners/settings.listener.js';
import { listenNotificationsUpdated } from './domains/notifications/listeners/notifications.listener.js';

export const initialize = () => {
  listenCreatePosition();
  listenClosePosition();
  listenNewPositionOpen();
  listenSettingsUpdated();
  listenNotificationsUpdated();
};

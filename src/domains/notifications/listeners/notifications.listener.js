import { logger } from '../../../core/logger/logger.js';
import { getNotificationsDB } from '../repository/notifications.repository.js';
import { setNotifications } from '../use-cases/get-notifications.usecase.js';

export const listenNotificationsUpdated = () => {
  const notificationsDB = getNotificationsDB();

  notificationsDB.on('value', (data) => {
    const notifications = data.val();
    setNotifications(notifications);
    logger.info(`Notifications: ${JSON.stringify(notifications)}`);
  });
}

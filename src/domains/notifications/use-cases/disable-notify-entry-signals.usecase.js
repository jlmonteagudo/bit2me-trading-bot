import * as repository from '../repository/notifications.repository.js';

export const disableNotifyEntrySignals = async () => {
  await repository.disableNotifyEntrySignals();
};

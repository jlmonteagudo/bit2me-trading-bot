import { logger } from '../../../core/log/logger.js';
import * as repository from '../repository/position.repository.js';

export const updatePosition = async (position) => {
  logger.info(`Updating the position ${position.id} (${position.symbol})`);
  repository.updatePosition(position);
};

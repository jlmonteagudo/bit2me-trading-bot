import { logger } from '../../../core/logger.js';
import * as repository from '../repository/position.repository.js';

export const hasOpenPosition = async () => {
  logger.info('Checking if has open position');
  const countOpenPositions = repository.getCountOpenPositions();
  return countOpenPositions > 0;
};

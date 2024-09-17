import { logger } from '../../../core/logger/logger.js';
import * as repository from '../repository/positions.repository.js';
import * as positionsState from '../state/positions.state.js';

export const initializeCurrentPosition = async () => {
  const position = await repository.getCurrentPosition(true);
  if (position) logger.info(`Got current position`);
  positionsState.setCurrentPosition(position);
};


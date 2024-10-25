import { logger } from '../../../core/logger/logger.js';
import * as repository from '../repository/positions.repository.js';
import * as positionsState from '../state/positions.state.js';
import { newPositionOpenEventEmitter } from '../../../core/events/event-emitters.js';
import { Events } from '../../../core/events/events.js';

export const initializeCurrentPosition = async () => {
  const position = await repository.getCurrentPosition(true);
  positionsState.setCurrentPosition(position);

  if (position) {
    logger.info(`Got current position`);
    newPositionOpenEventEmitter.emit(Events.NewPositionOpen, position);
  }
};

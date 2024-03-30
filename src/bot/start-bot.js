import { hasOpenPosition, createPosition } from './domains/position/index.js';
import { logger } from './core/logger.js';
import * as database from './database/index.js';

database.setup();

const startCycle = async (strategy) => {
  logger.info('Start new cycle...');
  if (await hasOpenPosition()) return await strategy.checkTrailingStopLoss();
  if (await strategy.hasEntryPosition()) await createPosition();
};

export const startBot = (strategy) => {
  logger.info('Starting the bot');
  startCycle(strategy);
  setInterval(startCycle, strategy.config.cycleInterval, strategy);
};

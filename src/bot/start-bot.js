import { logger } from './core/logger.js';
import * as positionDomain from './domains/position/index.js';
import * as database from './database/index.js';
import * as connector from '../conector/bit2me.js';

database.setup();

const startCycle = async (strategy) => {
  logger.info('Start new cycle...');

  try {
    const currentPosition = await positionDomain.getOpenPosition();

    if (currentPosition) {
      logger.info(`There is an open position for ${currentPosition.symbol}`);
      const exitOrder = await connector.getOrder(currentPosition.exitOrderId);

      if (['open', 'inactive'].includes(exitOrder.status)) {
        await strategy.checkTrailingStopLoss(
          strategy.config.stopLossPercentage
        );
        return;
      } else {
        logger.info(`Closing the position for ${currentPosition.symbol}`);
        await positionDomain.closePosition(currentPosition, exitOrder);
      }
    }

    logger.info('Looking for new entry opportunity');
    const entryPositionSymbol = await strategy.getEntryPositionSymbol();

    if (entryPositionSymbol) {
      logger.info(`Opening a new position for ${entryPositionSymbol}`);
      await positionDomain.createPosition(
        entryPositionSymbol,
        strategy.config.stopLossPercentage,
        strategy.config.quoteOrderAmount
      );
    } else {
      logger.info(`No opportunities found`);
    }
  } catch (error) {
    logger.error(error.message);
  }

  logger.info('End cycle\n');
};

export const startBot = (strategy) => {
  logger.info('Starting the bot');
  startCycle(strategy);
  setInterval(startCycle, strategy.config.cycleInterval, strategy);
};

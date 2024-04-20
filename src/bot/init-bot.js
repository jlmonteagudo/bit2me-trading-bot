import { logger } from './core/logger.js';
import * as positionDomain from './domains/position/index.js';
import * as database from './database/index.js';
import * as connector from '../conector/bit2me.js';
import * as firebase from './firebase/index.js';
import { BotStatusEnum } from './core/enums/bot-status.enum.js';

let intervalId;

database.setup();

export const initBot = (strategy) => {
  firebase.botConfig.on('value', (config) => {
    const botConfig = config.val();
    logger.info(`Bot status: ${botConfig.status}`);

    if (intervalId) stopBot();
    if (botConfig.status === BotStatusEnum.On) startBot(botConfig, strategy);
  });
};

const startBot = (botConfig, strategy) => {
  logger.info('Starting the bot');
  startCycle(strategy);
  intervalId = setInterval(startCycle, botConfig.cycleInterval, strategy);
};

const stopBot = () => {
  logger.info('The bot is stopped');
  if (intervalId) clearInterval(intervalId);
  intervalId = undefined;
};

const startCycle = async (strategy) => {
  logger.info('Start new cycle...');

  try {
    const currentPosition = await positionDomain.getOpenPosition();

    if (currentPosition) {
      logger.info(`There is an open position for ${currentPosition.symbol}`);
      const exitOrder = await connector.getOrder(currentPosition.exitOrderId);

      if (['open', 'inactive'].includes(exitOrder.status)) {
        await strategy.checkTrailingStopLoss(
          strategy.getConfig().stopLossPercentage
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
        strategy.getConfig().stopLossPercentage,
        strategy.getConfig().quoteOrderAmount
      );
    } else {
      logger.info(`No opportunities found`);
    }
  } catch (error) {
    logger.error(error.message);
  }

  logger.info('End cycle\n');
};
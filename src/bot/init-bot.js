import { logger } from './core/log/logger.js';
import * as positionDomain from './domains/position/index.js';
import * as balanceDomain from './domains/balance/index.js';
import * as tickerDomain from './domains/ticker/index.js';
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
  startCycle(botConfig, strategy);
  intervalId = setInterval(
    startCycle,
    botConfig.cycleInterval,
    botConfig,
    strategy
  );
};

const stopBot = () => {
  logger.info('The bot is stopped');
  if (intervalId) clearInterval(intervalId);
  intervalId = undefined;
};

const startCycle = async (botConfig, strategy) => {
  logger.info('Start new cycle...');

  try {
    logger.info('Loading balances');
    balanceDomain.loadBalances();

    logger.info('Loading tickers');
    tickerDomain.loadTickers();

    logger.info('Looking for new entry opportunity');
    const entryPositionSymbol = await strategy.getEntryPositionSymbol();
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

    if (botConfig.manualMode) {
      logger.warn('Working in manual mode. Exit from cycle');
      return;
    }

    if (entryPositionSymbol) {
      logger.info(`Opening a new position for ${entryPositionSymbol}`);

      await positionDomain.createPosition(
        entryPositionSymbol,
        strategy.getConfig().stopLossPercentage,
        strategy.getConfig().quoteOrderAmount
      );

      balanceDomain.loadBalances();
    } else {
      logger.info(`No opportunities found`);
    }
  } catch (error) {
    logger.error(error.message);
  }

  logger.info('End cycle\n');
};

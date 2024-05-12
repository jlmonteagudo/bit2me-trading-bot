import 'dotenv/config.js';
import { initBot } from './bot/init-bot.js';
import { logger } from './bot/core/log/logger.js';
import * as firebase from './bot/firebase/index.js';
import * as strategy from './strategies/candles-peformant/index.js';
import * as positionDomain from './bot/domains/position/index.js';

let botInitialized = false;

firebase.strategy('candle-performance').on('value', (snapshot) => {
  const strategyConfig = snapshot.val();
  strategyConfig.symbols = firebase.serializeSymbols(strategyConfig.symbols);

  strategy.setConfig(strategyConfig);

  if (!botInitialized) {
    initBot(strategy);
    botInitialized = true;
  }
});

firebase.botEvents.openNewPosition.on('value', (snapshot) => {
  firebase.botEvents.openNewPosition.remove();
  const symbol = snapshot.val();

  if (!symbol) return;

  logger.info(`Opening a new manual position for ${symbol}`);
  positionDomain.createPosition(
    symbol,
    strategy.getConfig().stopLossPercentage,
    strategy.getConfig().quoteOrderAmount
  );
});

firebase.botEvents.closeCurrentPosition.on('value', (snapshot) => {
  firebase.botEvents.closeCurrentPosition.remove();
  const close = snapshot.val();

  if (!close) return;

  logger.info('Closing current position manually');
  positionDomain.closePositionManually();
});

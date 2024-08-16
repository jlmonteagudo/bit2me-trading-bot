import 'dotenv/config.js';
import { initBot } from './bot/init-bot.js';
import { logger } from './bot/core/log/logger.js';
import * as firebase from './bot/firebase/index.js';
import * as strategy from './strategies/candles-peformant/index.js';
import * as positionDomain from './bot/domains/position/index.js';
import * as balanceDomain from './bot/domains/balance/index.js';

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

firebase.botEvents.openNewPosition.on('value', async (snapshot) => {
  firebase.botEvents.openNewPosition.remove();
  const symbol = snapshot.val();

  if (!symbol) return;

  logger.info(`Opening a new manual position for ${symbol}`);
  await positionDomain.createPosition(
    symbol,
    strategy.getConfig().stopLossPercentage,
    strategy.getConfig().quoteOrderAmount
  );

  balanceDomain.loadBalances();
});

firebase.botEvents.closeCurrentPosition.on('value', async (snapshot) => {
  firebase.botEvents.closeCurrentPosition.remove();
  const close = snapshot.val();

  if (!close) return;

  logger.info('Closing current position manually');
  await positionDomain.closePositionManually();
  await balanceDomain.loadBalances();
});

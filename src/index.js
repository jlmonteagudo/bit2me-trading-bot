import 'dotenv/config.js';
import { initBot } from './bot/init-bot.js';
import * as firebase from './bot/firebase/index.js';
import * as strategy from './strategies/candles-peformant/index.js';

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

import 'dotenv/config.js';
import { startBot } from './bot/start-bot.js';
import * as strategy from './strategies/candles-peformant/index.js';

startBot(strategy);

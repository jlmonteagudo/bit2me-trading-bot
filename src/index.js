import 'dotenv/config.js';
import { startBot } from './bot/start-bot.js';
import * as strategy from './strategies/candles-peformant/index.js';
import { getOpenOrders, getBalance, createOrder } from './conector/bit2me.js';

startBot(strategy);

// const orders = await getOpenOrders('BTC/EUR');
// const balance = await getBalance('EUR');

// const order = await createOrder(
//   'BTC/EUR',
//   'buy',
//   'limit',
//   0.0002,
//   20000,
//   undefined,
//   undefined
// );

// console.log({ orders });

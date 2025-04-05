import 'dotenv/config.js';
import * as firebase from './core/firebase/index.js';
import * as listeners from './listeners.js';
import * as connector from './conector/index.js';
import { initializeWebSocket } from './websockets/server.js';
import { listen, getServer } from './http/server.js';
import { checkTrailingPosition, initializeCurrentPosition } from './domains/positions/index.js';
import { broadcastServerTime } from './websockets/broadcasts/server-time.broadcast.js';
import { checkMostPerformantMarkets } from './domains/trading-strategies/check-most-performant-markets.js';
import { watchBalances } from './domains/balances/use-cases/load-balances.usecase.js';
import { PROVIDER } from './providers/index.js';

firebase.initialize();
listeners.initialize();

await connector.initialize(PROVIDER);

watchBalances();
await initializeCurrentPosition();
checkTrailingPosition();
checkMostPerformantMarkets();

initializeWebSocket(getServer());
listen();

broadcastServerTime();

import 'dotenv/config.js';
import * as firebase from './core/firebase/index.js';
import * as listeners from './listeners.js';
import * as websocketClient from './websockets/client.js';
import * as websocketServer from './websockets/server.js';
import { checkTrailingPosition, initializeCurrentPosition } from './domains/positions/index.js';
import { checkCandlePerformance } from './domains/candles/use-cases/check-candle-performance.js';

firebase.initialize();
listeners.initialize();

await initializeCurrentPosition();
checkTrailingPosition();
checkCandlePerformance();

websocketServer.listen();
websocketClient.connect();

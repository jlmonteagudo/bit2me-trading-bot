import 'dotenv/config.js';
import * as websocketClient from './strategies/manual-order-book-analysis/websockets/client.js';
import * as websocketServer from './strategies/manual-order-book-analysis/websockets/server.js';
import * as firebase from './strategies/manual-order-book-analysis/firebase/index.js';
import * as settings from './strategies/manual-order-book-analysis/settings/index.js';

firebase.init();
settings.initialize();
websocketServer.listen();
websocketClient.connect();

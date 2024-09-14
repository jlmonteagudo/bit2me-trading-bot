import 'dotenv/config.js';
import * as firebase from './core/firebase/index.js';
import * as settings from './domains/settings/index.js';
import * as listeners from './listeners.js';
import * as websocketClient from './websockets/client.js';
import * as websocketServer from './websockets/server.js';

firebase.initialize();
settings.initialize();
listeners.initialize();

websocketServer.listen();
websocketClient.connect();

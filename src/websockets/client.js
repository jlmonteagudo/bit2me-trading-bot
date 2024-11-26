import { logger } from '../core/logger/logger.js';
import WebSocket from 'ws';
import * as websocketServer from './server.js';
import { websocketDataEventEmitter } from '../core/events/event-emitters.js';
import { Events } from '../core/events/events.js';

const PING_INTERVAL = 5000;
const PONG_TIMEOUT = 15000;

let ws = null;
let pingInterval = null;
let lastPongReceived = null;
let hasToBeConnected = false;
let lastSymbol = null;

export const connect = (symbol) => {
  logger.info(`Connecting to websocket server for symbol ${symbol}`);

  if (ws) ws.close();

  ws = new WebSocket('wss://ws.bit2me.com/v1/trading');

  ws.on('open', () => {
    logger.info(`Connected to websocket server`);

    hasToBeConnected = true;
    lastSymbol = symbol;

    ws.send(JSON.stringify({
      'event': 'subscribe',
      'symbol': symbol,
      'subscription': { 'name': 'order-book' }
    }));

    pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, PING_INTERVAL);
  });

  ws.on('pong', () => {
    logger.info('Received pong from server');
    lastPongReceived = new Date().getTime();
  });

  ws.on('message', (data) => {
    websocketServer.broadcast(data);
    websocketDataEventEmitter.emit(Events.WebsocketDataReceived, data);
  });

  ws.on('error', (err) => {
    logger.error(`Websocket client error: ${err.message}`);
    connect();
    clearInterval(pingInterval);
  });
};

export const disconnect = (symbol) => {
  hasToBeConnected = false;
  clearInterval(pingInterval);

  ws.send(JSON.stringify({
    'event': 'unsubscribe',
    'symbol': symbol,
    'subscription': { 'name': 'order-book' }
  }));

  ws.close();
};

const checkPongTimeout = () => {
  if (!hasToBeConnected) return;

  const now = new Date().getTime();
  if (now - lastPongReceived > PONG_TIMEOUT) {
    logger.error('Pong timeout');
    disconnect(lastSymbol);
    connect(lastSymbol);
  }
};

setInterval(checkPongTimeout, PONG_TIMEOUT);

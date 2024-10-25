import { logger } from '../core/logger/logger.js';
import WebSocket from 'ws';
import * as websocketServer from './server.js';
import { websocketDataEventEmitter } from '../core/events/event-emitters.js';
import { Events } from '../core/events/events.js';

let ws = null;

export const connect = (symbol) => {
  logger.info(`Connecting to websocket server for symbol ${symbol}`);

  if (ws) ws.close();

  ws = new WebSocket('wss://ws.bit2me.com/v1/trading');

  ws.on('open', () => {
    logger.info(`Connected to websocket server`);

    ws.send(JSON.stringify({
      'event': 'subscribe',
      'symbol': symbol,
      'subscription': { 'name': 'order-book' }
    }));
  });

  ws.on('message', (data) => {
    websocketServer.broadcast(data);
    websocketDataEventEmitter.emit(Events.WebsocketDataReceived, data);
  });

  ws.on('error', (err) => {
    logger.error(`Websocket client error: ${err.message}`);
    connect();
  });
};

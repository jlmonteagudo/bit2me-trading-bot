import { logger } from '../../../bot/core/log/logger.js';
import WebSocket from 'ws';
import * as websocketServer from './server.js';

export const connect = () => {
  const ws = new WebSocket('wss://ws.bit2me.com/v1/trading');

  ws.on('open', () => {
    logger.info(`Connected to websocket server`);

    ws.send(JSON.stringify({
      'event': 'subscribe',
      'symbol': 'BTC/EUR',
      'subscription': { 'name': 'order-book' }
    }));
  });

  ws.on('message', (data) => {
    websocketServer.broadcast(data);
  });

  ws.on('error', (err) => {
    logger.error(`Websocket client error: ${err.message}`);
    connect();
  });

  ws.on('close', () => {
    logger.error(`Websocket client disconnected`);
    connect();
  });
}

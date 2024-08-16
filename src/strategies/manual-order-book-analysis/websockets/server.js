import WebSocket, { WebSocketServer } from 'ws';
import { logger } from '../../../bot/core/log/logger.js';

let wss;

export const listen = () => {
  wss = new WebSocketServer({ port: 8080 });
  logger.info(`Listening on port ${8080}`);
};

export const broadcast = (message) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message, { binary: false });
    }
  });
}

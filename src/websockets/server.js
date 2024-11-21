import WebSocket, { WebSocketServer } from 'ws';
import { logger } from '../core/logger/logger.js';

let wss;

export const initializeWebSocket = (server) => {
  wss = new WebSocketServer({ server });
  logger.info('WebSocket server initialized');
};

export const broadcast = (message) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message, { binary: false });
    }
  });
};

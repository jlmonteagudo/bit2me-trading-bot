import express from 'express';
import http from 'http';
import { logger } from '../core/logger/logger.js';
import { setupRoutes } from './routes.js';

const app = express();
const server = http.createServer(app);

setupRoutes(app);

export const listen = () => {
  server.listen(8080, () => {
    logger.info(`Listening on port ${8080}`);
  });
};

export const getServer = () => server;
import * as websocketServer from '../../../websockets/server.js';

export const broadcastLog = (message) => {
  const logMessage = JSON.stringify({
    event: 'log',
    data: message
  });

  websocketServer.broadcast(logMessage);
};

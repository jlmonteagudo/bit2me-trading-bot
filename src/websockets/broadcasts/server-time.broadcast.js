import * as websocketServer from '../server.js';

export const broadcastServerTime = () => {
  setInterval(() => {
    const serverTimeMessage = JSON.stringify({
      event: 'server-time',
      data: new Date()
    });

    websocketServer.broadcast(serverTimeMessage);
  }, 1000);
};

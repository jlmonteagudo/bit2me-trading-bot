import * as websocketServer from '../../../websockets/server.js';

export const broadcastExitCost = (exitCost) => {
  const exitCostMessage = JSON.stringify({
    event: 'exit-cost',
    data: exitCost
  });

  websocketServer.broadcast(exitCostMessage);
};

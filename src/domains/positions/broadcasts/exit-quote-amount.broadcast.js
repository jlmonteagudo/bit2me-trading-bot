import * as websocketServer from '../../../websockets/server.js';

export const broadcastExitQuoteAmount = (exitQuoteAmount) => {
  const exitQuoteAmountMessage = JSON.stringify({
    event: 'exit-quote-amount',
    data: exitQuoteAmount
  });

  websocketServer.broadcast(exitQuoteAmountMessage);

};

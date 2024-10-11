import { getCurrentPosition } from '../state/positions.state.js';
import { orderBookEventEmitter, Events } from '../../../core/events/index.js';
import { getSellQuote } from '../../order-book/index.js';
import { getSettings } from '../../settings/index.js';
import { closePosition } from './simulation-close-position.js';
import { broadcastExitQuoteAmount } from '../broadcasts/exit-quote-amount.broadcast.js';
import * as repository from '../repository/positions.repository.js';

export const checkTrailingPosition = () => {
  orderBookEventEmitter.on(Events.OrderBookReceived, processReceivedOrderBook);
};

const processReceivedOrderBook = async (orderBook) => {
  const position = getCurrentPosition();
  if (!position) return;

  const settings = getSettings(true);
  const sellQuote = await getSellQuote(position.symbol, position.baseAmount, orderBook);
  const quoteFeeAmount = settings.feePercentage * sellQuote / 100;
  const exitQuoteAmount = sellQuote - quoteFeeAmount;

  if (exitQuoteAmount < position.stopLossCost) {
    closePosition(position.id);
    return;
  }

  if (exitQuoteAmount > position.takeProfitCost) {
    position.takeProfitCost = exitQuoteAmount * (1 + settings.trailingTakeProfitPercentage / 100);
    position.stopLossCost = exitQuoteAmount * (1 - settings.trailingStopLossPercentage / 100);

    await repository.updatePosition(position, true);
  }

  broadcastExitQuoteAmount(exitQuoteAmount);
};

import { getCurrentPosition } from '../state/positions.state.js';
import { orderBookEventEmitter, Events } from '../../../core/events/index.js';
import { getSellQuote } from '../../order-book/index.js';
import { getSettings } from '../../settings/index.js';
import { closePosition } from './close-position.js';
import { broadcastExitCost } from '../broadcasts/exit-cost.broadcast.js';
import { truncateFloat } from '../../../core/util/math.js';
import * as repository from '../repository/positions.repository.js';

export const checkTrailingPosition = () => {
  orderBookEventEmitter.on(Events.OrderBookReceived, processReceivedOrderBook);
};

const processReceivedOrderBook = async (orderBook) => {
  const position = getCurrentPosition();
  if (!position) return;

  const settings = getSettings();
  const sellQuote = await getSellQuote(position.symbol, position.baseAmount, orderBook);
  const feeAmount = position.feePercentage * sellQuote / 100;
  const exitCost = sellQuote - feeAmount;

  // if (exitCost < position.stopLossCost) {
  //   closePosition(position.id);
  //   return;
  // }

  // if (exitCost > position.takeProfitCost) {
  //   position.takeProfitCost = exitCost * (1 + settings.trailingTakeProfitPercentage / 100);
  //   position.stopLossCost = exitCost * (1 - settings.trailingStopLossPercentage / 100);

  //   await repository.updatePosition(position, true);
  // }

  const profitPercentage = getProfitPercentage(position.entryCost, exitCost);
  position.lowerProfitPercentage = Math.min((position.lowerProfitPercentage ?? 0), profitPercentage);

  if (exitCost < position.stopLossCost || exitCost > position.takeProfitCost) closePosition(position.id);

  broadcastExitCost(exitCost);
};

const getProfitPercentage = (entryCost, exitCost) => {
    const profit = exitCost - entryCost;
    const profitPercentage = truncateFloat((profit / entryCost) * 100, 2);
    return profitPercentage;
};

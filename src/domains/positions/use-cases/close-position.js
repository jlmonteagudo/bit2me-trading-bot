import { logger } from '../../../core/logger/logger.js';
import { getMarket } from '../../markets/index.js';
import { truncateFloat } from '../../../core/util/math.js';
import * as repository from '../repository/positions.repository.js';
import * as positionsState from '../state/positions.state.js';
import * as connector from '../../../conector/bit2me.js';
import { getOrderFromExchange } from '../../orders/index.js';
import { loadBalances } from '../../balances/use-cases/load-balances.usecase.js';

export const closePosition = async (id) => {
  logger.info(`Closing the position ${id}`);

  const position = await repository.getPosition(id, true);
  const market = await getMarket(position.symbol);

  try {
    const amount = truncateFloat(position.baseAmount, market.amountPrecision);
    const createdOrder = await createOrderInExchange(position.symbol, amount);

    position.exitOrderId = createdOrder.id;
    position.exitPrice = createdOrder.price;
    position.exitCost = createdOrder.cost - createdOrder.feeAmount;
    position.profit = position.exitCost - position.entryCost;
    position.profit = truncateFloat(position.profit, market.pricePrecision);
    position.profitPercentage = (position.profit / position.entryCost) * 100;
    position.profitPercentage = truncateFloat(position.profitPercentage, 2);
    position.exitAt = new Date().getTime();
    position.status = 'closed';

  } catch (error) {
    position.exitPrice = 0;
    position.exitCost = 0;
    position.profit = 0;
    position.profitPercentage = 0;
    position.exitAt = new Date().getTime();
    position.status = 'cancelled';

    logger.error(`Error closing position: ${error}`);
  }

  await repository.updatePosition(position);
  positionsState.setCurrentPosition(null);
  loadBalances();
};

const createOrderInExchange = async (symbol, orderAmount) => {
  let createdOrder = await connector.createOrder(symbol, 'sell', 'market', orderAmount);
  return getOrderFromExchange(createdOrder.id, 10);
};

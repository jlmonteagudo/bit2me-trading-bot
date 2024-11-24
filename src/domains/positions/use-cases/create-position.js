import * as connector from '../../../conector/bit2me.js';
import { logger } from '../../../core/logger/logger.js';
import { getSettings } from '../../settings/index.js';
import * as repository from '../repository/positions.repository.js';
import * as positionsState from '../state/positions.state.js';
import { newPositionOpenEventEmitter } from '../../../core/events/event-emitters.js';
import { Events } from '../../../core/events/events.js';
import { getOrderFromExchange } from '../../orders/index.js';

export const createPosition = async (
  symbol,
  orderAmount,
) => {
  try {
    logger.info(`Creating a new position for ${symbol}`);

    if (orderAmount <= 0) throw new Error(`Quote order amount can't be less than or equal to 0`);

    const createdOrder = await createOrderInExchange(symbol, orderAmount);
    const position = await getPositionToCreate(createdOrder);
    const createdPostion = await repository.createPosition(position, true);
    positionsState.setCurrentPosition(createdPostion);
    newPositionOpenEventEmitter.emit(Events.NewPositionOpen, createdOrder);

    logger.info(`New position created ${JSON.stringify(position)}`);

  } catch (error) {
    logger.error(`Error creating position: ${error.message}`);
  }
};

const getPositionToCreate = async (order) => {
  const settings = getSettings();
  const takeProfitCost = order.cost * (1 + settings.initialTakeProfitPercentage / 100);
  const stopLossCost = order.cost * (1 - settings.initialStopLossPercentage / 100);

  const position = {
    symbol: order.symbol,
    status: 'open',
    baseAmount: order.orderAmount - order.feeAmount,
    feePercentage: order.feePercentage,
    profit: 0,
    profitPercentage: 0,
    stopLossCost,
    takeProfitCost,
    entryOrderId: order.id,
    entryAt: new Date().getTime(),
    entryPrice: order.price,
    entryCost: order.cost,
    exitOrderId: '',
    exitPrice: 0,
    exitCost: 0,

  };

  return position;
};

const createOrderInExchange = async (symbol, orderAmount) => {
  let createdOrder = await connector.createOrder(symbol, 'buy', 'market', orderAmount, undefined, undefined, undefined, true);
  return getOrderFromExchange(createdOrder.id, 10);
};

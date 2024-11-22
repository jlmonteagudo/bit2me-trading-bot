import { logger } from '../../../core/logger/logger.js';
import { getSettings } from '../../settings/index.js';
import * as repository from '../repository/positions.repository.js';
import { getAmountBasedOnQuoteBalance } from '../../order-book/index.js';
import * as positionsState from '../state/positions.state.js';
import { newPositionOpenEventEmitter } from '../../../core/events/event-emitters.js';
import { Events } from '../../../core/events/events.js';

export const createPosition = async (
  symbol,
  quoteOrderAmount,
) => {
  logger.info(`Creating a new simulation position for ${symbol}`);

  if (quoteOrderAmount <= 0) {
    logger.error(`Quote order amount can't be less than or equal to 0`);
    return;
  }

  const amount = await getAmountBasedOnQuoteBalance(symbol, quoteOrderAmount);

  const createdOrder = {
    symbol,
    status: 'open',
    orderAmount: amount,
    cost: quoteOrderAmount
  };

  const position = await getPositionToCreate(createdOrder);
  const createdPostion = await repository.createPosition(position, true);
  positionsState.setCurrentPosition(createdPostion);
  newPositionOpenEventEmitter.emit(Events.NewPositionOpen, createdOrder);

  logger.info(`New position created ${JSON.stringify(position)}`);
};

const getPositionToCreate = async (order) => {
  const settings = getSettings(true);
  const baseFeeAmount = settings.feePercentage * order.orderAmount / 100;
  const quoteFeeAmount = settings.feePercentage * order.cost / 100;
  const takeProfitCost = order.cost * (1 + settings.initialTakeProfitPercentage / 100);
  const stopLossCost = order.cost * (1 - settings.initialStopLossPercentage / 100);

  const position = {
    symbol: order.symbol,
    entryAt: new Date().getTime(),
    status: order.status,
    baseAmount: order.orderAmount - baseFeeAmount,
    entryAveragePrice: order.cost / order.orderAmount,
    exitAveragePrice: 0,
    entryQuoteAmount: order.cost,
    exitQuoteAmount: 0,
    profit: 0,
    feePercentage: settings.feePercentage,
    baseFeeAmount,
    entryQuoteFeeAmount: quoteFeeAmount,
    stopLossCost,
    takeProfitCost
  };

  return position;
};

import { logger } from '../../../core/log/logger.js';
import * as connector from '../../../../conector/bit2me.js';
import { OrderSide } from '../enums/order-side.enum.js';
import { OrderType } from '../enums/order-type.enum.js';
import { closePosition } from './close-position.js';
import { getOpenPosition } from './get-open-position.js';

export const closePositionManually = async () => {
  const currentPosition = await getOpenPosition();
  if (!currentPosition) return;

  try {
    const exitOrder = await connector.getOrder(currentPosition.exitOrderId);
    await connector.cancelOrder(exitOrder.id);

    let newExitOrder = await connector.createOrder(
      exitOrder.symbol,
      OrderSide.Sell,
      OrderType.Market,
      exitOrder.orderAmount
    );

    await sleep(2000);

    newExitOrder = await connector.getOrder(newExitOrder.id);
    if (!newExitOrder || newExitOrder.status !== 'filled') return;

    await closePosition(currentPosition, newExitOrder);
  } catch (error) {
    logger.error('Error closing the position manually: ', error.message);
  }
};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

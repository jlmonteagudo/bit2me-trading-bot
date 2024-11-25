import { logger } from '../../../core/logger/logger.js';
import { sleep } from '../../../core/util/sleep.js';
import * as connector from '../../../conector/bit2me.js';

export const getOrderFromExchange = async (orderId, maxRetries) => {
  let createdOrder;
  let retries = 0;
  let hasToRetry = true;

  while (hasToRetry && retries < maxRetries) {
    try {
      createdOrder = await connector.getOrder(orderId);
      if (createdOrder.status !== 'open') hasToRetry = false;
      else await sleep(1000);
    } catch (error) {
      logger.error(`Error fetching the order in exchange: ${error.message}`);
    } finally {
      retries++;
    }
  }

  if (!createdOrder) throw new Error('Order not created in exchange');

  if (createdOrder.cost <= 0) throw new Error('Order cost is 0');

  const orderFee = await getOrderFee(orderId);
  createdOrder.feeAmount = orderFee.feeAmount;
  createdOrder.feePercentage = orderFee.feePercentage;

  return createdOrder;

};

const getOrderFee = async (orderId) => {
  const trades = await connector.getTradesByOrder(orderId);

  const orderFee = {
    feeAmount: trades.reduce((acc, trade) => acc + trade.feeAmount, 0),
    feePercentage: trades.reduce((acc, trade) => Math.min(acc, trade.feePercentage), 100),
  }

  return orderFee;
};

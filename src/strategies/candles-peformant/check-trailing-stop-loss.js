import { logger } from '../../bot/core/logger.js';
import {
  getOpenPosition,
  createExitOrder,
  updatePosition,
} from '../../bot/domains/position/index.js';
import { truncateFloat } from '../../bot/domains/position/utils.js';
import {
  cancelOrder,
  getOrder,
  getTicker,
  getMarket,
} from '../../conector/bit2me.js';

export const checkTrailingStopLoss = async (stopLossPercentage) => {
  logger.info('Checking trailing stop loss');

  const position = await getOpenPosition();
  const market = await getMarket(position.symbol);
  const ticker = await getTicker(position.symbol);
  const exitOrder = await getOrder(position.exitOrderId);

  if (!market || !exitOrder) return;

  const rateStopLoss = (100 - stopLossPercentage) / 100;
  const currentPrice = ticker.close;

  const newStopPrice = truncateFloat(
    currentPrice * rateStopLoss,
    market.pricePrecision
  );

  logger.info(`
  New stop price    : ${newStopPrice}
  Current stop price: ${exitOrder.stopPrice}
  `);

  if (newStopPrice > exitOrder.stopPrice) {
    logger.info('Creating a new exit order with the new stop price');

    await cancelOrder(position.exitOrderId);
    const newExitOrder = await createExitOrder(
      market,
      exitOrder.orderAmount,
      currentPrice,
      stopLossPercentage
    );

    position.exitOrderId = newExitOrder.id;
    position.exitPrice = newExitOrder.price;

    updatePosition(position);
  }
};

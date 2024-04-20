import { logger } from '../../bot/core/logger.js';
import * as positionDomain from './domains/position/index.js';
import * as connector from '../../conector/bit2me.js';
import { truncateFloat } from '../../bot/domains/position/utils.js';

export const checkTrailingStopLoss = async (stopLossPercentage) => {
  logger.info('Checking trailing stop loss');

  const position = await positionDomain.getOpenPosition();
  const market = await connector.getMarket(position.symbol);
  const ticker = await connector.getTicker(position.symbol);
  const exitOrder = await connector.getOrder(position.exitOrderId);

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

    await connector.cancelOrder(position.exitOrderId);
    const newExitOrder = await positionDomain.createExitOrder(
      market,
      exitOrder.orderAmount,
      currentPrice,
      stopLossPercentage
    );

    position.exitOrderId = newExitOrder.id;
    position.exitPrice = newExitOrder.price;

    positionDomain.updatePosition(position);
  }
};

import * as connector from '../../../../conector/bit2me.js';
import { OrderSide } from '../enums/order-side.enum.js';
import { OrderType } from '../enums/order-type.enum.js';
import { truncateFloat } from '../utils.js';

export const createExitOrder = async (
  market,
  amount,
  price,
  stopLossPercentage
) => {
  const rateStopLoss = (100 - stopLossPercentage) / 100;
  const stopPrice = truncateFloat(price * rateStopLoss, market.pricePrecision);
  price = truncateFloat(stopPrice * rateStopLoss, market.pricePrecision);
  amount = truncateFloat(amount, market.amountPrecision);

  return connector.createOrder(
    market.symbol,
    OrderSide.Sell,
    OrderType.StopLimit,
    amount,
    price,
    stopPrice,
    undefined
  );
};

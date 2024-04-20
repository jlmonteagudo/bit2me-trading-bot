import * as connector from '../../../../conector/bit2me.js';
import { OrderSide } from '../enums/order-side.enum.js';
import { OrderType } from '../enums/order-type.enum.js';
import { truncateFloat } from '../utils.js';

export const createEntryOrder = async (market, amount) => {
  amount = amount * 0.99;
  amount = truncateFloat(amount, market.amountPrecision);

  return connector.createOrder(
    market.symbol,
    OrderSide.Buy,
    OrderType.Market,
    amount,
    undefined,
    undefined,
    undefined
  );
};

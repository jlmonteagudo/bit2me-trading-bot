import * as connector from '../../../conector/bit2me.js';
import { getMarket } from '../../markets/index.js';
import { truncateFloat } from '../../../core/util/math.js';

export const getAmountBasedOnQuoteBalance = async (symbol, balance) => {
  const market = await getMarket(symbol);
  const orderBook = await connector.getOrderBook(symbol);

  let amount = 0;
  let remainingBalance = balance;

  for (const [price, volume] of orderBook.asks) {
    const cost = price * volume;
    if (cost <= remainingBalance) {
      amount += volume;
      remainingBalance -= cost;
    } else {
      amount += remainingBalance / price;
      break;
    }
  }

  amount = truncateFloat(amount, market.amountPrecision);

  return amount;
};

import {
  createOrder,
  getBalance,
  getMarket,
  getOrderBook,
  getTradesByOrder,
} from '../../../../conector/bit2me.js';
import { logger } from '../../../core/logger.js';
import { OrderSide } from '../enums/order-side.enum.js';
import { OrderType } from '../enums/order-type.enum.js';
import {
  getAmountBasedOnQuoteBalance,
  getMaxPriceOfTrades,
  truncateFloat,
} from '../utils.js';

export const createPosition = async (symbol) => {
  logger.info(`Creating a new position for ${symbol}`);

  const market = await getMarket(symbol);
  if (!market) return;

  const quoteCurrency = symbol.split('/')[1];
  const quoteBalance = await getBalance(quoteCurrency);

  if (quoteBalance < 100) return;

  const orderBook = await getOrderBook(symbol);
  const amount = getAmountBasedOnQuoteBalance(quoteBalance, orderBook);

  if (amount <= 0) return;

  const entryOrder = await createEntryOrder(market, amount);
  const entryOrderTrades = await getTradesByOrder(entryOrder.id);
  const maxPrice = getMaxPriceOfTrades(entryOrderTrades);
  const exitOrder = await createExitOrder(market, entryOrder.amount, maxPrice);
  savePosition(entryOrder, exitOrder);
};

const createEntryOrder = async (market, amount) => {
  amount = amount * 0.99;
  amount = truncateFloat(amount, market.amountPrecision);

  const createdOrder = {
    symbol: market.symbol,
    amount,
    id: 'ba8daf86-c49e-4ecd-aaf1-2614a2e5edf0',
  };
  console.log('CREATING ENTRY ORDER', createdOrder);

  return createdOrder;

  // return createOrder(
  //   symbol,
  //   OrderSide.Buy,
  //   OrderType.Market,
  //   amount,
  //   undefined,
  //   undefined,
  //   undefined
  // );
};

const createExitOrder = async (market, amount, price) => {
  const stopPrice = truncateFloat(price * 0.99, market.pricePrecision);
  price = truncateFloat(stopPrice * 0.99, market.pricePrecision);
  amount = truncateFloat(amount, market.amountPrecision);

  const createdOrder = { symbol: market.symbol, amount, price, stopPrice };
  console.log('CREATING EXIT ORDER', createdOrder);

  return createdOrder;

  // return createOrder(
  //   symbol,
  //   OrderSide.Sell,
  //   OrderType.StopLimit,
  //   amount,
  //   price,
  //   stopPrice,
  //   undefined
  // );
};

const savePosition = async (entryOrder, exitOrder) => {};

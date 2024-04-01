import {
  createOrder,
  getBalance,
  getMarket,
  getOrder,
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
import { database } from '../../../database/index.js';
import { PositionStatus } from '../enums/position-status.enum.js';

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
  const createdEntryOrder = await getOrder(entryOrder.id);
  const maxPrice = getMaxPriceOfTrades(entryOrderTrades);
  const exitOrder = await createExitOrder(
    market,
    createdEntryOrder.orderAmount,
    maxPrice
  );
  savePosition(createdEntryOrder, exitOrder);
};

const createEntryOrder = async (market, amount) => {
  amount = amount * 0.99;
  amount = truncateFloat(amount, market.amountPrecision);

  const createdOrder = {
    symbol: market.symbol,
    orderAmount: amount,
    id: 'ba8daf86-c49e-4ecd-aaf1-2614a2e5edf0',
    price: 60000,
    cost: 100,
    updatedAt: new Date(),
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

  const createdOrder = {
    symbol: market.symbol,
    amount,
    price,
    stopPrice,
    id: 'a-b-c-d',
    updatedAt: new Date(),
  };
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

/*

          id INTEGER PRIMARY KEY AUTOINCREMENT,
          symbol TEXT NOT NULL,
          status TEXT NOT NULL,
          entryOrderId TEXT NOT NULL,
          exitOrderId TEXT NOT NULL,
          positionBaseAmount NUMERIC,
          entryPrice NUMERIC,
          exitPrice NUMERIC,
          entryQuoteAmount NUMERIC,
          exitQuoteAmount NUMERIC,
          profit NUMERIC,
          entryDatetime NUMERIC,
          exitDatetime NUMERIC


*/

const savePosition = async (entryOrder, exitOrder) => {
  const position = {
    symbol: entryOrder.symbol,
    status: PositionStatus.Open,
    entryOrderId: entryOrder.id,
    exitOrderId: exitOrder.id,
    positionBaseAmount: entryOrder.orderAmount,
    entryPrice: entryOrder.price,
    exitPrice: exitOrder.price,
    entryQuoteAmount: entryOrder.cost,
    exitQuoteAmount: undefined,
    profit: undefined,
    entryDatetime: new Date(entryOrder.updatedAt).getTime(),
    exitDatetime: new Date(exitOrder.updatedAt).getTime(),
  };

  const insert = database.prepare(`INSERT INTO positions (
    symbol,
    status,
    entryOrderId,
    exitOrderId,
    positionBaseAmount,
    entryPrice,
    exitPrice,
    entryQuoteAmount,
    exitQuoteAmount,
    profit,
    entryDatetime,
    exitDatetime
  ) VALUES (
    @symbol,
    @status,
    @entryOrderId,
    @exitOrderId,
    @positionBaseAmount,
    @entryPrice,
    @exitPrice,
    @entryQuoteAmount,
    @exitQuoteAmount,
    @profit,
    @entryDatetime,
    @exitDatetime
  )`);

  insert.run(position);
};

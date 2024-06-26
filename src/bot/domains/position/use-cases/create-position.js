import {
  getBalance,
  getMarket,
  getOrder,
  getOrderBook,
  getTradesByOrder,
} from '../../../../conector/bit2me.js';
import { logger } from '../../../core/logger.js';
import { getAmountBasedOnQuoteBalance, getMaxPriceOfTrades } from '../utils.js';
import { PositionStatus } from '../enums/position-status.enum.js';
import * as repository from '../repository/position.repository.js';
import { createEntryOrder } from './create-entry-order.js';
import { createExitOrder } from './create-exit-order.js';

export const createPosition = async (
  symbol,
  stopLossPercentage,
  quoteOrderAmount
) => {
  logger.info(`Creating a new position for ${symbol}`);

  const market = await getMarket(symbol);
  if (!market) return;

  const [baseCurrency, quoteCurrency] = symbol.split('/');
  const quoteBalance = quoteOrderAmount ?? (await getBalance(quoteCurrency));
  const orderBook = await getOrderBook(symbol);
  const amount = getAmountBasedOnQuoteBalance(quoteBalance, orderBook);

  if (amount <= 0) return;

  const entryOrder = await createEntryOrder(market, amount);
  const entryOrderTrades = await getTradesByOrder(entryOrder.id);
  const createdEntryOrder = await getOrder(entryOrder.id);
  const maxPrice = getMaxPriceOfTrades(entryOrderTrades);
  const exitOrderAmount = await getBalance(baseCurrency);

  const exitOrder = await createExitOrder(
    market,
    exitOrderAmount,
    maxPrice,
    stopLossPercentage
  );

  insertPosition(createdEntryOrder, exitOrder);
};

const insertPosition = async (entryOrder, exitOrder) => {
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

  repository.insertPosition(position);
};

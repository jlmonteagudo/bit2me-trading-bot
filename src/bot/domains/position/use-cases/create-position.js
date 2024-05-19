import * as connector from '../../../../conector/bit2me.js';
import { logger } from '../../../core/log/logger.js';
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

  const market = await connector.getMarket(symbol);
  if (!market) return;

  const [baseCurrency, quoteCurrency] = symbol.split('/');
  const quoteBalance =
    quoteOrderAmount ?? (await connector.getBalanceByCurrency(quoteCurrency));
  const orderBook = await connector.getOrderBook(symbol);
  const amount = getAmountBasedOnQuoteBalance(quoteBalance, orderBook);

  if (amount <= 0) return;

  // try {
  console.log({ quoteBalance });
  console.log({ amount });
  const entryOrder = await createEntryOrder(market, amount);
  console.log({ entryOrder });
  const entryOrderTrades = await connector.getTradesByOrder(entryOrder.id);
  console.log({ entryOrderTrades });
  const createdEntryOrder = await connector.getOrder(entryOrder.id);
  console.log({ createdEntryOrder });
  const maxPrice = getMaxPriceOfTrades(entryOrderTrades);
  console.log({ maxPrice });
  const exitOrderAmount = await connector.getBalanceByCurrency(baseCurrency);
  console.log({ baseCurrency, exitOrderAmount });

  const exitOrder = await createExitOrder(
    market,
    exitOrderAmount,
    maxPrice,
    stopLossPercentage
  );

  console.log({ exitOrder });

  insertPosition(createdEntryOrder, exitOrder);
  // } catch (error) {
  //   logger.error('Error creating a new position: ', error);
  // }
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
    exitQuoteAmount: null,
    profit: null,
    entryDatetime: new Date(entryOrder.updatedAt).getTime(),
    exitDatetime: new Date(exitOrder.updatedAt).getTime(),
  };

  repository.insertPosition(position);
};

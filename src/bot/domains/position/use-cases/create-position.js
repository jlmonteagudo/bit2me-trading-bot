import { getBalance, getOrderBook } from '../../../../conector/bit2me.js';
import { logger } from '../../../core/logger.js';
import { OrderBookItemEnum } from '../enums/order-book-item.enum.js';

export const createPosition = async (symbol) => {
  logger.info(`Creating a new position for ${symbol}`);

  const quoteCurrency = symbol.split('/')[1];
  const quoteBalance = await getBalance(quoteCurrency);
  const amount = await getAmountBasedOnQuoteBalance(symbol, quoteBalance);

  if (amount <= 0) return;

  console.log({ quoteBalance, amount });
};

export const getAmountBasedOnQuoteBalance = async (symbol, balance) => {
  const orderBook = await getOrderBook(symbol);
  if (!orderBook) return 0;

  console.log({ orderBook });

  // const asks = orderBook.asks;
  // let amount = 0;
  // let cost = 0;
  // let index = 0;

  // while (cost < balance) {
  //   const askItem = asks[index];
  //   const itemCost =
  //     askItem[OrderBookItemEnum.Price] * askItem[OrderBookItemEnum.Volume];
  // }

  // console.log({ asks });

  // return quoteBalance;

  const amount = 0;

  return amount;
};

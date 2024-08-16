import { logger } from '../../../bot/core/log/logger.js';
import * as connector from '../../../conector/bit2me.js';
import { getAmountBasedOnQuoteBalance } from '../../../bot/domains/position/utils.js';
import { getMarket } from '../market/index.js';
import { truncateFloat } from '../../../bot/domains/position/utils.js';
import * as firebase from '../firebase/index.js';
import * as settingsService from '../settings/index.js';

export const createPosition = async (
  symbol,
  quoteOrderAmount,
  simulation
) => {
  logger.info(`Creating a new position for ${symbol}`);

  let createdOrder;
  const market = await getMarket(symbol);
  const orderBook = await connector.getOrderBook(symbol);

  let amount = getAmountBasedOnQuoteBalance(quoteOrderAmount, orderBook);
  amount = truncateFloat(amount, market.amountPrecision);

  if (!simulation) {
    // const createdOrder = await connector.createOrder(
    //   market.symbol,
    //   OrderSide.Buy,
    //   OrderType.Market,
    //   amount,
    //   undefined,
    //   undefined,
    //   undefined
    // );

    // logger.info(`New order created`, order);
  }
  else {
    createdOrder = {
      symbol,
      status: 'open',
      amount,
      quoteOrderAmount
    };
  }

  const position = await getPositionToCreate(createdOrder);
  await savePosition(position, simulation);

  logger.info(`New position created ${JSON.stringify(position)}`);
};

const getPositionToCreate = async (order) => {
  const settings = settingsService.getSettings();

  const baseFeeAmount = settings.feePercentage * order.amount / 100;
  const quoteFeeAmount = settings.feePercentage * order.quoteOrderAmount / 100;

  const position = {
    symbol: order.symbol,
    entryAt: new Date().getTime(),
    status: order.status,
    baseAmount: order.amount - baseFeeAmount,
    entryAveragePrice: order.quoteOrderAmount / order.amount,
    exitAveragePrice: 0,
    entryQuoteAmount: order.quoteOrderAmount,
    exitQuoteAmount: 0,
    profit: 0,
    feePercentage: settings.feePercentage,
    baseFeeAmount,
    entryQuoteFeeAmount: quoteFeeAmount,
  };

  return position;
};

const savePosition = async (position, simulation) => {
  const path = simulation ? firebase.POSITIONS_SIMULATION : firebase.POSITIONS;
  await firebase.db.ref(path).push(position);
};




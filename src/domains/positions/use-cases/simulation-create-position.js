import { logger } from '../../../core/logger/logger.js';
import { getSettings } from '../../settings/index.js';
import * as repository from '../repository/positions.repository.js';
import { getAmountBasedOnQuoteBalance } from '../../order-book/index.js';

export const createPosition = async (
  symbol,
  quoteOrderAmount,
) => {
  logger.info(`Creating a new simulation position for ${symbol}`);

  const amount = await getAmountBasedOnQuoteBalance(symbol, quoteOrderAmount);

  const createdOrder = {
    symbol,
    status: 'open',
    orderAmount: amount,
    cost: quoteOrderAmount
  };

  const position = await getPositionToCreate(createdOrder);
  await repository.createPosition(position, true);

  logger.info(`New position created ${JSON.stringify(position)}`);
};

const getPositionToCreate = async (order) => {
  const settings = getSettings();

  const baseFeeAmount = settings.feePercentage * order.orderAmount / 100;
  const quoteFeeAmount = settings.feePercentage * order.cost / 100;

  const position = {
    symbol: order.symbol,
    entryAt: new Date().getTime(),
    status: order.status,
    baseAmount: order.orderAmount - baseFeeAmount,
    entryAveragePrice: order.cost / order.orderAmount,
    exitAveragePrice: 0,
    entryQuoteAmount: order.cost,
    exitQuoteAmount: 0,
    profit: 0,
    feePercentage: settings.feePercentage,
    baseFeeAmount,
    entryQuoteFeeAmount: quoteFeeAmount,
  };

  return position;
};

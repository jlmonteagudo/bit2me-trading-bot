import { logger } from '../../../core/logger/logger.js';
import { getMarket } from '../../markets/index.js';
import { getSettings } from '../../settings/index.js';
import { getSellQuote } from '../../order-book/index.js';
import { truncateFloat } from '../../../core/util/math.js';
import * as repository from '../repository/positions.repository.js';
import * as positionsState from '../state/positions.state.js';

export const closePosition = async (id) => {
  logger.info(`Closing the position ${id}`);

  const settings = getSettings();
  const position = await repository.getPosition(id, true);
  const market = await getMarket(position.symbol);
  const sellQuote = await getSellQuote(position.symbol, position.baseAmount);
  const quoteFeeAmount = settings.feePercentage * sellQuote / 100;

  position.exitAveragePrice = sellQuote / position.baseAmount;
  position.exitQuoteAmount = sellQuote - quoteFeeAmount;
  position.profit = position.exitQuoteAmount - position.entryQuoteAmount;
  position.profit = truncateFloat(position.profit, market.pricePrecision);
  position.exitAt = new Date().getTime();
  position.status = 'closed';
  position.exitQuoteFeeAmount = quoteFeeAmount;

  await repository.updatePosition(position, true);
  positionsState.setCurrentPosition(null);
};


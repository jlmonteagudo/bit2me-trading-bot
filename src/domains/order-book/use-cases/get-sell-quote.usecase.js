import { getMarket } from '../../markets/index.js';
import { truncateFloat } from '../../../core/util/math.js';

export const getSellQuote = async (symbol, amountToSell, orderBook) => {
  const market = await getMarket(symbol);

  let sellQuote = 0;
  let remainingAmountToSell = amountToSell;

  for (const [price, volume] of orderBook.bids) {
    if (volume <= remainingAmountToSell) {
      sellQuote += (price * volume);
      remainingAmountToSell -= volume;
    } else {
      sellQuote += (remainingAmountToSell * price);
      break;
    }
  }

  sellQuote = truncateFloat(sellQuote, market.pricePrecision);

  return sellQuote;
};

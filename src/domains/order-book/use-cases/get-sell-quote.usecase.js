import * as connector from '../../../conector/bit2me.js';
import { getMarket } from '../../markets/index.js';

export const getSellQuote = async (amountToSell) => {
  const orderBook = await connector.getOrderBook(position.symbol);
  const market = await getMarket(position.symbol);

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

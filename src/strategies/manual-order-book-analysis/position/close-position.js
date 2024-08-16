import { logger } from '../../../bot/core/log/logger.js';
import * as connector from '../../../conector/bit2me.js';
import { getAmountBasedOnQuoteBalance } from '../../../bot/domains/position/utils.js';
import { truncateFloat } from '../../../bot/domains/position/utils.js';
import * as firebase from '../firebase/index.js';
import { getMarket } from '../market/index.js';
import { getSellQuote } from '../order-book/index.js';
import * as settingsService from '../settings/index.js';

export const closePosition = async (position) => {
  logger.info(`Closing the position ${position.id}`);

  if (position.simulation) {
    closePositionSimulation(position.id);
    return;
  }

  /*
  const market = await getMarket(symbol);
  const orderBook = await connector.getOrderBook(symbol);

  let amount = getAmountBasedOnQuoteBalance(quoteOrderAmount, orderBook);
  amount = truncateFloat(amount, market.amountPrecision);

  if (!simulation) {

    // const order = await connector.createOrder(
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

  const position = {
    symbol,
    createdAt: new Date(),
    status: 'open',
    baseAmount: amount,
    entryQuoteAmount: quoteOrderAmount,
    exitQuoteAmount: quoteOrderAmount,
    profit: 0
  };

  await firebase.createPosition(position, simulation);

  logger.info(`New position created ${JSON.stringify(position)}`);
  */
};


const closePositionSimulation = async (id) => {
  const settings = settingsService.getSettings();
  const position = await getPosition(id, true);

  const orderBook = await connector.getOrderBook(position.symbol);
  let sellQuote = getSellQuote(position.baseAmount, orderBook);

  const market = await getMarket(position.symbol);
  sellQuote = truncateFloat(sellQuote, market.pricePrecision);

  const quoteFeeAmount = settings.feePercentage * sellQuote / 100;

  position.exitAveragePrice = sellQuote / position.baseAmount;
  position.exitQuoteAmount = sellQuote - quoteFeeAmount;
  position.profit = position.exitQuoteAmount - position.entryQuoteAmount;
  position.profit = truncateFloat(position.profit, market.pricePrecision);
  position.exitAt = new Date().getTime();
  position.status = 'closed';
  position.exitQuoteFeeAmount = quoteFeeAmount;

  await updatePosition(position, true);
};

const getPosition = async (id, simulation) => {
  const path = simulation ? firebase.POSITIONS_SIMULATION : firebase.POSITIONS;
  const positionSnapshot = await firebase.db.ref(path).child(id).get();
  return {
    id,
    ...positionSnapshot.val()
  }
};

const updatePosition = async (position, simulation) => {
  const path = simulation ? firebase.POSITIONS_SIMULATION : firebase.POSITIONS;

  await firebase.db.ref(path).child(position.id).update({
    exitAveragePrice: position.exitAveragePrice,
    exitQuoteAmount: position.exitQuoteAmount,
    profit: position.profit,
    exitAt: position.exitAt,
    status: position.status
  });
};



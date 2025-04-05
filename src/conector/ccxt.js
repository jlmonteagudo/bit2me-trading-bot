import ccxt from 'ccxt';
import { logger } from '../core/logger/logger.js';

export let exchange;

export const initialize = async (exchangeId) => {
  try {
    exchange = new ccxt.pro[exchangeId]({
      apiKey: process.env.BINANCE_API_KEY,
      secret: process.env.BINANCE_SECRET,
    });

    await exchange.loadMarkets();
  } catch (error) {
    const hostIP = Object.values(os.networkInterfaces())
      .flat()
      .find((iface) => iface.family === 'IPv4' && !iface.internal)?.address || 'Unknown IP';

    logger.error(`
      Error initializing connector: ${error.message}.
      Host IP: ${hostIP}
    `);

    throw error;
  }
};


export const getBalance = async () => {
  const balance = await exchange.fetchBalance({ omitZeroBalances: true });
  const currencies = Object.keys(balance.total);
  const parsedBalance = currencies.map((currency) => ({
    currency,
    balance: balance.free[currency],
    blockedBalance: balance.used[currency],
  }));

  return parsedBalance;
};

export const getTickers = async () => {
  try {
    let tickers = await exchange.fetchTickers(undefined, { type: 'spot' });

    tickers = Object.values(tickers)

    tickers.forEach((ticker) => {
      delete ticker.info;
      delete ticker.markPrice;
      delete ticker.indexPrice;
    });

    return tickers;
  } catch (error) {
    logger.error('Error fetching tickers: ', error);
    return [];
  }
};

export const getCandles = async (symbol, interval, startTime, endTime, limit) => {
  try {
    return exchange.fetchOHLCV(symbol, interval, undefined, limit)
  } catch (error) {
    logger.error('Error getting candles', error);
    return [];
  }
};

export const getOrderBook = async (symbol) => {
  try {
    return exchange.fetchOrderBook(symbol);
  } catch (error) {
    logger.error('Error getting the order book', error);
    return undefined;
  }
};

export const createOrder = async (
  symbol,
  side,
  orderType,
  amount,
  price,
  stopPrice,
  clientOrderId,
  amountInQuote
) => {
  if (amountInQuote === true && orderType == 'market') {
    if (side === 'sell') return exchange.createMarketSellOrderWithCost(symbol, amount);
    if (side === 'buy') return exchange.createMarketBuyOrderWithCost(symbol, amount);
  }

  return exchange.createOrder(symbol, orderType, side, amount, price, { stopPrice, clientOrderId });
};

export const getOrder = async (orderId, symbol) => {
  const order = await exchange.fetchOrder(orderId, symbol);
  order.orderAmount = order.filled;
  return order;
};

export const getTradesByOrder = async (orderId, symbol) => {
  let trades = await exchange.fetchOrderTrades(orderId, symbol);

  trades = trades.map((trade) => {
    trade.feeAmount = trade.fee.cost;
    trade.feePercentage = (trade.fee.cost / trade.amount) * 100;
    return trade;
  });

  return trades;
};

export const getMarket = async (symbol) => {
  try {
    const market = exchange.markets[symbol];

    market.amountPrecision = -Math.log10(market.precision.amount);
    market.pricePrecision = -Math.log10(market.precision.price);

    return market;
  } catch (error) {
    return undefined;
  }
};

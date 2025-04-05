import { PROVIDER } from '../providers/index.js';
import * as bit2me from './clients/bit2me-client.js';
import * as binance from './clients/ccxt-client.js';

const getExchange = () => {
  if (PROVIDER === 'binance') {
    return binance;
  } else if (PROVIDER === 'bit2me') { 
    return bit2me;
  }
};

export const connect = (symbol) => {
  const exchange = getExchange();;
  exchange.connect(symbol);
};

export const disconnect = (symbol) => {
  const exchange = getExchange();;
  exchange.disconnect(symbol);
};

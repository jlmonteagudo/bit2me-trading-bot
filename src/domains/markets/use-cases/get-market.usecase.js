import * as connector from '../../../conector/bit2me.js';

let market;

const setMarket = async (symbol) => {
  market = await connector.getMarket(symbol);
}

export const getMarket = async (symbol) => {
  if (!market || market.symbol !== symbol) await setMarket(symbol);
  return market;
}

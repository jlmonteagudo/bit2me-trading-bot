import * as connector from '../../../conector/bit2me.js';

let market;

export const setMarket = async (symbol) => {
  market = await connector.getMarket(symbol);
}

export const getMarket = async (symbol) => {
  if (!market) await setMarket(symbol);
  return market;
}

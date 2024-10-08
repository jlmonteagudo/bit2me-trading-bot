import axios from 'axios';
import { getAuthHeaders } from './auth.js';

const SERVER_URL = 'https://gateway.bit2me.com';
const BASE_PATH = '/v1/trading';

export const getOpenOrders = async (symbol) => {
  const url = `${BASE_PATH}/order?symbol=${symbol}&status=open`;
  const requestConfig = getAuthHeaders(url);
  const response = await axios.get(`${SERVER_URL}${url}`, requestConfig);
  return response.data;
};

export const getOrder = async (orderId) => {
  const url = `${BASE_PATH}/order/${orderId}`;
  const requestConfig = getAuthHeaders(url);
  const response = await axios.get(`${SERVER_URL}${url}`, requestConfig);
  return response.data;
};

export const getTradesByOrder = async (orderId) => {
  const url = `${BASE_PATH}/order/${orderId}/trades`;
  const requestConfig = getAuthHeaders(url);
  const response = await axios.get(`${SERVER_URL}${url}`, requestConfig);
  return response.data;
};

export const cancelOrder = async (orderId) => {
  const url = `${BASE_PATH}/order/${orderId}`;
  const requestConfig = getAuthHeaders(url);
  const response = await axios.delete(`${SERVER_URL}${url}`, requestConfig);
  return response.data;
};

export const getBalance = async () => {
  const url = `${BASE_PATH}/wallet/balance`;
  const requestConfig = getAuthHeaders(url);
  const response = await axios.get(`${SERVER_URL}${url}`, requestConfig);
  return response.data;
};

export const getBalanceByCurrency = async (symbol) => {
  const url = `${BASE_PATH}/wallet/balance?symbols=${symbol}`;
  const requestConfig = getAuthHeaders(url);
  const response = await axios.get(`${SERVER_URL}${url}`, requestConfig);
  return response.data[0]?.balance;
};

export const createOrder = async (
  symbol,
  side,
  orderType,
  amount,
  price,
  stopPrice,
  clientOrderId
) => {
  const order = {
    symbol,
    side,
    orderType,
    amount: amount.toString(),
    price: price?.toString(),
    stopPrice: stopPrice?.toString(),
    clientOrderId,
  };

  const url = `${BASE_PATH}/order`;
  const requestConfig = getAuthHeaders(url, order);
  const response = await axios.post(
    `${SERVER_URL}${url}`,
    order,
    requestConfig
  );
  return response.data;
};

export const getCandles = async (symbol, interval, startTime, endTime) => {
  try {
    const url = `${BASE_PATH}/candle?symbol=${symbol}&interval=${interval}&startTime=${startTime}&endTime=${endTime}&limit=1000`;
    const response = await axios.get(`${SERVER_URL}${url}`);
    const candles = response.data.filter((candle) => candle[0] >= startTime);
    return candles;
  } catch (error) {
    return [];
  }
};

export const getOrderBook = async (symbol) => {
  try {
    const url = `/v2/trading/order-book?symbol=${symbol}`;
    const response = await axios.get(`${SERVER_URL}${url}`);
    return response.data;
  } catch (error) {
    return undefined;
  }
};

export const getMarket = async (symbol) => {
  try {
    const url = `${BASE_PATH}/market-config?symbol=${symbol}`;
    const response = await axios.get(`${SERVER_URL}${url}`);
    return response.data[0];
  } catch (error) {
    return undefined;
  }
};

export const getTickers = async () => {
  try {
    const url = '/v2/trading/tickers';
    const response = await axios.get(`${SERVER_URL}${url}`);
    return response.data;
  } catch (error) {
    return [];
  }
};

export const getTicker = async (symbol) => {
  try {
    const url = '/v2/trading/tickers';
    const response = await axios.get(`${SERVER_URL}${url}`);
    return response.data.filter((ticker) => ticker.symbol === symbol)[0];
  } catch (error) {
    return undefined;
  }
};

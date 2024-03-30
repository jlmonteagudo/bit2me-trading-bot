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
  throw new Error('Not implemented yet');
};

export const cancelOrder = async (orderId) => {
  throw new Error('Not implemented yet');
};

export const getBalance = async (symbol) => {
  const url = `${BASE_PATH}/wallet/balance?symbols=${symbol}`;
  const requestConfig = getAuthHeaders(url);
  const response = await axios.get(`${SERVER_URL}${url}`, requestConfig);
  return response.data;
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
    price: price.toString(),
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

export const getCandles = async (numberOfCandles, interval) => {
  throw new Error('Not implemented yet');
};

export const getMarket = async (symbol) => {
  throw new Error('Not implemented yet');
};

export const getTickers = async () => {
  throw new Error('Not implemented yet');
};
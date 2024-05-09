const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');
const fetch = require('node-fetch');

const SERVER_URL = 'https://gateway.bit2me.com';
const BASE_PATH = '/v1/trading';
// const CORS = { cors: ['bit2me-trading.web.app', 'localhost:4200'] };
const HTTP_OPTIONS = {
  cors: true,
};

exports.helloWorld = onRequest(HTTP_OPTIONS, (request, response) => {
  logger.info('Hello logs!', { structuredData: true });
  response.send('Hello from Firebase!');
});

exports.candles = onRequest(HTTP_OPTIONS, async (request, response) => {
  const { symbol, interval, numberOfCandles } = request.query;
  const endTime = getEndTime();
  const startTime = getStartTime(interval, numberOfCandles, endTime);

  let candles = [];

  try {
    // eslint-disable-next-line max-len
    const url = `${BASE_PATH}/candle?symbol=${symbol}&interval=${interval}&startTime=${startTime}&endTime=${endTime}&limit=1000`;
    const response = await fetch(`${SERVER_URL}${url}`);
    const json = await response.json();
    candles = json.filter((candle) => candle[0] >= startTime);
  } catch (error) {
    candles = [];
  }

  response.send(candles);
});

const getEndTime = () => {
  return new Date().getTime();
};

const getStartTime = (interval, numberOfCandles, endTime) => {
  const intervalMilliseconds = interval * numberOfCandles * 60 * 1000;
  const startTime = endTime - intervalMilliseconds;
  return startTime;
};

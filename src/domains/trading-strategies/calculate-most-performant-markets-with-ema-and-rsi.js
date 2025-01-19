import { logger } from '../../core/logger/logger.js';
import * as connector from '../../conector/bit2me.js';
import { sleep } from '../../core/util/sleep.js';
import { CandleEnum } from '../candles/enums/candle.enum.js';
import { ema, rsi } from 'indicatorts';
import { savePerformantMarkets } from './repository/trading-strategies.repository.js';
import { getSettings } from '../settings/index.js';
import { getNotifications, disableNotifyEntrySignals } from '../notifications/index.js';
import { broadcastLog } from './broadcasts/log.broadcast.js';
import { messaging } from '../../core/firebase/index.js';


export const calculateMostPerformantMarketsWithEMAAndRSI = async () => {
  let index = 0;
  const tickers = await getTickers();
  const performantTickers = [];
  const candlesMap = {};

  logger.info(`Calculating most performant markets with EMA and RSI for ${tickers.length} tickers`);

  for (const ticker of tickers) {
    index++;
    const logMessage = `${index}/${tickers.length} Analyzing market ${ticker.symbol}. Found: ${performantTickers.length}`;
    logger.info(logMessage);
    broadcastLog(logMessage);

    const candles = await getCandles(ticker.symbol);
    candlesMap[ticker.symbol] = candles;

    const isPerformant = await isMarketPerformant(ticker.symbol);
    if (isPerformant) performantTickers.push(ticker);

    await sleep(250);
  }

  const rankedTickers = rankPerformantTickers(performantTickers, candlesMap);

  await savePerformantMarkets(rankedTickers);

  logger.info(`Found ${rankedTickers.length} performant markets: ${JSON.stringify(rankedTickers.map(t => t.ticker.symbol))}`);
  if (rankedTickers.length) sendPushNotification(rankedTickers.length);
};

const isMarketPerformant = async (symbol) => {
  const settings = getSettings();

  const candles = await getCandles(symbol);
  if (!candles.length) false;

  let isPerformant = validateEmaAndRsi(candles);
  if (!isPerformant) return false;

  if (settings.validatePenultimateCandleVolume) isPerformant = validatePenultimateCandleVolumeAboveAverage(candles);
  if (!isPerformant) return false;

  if (settings.validatePenultimateCandleIsPositive) isPerformant = validatePenultimateCandleIsPositive(candles);
  if (!isPerformant) return false;

  if (settings.validateResistance) isPerformant = validateResistance(candles);
  if (!isPerformant) return false;

  if (settings.validateSpread) isPerformant = validateSpread(symbol);
  if (!isPerformant) return false;

  return isPerformant;
};

const validateEmaAndRsi = (candles) => {
  const settings = getSettings();
  const closes = candles.map(candle => candle[CandleEnum.Close]);
  const emaFast = ema(closes, { period: settings.emaFastPeriod });
  const emaSlow = ema(closes, { period: settings.emaSlowPeriod });
  const rsiStrategy = rsi(closes, { period: settings.rsiPeriod });
  const lastIndex = closes.length - 1;
  const isEmaFastAboveEmaSlow = emaFast[lastIndex] > emaSlow[lastIndex];
  const isRsiAbove50 = rsiStrategy[lastIndex] > 50;

  return isEmaFastAboveEmaSlow && isRsiAbove50;
}

const validatePenultimateCandleVolumeAboveAverage = (candles) => {
  const settings = getSettings();
  const volumes = candles.map(candle => candle[CandleEnum.Volume]).slice(-20);
  const averageVolume = volumes.reduce((acc, volume) => acc + volume, 0) / volumes.length;
  const penultimateVolume = volumes[volumes.length - 2];
  const valid = penultimateVolume > averageVolume * settings.validatePenultimateCandleVolumeFactor;

  logger.info(JSON.stringify({
    penultimateVolume,
    averageVolumeWithFactor: averageVolume * settings.validatePenultimateCandleVolumeFactor,
    valid
  }));

  return valid;
};

const validatePenultimateCandleIsPositive = (candles) => {
  const penultimateCandle = candles[candles.length - 2];
  const penultimateCandleIsPositive = penultimateCandle[CandleEnum.Close] > penultimateCandle[CandleEnum.Open];

  const lastCandle = candles[candles.length - 1];
  const lastCandleIsPositive = lastCandle[CandleEnum.Close] > lastCandle[CandleEnum.Open];


  logger.info(JSON.stringify({ lastCandleIsPositive, penultimateCandleIsPositive }));

  return penultimateCandleIsPositive && lastCandleIsPositive;
};

const validateResistance = (candles) => {
  const settings = getSettings();
  const highs = candles.map(candle => candle[CandleEnum.High]);
  const lastPrice = candles[candles.length - 1][CandleEnum.Close];
  const resistance = Math.max(...highs);
  const lastPriceWithFactor = lastPrice * settings.validateResistanceFactor;
  const valid = resistance > lastPriceWithFactor;

  logger.info(JSON.stringify({ resistance, lastPrice, lastPriceWithFactor, valid }));

  return valid;
};

const validateSpread = async (symbol) => {
  const settings = getSettings();
  const orderBook = await getOrderBook(symbol);
  const limitPercentage = settings.validateSpreadLimitPercentage;
  const limitAmountQuote = settings.validateSpreadAmountQuote;

  const asks = orderBook.asks;

  if (!asks.length) return false;

  let accumulatedAmountQuote = 0;
  let firstPrice = asks[0][0];
  let lastPrice = asks[0][0];

  for (const ask of asks) {
    const [price, amount] = ask;
    const amountQuote = price * amount;

    accumulatedAmountQuote += amountQuote;
    lastPrice = price;

    if (accumulatedAmountQuote >= limitAmountQuote) break;
  }

  const priceVariationPercentage = ((lastPrice - firstPrice) / firstPrice) * 100;
  const valid = priceVariationPercentage <= limitPercentage;

  logger.info(JSON.stringify({
    limitPercentage,
    priceVariationPercentage,
    valid
  }));

  return valid;
};


const getTickers = async () => {
  const settings = getSettings();

  return (await connector.getTickers())
    .filter((ticker) => {
      const quote = ticker.symbol.split('/')[1];
      return quote === settings.quoteCurrency
        && ticker.quoteVolume > settings.quoteVolumeLimit;
    })
    .sort((a, b) => b.percentage - a.percentage);
}

const getCandles = async (symbol) => {
  const settings = getSettings();
  const endTime = new Date().getTime();
  const intervalMilliseconds = settings.timeframeInterval * settings.numberOfCandles * 60 * 1000;
  const startTime = endTime - intervalMilliseconds;

  return connector.getCandles(
    symbol,
    settings.timeframeInterval,
    startTime,
    endTime
  );
};

const getOrderBook = async (symbol) => {
  return connector.getOrderBook(symbol);
};

const rankPerformantTickers = (performantTickers, candlesMap) => {
  const settings = getSettings();

  return performantTickers.map(ticker => {
    const candles = candlesMap[ticker.symbol];

    // Calculate score for crossed EMA
    const closes = candles.map(c => c[CandleEnum.Close]);
    const emaFast = ema(closes, { period: settings.emaFastPeriod });
    const emaSlow = ema(closes, { period: settings.emaSlowPeriod });
    const lastIndex = closes.length - 1;
    const emaScore = emaFast[lastIndex] - emaSlow[lastIndex]; // More difference => More score

    // Calculate score for RSI
    const rsiValues = rsi(closes, { period: settings.rsiPeriod });
    const rsiScore = rsiValues[lastIndex] > 50 ? rsiValues[lastIndex] - 50 : 0; // RSI higher than 50 increments score

    // Calculate score for volume
    const volumes = candles.map(c => c[CandleEnum.Volume]).slice(-20);
    const averageVolume = volumes.reduce((acc, vol) => acc + vol, 0) / volumes.length;
    const penultimateVolume = volumes[volumes.length - 2];
    const volumeScore = penultimateVolume > averageVolume ? (penultimateVolume / averageVolume) - 1 : 0;

    // Calculate resistance distance
    const highs = candles.map(c => c[CandleEnum.High]);
    const lastPrice = closes[lastIndex];
    const resistance = Math.max(...highs);
    const resistanceScore = (resistance - lastPrice) / lastPrice; // More distance => More score

    // Combine scores
    const totalScore = (emaScore * 0.4) + (rsiScore * 0.3) + (volumeScore * 0.2) + (resistanceScore * 0.1);
    return { ticker, score: totalScore };
  }).sort((a, b) => b.score - a.score); // Order by highest score
};

const sendPushNotification = async (numberOfEntrySignals) => {
  const notifications = getNotifications();

  if (!notifications.notifyEntrySignal) return;

  try {
    const response = await messaging.send({
      token: notifications.token,
      notification: {
        title: `New entry signals`,
        body: `Found ${numberOfEntrySignals} new entry signals`,
      },
    });

    logger.info(`Push notification sent: ${JSON.stringify(response)}`);

    disableNotifyEntrySignals();
  } catch (error) {
    logger.error(`Error sending push notification:`, error);
  }
};

import { getSettings } from '../../settings/index.js';
import * as connector from '../../../conector/bit2me.js';
import { CandleEnum } from '../enums/candle.enum.js';
import { messaging } from '../../../core/firebase/index.js';
import { logger } from '../../../core/logger/logger.js';

const CHECK_INTERVAL_MILISECONDS = 60000;

export const checkCandlePerformance = () => {
  checkCandlePerformanceInternal();
  setInterval(checkCandlePerformanceInternal, CHECK_INTERVAL_MILISECONDS);
};

const checkCandlePerformanceInternal = async () => {
  const settings = getSettings(true);
  const settingsEntryPosition = settings.notifications.entryPosition;
  const symbol = settings.symbol;
  const endTime = new Date().getTime();
  const intervalMilliseconds = settingsEntryPosition.candlesInterval * settingsEntryPosition.numberOfCandles * 60 * 1000;
  const startTime = endTime - intervalMilliseconds;

  const candles = await connector.getCandles(
    symbol,
    settingsEntryPosition.candlesInterval,
    startTime,
    endTime
  );


  const arePositive = areAllCandlesPositive(candles);
  const intervalPercentagePriceVariation = getIntervalPercentagePriceVariation(candles);

  logger.info(`Candle information: ${JSON.stringify({ arePositive, intervalPercentagePriceVariation })}`);

  if (arePositive && intervalPercentagePriceVariation >= settingsEntryPosition.percentage) {
    logger.info('Sending push notification to open position');
    sendPushNotification(settings.notifications.token, { title: 'Bull market', body: `Analyze open a new position for ${symbol}` });
  }
};

const areAllCandlesPositive = (candles) =>
  candles.reduce((isPositive, candle) => {
    return isPositive && getPercentagePriceVariation(candle) > 0;
  }, true);


const getPercentagePriceVariation = (candle) =>
  ((candle[CandleEnum.Close] - candle[CandleEnum.Open]) /
    candle[CandleEnum.Open]) *
  100;

const getIntervalPercentagePriceVariation = (candles) => {
  const firstCandle = candles[0];
  const lastCandle = candles[candles.length - 1];

  if (!lastCandle || !firstCandle) return 0;

  return (
    ((lastCandle[CandleEnum.Close] - firstCandle[CandleEnum.Open]) /
      firstCandle[CandleEnum.Open]) *
    100
  );
};


const sendPushNotification = async (token, payload) => {
  try {
    const response = await messaging.send({
      token: token,
      notification: {
        title: payload.title,
        body: payload.body,
      },
    });

    logger.info(`Push notification sent: ${JSON.stringify(response)}`);
  } catch (error) {
    logger.error(`Error sending push notification:`, error);
  }
};

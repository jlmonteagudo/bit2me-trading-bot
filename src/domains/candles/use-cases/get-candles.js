import { connector } from '../../../conector/index.js';
import { logger } from '../../../core/logger/logger.js';

export const getCandles = async (symbol, interval, numberOfCandles) => {
  let candles = [];

  try {
    candles = await connector.getCandles(
      symbol,
      interval,
      undefined,
      undefined,
      numberOfCandles
    );
  } catch (error) {
    logger.error('Error getting candles', error);
    candles = [];    
  }

  return candles;
};

// export const getCandles = async (symbol, interval, numberOfCandles) => {
//   const endTime = new Date().getTime();
//   const intervalMilliseconds = interval * numberOfCandles * 60 * 1000;
//   const startTime = endTime - intervalMilliseconds;
//   let candles = [];

//   try {
//     candles = await connector.getCandles(
//       symbol,
//       interval,
//       startTime,
//       endTime,
//       numberOfCandles
//     );
//   } catch (error) {
//     logger.error('Error getting candles', error);
//     candles = [];    
//   }

//   return candles;
// };


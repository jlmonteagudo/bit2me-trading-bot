import { logger } from '../../bot/core/logger.js';

export const checkTrailingStopLoss = async () => {
  logger.info('Checking trailing stop loss');
  /*
    En la estrategia están definidos los porcentajes del trailing stop loss, 
    pero la validación del trailing estaŕa en el bot en el domain position
  */
};

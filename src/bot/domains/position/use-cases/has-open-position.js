import { logger } from '../../../core/logger.js';

export const hasOpenPosition = async () => {
  logger.info('Checking if has open position');
  return false;
  /*
  - es un comando del sistema de trading
  - consultará la BD SQLITE a ver si hay una posición abierta
  - la posición tendrá un campo status (open, closed, canceled)
  - la posición tendrá un campo con el ID de la orden market de compra
  - la posición tendrá un campo con el ID de la orden stop limit de venta
  - la función confirmará que la orden stop limit sigue abierta. si no sigue abierta, cancelará la posición
*/
};

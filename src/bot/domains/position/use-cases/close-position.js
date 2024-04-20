import { updatePosition } from './update-position.js';

export const closePosition = async (position, exitOrder) => {
  position.status = exitOrder.status === 'filled' ? 'closed' : exitOrder.status;
  position.exitPrice = exitOrder.price;
  position.exitQuoteAmount = exitOrder.cost;
  position.profit =
    position.status === 'cancelled'
      ? 0
      : position.exitQuoteAmount - position.entryQuoteAmount;
  position.exitDatetime = new Date().getTime();

  await updatePosition(position);
};

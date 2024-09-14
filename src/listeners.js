import { listenCreatePosition } from './domains/positions/listeners/create-position.listener.js'
import { listenClosePosition } from './domains/positions/listeners/close-position.listener.js'

export const initialize = () => {
  listenCreatePosition();
  listenClosePosition();
};

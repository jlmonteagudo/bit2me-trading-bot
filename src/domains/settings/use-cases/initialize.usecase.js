import * as simulationListener from '../listeners/simulation-settings.listener.js';
import * as productionListener from '../listeners/production-settings.listener.js';

export const initialize = () => {
  simulationListener.listen();
  productionListener.listen();
}

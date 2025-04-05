import * as bit2meConnector from './bit2me.js';
import * as ccxtConnector from './ccxt.js';

export let connector;

export const initialize = async (exchangeId) => {
    if (exchangeId === 'bit2me') {
        connector = bit2meConnector;
    }
    else {
        connector = ccxtConnector;
        await connector.initialize(exchangeId);
    }
};

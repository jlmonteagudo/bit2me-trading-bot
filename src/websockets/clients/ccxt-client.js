import { exchange } from '../../conector/ccxt.js';
import * as websocketServer from '../server.js';
import { websocketDataEventEmitter } from '../../core/events/event-emitters.js';
import { Events } from '../../core/events/events.js';

const ORDER_BOOK_LIMIT = 20;

let connected = false;

export const connect = async (symbol) => {
    await exchange.watchOrderBook(symbol, ORDER_BOOK_LIMIT);
    connected = true;

    while (true && connected) {
        const orderBook = exchange.orderbooks[symbol].limit(ORDER_BOOK_LIMIT);
        await exchange.sleep (1000);
        // websocketServer.broadcast(JSON.stringify(orderBook));
        websocketDataEventEmitter.emit(Events.WebsocketDataReceived, JSON.stringify(orderBook));
    }
};

export const disconnect = (symbol) => {
    exchange.unWatchOrderBook(symbol);
    connected = false;
};

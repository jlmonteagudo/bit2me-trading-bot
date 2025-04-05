import { EventEmitter } from 'node:events';
import { Events } from './events.js';

export const websocketDataEventEmitter = new EventEmitter();

export const orderBookEventEmitter = new EventEmitter();

export const newPositionOpenEventEmitter = new EventEmitter();

websocketDataEventEmitter.on(Events.WebsocketDataReceived, (data) => {
  const parsedData = JSON.parse(data.toString('utf-8'));
  if (isOrderBookEvent(parsedData))
    orderBookEventEmitter.emit(Events.OrderBookReceived, parsedData);
});

const isOrderBookEvent = (data) => {
  return (data.event === Events.OrderBookReceived || (!!data.bids && !!data.asks));
};

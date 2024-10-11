import { EventEmitter } from 'node:events';
import { Events } from './events.js';

export const websocketDataEventEmitter = new EventEmitter();

export const orderBookEventEmitter = new EventEmitter();

websocketDataEventEmitter.on(Events.WebsocketDataReceived, (data) => {
  const parsedData = JSON.parse(data.toString('utf-8'));
  if (parsedData.event === Events.OrderBookReceived)
    orderBookEventEmitter.emit(Events.OrderBookReceived, parsedData.data);
});


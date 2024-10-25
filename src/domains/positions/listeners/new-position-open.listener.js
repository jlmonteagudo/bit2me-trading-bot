import { newPositionOpenEventEmitter } from '../../../core/events/event-emitters.js';
import { Events } from '../../../core/events/events.js';
import * as websocketClient from '../../../websockets/client.js';


export const listenNewPositionOpen = () => {
  newPositionOpenEventEmitter.on(Events.NewPositionOpen, (data) => {
    websocketClient.connect(data.symbol);
  });
};

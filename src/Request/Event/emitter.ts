import {EventEmitter as _EventEmitter} from "events";


type EventReceiver<T> = (params: T) => void;


export class EventEmitter<T extends string | symbol,K> {

    private emitter = new _EventEmitter();

    on(eventName: T, fn: EventReceiver<K>) {
      this.emitter.on(eventName, fn);
    }

    off(eventName: T, fn: EventReceiver<K>) {
      this.emitter.off(eventName, fn);
    }

    emit(eventName: T, params: K) {
      this.emitter.emit(eventName, params);
    }
}



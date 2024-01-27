import * as T from "./types.js";

export default class Listeners {
    currentListener: T.ListenerFn | null;
    isBulkUpdate: boolean;
    listenerProperties: Set<string | symbol>;
    statesMap: T.GlobalListenersMap;
    listenersQueue: T.ListenersSet;

    constructor() {
        this.currentListener = null;
        this.isBulkUpdate = false;
        this.listenerProperties = new Set<string | symbol>();
        this.statesMap = new WeakMap();
        this.listenersQueue = new Set([]);
    }

    static createPropertiesMap(): T.PropertiesMap {
        return new Map([]);
    }

    static createListenersSet(): T.ListenersSet {
        return new Set([]);
    }

    getPropertiesMap(instance: object): T.PropertiesMap {
        if (this.statesMap.has(instance)) {
            return this.statesMap.get(instance);
        }
        this.statesMap.set(instance, Listeners.createPropertiesMap());
        return this.statesMap.get(instance);
    }

    clearCurrentListener() {
        this.currentListener = null;
    }

    clearCurrentListenerProperties() {
        this.listenerProperties.clear();
    }

    runBulkUpdate(cb: T.ListenerFn) {
        this.isBulkUpdate = true;
        cb();
        for (const callback of this.listenersQueue) {
            callback();
        }
        this.listenersQueue.clear();
        this.isBulkUpdate = false;
    }
}

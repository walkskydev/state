/**
 * @typedef {(...args: any[]) => any} ListenerFn
 * @typedef {Set<ListenerFn>} ListenersSet
 * @typedef {Map<string | symbol, ListenersSet>} PropertiesMap
 * @typedef {WeakMap<object, PropertiesMap>} GlobalListenersMap
 */

export default class Listeners {
    /**
     * @type {ListenerFn|null}
     */
    currentListener;

    /**
     * @type {boolean}
     */
    isBulkUpdate;

    /**
     * @type {Set<string | symbol>}
     */
    listenerProperties;

    /**
     * @type {GlobalListenersMap}
     */
    statesMap;

    /**
     * @type {ListenersSet}
     */
    listenersQueue;

    constructor() {
        this.currentListener = null;
        this.isBulkUpdate = false;
        this.listenerProperties = new Set();
        this.statesMap = new WeakMap();
        this.listenersQueue = new Set();
    }

    /**
     * @returns {PropertiesMap}
     */
    static createPropertiesMap() {
        return new Map();
    }

    /**
     * @returns {ListenersSet}
     */
    static createListenersSet() {
        return new Set();
    }

    /**
     * @param {object} instance
     * @returns {PropertiesMap}
     */
    getPropertiesMap(instance) {
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

    /**
     * @param {ListenerFn} cb
     */
    runBulkUpdate(cb) {
        this.isBulkUpdate = true;
        cb();
        for (const callback of this.listenersQueue) {
            callback();
        }
        this.listenersQueue.clear();
        this.isBulkUpdate = false;
    }
}
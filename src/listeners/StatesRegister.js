/**
 * @typedef {() => void} ListenerFn
 * @typedef {Set<ListenerFn>} ListenersSet
 * @typedef {Map<string | symbol, ListenersSet>} PropertiesMap
 * @typedef {WeakMap<object, PropertiesMap>} GlobalListenersMap
 */

export default class Listeners {
    /**
     * Listener callback which one executed right now and run the getter Proxy Trap
     * @type {ListenerFn|null}
     */
    currentListener = null;

    /**
     * bulkUpdate triggered from setState. Used to avoid executing each field listeners in multiple fields update
     * @type {boolean}
     */
    isBulkUpdate = false;

    /**
     * @type {GlobalListenersMap}
     */
    statesMap= new WeakMap();

    /**
     * @type {ListenersSet}
     */
    listenersQueue= new Set();

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
     * Return state properties
     * @param {object} state
     * @returns {PropertiesMap}
     */
    getPropertiesMap(state) {
        if (this.statesMap.has(state)) {
            return this.statesMap.get(state);
        }
        this.statesMap.set(state, Listeners.createPropertiesMap());
        return this.statesMap.get(state);
    }

    clearCurrentListener() {
        this.currentListener = null;
    }

    /**
     * Unsubscribes a callback from all listeners associated with a given state.
     *
     * @param {Function} cb - The callback function to unsubscribe.
     * @param {object} state - The state object.
     *
     * @return {void}
     */
    unsubscribe(cb, state) {
        const props = this.getPropertiesMap(state);
        for (const [, listeners] of props) {
            listeners.delete(cb)
        }
    }


    /**
     * Bulk update means a multiple state properties will be updated
     * when callback has been executed - it means getter Proxy trap collect all  callbacks from changed keys to
     * 'listenersQueue'. What means than now listeners could be executed
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

    /**
     * Sets the currentListener which was executed and use getters on proxy traps
     * @param {ListenerFn} listener The listener function.
     */
    setCurrentListener(listener) {
        this.currentListener = listener;
    }
}
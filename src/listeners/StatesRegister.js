/**
 * @namespace listenerNamespace
 * @{
 */

/**
 * A function with no parameters and no return value.
 * @callback ListenerFn
*/
/**
 * Set with listeners
 * @typedef {Set<ListenerFn>} ListenersSet
*/
/**
 * A map that holds observable properties
 * @typedef {Map<string | symbol, ListenersSet>} PropertiesMap
 */
/**
 * WeakMap with all states instances
 * @typedef {WeakMap<object, PropertiesMap>}  GlobalListenersMap
 */

/**
 * A class that manages listeners.
 * @class
 * @name Listeners
 * @{
 */
export default class Listeners {

    /**
     * Currently running listener callback.
     * This callback is executed when the getter Proxy Trap runs.
     * @type {ListenerFn|null}
     */
    currentListener = null;

    /**
     * Flag to indicate if a bulk update is currently in progress.
     * This is used to avoid executing each field listener in case of a multiple fields update.
     * @type {boolean}
     */
    isBulkUpdate = false;

    /**
     * Global Map storing all states instances.
     * @type {GlobalListenersMap}
     */
    statesMap = new WeakMap();

    /**
     * Queue to store listeners that will be processed.
     * @type {ListenersSet}
     */
    listenersQueue = new Set();

    /**
     * Creates a new PropertiesMap instance.
     *
     * @returns {PropertiesMap}
     */
    static createPropertiesMap() {
        return new Map();
    }

    /**
     * Creates a new ListenersSet instance.
     *
     * @returns {ListenersSet}
     */
    static createListenersSet() {
        return new Set();
    }

    /**
     * Returns a properties map related to a specific state.
     * If the state doesn't exist in the statesMap, a new entry will be created.
     *
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

    /**
     * Clears the currentListener field.
     */
    clearCurrentListener() {
        this.currentListener = null;
    }

    /**
     * Unsubscribes a callback from all listeners associated with a given state.
     *
     * @param {ListenerFn} cb - The callback function to unsubscribe.
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
     * Executes a bulk update operation.
     * All listeners related to the state properties being modified during the callback execution
     * will be added to the listenersQueue. These listeners will be then executed after the callback has finished.
     *
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
     * Sets the currentListener field.
     * This method is used when getters on proxy traps are invoked.
     *
     * @param {ListenerFn} listener The listener function.
     */
    setCurrentListener(listener) {
        this.currentListener = listener;
    }
}

/** @} */
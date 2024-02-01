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
 * PropertiesMap type represents a Map that pairs property keys to ListenersSet values.
 * @typedef {Map<string | symbol, ListenersSet>} PropertiesMap
 */
/**
 * WeakMap with all states instances
 * @typedef {WeakMap<object, PropertiesMap>}  GlobalListenersMap
 */

import callbackExecutor from '../listenerExecutor.js';

/**
 * A class that manages states with properties listeners.
 * @class
 * @name StatesRegister
 * This class manages the listeners for state changes.
 */
export default class StatesRegister {

    /**
     * Flag indicating whether a bulk update is in progress.
     * It helps to prevent executing each listener during multi-field updates.
     * @type {boolean}
     */
    isBulkUpdate = false;

    /**
     * Global Map storing all states instances.
     * @type {GlobalListenersMap}
     */
    statesMap = new WeakMap();

    /**
     * Queue for storing listeners for execution.
     * @type {ListenersSet}
     */
    listenersQueue = new Set();

    /**
     * Helper method that creates a new PropertiesMap.
     *
     * @returns {Map} A new instance of PropertiesMap.
     */
    static createPropertiesMap() {
        return new Map();
    }

    /**
     * Helper method that creates a new ListenersSet.
     *
     * @returns {Set} A new instance of ListenersSet.
     */
    static createListenersSet() {
        return new Set();
    }

    /**
     * Fetches the PropertiesMap associated with a state.
     *
     * @param {object} state - State to get PropertiesMap from.
     * @returns {PropertiesMap} The PropertiesMap of the given state. Creates a new PropertiesMap if it doesn't exist.
     */
    getStatePropertiesMap(state) {
        if (this.statesMap.has(state)) {
            return this.statesMap.get(state);
        }
        this.statesMap.set(state, StatesRegister.createPropertiesMap());
        return this.statesMap.get(state);
    }


    /**
     * Unsubscribes a given listener callback from all listeners across the state.
     *
     * @param {ListenerFn} cb - The callback function to unsubscribe.
     * @param {State} state - The state object.
     */
    unsubscribe(cb, state) {
        const props = this.getStatePropertiesMap(state);
        for (const [, listeners] of props) {
            listeners.delete(cb)
        }
    }

    /**
     * Executes a bulk state update. Adds all listeners related to the state properties being modified during the callback
     * to the listenersQueue. After the callback execution, these listeners are executed.
     *
     * @param {ListenerFn} bulkUpdateTrigger - A function that triggers proxy setters.
     */
    runBulkUpdate(bulkUpdateTrigger) {
        this.isBulkUpdate = true;
        bulkUpdateTrigger();

        for (const callback of this.listenersQueue) {
            callbackExecutor.execute(callback)
        }

        this.listenersQueue.clear();
        this.isBulkUpdate = false;
    }

}

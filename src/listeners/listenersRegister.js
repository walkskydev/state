/**
 * A function with no parameters and no return value.
 * @callback ListenerFn
 *
 * Set with listeners
 * @typedef {Set<ListenerFn>} ListenersSet
 *
 * PropertiesMap type represents a Map that pairs property keys to ListenersSet values.
 * @typedef {Map<string | symbol, ListenersSet>} PropertiesMap
 *
 * WeakMap with all states instances
 * @typedef {WeakMap<object, PropertiesMap>}  GlobalListenersMap
 */

/**
 * A class that manages states with properties listeners.
 * @class
 * @name ListenersRegister
 * This class manages the listeners for state changes.
 */
class ListenersRegister {
	/**
	 * Global Map storing all states instances.
	 * @type {GlobalListenersMap}
	 */
	statesMap = new WeakMap();
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
		this.statesMap.set(state, new Map());
		return this.statesMap.get(state);
	}
	/**
	 * Unsubscribes a given listener callback from all listeners across the state.
	 *
	 * @param {ListenerFn} cb - The callback function to unsubscribe.
	 * @param {object} state - The state object.
	 */
	unsubscribe(cb, state) {
		const props = this.getStatePropertiesMap(state);
		for (const [, listeners] of props) {
			listeners.delete(cb);
		}
	}
}

export default new ListenersRegister();

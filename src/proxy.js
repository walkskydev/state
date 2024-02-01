import listenerExecutor from "./Executor.js";
import ListenersRegister from "./listeners/ListenersRegister.js";

/**
 * @typedef {Object} HandlerParams
 * @property {object} target - Original object that actions are performed upon.
 * @property {string|symbol} property - The property key which is being set or accessed.
 * @property {object} [state] - Optional state object.
 * @property {ListenersRegister} statesRegister - ListenersRegister instance for keeping track of state changes.
 * @property {unknown} [value] - Optional new value being assigned to the property.
 */

/**
 * Attempts to set a new property value, then triggers property listeners. If performing a bulkUpdate, listeners will be queued and executed later.
 * @param {HandlerParams} params - An object containing parameters needed for property setting and listener execution.
 * @return {boolean} Reflects the result (success or failure) of the property setting operation.
 */
const createSetTrap = ({ target, property, value, state, statesRegister }) => {
	const statePropertiesMap = statesRegister.getStatePropertiesMap(state);

	if (listenerExecutor.listener) {
		console.warn(
			`A callback function is currently executing at this store. Setting property '${property}' is not allowed until the current execution finishes.`,
		);

		statesRegister.unsubscribe(listenerExecutor.listener, state);

		return true;
	}

	const result = Reflect.set(target, property, value);

	if (statePropertiesMap.has(property)) {
		if (listenerExecutor.isBulkUpdate) {
			for (const listener of statePropertiesMap.get(property)) {
				listenerExecutor.addToQueue(listener);
			}
		} else {
			for (const listener of statePropertiesMap.get(property)) {
				listenerExecutor.execute(listener);
			}
		}
	}
	return result;
};

/**
 * Get handler retrieves a property from the target, ties the property to the state, and
 * If a currentListener is present, it signifies that this listener needs to be added to the property listeners.
 *
 * @param {HandlerParams} params - The parameters required for the get operation.
 * @return {unknown} The value of the property being accessed.
 */
const createGetTrap = ({ target, property, state, statesRegister }) => {
	const statePropertiesMap = statesRegister.getStatePropertiesMap(state);

	if (!statePropertiesMap.has(property)) {
		statePropertiesMap.set(property, ListenersRegister.createListenersSet());
	}

	const propertyListeners = statePropertiesMap.get(property);

	if (listenerExecutor.listener) {
		if (!propertyListeners.has(listenerExecutor.listener)) {
			propertyListeners.add(listenerExecutor.listener);
		}
	}

	return Reflect.get(target, property);
};

/**
 * Constructs a proxy handler for a state object with prescribed set and get actions that interact with the ListenersRegister.
 * @param {object} state - The state object to be handled.
 * @param {ListenersRegister} statesRegister - The ListenersRegister handling the state object.
 * @return {ProxyHandler<object>} The generated proxy handler object.
 */
const createProxyHandler = (state, statesRegister) => {
	return {
		set: (target, property, value) =>
			createSetTrap({ target, property, value, state, statesRegister }),
		get: (target, property) =>
			createGetTrap({ target, property, state, statesRegister }),
	};
};

/**
 * Generates a Proxy for a state instance and raw object, enforcing set and get rules defined by the ListenersRegister.h
 *
 * @param {object} rawObj - The raw (unproxied) object.
 * @param {object} stateInstance - The instance of the state that the proxy represents.
 * @param {ListenersRegister} statesRegister - The ListenersRegister instance managing state instances.
 * @return {object} The new Proxy object.
 */
export function createProxy(rawObj, stateInstance, statesRegister) {
	return new Proxy(
		{ ...rawObj },
		createProxyHandler(stateInstance, statesRegister),
	);
}

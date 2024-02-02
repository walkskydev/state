import callbackExecutor from "./listeners/callbackExecutor.js";

/**
 * @typedef {import('./listeners/listenersRegister.js').default} ListenerRegister
 */

/**
 * @typedef {object} CreateTrapParameters
 * @property {object} state - The state object of the store.
 * @property {ListenerRegister} statesRegister - The listeners register instance.
 */

/**
 * @template {object} T
 * @param {T} rawObj - The raw object to create a proxy for.
 * @param {object} state - The state to create the proxy handler for.
 * @param {ListenerRegister} statesRegister - The listeners register instance.
 *
 * @returns {T} - The created proxy.
 */
export function createProxy(rawObj, state, statesRegister) {
	return new Proxy({ ...rawObj }, createProxyHandler(state, statesRegister));
}

/**
 * Creates a proxy handler with traps.
 *
 * @param {object} state - The state to create the proxy handler for.
 * @param {ListenerRegister} statesRegister - The listeners register instance.
 *
 * @returns {object} - The created proxy handler.
 */
const createProxyHandler = (state, statesRegister) => {
	return {
		/***
		 * @param {object} target - The target object.
		 * @param {string} property - The property to set the value on.
		 * @param {unknown} value - The value to set on the property.
		 * @return {boolean} - Indicates whether the value was successfully set on the property.
		 */
		set: (target, property, value) =>
			createSetTrap({ target, property, value, state, statesRegister }),

		/**
		 * Retrieves the value of a property from a target object using the
		 * get trap.
		 *
		 * @param {object} target - The target object to retrieve the property from.
		 * @param {string} property - The name of the property to retrieve.
		 * @returns {*} - The value of the property.
		 */
		get: (target, property) =>
			createGetTrap({ target, property, state, statesRegister }),
	};
};

/**
 * Creates a trap function for setting properties on an object, with additional functionality for managing state.
 *
 * @param {object} params - The parameters for the trap function.
 * @param {object} params.target - The target object on which the property is being set.
 * @param {string|symbol} params.property - The name or symbol of the property being set.
 * @param {unknown} params.value - The value being set for the property.
 * @param {Object} params.state - The current state object.
 * @param {ListenerRegister} params.statesRegister - The statesRegister object responsible for managing states.
 *
 * @returns {boolean} - Returns the result of the property set operation.
 */
const createSetTrap = ({ target, property, value, state, statesRegister }) => {
	const statePropertiesMap = statesRegister.getStatePropertiesMap(state);

	if (callbackExecutor.activeCallback) {
		console.warn(
			// @ts-ignore
			`A callback function is currently executing at this store. Setting property '${property}' is not allowed.`,
		);

		statesRegister.unsubscribe(callbackExecutor.activeCallback, state);

		return true;
	}

	const result = Reflect.set(target, property, value);

	if (statePropertiesMap.has(property)) {
		for (const listener of statePropertiesMap.get(property)) {
			callbackExecutor.pushToPending(listener);
		}
	}
	return result;
};

/**
 * Registers a get trap for a target object.
 *
 * @param {object} options - The options for creating the get trap.
 * @param {object} options.target - The target object.
 * @param {string} options.property - The property to get.
 * @param {object} options.state - The state to use for registering the property.
 * @param {ListenerRegister} options.statesRegister - The states register object.
 *
 * @returns {*} - The value retrieved from the target object.
 */
const createGetTrap = ({ target, property, state, statesRegister }) => {
	const statePropertiesMap = statesRegister.getStatePropertiesMap(state);

	if (!statePropertiesMap.has(property)) {
		statePropertiesMap.set(property, new Set());
	}

	const propertyListeners = statePropertiesMap.get(property);

	if (callbackExecutor.activeCallback) {
		if (!propertyListeners.has(callbackExecutor.activeCallback)) {
			propertyListeners.add(callbackExecutor.activeCallback);
		}
	}

	return Reflect.get(target, property);
};

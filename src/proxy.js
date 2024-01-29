import StatesRegister from "./listeners/StatesRegister.js";

/**
 * @typedef {Object} HandlerParams
 * @property {object} target - The target object.
 * @property {string|symbol} property - The property to set or get.
 * @property {object} [state] - The state object.
 * @property {StatesRegister} statesRegister - The StatesRegister instance.
 * @property {unknown} [value] - The new value for the property.
 */

/**
 * @param {HandlerParams} params The parameters for the set handler.
 * @return {boolean} The result of setting the property.
 */
const setHandler = ({ target, property, value, state, statesRegister }) => {
	const result = Reflect.set(target, property, value);
	const statePropertiesMap = statesRegister.getPropertiesMap(state);
	if (statePropertiesMap.has(property)) {
		if (statesRegister.isBulkUpdate) {
			for (const listener of statePropertiesMap.get(property)) {
				statesRegister.listenersQueue.add(listener);
			}
		} else {
			for (const listener of statePropertiesMap.get(property)) {
				listener();
			}
		}
	}
	return result;
};

/**
 * @param {HandlerParams} params The parameters for the get handler.
 * @return {unknown} The value of the property.
 */
const getHandler = ({ target, property, state, statesRegister }) => {
	const statePropertiesMap = statesRegister.getPropertiesMap(state);
	if (!statePropertiesMap.has(property)) {
		statePropertiesMap.set(property, StatesRegister.createListenersSet());
	}
	const propertyListeners = statePropertiesMap.get(property);
	if (
		statesRegister.currentListener &&
		!propertyListeners.has(statesRegister.currentListener)
	) {
		propertyListeners.add(statesRegister.currentListener);
	}
	statesRegister.listenerProperties.add(property);
	return Reflect.get(target, property);
};

/**
 * @param {object} state The state object.
 * @param {StatesRegister} statesRegister The StatesRegister instance.
 * @return {ProxyHandler<object>} The proxy handler.
 */
const createProxyHandler = (state, statesRegister) => {
	return {
		set: (target, property, value) =>
			setHandler({ target, property, value, state, statesRegister }),
		get: (target, property) =>
			getHandler({ target, property, state, statesRegister }),
	};
};

/**
 * @template T
 * @param {object} rawObj The raw object.
 * @param {object} stateInstance The state instance.
 * @param {StatesRegister} statesRegister The StatesRegister instance.
 * @return {T} The proxy.
 */
export function createProxy(rawObj, stateInstance, statesRegister) {
	return new Proxy(
		{ ...rawObj },
		createProxyHandler(stateInstance, statesRegister),
	);
}

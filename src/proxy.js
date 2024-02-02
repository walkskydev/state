import callbackExecutor from "./listeners/callbackExecutor.js";

/**
 * @typedef {import("./listeners/listenersRegister.js").default} ListenerRegister
 */

/**
 * @template T
 * @param {T} rawObj the state to create the proxy handler for
 * @param {object} state the state to create the proxy handler for
 * @param {ListenerRegister} statesRegister the listeners register instance
 *
 * @returns {T}
 */
export function createProxy(rawObj, state, statesRegister) {
	return new Proxy({ ...rawObj }, createProxyHandler(state, statesRegister));
}

const createProxyHandler = (state, statesRegister) => {
	return {
		set: (target, property, value) =>
			createSetTrap({ target, property, value, state, statesRegister }),
		get: (target, property) =>
			createGetTrap({ target, property, state, statesRegister }),
	};
};

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

import callbackExecutor from "./listeners/callbackExecutor.js";

/**
 * @typedef {import('./listeners/listenersRegister.js').default} ListenerRegister
 * @typedef {ListenerRegister} statesRegister - The listeners register instance.
 */

/**
 * @template {object} T
 * @param {T} originalTarget - The raw object to create a proxy for.
 * @param {object} state - The state to create the proxy handler for.
 * @param {ListenerRegister} statesRegister - The listeners register instance.
 *
 * @returns {T} - The created proxy.
 */
export function createProxy(originalTarget, state, statesRegister) {
	return new Proxy(originalTarget, {
		set: () => {
			return true;
			// const statePropertiesMap = statesRegister.getStatePropertiesMap(state);
			//
			// if (callbackExecutor.activeCallback) {
			// 	console.warn(
			// 		// @ts-ignore
			// 		`A callback function is currently executing at this store. Setting property '${property}' is not allowed.`,
			// 	);
			//
			// 	statesRegister.unsubscribe(callbackExecutor.activeCallback, state);
			//
			// 	return true;
			// }
			//
			// const result = Reflect.set(target, property, value);
			//
			// if (statePropertiesMap.has(property)) {
			// 	for (const listener of statePropertiesMap.get(property)) {
			// 		callbackExecutor.pushToPending(listener);
			// 	}
			// }
			// return result;
		},

		get: (target, property) => {
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

			return Reflect.get(originalTarget, property);
		},
	});
}

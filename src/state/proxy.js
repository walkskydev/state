import callbackExecutor from "../listeners/callbackExecutor.js";

/**
 * @typedef {import('../listeners/listenersRegister.js').default} ListenerRegister
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
		},

		get: (target, property) => {
			const statePropertiesMap = statesRegister.getStatePropertiesMap(state);

			if (!statePropertiesMap.has(property)) {
				statePropertiesMap.set(property, new Set());
			}

			const propertyListeners = statePropertiesMap.get(property);

			if (callbackExecutor.processingListener) {
				if (!propertyListeners.has(callbackExecutor.processingListener)) {
					propertyListeners.add(callbackExecutor.processingListener);
				}
			}

			return Reflect.get(originalTarget, property);
		},

		deleteProperty() {
			return true;
		},
	});
}

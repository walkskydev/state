import { autoTrackableObserver } from "../observers/listenersExecutor.js";
import { addObserver, getObserverBit } from "../observers/observers.js";

/**
 * @template {object} T
 * @param {T} originalTarget - The raw object to create a proxy for.
 * @param {Map<keyof T, [number, number]>} observers - The state to create the proxy handler for.
 *
 * @returns {T} - The created proxy.
 */
export function createProxy(originalTarget, observers) {
	return new Proxy(originalTarget, {
		set: () => {
			return true;
		},
		get: (target, property) => {
			const currentExecutor = autoTrackableObserver;

			if (currentExecutor !== null) {
				const [index, bit] = addObserver(currentExecutor);

				observers.set(property, [index, (observers.get(property) || 0) | bit]);
			}

			return Reflect.get(originalTarget, property);
		},

		deleteProperty() {
			return true;
		},
	});
}

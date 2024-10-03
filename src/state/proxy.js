import { autoTrackableObserver } from "../observers/executeTrackableObserver.js";
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
			if (autoTrackableObserver.length > 0) {
				const current = autoTrackableObserver.at(-1);

				// @ts-ignore
				if (getObserverBit(current) === undefined) {
					// @ts-ignore
					const [index, bit] = addObserver(current);

					// @ts-ignore
					observers.set(property, [
						index,
						// @ts-ignore
						(observers.get(property) || 0) | bit,
					]);
				}
			}

			return Reflect.get(originalTarget, property);
		},

		deleteProperty() {
			return true;
		},
	});
}

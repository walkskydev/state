import { autoTrackableObserver } from "../observers/executeTrackableObserver.js";
import {
	addObserver,
	isObserverHasRegistered,
} from "../observers/observers.js";

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
			// todo: move it to microtask
			if (autoTrackableObserver.length > 0) {
				const current = autoTrackableObserver.at(-1);

				// @ts-ignore
				if (!isObserverHasRegistered(current)) {
					// @ts-ignore
					const observerBitAddress = addObserver(current);

					if (observerBitAddress !== undefined) {
						const [index, bit] = observerBitAddress;
						// @ts-ignore
						observers.set(property, [
							index, // todo: BUG - this will rewrite previous index if index will be increased
							// @ts-ignore
							(observers.get(property) || 0) | bit,
						]);
					}
				}
			}

			return Reflect.get(originalTarget, property);
		},

		deleteProperty() {
			return true;
		},
	});
}

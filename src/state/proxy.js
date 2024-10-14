import { autoTrackableObserver } from "../observers/executeTrackableObserver.js";
import { addObserver } from "../observers/observers.js";

/**
 * @typedef {import('./index.js').LocalStateObservers} LocalStateObservers
 */

/**
 *
 * @param {String} property
 * @param {LocalStateObservers} map
 * @return {(index: number, bit: number) => void}
 */
function createStateObserverCleaner(property, map) {
	/**
	 * @param {number} index
	 * @param {number} bit
	 */
	return (index, bit) => {
		const currentBit = map.get(property)?.get(index);

		if (currentBit !== undefined && (currentBit & bit) !== 0) {
			map.set(property, new Map([[index, currentBit ^ bit]]));
		}
	};
}

/**
 * @template {object} T
 * @param {T} originalTarget - The raw object to create a proxy for.
 * @param {LocalStateObservers} stateLocalObservers - The state to create the proxy handler for.
 *
 * @returns {T} - The created proxy.
 */
export function createProxy(originalTarget, stateLocalObservers) {
	return new Proxy(originalTarget, {
		set: () => {
			return true;
		},
		/** @param {string} property
		 * @template {object} T
		 * @param {T} target
		 */
		get: (target, property) => {
			// todo: move it to microtask
			if (autoTrackableObserver.length > 0) {
				const current = autoTrackableObserver.at(-1);

				const observerBitAddress = addObserver(
					// @ts-ignore
					current,
					createStateObserverCleaner(property, stateLocalObservers),
				);

				if (observerBitAddress !== undefined) {
					const [index, bit] = observerBitAddress;

					if (!stateLocalObservers.has(property)) {
						stateLocalObservers.set(property, new Map());
					}

					const bitsMap = stateLocalObservers.get(property);
					if (!bitsMap?.has(index)) {
						// @ts-ignore
						bitsMap.set(index, bit);
					} else {
						const currentMask = bitsMap.get(index);
						// @ts-ignore
						bitsMap?.set(index, currentMask | bit);
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

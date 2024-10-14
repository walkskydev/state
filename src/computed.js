/**
 * @typedef {() => void} Callback
 */

// import {computed} from 'mobx'
import { executeTrackableObserver } from "./observers/executeTrackableObserver.js";
import { isObserverInExecutionQueue } from "./observers/executionObserversQueue.js";
import { getObserversBit } from "./observers/observers.js";

/**
 * @param {Callback} observer
 */
export function computed(observer) {
	/** @type {unknown} */
	let cachedValue;
	cachedValue = executeTrackableObserver(observer);
	const bits = getObserversBit(observer);

	return () => {
		if (!bits) return cachedValue;
		const shouldRecall = isObserverInExecutionQueue(bits);

		if (shouldRecall) {
			const temp = true;
			if (temp) {
				cachedValue = observer();
			}
		}
		return cachedValue;
	};
}

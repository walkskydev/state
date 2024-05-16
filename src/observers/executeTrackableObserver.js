/**
 * @typedef {() => void} Callback
 */

/**
 * Active subscription observer
 * @type {Callback | null}
 */
export let autoTrackableObserver = null;
/**
 *
 * @param {Callback} callback
 * @return {*}
 */
export const executeTrackableObserver = (callback) => {
	autoTrackableObserver = callback;

	const result = callback();
	autoTrackableObserver = null;

	return result;
};

/**
 * @typedef {() => void} Callback
 */

/**
 * Active subscription observer
 * @type {Array<Callback>}
 */
export const autoTrackableObserver = [];
/**
 *
 * @param {Callback} callback
 * @return {*}
 */
export const executeTrackableObserver = (callback) => {
	autoTrackableObserver.push(callback);

	try {
		return callback();
	} finally {
		autoTrackableObserver.pop();
	}
};

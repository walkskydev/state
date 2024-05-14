/**
 * @typedef {() => void} callback
 */

/**
 *  CallbackExecutor is designed to manage listeners and setters execution. It helps to merge setters and listeners into one updating cycle
 */
class ListenersExecutor {
	/**
	 * Represents the current callback function under execution.
	 * Stores `null` if no function is being executed
	 *
	 * @type {callback | null} processingListener
	 */
	processingListener = null;

	/**
	 * Set storing pending listeners.
	 * @type {Set<callback>}
	 */
	#pendingListeners = new Set();

	/**
	 * Adds given callback to pendingCallbacks
	 * or immediately executes it based on isBatchUpdateMode
	 *
	 * @param {callback} callback - Callback to be added to pending or executed directly
	 */
	pushToPending(callback) {
		this.#pendingListeners.add(callback);
	}
	/**
	 * Executes the given listener. And set public property 'processingListener' to help understand which listeners is executing now
	 *
	 * @param {callback} callback - The function to be executed
	 * @return {*}
	 */
	executeListener = (callback) => {
		this.processingListener = callback;
		const result = callback();
		this.processingListener = null;
		return result;
	};

	/**
	 * Executes all pending callback functions and then clears the queue.
	 */
	#executeListenersQueue = () => {
		for (const callback of this.#pendingListeners)
			this.executeListener(callback);
		this.#pendingListeners.clear();
	};

	/**
	 * Execute setter
	 * @param {callback} setter - The function to be executed
	 */
	runUpdate = (setter) => {
		setter();

		queueMicrotask(this.#executeListenersQueue);

		this.#pendingListeners.clear();
	};
}

export default new ListenersExecutor();

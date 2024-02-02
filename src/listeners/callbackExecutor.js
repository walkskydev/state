/**
 * Represents an executor for callback events.
 */
class CallbackExecutor {
	/**
	 * The currently executing callback function.
	 * Stores `null` if no function is being executed
	 *
	 * @property {Function | null} activeCallback
	 */
	activeCallback = null;

	// Specifies whether the executor is currently in batch update mode or not
	isBatchUpdateMode = false;

	// Set of callbacks awaiting to be executed when batch update mode ends
	#pendingCallbacks = new Set();

	/**
	 * Adds given callback to pendingCallbacks
	 * or directly executes it based on isBatchUpdateMode
	 *
	 * @param {function} callback - Callback to be added to pending or executed directly
	 */
	pushToPending(callback) {
		if (this.isBatchUpdateMode) {
			this.#pendingCallbacks.add(callback);
		} else {
			this.execute(callback);
		}
	}

	/**
	 * A private setter function to update the executing function of activeCallback.
	 *
	 * @param {Function} fn - New function to be executed by activeCallback
	 */
	#setActiveCallback(fn) {
		this.activeCallback = fn;
	}

	/**
	 * Executes the provided callback.
	 * It stores the callback in activeCallback, executes it,
	 * and then cleans activeCallback (sets it to null)
	 *
	 * @param {function} callback - The function to be executed
	 * @return {void}
	 */
	execute(callback) {
		this.#setActiveCallback(callback);
		callback();
		this.#setActiveCallback(null);
	}

	/**
	 * A private function to execute all pending callback functions.
	 */
	#executeQueue() {
		for (const callback of this.#pendingCallbacks) callback();
	}

	/**
	 * The function to execute when entering batch update mode.
	 * It executes a function, the queue of pending callbacks
	 * and then cleans up before exiting the batch update mode.
	 *
	 * @param {function} setter - The function to be executed
	 */
	runBatchUpdate(setter) {
		this.isBatchUpdateMode = true;

		// execute the function provided
		setter();

		// execute all pending callbacks
		this.#executeQueue();

		// cleanup
		this.#pendingCallbacks.clear();
		this.isBatchUpdateMode = false;
	}
}

export default new CallbackExecutor();

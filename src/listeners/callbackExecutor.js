/**
 * @typedef {() => void} callback
 */


/**
 * Represents an executor for callback events.
 */
class CallbackExecutor {
	/**
	 * The currently executing callback function.
	 * Stores `null` if no function is being executed
	 *
	 * @type {callback | null} activeCallback
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
	 * @param {callback} callback - Callback to be added to pending or executed directly
	 */
	pushToPending(callback) {
		this.#pendingCallbacks.add(callback);
	}

	/**
	 * A private setter function to update the executing function of activeCallback.
	 *
	 * @param {callback | null} fn - New function to be executed by activeCallback
	 */
	#setActiveCallback(fn) {
		this.activeCallback = fn;
	}

	/**
	 * Executes the provided callback.
	 * It stores the callback in activeCallback, executes it,
	 * and then cleans activeCallback (sets it to null)
	 *
	 * @param {callback} callback - The function to be executed
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
		for (const callback of this.#pendingCallbacks) this.execute(callback);
		this.#pendingCallbacks.clear();
	}

	/**
	 * The function to execute when entering batch update mode.
	 * It executes a function, the queue of pending callbacks
	 * and then cleans up before exiting the batch update mode.
	 *
	 * @param {callback} setter - The function to be executed
	 */
	runUpdate(setter) {
		// execute all pending callbacks
		 if (!this.isBatchUpdateMode) {
			 setter();

			 this.#executeQueue();
			 this.#pendingCallbacks.clear();
		 } else {
			 this.#settersQueue.add(setter);
		 }
	}

	/**
	 * A queue for storing setter functions.
	 * @type {Set<callback>}
	 */
	#settersQueue = new Set();

	#executeSettersQueue() {
		for (const setter of this.#settersQueue) {
      setter();
    }
    this.#settersQueue.clear();
	}


	/**
	 * Multiple states update
	 * @param {callback[]} settersArray
	 */
	runBatchUpdate(settersArray) {
		this.isBatchUpdateMode = true;

		for (const setter of settersArray) {
			this.runUpdate(setter);
		}

		this.#executeQueue();
		this.#executeSettersQueue();

		this.isBatchUpdateMode = false;
	}
}

export default new CallbackExecutor();

/**
 * @typedef {() => void} callback
 */

/**
 *  CallbackExecutor is designed to manage listeners and setters execution. It helps to merge setters and listeners into one updating cycle
 */
class CallbackExecutor {
	/**
	 * Represents the current callback function under execution.
	 * Stores `null` if no function is being executed
	 *
	 * @type {callback | null} processingListener
	 */
	processingListener = null;

	/** indicates if the executor is in batch update mode. */
	#isBatchUpdateMode = false;
	/**
	 * Set storing pending listeners. This is mainly used when the executor is in batch update mode.
	 * @type {Set<callback>}
	 */
	#pendingListeners = new Set();
	/**
	 * A queue storing setter functions.
	 * @type {Set<callback>}
	 */
	#settersQueue = new Set();

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
	 * @return {void}
	 */
	executeListener(callback) {
		this.processingListener = callback;
		callback();
		this.processingListener = null;
	}

	/**
	 * Executes all pending callback functions and then clears the queue.
	 */
	#executeListenersQueue() {
		for (const callback of this.#pendingListeners) this.executeListener(callback);
		this.#pendingListeners.clear();
	}

	/**
	 * Execute setter or add it to 'settersQueue' bases on batch mode
	 * @param {callback} setter - The function to be executed
	 */
	runUpdate(setter) {
		// execute all pending callbacks
		 if (!this.#isBatchUpdateMode) {
			 setter();

			 this.#executeListenersQueue();
			 this.#pendingListeners.clear();
		 } else {
			 this.#settersQueue.add(setter);
		 }
	}

    /**
     * Executes all setter functions stored in the queue and then clears the queue.
     *
     */
    #executeSettersQueue() {
        for (const setter of this.#settersQueue) {
            setter();
        }
        this.#settersQueue.clear();
    }

    /**
     * Executes multiple updates at once in batch update mode.
     *
     * @param {callback[]} settersArray - An array of setter functions to be executed
     */
    batch(settersArray) {
        this.#isBatchUpdateMode = true;
        for (const setter of settersArray) {
            this.runUpdate(setter);
        }
        this.#executeListenersQueue();
        this.#executeSettersQueue();
        this.#isBatchUpdateMode = false;
    }
}

export default new CallbackExecutor();

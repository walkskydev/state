/**
 * Represents an executor for callback events.
 */
class ListenerExecutor {
	/**
	 * The callback function that the listener is currently executing.
	 * Null of no function is being executed
	 *
	 * @property {Function | null} listener
	 */
	listener = null;

	isBulkUpdate = false;

	#callbacksQueue = new Set();

	addToQueue(callback) {
		this.#callbacksQueue.add(callback);
	}

	/**
	 * Setter function for updating the executor function of the listener.
	 * @param {Function} fn - The function that will be used for execution by the listener.
	 */
	#setExecutor(fn) {
		this.listener = fn;
	}

	/**
	 * Method for executing a provided callback function.
	 * Before executing the callback, the execution state and executing function are updated.
	 * After execution, they are reset to their default states.
	 *
	 * @param {function} callback - The function to be executed by the listener.
	 * @return {void}
	 */
	execute(callback) {
		this.#setExecutor(callback);
		callback();
		this.#setExecutor(null);
	}

	runBulkUpdate(bulkUpdateTrigger) {
		this.isBulkUpdate = true;
		bulkUpdateTrigger();

		for (const callback of this.#callbacksQueue) {
			this.execute(callback);
		}

		this.#callbacksQueue.clear();
		this.isBulkUpdate = false;
	}
}

export default new ListenerExecutor();

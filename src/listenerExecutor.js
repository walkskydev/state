/**
 * Represents an executor for callback events.
 */
class ListenerExecutor {
	/**
	 * Indicates the execution state of the listener. i.e., whether it is currently in the process of executing a callback or not.
	 *
	 * @type {boolean}
	 */
	isCurrentlyExecuting = false;

	/**
	 * The callback function that the listener is currently executing.
	 * Null of no function is being executed
	 *
	 * @property {Function | null} listener
	 */
	listener = null;

	/**
	 * Setter function for updating the execution state of the listener.
	 *
	 * @param {boolean} value - The new state to be set, indicating whether the listener is currently executing or not.
	 */
	#setIsCurrentlyExecuting(value) {
		this.isCurrentlyExecuting = value;
	}

	/**
	 * Setter function for updating the executor function of the listener.
	 *
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
		this.#setIsCurrentlyExecuting(true);
		this.#setExecutor(callback);
		callback();
		this.#setIsCurrentlyExecuting(false);
		this.#setExecutor(null);
	}
}

export default new ListenerExecutor();

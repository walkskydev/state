import listenerExecutor from "./listenerExecutor.js";
import StatesRegister from "./listeners/StatesRegister.js";
import { createProxy } from "./proxy.js";
import * as utils from "./utils.js";

const statesRegister = new StatesRegister();

/**
 * Represents a state that can be subscribed to and updated.
 * @class
 * @template T - The type of the state value
 */
class State {
	/**
	 * @constructor
	 * @param {T} value - The initial value for the instance.
	 * @throws {Error} Throws an error if the value is not an object.
	 */
	constructor(value) {
		if (utils.isObject(value)) {
			this.#state = createProxy(value, this, statesRegister);
		} else {
			throw new Error("This type is not supported yet!");
		}
	}

	#state;

	/**
	 * @returns {T} The state.
	 */
	getState = () => {
		return this.#state;
	};

	/**
	 * Sets the state of the object.
	 * @param {Partial<T>} newValue
	 */
	setState = (newValue) => {
		statesRegister.runBulkUpdate(() => {
			Object.assign(this.#state, newValue);
		});
	};

	/**
	 * Subscribe a listener to changes in state.
	 *
	 * @param {function} listener - The listener function to be called when a change occurs.
	 *
	 * @return {function} An unsubscribe function to remove the listener.
	 */
	subscribe = (listener) => {
		statesRegister.setCurrentListener(listener);

		listenerExecutor.execute(listener);

		statesRegister.clearCurrentListener();

		return () => {
			statesRegister.unsubscribe(listener, this);
		};
	};
}

export default State;

import listenerExecutor from "./listeners/callbackExecutor.js";
import listenersRegister from "./listeners/listenersRegister.js";
import { createProxy } from "./proxy.js";
import * as utils from "./utils.js";

/**
 * State instance
 * @template T
 * @property {Function} getState Returns the state
 * @property {function(Partial<T>):void} setState Sets the new state
 * @property {function(Function):Function} subscribe Subscribes a activeCallback to changes in state
 */
class State {
	/**

	 * @constructor
	 * @param {T} value - The initial value for the instance.
	 * @throws {Error} Throws an error if the value is not an object.
	 */
	constructor(value) {
		if (utils.isObject(value)) {
			this.#state = createProxy(value, this, listenersRegister);
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
		listenerExecutor.runBatchUpdate(() => {
			Object.assign(this.#state, newValue);
		});
	};

	/**
	 * Subscribe a activeCallback to changes in state.
	 *
	 * @param {function} listener - The activeCallback function to be called when a change occurs.
	 *
	 * @return {function} An unsubscribe function to remove the activeCallback.
	 */
	subscribe = (listener) => {
		listenerExecutor.execute(listener);

		return () => {
			listenersRegister.unsubscribe(listener, this);
		};
	};
}

export default State;

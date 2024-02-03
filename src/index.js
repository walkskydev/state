import listenerExecutor from "./listeners/callbackExecutor.js";
import listenersRegister from "./listeners/listenersRegister.js";
import { createProxy } from "./proxy.js";
import * as utils from "./utils.js";

/** @template {object} T */
class State {
	/**@type T */
	#target;
	/**@type T */
	#state;

	/** @param {T} value */
	constructor(value) {
		if (utils.isObject(value)) {
			this.#target = { ...value };
			this.#state = createProxy(this.#target, this, listenersRegister);
		} else {
			throw new Error("This type is not supported yet!");
		}
	}

	/**
	 * Getter for state
	 *  @returns {T}
	 */
	getState = () => {
		return this.#state;
	};

	/**
	 * Method to update state
	 *  @param {Partial<T>} newValue
	 */
	setState = (newValue) => {
		if (listenerExecutor.processingListener) {
			console.warn("'SetState' method is not allowed in subscribers.");
			listenersRegister.unsubscribe(listenerExecutor.processingListener, this);
			return;
		}

		const statePropertiesMap = listenersRegister.getStatePropertiesMap(this);

		listenerExecutor.runUpdate(() => {
			for (const key in newValue) {
				Reflect.set(this.#target, key, newValue[key]);

				if (statePropertiesMap.has(key)) {
					this.#notifyLIsteners(key);
				}
			}
		});
	};

	/** @param {string} key */
	#notifyLIsteners(key) {
		const statePropertiesMap = listenersRegister.getStatePropertiesMap(this);

		for (const listener of statePropertiesMap.get(key)) {
			listenerExecutor.pushToPending(listener);
		}
	}

	/**
	 * Subscribe a listener to changes in state.
	 *
	 * @param {() => void} listener - The listener function to be called when a change occurs.
	 * @return {() => void} An unsubscribe function to remove the listener.
	 */
	subscribe = (listener) => {
		listenerExecutor.executeListener(listener);

		return () => {
			listenersRegister.unsubscribe(listener, this);
		};
	};
}

export default State;

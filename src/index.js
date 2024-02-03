import _listenerExecutor from "./listeners/callbackExecutor.js";
import _listenersRegister from "./listeners/listenersRegister.js";
import { createProxy } from "./proxy.js";
import * as utils from "./utils.js";

/**
 * @typedef {() => void} callback
 */

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
			this.#state = createProxy(this.#target, this, _listenersRegister);
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
		if (_listenerExecutor.processingListener) {
			console.warn("'SetState' method is not allowed in subscribers.");
			_listenersRegister.unsubscribe(
				_listenerExecutor.processingListener,
				this,
			);
			return;
		}

		const statePropertiesMap = _listenersRegister.getStatePropertiesMap(this);

		_listenerExecutor.runUpdate(() => {
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
		const statePropertiesMap = _listenersRegister.getStatePropertiesMap(this);

		for (const listener of statePropertiesMap.get(key)) {
			_listenerExecutor.pushToPending(listener);
		}
	}

	/**
	 * Subscribe a listener to changes in state.
	 *
	 * @param {() => void} listener - The listener function to be called when a change occurs.
	 * @return {() => void} An unsubscribe function to remove the listener.
	 */
	subscribe = (listener) => {
		_listenerExecutor.executeListener(listener);

		return () => {
			_listenersRegister.unsubscribe(listener, this);
		};
	};
}

/**
 * Observes a component and executes the component with the provided arguments when triggered.
 * @param {(...args: any[]) => any} component - The component to observe.
 * @return {(...args: any[]) => any} The observer function that takes arguments and triggers the component.
 */
export function observe(component) {
	return (args) => {
		return _listenerExecutor.executeListener(() => component(args));
	};
}

/**
 * @param {Array<callback>} setters
 */
export function batch(setters) {
	_listenerExecutor.batch(setters);
}

export default State;

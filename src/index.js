import listenerExecutor from "./listeners/callbackExecutor.js";
import listenersRegister from "./listeners/listenersRegister.js";
import { createProxy } from "./proxy.js";
import * as utils from "./utils.js";

/**
 * State
 * @class State
 * @property {function(Partial<Data>):void} setState Sets the new state
 * @property {() => () => void} subscribe Subscribes a listener to changes in state
 */
class State {
	#copy;
	#state;

	constructor(value) {
		if (utils.isObject(value)) {
			const copy = { ...value };
			this.#copy = copy;
			this.#state = createProxy(copy, this, listenersRegister);
		} else {
			throw new Error("This type is not supported yet!");
		}
	}

	getState = () => {
		return this.#state;
	};

	setState = (newValue) => {
		if (listenerExecutor.activeCallback) {
			console.warn("'SetState' method is not allowed in subscribers.");
			listenersRegister.unsubscribe(listenerExecutor.activeCallback, this);
			return;
		}

		const statePropertiesMap = listenersRegister.getStatePropertiesMap(this);

		listenerExecutor.runUpdate(() => {
			for (const key in newValue) {
				Reflect.set(this.#copy, key, newValue[key]);

				if (statePropertiesMap.has(key)) {
					this.#notifyLIsteners(key);
				}
			}
		});
	};

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
		listenerExecutor.execute(listener);

		return () => {
			listenersRegister.unsubscribe(listener, this);
		};
	};
}

export default State;

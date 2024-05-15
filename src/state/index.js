import {
	autoTrackableObserver,
	executeObserverWithAutoTrack,
} from "../observers/listenersExecutor.js";
import { removeObserver } from "../observers/observers.js";
import { addObserverToExecutionQueue } from "../observers/pendingObservers.js";
import * as utils from "../utils.js";
import { createProxy } from "./proxy.js";

/**
 * @typedef {() => void} callback
 * @typedef {number} BitsRange
 * @typedef {number} BitMask
 */

/** @template {object} T */
class State {
	/**@type {T} */
	#target;
	/**@type {T} */
	#state;

	/** @param {T} value */
	constructor(value) {
		if (utils.isObject(value)) {
			this.#target = { ...value };
			this.#state = createProxy(this.#target, this.#observers);
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
	 * @type {Map<keyof T, [BitsRange, BitMask]>}
	 */
	#observers = new Map();

	/**
	 * Method to update state
	 *  @param {Partial<T>} newValue
	 */
	setState = (newValue) => {
		if (autoTrackableObserver) {
			console.warn("'SetState' method is not allowed in subscribers.");
			removeObserver(autoTrackableObserver);
			return;
		}

		for (const key in newValue) {
			Reflect.set(this.#target, key, newValue[key]);

			this.#notifyObservers(key);
		}
	};

	/** @param {string} key */
	#notifyObservers(key) {
		const observersMask = this.#observers.get(key);

		if (observersMask !== undefined) {
			addObserverToExecutionQueue(observersMask);
		}
	}

	/**
	 * Subscribe a listener to changes in state.
	 *
	 * @param {() => void} listener - The listener function to be called when a change occurs.
	 * @return {() => void} An unsubscribe function to remove the listener.
	 */
	subscribe = (listener) => {
		executeObserverWithAutoTrack(listener);

		return () => {
			removeObserver(listener);
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
		return executeObserverWithAutoTrack(() => component(args));
	};
}

export default State;

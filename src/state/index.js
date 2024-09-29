import {
	autoTrackableObserver,
	executeTrackableObserver,
} from "../observers/executeTrackableObserver.js";
import { addObserverToExecutionQueue } from "../observers/executionObserversQueue.js";
import { removeObserver } from "../observers/observers.js";
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
			this.#target = { ...value }; // todo iterate properly & check types & add class
			this.#state = createProxy(this.#target, this.#observers);
		} else {
			throw new Error("This type is not supported yet!");
		}
	}

	/**
	 * Getter for state
	 * @method
	 * @public
	 * @returns {T}
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
	 * @method
	 * @public
	 * @param {Partial<T>} newValue
	 */
	setState = (newValue) => {
		if (autoTrackableObserver.length > 0) {
			// @ts-ignore
			removeObserver(autoTrackableObserver.at(-1));
			throw new Error("'setState' method is not allowed in subscribers");
		}

		for (const key in newValue) {
			Reflect.set(this.#target, key, newValue[key]);
			this.#notifyObservers(key);
		}
	};

	/** @param {keyof T} key */
	#notifyObservers(key) {
		const observersMask = this.#observers.get(key);

		if (observersMask !== undefined) {
			addObserverToExecutionQueue(observersMask);
		}
	}

	/**
	 * Subscribe a listener to changes in state.
	 *
	 * @method
	 * @public
	 *
	 * @param {() => void} listener - The listener function to be called when a change occurs.
	 * @return {() => void} An unsubscribe function to remove the listener.
	 */
	subscribe = (listener) => {
		executeTrackableObserver(listener);

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
		return executeTrackableObserver(() => component(args));
	};
}

export default State;

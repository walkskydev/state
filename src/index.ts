import { createListenersSet, createPropertiesMap } from "./helpers.js";
import * as T from "./types.js";
import * as utils from "./utils.js";

const statesMap: T.GlobalListenersMap = new WeakMap();
const listenersQueue = createListenersSet();

// Listener HANDLERS
let currentListener: T.ListenerFn | null;
let isBulkUpdate = false;
const listenerProperties: Set<string | symbol> = new Set();

// HELPERS
function getPropertiesMap(instance: object): T.PropertiesMap {
	if (statesMap.has(instance)) {
		return statesMap.get(instance);
	}
	statesMap.set(instance, createPropertiesMap());
	return statesMap.get(instance);
}
function clearCurrentListener() {
	currentListener = null;
}
function runBulkUpdate(cb: T.ListenerFn) {
	isBulkUpdate = true;
	cb();
	for (const callback of listenersQueue) {
		callback();
	}
	listenersQueue.clear();
	isBulkUpdate = false;
}

const createProxyHandler = (state: object): T.ProxyHandler<object> => {
	return {
		set(target, property, value) {
			const result = Reflect.set(target, property, value);
			const statePropertiesMap = getPropertiesMap(state);

			if (statePropertiesMap.has(property)) {
				if (isBulkUpdate) {
					for (const listener of statePropertiesMap.get(property)) {
						listenersQueue.add(listener);
					}
				} else {
					for (const listener of statePropertiesMap.get(property)) {
						listener();
					}
				}
			}

			return result;
		},
		get(target, property) {
			const statePropertiesMap = getPropertiesMap(state);

			if (!statePropertiesMap.has(property)) {
				statePropertiesMap.set(property, createListenersSet());
			}

			const listeners = statePropertiesMap.get(property);

			// todo: performance benchmark
			if (currentListener && !listeners.has(currentListener)) {
				listeners.add(currentListener);
			}

			listenerProperties.add(property);
			return Reflect.get(target, property);
		},
	};
};

function createProxy<T>(rawObj: object, stateInstance: object): T {
	return new Proxy({ ...rawObj }, createProxyHandler(stateInstance)) as T;
}

interface IState<T> {
	getState: () => T;
	setState: (o: object) => void;
}

class State<T> implements IState<T> {
	constructor(value: T) {
		if (utils.isObject(value)) {
			this.#state = createProxy(value as object, this);
		} else {
			throw new Error("This type is not supported yet!");
		}
	}

	#state: T;

	public getState = () => {
		return this.#state;
	};

	public setState = (newValue: Partial<T>) => {
		runBulkUpdate(() => {
			Object.assign(this.#state, newValue);
		});
	};

	// sideEffects should be restricted
	// classic subscriber
	// works for react
	// name options: subscribe, runEffect
	public subscribe = (listener: T.ListenerFn, ...args: unknown[]) => {
		currentListener = listener;
		listener(...args);

		const unsubscribe = () => {
			const props = Array.from(listenerProperties);
			const state = getPropertiesMap(this);
			for (const prop of props) {
				state.get(prop).delete(listener);
			}
		};

		listenerProperties.clear();
		clearCurrentListener();

		return unsubscribe;
	};
}

//
// export function reactOnSignal(reaction: t.ListenerFn, ...args: unknown[]) {
// 	// currentListener = reaction;
// 	// const result = reaction(args);
// 	// clearCurrentListener();
// 	// return result;
// }

export default State;

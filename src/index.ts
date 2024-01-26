import {createListenersSet, createPropertiesMap} from "./helpers.js";
import * as t from "./types.js";

const statesMap: t.GlobalListeners = new WeakMap();
const listenersQueue = createListenersSet();

// HANDLERS
let currentListener: t.Listener | null;
let isBulk = false;

// HELPERS
function getObservedState(instance: State<object>): t.PropertiesMap {
	if (statesMap.has(instance)) {
		return statesMap.get(instance);
	}
	statesMap.set(instance, createPropertiesMap());
	return statesMap.get(instance);
}
function clearCurrentListener() {
	currentListener = null;
}
function bulkUpdate(cb: t.Listener) {
	isBulk = true;
	cb();
	for (const callback of listenersQueue) {
		callback();
	}
	listenersQueue.clear();
	isBulk = false;
}

function createProxy<T extends object>(rawObj: T, stateInstance: State<T>): T {
	// todo: make a copy of rawObject
	return new Proxy(rawObj, {
		set(target: T, property: keyof object, value: unknown) {
			const result = Reflect.set(target, property, value);
			// todo: rename
			const observedState = getObservedState(stateInstance);

			if (observedState.has(property)) {
				if (isBulk) {
					for (const callback of observedState.get(property)) {
						listenersQueue.add(callback);
					}
				} else {
					for (const callback of observedState.get(property)) {
						callback();
					}
				}
			}

			return result;
		},
		get(target: T, property: keyof object) {
			const observedState = getObservedState(stateInstance);

			if (!observedState.has(property)) {
				observedState.set(property, createListenersSet());
			}

			const listeners = observedState.get(property);

			if (currentListener && !listeners.has(currentListener)) {
				listeners.add(currentListener);
			}

			clearCurrentListener();
			return target[property];
		},
	});
}

class State<T extends object> {
	constructor(obj: T) {
		this.#state = createProxy(obj, this);
	}

	#state: T;

	public getState = () => {
		return this.#state;
	};

	public setState = (newValue: Partial<T>) => {
		bulkUpdate(() => {
			Object.assign(this.#state, newValue);
		});
	};

	// sideEffects should be restricted
	// classic subscriber
	// works for react
	// name options: subscribe
	public runEffect = (listener: t.Listener) => {
		currentListener = listener;
		listener();
		clearCurrentListener();

		const unsubscribe = () => {};

		return unsubscribe;
	};
}

// component or function that return some value
// sideEffects should be restricted
// todo: naming options: watchSignals
export function reactOnSignal(reaction: t.Listener, ...args: unknown[]) {
	currentListener = reaction;
	const result = reaction(args);
	clearCurrentListener();
	return result;
}

// DEBUG:

const appleState = new State({apples: 0, price: 0, marketsIDs: []});

// const applesSub = () => {
// 	console.log(appleState.getState().apples);
// }
// const priceSub = () => {
// 	console.log(appleState.getState().price);
// }
//
// console.log("SUBSCRIBED to applesSub")
// appleState.runEffect(applesSub);
//
// console.log("set price: 1}")
// appleState.setState({price: 1})
// console.log("SUBSCRIBED to priceSub")
//
// appleState.runEffect(priceSub);
// appleState.setState({price: 2})



// todo write tests
// todo: unsubscribe
// todo: cancel side effects from listeners
// todo: primitives support
// todo: mutable/immutable options
// todo: array & object changes?
// todo: no dependency subscription (log everything?)
// todo: add middlewares
// todo: persistence
// todo: add readme

export default State;

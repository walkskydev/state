import { createListenersSet, createPropertiesMap } from "./helpers.js";
import * as t from "./types.js";

const statesMap: t.GlobalListenersMap = new WeakMap();
const listenersQueue = createListenersSet();

// HANDLERS
let currentListener: t.ListenerFn | null;
let isBulkUpdate = false;

// HELPERS
function getPropertiesMap(instance: State): t.PropertiesMap {
	if (statesMap.has(instance)) {
		return statesMap.get(instance);
	}
	statesMap.set(instance, createPropertiesMap());
	return statesMap.get(instance);
}
function clearCurrentListener() {
	currentListener = null;
}
function runBulkUpdate(cb: t.ListenerFn) {
	isBulkUpdate = true;
	cb();
	for (const callback of listenersQueue) {
		callback();
	}
	listenersQueue.clear();
	isBulkUpdate = false;
}

const createProxyHandler = (state: State): t.ProxyHandler<object> => {
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

			if (currentListener && !listeners.has(currentListener)) {
				listeners.add(currentListener);
			}

			clearCurrentListener();
			return Reflect.get(target, property);
		},
	};
};

function createProxy(rawObj: object, stateInstance: State) {
	return new Proxy({...rawObj}, createProxyHandler(stateInstance));
}

interface IState {
	getState: () => object;
	setState: (o: object) => void;
}

class State implements IState {
	constructor(obj: object) {
		this.#state = createProxy(obj, this);
	}

	#state;

	public getState = () => {
		return this.#state;
	};

	public setState = (newValue: object) => {
		runBulkUpdate(() => {
			Object.assign(this.#state, newValue);
		});
	};

	// sideEffects should be restricted
	// classic subscriber
	// works for react
	// name options: subscribe, runEffect
	public runEffect = (listener: t.ListenerFn, ...args: unknown[]) => {
		currentListener = listener;
		listener(args);
		clearCurrentListener();

		const unsubscribe = () => {};

		return unsubscribe;
	};
}

//
export function reactOnSignal(reaction: t.ListenerFn, ...args: unknown[]) {
	currentListener = reaction;
	const result = reaction(args);
	clearCurrentListener();
	return result;
}

const state = new State({ apples: 1 });

state.setState({ apples: 1 });

export default State;

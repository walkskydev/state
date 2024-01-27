import * as listeners from "./listeners.js";
import * as T from "./types.js";
import * as utils from "./utils.js";

const _statesRegister = listeners.createListeners();

const createProxyHandler = (state: object): T.ProxyHandler<object> => {
	return {
		set(target, property, value) {
			const result = Reflect.set(target, property, value);
			const statePropertiesMap = listeners.getPropertiesMap(
				state,
				_statesRegister,
			);

			if (statePropertiesMap.has(property)) {
				if (_statesRegister.isBulkUpdate) {
					for (const listener of statePropertiesMap.get(property)) {
						_statesRegister.listenersQueue.add(listener);
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
			const statePropertiesMap = listeners.getPropertiesMap(
				state,
				_statesRegister,
			);

			if (!statePropertiesMap.has(property)) {
				statePropertiesMap.set(property, listeners.createListenersSet());
			}

			const propertyListeners = statePropertiesMap.get(property);

			// todo: performance benchmark
			if (
				_statesRegister.currentListener &&
				!propertyListeners.has(_statesRegister.currentListener)
			) {
				propertyListeners.add(_statesRegister.currentListener);
			}

			_statesRegister.listenerProperties.add(property);
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
		listeners.runBulkUpdate(() => {
			Object.assign(this.#state, newValue);
		}, _statesRegister);
	};

	// sideEffects should be restricted
	// classic subscriber
	// works for react
	// name options: subscribe, runEffect
	public subscribe = (listener: T.ListenerFn, ...args: unknown[]) => {
		_statesRegister.currentListener = listener;
		listener(...args);

		const unsubscribe = () => {
			const props = Array.from(_statesRegister.listenerProperties);
			const state = listeners.getPropertiesMap(this, _statesRegister);
			for (const prop of props) {
				state.get(prop).delete(listener);
			}
		};

		_statesRegister.listenerProperties.clear();
		listeners.clearCurrentListener(_statesRegister);

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

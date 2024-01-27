import StatesRegister from "./Listeners/StatesRegister.js";
import * as T from "./Listeners/types.js";
import { createProxy } from "./proxy.js";
import * as utils from "./utils.js";

const statesRegister = new StatesRegister();

interface IState<T> {
	getState: () => T;
	setState: (o: Partial<T>) => void;
}

class State<T> implements IState<T> {
	constructor(value: T) {
		if (utils.isObject(value)) {
			this.#state = createProxy(value as object, this, statesRegister);
		} else {
			throw new Error("This type is not supported yet!");
		}
	}

	#state: T;

	public getState = () => {
		return this.#state;
	};

	public setState = (newValue: Partial<T>) => {
		statesRegister.runBulkUpdate(() => {
			Object.assign(this.#state, newValue);
		});
	};

	public subscribe = (listener: T.ListenerFn, ...args: unknown[]) => {
		statesRegister.currentListener = listener;
		listener(...args);

		const unsubscribe = () => {
			const props = Array.from(statesRegister.listenerProperties);
			const state = statesRegister.getPropertiesMap(this);
			for (const prop of props) {
				state.get(prop).delete(listener);
			}
		};

		statesRegister.clearCurrentListenerProperties();
		statesRegister.clearCurrentListener();

		return unsubscribe;
	};
}

const state = new State({ hello: 1, b: 2 });
state.setState({});

export default State;

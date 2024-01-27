import StatesRegister from "./Listeners/StatesRegister.js";

interface IHandlerParams {
	target: object;
	property: string | symbol;
	state?: object;
	statesRegister: StatesRegister;
	value?: unknown;
}

const setHandler = ({
	target,
	property,
	value,
	state,
	statesRegister,
}: IHandlerParams): boolean => {
	const result = Reflect.set(target, property, value);
	const statePropertiesMap = statesRegister.getPropertiesMap(state);
	if (statePropertiesMap.has(property)) {
		if (statesRegister.isBulkUpdate) {
			for (const listener of statePropertiesMap.get(property)) {
				statesRegister.listenersQueue.add(listener);
			}
		} else {
			for (const listener of statePropertiesMap.get(property)) {
				listener();
			}
		}
	}
	return result;
};

const getHandler = ({
	target,
	property,
	state,
	statesRegister,
}: IHandlerParams) => {
	const statePropertiesMap = statesRegister.getPropertiesMap(state);
	if (!statePropertiesMap.has(property)) {
		statePropertiesMap.set(property, StatesRegister.createListenersSet());
	}
	const propertyListeners = statePropertiesMap.get(property);
	if (
		statesRegister.currentListener &&
		!propertyListeners.has(statesRegister.currentListener)
	) {
		propertyListeners.add(statesRegister.currentListener);
	}
	statesRegister.listenerProperties.add(property);
	return Reflect.get(target, property);
};

const createProxyHandler = (
	state: object,
	statesRegister: StatesRegister,
): ProxyHandler<object> => {
	return {
		set: (target, property, value) =>
			setHandler({ target, property, value, state, statesRegister }),
		get: (target, property) =>
			getHandler({ target, property, state, statesRegister }),
	};
};

export function createProxy<T>(
	rawObj: object,
	stateInstance: object,
	statesRegister: StatesRegister,
): T {
	return new Proxy(
		{ ...rawObj },
		createProxyHandler(stateInstance, statesRegister),
	) as T;
}

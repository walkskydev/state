import * as T from "./types.js";

export function createPropertiesMap(): T.PropertiesMap {
	return new Map([]);
}

export function createListenersSet(): T.ListenersSet {
	return new Set([]);
}

export function createStatesMap(): T.GlobalListenersMap {
	return new WeakMap();
}

export function createListeners(): T.Listeners {
	return {
		currentListener: null,
		isBulkUpdate: false,
		listenerProperties: new Set<string | symbol>(),
		statesMap: createStatesMap(),
		listenersQueue: createListenersSet(),
	};
}

export function getPropertiesMap(
	instance: object,
	listeners: T.Listeners,
): T.PropertiesMap {
	if (listeners.statesMap.has(instance)) {
		return listeners.statesMap.get(instance);
	}
	listeners.statesMap.set(instance, createPropertiesMap());
	return listeners.statesMap.get(instance);
}

export function clearCurrentListener(listeners: T.Listeners) {
	listeners.currentListener = null;
}

export function runBulkUpdate(cb: T.ListenerFn, listeners: T.Listeners) {
	listeners.isBulkUpdate = true;
	cb();
	for (const callback of listeners.listenersQueue) {
		callback();
	}
	listeners.listenersQueue.clear();
	listeners.isBulkUpdate = false;
}

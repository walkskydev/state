// biome-ignore lint/suspicious/noExplicitAny: <It is designed to accept any kind of arguments and return any possible outcome>
export type ListenerFn = (...args: any[]) => any;
export type ListenersSet = Set<ListenerFn>;
export type PropertiesMap = Map<string | symbol, ListenersSet>;
export type GlobalListenersMap = WeakMap<object, PropertiesMap>;

export type ProxyHandler<T extends object> = {
	set: (target: T, property: string | symbol, value: unknown) => boolean;
	get: (target: T, property: string | symbol) => boolean;
};

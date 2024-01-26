// biome-ignore lint/suspicious/noExplicitAny: <It is designed to accept any kind of arguments and return any possible outcome>
export type Listener = (...args: any[]) => any;
export type Listeners = Set<Listener>;
export type PropertiesMap = Map<keyof object, Listeners>;
export type GlobalListeners = WeakMap<object, PropertiesMap>;

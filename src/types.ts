export type Listener = Function;
export type Listeners = Set<Listener>;
export type PropertiesMap = Map<keyof object, Listeners>;
export type GlobalListeners = WeakMap<object, PropertiesMap>;

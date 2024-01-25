import {createListenersSet, createPropertiesMap} from './helpers.js'
import * as t from './types.js'

const statesMap: t.GlobalListeners = new WeakMap();
let currentListener: t.Listener | null;
const listenersQueue = createListenersSet();
let isBulk = false;


function getObservedState(instance: State<object>): t.PropertiesMap {
  if (statesMap.has(instance)) {
    return statesMap.get(instance)!;
  } else {
    statesMap.set(instance, createPropertiesMap());
    return statesMap.get(instance)!;
  }
}
function clearCurrentListener() {
  currentListener = null;
}



function createProxy<T extends object>(rawObj: T, stateInstance: State<T>): T {
  return new Proxy(rawObj, {
    set(target: T, property: keyof object, value: any) {
      const result = Reflect.set(target, property, value);

      // todo: rename
      const $obj = getObservedState(stateInstance);

      if ($obj.has(property)) {
        if (isBulk) {
          $obj.get(property)?.forEach((callback) => listenersQueue.add(callback));
        } else {
          $obj.get(property)?.forEach((callback) => callback());
        }
      }

      return result;
    },
    get(target: T, property: keyof object) {
      const $obj = getObservedState(stateInstance);

      if (!$obj.has(property)) {
        $obj.set(property, createListenersSet());
      }

      const listeners = $obj.get(property)!;

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
    const ref = this;
    this.#state = createProxy(obj, ref);
  }

   #state: T;

  public getState = () => {
    return this.#state;
  }

   #bulkUpdate = (cb: Function) => {
    isBulk = true
    cb();
    listenersQueue.forEach(callback => callback());
    listenersQueue.clear();
    isBulk = false
  }

  public setState = (newValue: Partial<T>) => {
    this.#bulkUpdate(() => {
      Object.assign(this.#state, newValue);
    })
  }

  // component or function that return some value
  // sideEffects should be restricted
  // todo: think about naming options: watchSignals
  public reactOnSignal(reaction: t.Listener, ...args: any[]) {
    currentListener = reaction;
    const result = reaction(args)
    clearCurrentListener();
    return result;
  }

  // sideEffects should be restricted
  // classic subscriber
  // works for react
  public runEffect = (listener: t.Listener) => {
    currentListener = listener;
    listener();
    clearCurrentListener();

    const unsubscribe = () => {};

    return unsubscribe;
  }
}

// DEBUG:


// todo write tests
// todo: unsubscribe
// todo: cancel side effects from listeners
// todo: mutable/immutable options
// todo: array & object changes?
// todo: no dependency subscription (log everything?)
// todo: add middlewares
// todo: persistance

export default State;

import {createListenersSet, createPropertiesMap} from './helpers.js'
import * as t from './types.js'

const statesMap: t.GlobalListeners = new WeakMap();
let currentListener: t.Listener | null;
const listenersQueue = createListenersSet();


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

      // console.log("SET: ", property);

      if ($obj.has(property)) {
        // $obj.get(property)?.forEach((callback) => callback());
        $obj.get(property)?.forEach((callback) => listenersQueue.add(callback));
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
    cb();
    listenersQueue.forEach(callback => callback());
    listenersQueue.clear();
  }

  public setState = (newValue: Partial<T>) => {
    // const state = this.getState();
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

const appleObj = { apples: 0, price: 0, points: [0] };
const appleState = new State(appleObj);

console.log(appleState.getState());



function AlldependencyListener() {
  const apples = appleState.getState().apples;
  const price = appleState.getState().price;
  const points = appleState.getState().points;
  console.log("SUBSCRIBER 1 EXECUTED!", apples, price, points);
}

function noDepsListener() {
  console.log("NO DEPENDENCY 2 SUB EXECUTED!");
}
function appleDep() {
  console.log('apple dep', appleState.getState().apples)
}
function pointsDep() {
  console.log('points dep', appleState.getState().points)
}
function priceDep() {
  console.log('price dep', appleState.getState().price)
}


console.log("SET  ALL!")
appleState.setState({apples: 100, price: 400, points: []});

console.log('ALL STATE', appleState.getState());

appleState.runEffect(AlldependencyListener);
appleState.runEffect(noDepsListener);
appleState.runEffect(appleDep);
appleState.runEffect(pointsDep);
appleState.runEffect(priceDep);


console.log("SET POINTS")
appleState.setState({points: [1,2]})


console.log("SETUP ONLY APPLES");
appleState.getState().apples = 999;



// todo: setState
// todo: unsubscribe
// todo: computed()
// todo: mutable/immutable options
// todo: array & object changes
// todo: no dependency subscription
// todo: cancel side effects from listeners

export default State;

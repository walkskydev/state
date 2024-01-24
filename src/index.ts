type Listener = Function;
type Listeners = Set<Listener>;
type PropertiesMap = Map<keyof object, Listeners>;
type GlobalListeners = WeakMap<object, PropertiesMap>;

const $globalStates: GlobalListeners = new WeakMap();
let $currentListener: Listener | null;

function getObservedState(instance: State<object>): PropertiesMap {
  if ($globalStates.has(instance)) {
    return $globalStates.get(instance)!;
  } else {
    $globalStates.set(instance, new Map([]));
    return $globalStates.get(instance)!;
  }
}

function clearCurrentListener() {
  $currentListener = null;
}

function createProxy<T extends object>(rawObj: T, stateInstance: State<T>): T {
  return new Proxy(Object.create(rawObj), {
    set(target, property: keyof object, value) {
      const result = Reflect.set(target, property, value);

      const $obj = getObservedState(stateInstance);

      if ($obj.has(property)) {
        $obj.get(property)?.forEach((callback) => callback());
      }

      return result;
    },
    get(target: T, property: keyof object) {
      const $obj = getObservedState(stateInstance);

      if (!$obj.has(property)) {
        $obj.set(property, new Set());
      }

      const listeners = $obj.get(property)!;

      if ($currentListener && !listeners.has($currentListener)) {

        listeners.add($currentListener);
      }

      clearCurrentListener();
      return target[property];
    },
  });
}

class State<T extends object> {
  constructor(obj: T) {
    const ref = this;
    this.state = createProxy(obj, ref);
  }

  private state: T;

  public getState() {
    return this.state;
  }

  public subscribe(listener: Listener) {
    $currentListener = listener;
    const result = listener()
    clearCurrentListener();
    return result;
  }
}

// DEBUG:

const appleObj = { apples: 10, price: 1500, points: [1, 2, 3] };
const appleState = new State(appleObj);

function dependencyListener() {
  const apples = appleState.getState().apples;
  console.log("SUBSCRIBER 1 EXECUTED!", apples);
}

function noDepsListener() {
  console.log("NO DEPENDENCY 2 SUB EXECUTED!");
}

appleState.subscribe(dependencyListener);
appleState.subscribe(noDepsListener);


appleState.getState().apples = 11;
appleState.getState().apples = 12;
appleState.getState().apples = 13;

const points = appleState.getState().points;
const price = appleState.getState().price;
console.log(points, price);

points.push(4);
points.push(5);
points.push(6);

// todo: array & object changes
// todo: no dependency subscription
// todo: cancel side effects from listeners

// export default State;

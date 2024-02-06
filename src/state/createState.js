import State from './index.js';

function processObjectProps(objKeys, obj) {
  return objKeys.reduce((acc, key) => {
    if (typeof obj[key] !== 'function') {
      acc[0][key] = obj[key];
    } else {
      acc[1][key] = obj[key];
    }
    return acc;
  }, [{}, {}]);
}

function collectProps(obj) {
  const objKeys = Object.keys(obj);
  return processObjectProps(objKeys, obj);
}

function createGetProps(computedProps, props, state) {
  const getProps = {...computedProps};

  for (const prop in props) {
    getProps[prop] = () => state.getState()[prop];
  }

  return getProps;
}

export default function createState(getter, setter) {
  const state = new State({});
  const getters = getter(state.getState);
  const [props, computeds] = collectProps(getters);

  state.setState(props);

  const gets = createGetProps(computeds, props, state);
  const sets = setter(state.setState, state.getState);

  return [gets, sets, state.subscribe];
}
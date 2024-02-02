import State from '../index.js';


// todo: implement global subscribe function
/**
 * @type {(listener: () => void) => () => void}
 */
export let subscribe;

/**
 * @template {object} T
 * @param {T} value
 * @returns {[() => T, (newValue: Partial<T>) => void]} Setter
 */
function createSignal(value){
  const state = new State(value);

  subscribe = state.subscribe;

  return [state.getState, state.setState]
}


export default createSignal;
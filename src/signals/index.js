import State from '../index.js';

/**
 * A function that creates a stateful value and a function to update it.
 *
 * @template T The type of the value to be managed
 * @param {T} value - The initial value to be managed. Must be of type T.
 * @typedef {() => {}} Set  An updater function that allows the state value to be updated
 * @returns {[T, Set]} - A tuple where the first element is a function to retrieve the current state value and the second element is the Updater function.
 */

export let subscribe;

function createSignal(value){
  const state = new State(value);

  subscribe = state.subscribe;

  return [state.getState, state.setState]
}


export default createSignal;
import { useSyncExternalStore } from 'react';
import State from '../../src/index.js'

/**
 * A custom hook that initializes a state with the given value and returns
 * data from a synchronous external store along with the ability to update
 * the state.
 *
 * @typedef {function} setState
 * @template T
 * @param {T} value - The initial value for the state.
 * @returns {[value, setState]} - An array containing the data from the external store
 *                    and a function to update the state.
 */
export default function useHook(value) {
  const state = new State(value)
  const data = useSyncExternalStore(state.subscribe, state.getState);

  return [data, state.setState];
}

// npm i use-sync-external-store
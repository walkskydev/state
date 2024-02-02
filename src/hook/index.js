// @ts-ignore
import { useSyncExternalStore } from 'react';
import State from '../../src/index.js'

/**
 * @exports State from "../index"
 */


/**
 * @template T
 * @param {T} value
 * @returns {[T, (newValue: Partial<T>) => void]} Setter
 */
export default function useHook(value) {
  const state = new State(value)
  const data = useSyncExternalStore(state.subscribe, state.getState);

  return [data, state.setState];
}
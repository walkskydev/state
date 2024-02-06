// @ts-ignore
import { useSyncExternalStore } from 'react';
import State from '../../src/index.js'
import createState from '../state/createState.js';

/**
 * @template {object} T
 * @param {T} value
 * @returns {[T, (newValue: Partial<T>) => void]} Setter
 */
export default function createHook(value) {
  const [getters, setters, subscribe] = createState(value);

  const data = useSyncExternalStore(subscribe, getters);

  return [data, setters];
}


createHook({apples: 1})
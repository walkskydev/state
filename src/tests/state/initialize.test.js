import {describe, it} from 'mocha';
import State from '../../index.js';
import {assert} from 'chai';

describe('Initialization State Test', () => {
  const initialState = {hello: 1};
  const state  = new State(initialState);

  it('State object should not be the same as the one passed to constructor', () => {
    assert.notEqual(state.getState(), initialState);
  });

  it('After setState, state value must not be the same as the initial', () => {
    state.setState({ hello: 2 });
    assert.notDeepEqual(state.getState(), initialState);
  });
});
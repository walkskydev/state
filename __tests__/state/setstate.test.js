import { describe, it } from 'mocha';
import { assert } from 'chai';

import State from '../../src/index.js'

describe("set state", () => {
  const initialState = {
    apples: 0,
        price: 0,
        markets: [],
  }

  const state = new State(initialState);

  it('State object should not be the same as the one passed to constructor', () => {
    assert.notStrictEqual(state.getState(), initialState);
  });

  it("'setState' should set the state correctly", () => {
    state.setState({ apples: 5, price: 1.5, markets: ['Market A', 'Market B'] });
    assert.deepEqual(state.getState(), { apples: 5, price: 1.5, markets: ['Market A', 'Market B'] });
  })

  it("'setState' should not modify the original state object", () => {
      state.setState({ apples: 5, price: 1.5, markets: ['Market A', 'Market B'] });
      assert.notDeepEqual(state.getState(), initialState);
  });

  it("'setState' should merge the new state with the existing state", () => {
      state.setState({ apples: 5 });
      state.setState({ price: 1.5 });
      state.setState({ markets: ['Market A', 'Market B'] });
      assert.deepEqual(state.getState(), { apples: 5, price: 1.5, markets: ['Market A', 'Market B'] });
  })
})


import { describe, it } from 'mocha';
import { assert } from 'chai';

import State from '../../index.js'



describe("mutations in subscribers should be restricted",  () => {
  const initialState = {apples: 1, price: 100};
  const state = new State(initialState);

  const subscriberWithEffect = () => {
    const apples  = state.getState().apples;
    const price  = state.getState().price;

    state.getState().apples  = 111111111;
    state.getState().price = 1111111111;

    state.setState({ apples: 9999999999999 });
    state.setState({ price: 9999999999999 });
  }

  const allowedMutations = {
    apples: 0,
    price:  0
  }

  const normalListener = () => {
    const apples  = state.getState().apples;
    const price  = state.getState().price;

    allowedMutations.apples +=1
    allowedMutations.price +=1
  }


  const unsubscribe = state.subscribe(subscriberWithEffect);

  it("'subscriberWithEffect' should not update the state", () => {

    assert.equal(state.getState().apples, initialState.apples);
    assert.equal(state.getState().price, initialState.price);
    // unsubscribe()
  })

  it('legal listeners shoud work properly', () => {
    state.subscribe(normalListener);
    state.setState({apples: 15});

    assert.deepEqual(allowedMutations, {
      apples: 2,
      price:  2
    });
  });

  it('set state shoud work', () => {
    state.setState({apples: 15});
    state.setState({price: 200});

    assert.equal(state.getState().apples, 15);
    assert.equal(state.getState().price, 200);
  });

})



import { describe, it } from 'mocha';
import { assert, expect } from 'chai';

import State from '../../src/index.js'



describe("mutations in subscribers should be restricted",  () => {
  const initialState = {apples: 1, price: 100};
  const state = new State(initialState);

  const subscriberWithEffect = () => {
    const apples  = state.getState().apples;
    const price  = state.getState().price;


    state.setState({ apples: 9999999999999 });
    state.setState({ price: 9999999999999 });
  }

  it("should throw an error if setState is called within a subscriber", () => {


    expect(() => state.subscribe(subscriberWithEffect)).to.throw(
        Error,
        "'setState' method is not allowed in subscribers"
    );
  });



  it('set state should work after invalid attempt to make effect in subscription', () => {
    state.setState({apples: 15});
    state.setState({price: 200});

    assert.equal(state.getState().apples, 15);
    assert.equal(state.getState().price, 200);
  });

})

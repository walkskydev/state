import {assert} from 'chai'
import createState from '../src/state/createState.js'


function testGetter(getState) {
  return {
    apples: 1,
    price: 100,
    count: (quantity) => quantity * getState().price,
    totalPrice: () => getState().price * getState().apples,
  }
}

function testSetter(set, get) {
  return {
    increaseApples: () => {set({apples: get().apples + 1})}
  }
}

describe("create state", () => {
  const [state, actions] = createState(testGetter, testSetter);

  it("", () => {
    assert.equal(state.apples(), 1);
    assert.equal(state.price(), 100);
    assert.equal(state.count(5), 500);
    assert.equal(state.totalPrice(), 100);
    actions.increaseApples();
    assert.equal(state.apples(), 2);
    assert.equal(state.totalPrice(), 200);
  })



})
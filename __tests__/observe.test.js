import {assert} from 'chai';


import State, {observe} from '../src/index.js'
import {it} from 'mocha';


describe("Observe function", () => {
  const applesState = new State({apples: 1});
  const blueColorProps = {color: 'blue'}
  const redColorProps = {color: 'red'}

  let result;

  const Component = ({color}) => {
    const apples = applesState.getState().apples;
    result = `Apples: ${apples}, color: ${color}`;
    return result;
  }

  const wrapped = observe(Component);


  it('Component should take values from props and state', () => {
      const returned = wrapped(blueColorProps);

      assert.equal(result, returned);
  });



  it("Should update with new props", () => {
    wrapped(redColorProps);

    assert.equal(result, "Apples: 1, color: red");
  })

})


import {assert} from 'chai';


import State, {observe, batch} from '../src/index.js'
import {it} from 'mocha';


describe("Observe function", () => {
  const applesState = new State({apples: 1});
  const bananaState = new State({bannanas: 100});
  const blueColorProps = {color: 'blue'}
  const redColorProps = {color: 'red'}

  let countComponentCalls = 0;
  let result;

  const Component = ({color}) => {
    const apples = applesState.getState().apples;
    countComponentCalls++;
    result = `Apples: ${apples}, color: ${color}`;
    return result;
  }

  const wrapped = observe(Component);


  it('Component should take values from props and state', () => {
      const returned = wrapped(blueColorProps);

      assert.equal(countComponentCalls, 1);
      assert.equal(result, returned);
  });

  it("", () => {
    applesState.setState({apples:2});
    assert.equal(countComponentCalls, 2);

    assert.equal(result, "Apples: 2, color: blue");
    assert.equal(countComponentCalls, 2);

    applesState.setState({apples: 18});
    assert.equal(result, "Apples: 18, color: blue");
    assert.equal(countComponentCalls, 3);

  })

  it("Should update with new props", () => {
    wrapped(redColorProps);

    assert.equal(result, "Apples: 18, color: red");
    assert.equal(countComponentCalls, 4);
  })


  it('Render in changes in different stores', () => {
    let result;
    let count = 0;

    const Component = () => {
      const apples = applesState.getState().apples;
      const bananas = bananaState.getState().bannanas;


      count++
      result = `Apples: ${apples}, bananas: ${bananas}`;
    }

    const wrapped = observe(Component);
    wrapped();
    assert.equal(count, 1);


    assert.equal(result, "Apples: 18, bananas: 100");

    applesState.setState({apples: 10})
    assert.equal(count, 2);

    bananaState.setState({bannanas: 10})
    assert.equal(count, 3);


    assert.equal(result, "Apples: 10, bananas: 10");
  })

  it("", () => {
    let count = 0;
    let result;

    // reset
    applesState.setState({apples: 1})
    bananaState.setState({bannanas: 1})

    const Component = () => {
      const apples = applesState.getState().apples;
      const bananas = bananaState.getState().bannanas;

      count++
      result = `Apples: ${apples}, bananas: ${bananas}`;
    }

    const wrapped = observe(Component);
    wrapped();
    assert.equal(count, 1);



   batch([
     applesState.setState({apples: 2}),
     bananaState.setState({bannanas: 2}),
     applesState.setState({apples: 3}),
     bananaState.setState({bannanas: 4}),
     applesState.setState({apples: 5}),
     bananaState.setState({bannanas: 5})
   ])
    assert.equal(count, 2);


    assert.equal(result, "Apples: 5, bananas: 5");

  })
})


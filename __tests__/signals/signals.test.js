import { describe, it } from 'mocha';
import { assert } from 'chai';

import createSignal from '../../src/signals/index.js';

describe('Object Signals', () => {
  const [apples, setApples] = createSignal({apples: 100});

  it('createSignal should return state', () => {
    assert.equal(apples().apples, 100);
  });

  it('setApples should update state', () => {
    setApples({apples: 200});
    assert.equal(apples().apples, 200);
  });
})


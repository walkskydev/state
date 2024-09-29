import * as chai from 'chai';
import { computed } from '../src/computed.js';

const assert = chai.assert;

describe('Computed function tests', () => {
  // Test focusing on a single use case
  it('Should return cachedValue when no observer bits', () => {
    const expectedValue = "cachedValue";
    const observer = () => expectedValue;

    const result = computed(observer);

    assert.equal(result(), expectedValue);
  });

});
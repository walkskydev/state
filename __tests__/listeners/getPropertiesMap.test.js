import {assert} from 'chai';
import ListenersRegister from '../../src/listeners/ListenersRegister.js';


describe('getPropertiesMap method', () => {
  const listeners = new ListenersRegister();

  it('should return correct PropertiesMap from given state', () => {
    const state = { key: 'value' };
    assert.isNotNull(listeners.getStatePropertiesMap(state));
    assert.instanceOf(listeners.getStatePropertiesMap(state), Map);
  });

  it('should create a new PropertiesMap when given a new state', () => {
    const state = { key1: 'value1' };
    assert.isNotNull(listeners.getStatePropertiesMap(state));
    assert.instanceOf(listeners.getStatePropertiesMap(state), Map);
    assert.equal(listeners.getStatePropertiesMap(state).size, 0);
  });
});
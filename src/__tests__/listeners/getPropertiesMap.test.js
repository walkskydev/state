import {assert} from 'chai';
import Listeners from '../../listeners/StatesRegister.js';


describe('getPropertiesMap method', () => {
  const listeners = new Listeners();

  it('should return correct PropertiesMap from given state', () => {
    const state = { key: 'value' };
    assert.isNotNull(listeners.getPropertiesMap(state));
    assert.instanceOf(listeners.getPropertiesMap(state), Map);
  });

  it('should create a new PropertiesMap when given a new state', () => {
    const state = { key1: 'value1' };
    assert.isNotNull(listeners.getPropertiesMap(state));
    assert.instanceOf(listeners.getPropertiesMap(state), Map);
    assert.equal(listeners.getPropertiesMap(state).size, 0);
  });
});
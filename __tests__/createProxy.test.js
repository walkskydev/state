import {assert} from 'chai';
import { createProxy } from '../src/proxy.js';
import {it} from 'mocha';

describe('createProxy function', () => {
    const state = {};
    const statesRegister = {
        getStatePropertiesMap: () => new Map(),
    };

    it('should create a new proxy object', () => {
        const originalTarget = { name: 'John' };

        const proxy = createProxy(originalTarget, state, statesRegister);

        assert(typeof proxy === 'object');
    });

    it('should maintain original properties', () => {
        const originalTarget = { name: 'John' };

        const proxy = createProxy(originalTarget, state, statesRegister);

        assert.equal(proxy.name, originalTarget.name);
    });

    it("shouldn't allow setting new properties", () => {
        const originalTarget = { name: 'John' };

        const proxy = createProxy(originalTarget, state, statesRegister);
        proxy.age = 25;

        assert.notEqual(proxy.age, 25);
    });

    it("shouldn't allow modifying existing properties", () => {
        const originalTarget = { name: 'John' };

        const proxy = createProxy(originalTarget, state, statesRegister);
        proxy.name = 'Jane';

        assert.notEqual(proxy.name, 'Jane');
    });

    it("shouldn't allow deleting properties", () => {
        const originalTarget = { name: 'John' };

        const proxy = createProxy(originalTarget, state, statesRegister);
        // biome-ignore lint/performance/noDelete: <explanation>
        delete  proxy.name;

        assert.equal(proxy.name, 'John');
    });
});
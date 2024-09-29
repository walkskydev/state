import {describe, it} from 'mocha';
import {assert} from 'chai';

import State from '../../src/index.js';

describe("Test 'subscribe' method...", () => {
	const initialState = {
		apples: 0,
		price: 0,
		markets: [],
	};

	let result = 0;

	const state = new State(initialState);

	const observer = () => {
		const order = state.getState();

		order.apples;
		result += 1;
	};

	it("Observer should run on subscribe and each set state call", () => {
		state.subscribe(observer);
		assert.equal(result, 1);
		state.setState({ apples: 9999999999999 });
		assert.equal(result, 2);
		state.setState({ apples: 12 });
		assert.equal(result, 3);
	});
});

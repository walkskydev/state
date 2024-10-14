import * as chai from 'chai';
import {computed} from '../src/computed.js';
import State from '../src/index.js';

const assert = chai.assert;

describe("Computed function tests", () => {
	it("Should return value", () => {
		const expectedValue = "cachedValue";
		const observer = () => expectedValue;

		const result = computed(observer);

		assert.equal(result(), expectedValue);
	});

	it("", () => {
		const state = new State({ apples: 0 });

		let numberOfCals = 0;

		const observer = () => {
			numberOfCals += 1;
			return `In state: ${state.getState().apples} apples`;
		};

		const result = computed(observer);
		result()

		assert.equal(result(), "In state: 0 apples");
		result()
		result()
		result()
		result()
		assert.equal(result(), "In state: 0 apples");
		state.setState({apples: 5});
		assert.equal(numberOfCals, 2);
		assert.equal(result(), "In state: 5 apples");
	});
});

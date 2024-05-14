/** @typedef {() => void} Observer */
import { observe } from "../index.js";

const bits = [
	1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768,
	65536, 131072, 262144, 524288, 1048576, 2097152, 4194304, 8388608, 16777216,
	33554432, 67108864, 134217728, 268435456, 536870912, 1073741824, 2147483648,
];

const tempObservers = new Map([
	//  [() => {}, [1, 256]]
]);

class Observers {
	#index = 0;

	/** @type {[number, number][]} */
	#freeBitsStack = [];

	/**
	 *
	 * @type {Map<number, Map<number, Observer>>}
	 */
	observers = new Map([]);

	/** @param {Observer} observer */
	addObserver = (observer) => {
		if (this.#freeBitsStack.length !== 0) {
			const [index, bit] = this.#freeBitsStack.pop();
			tempObservers.set(observer, [index, bit]);

			const current = this.observers.get(index);
			current.set(bit, observer);
		} else {
			const newIndex = Math.floor(this.#index / 31);

			if (!this.observers.has(newIndex)) {
				this.observers.set(newIndex, new Map());
			}

			const current = this.observers.get(newIndex);
			const bit = 2 ** (this.#index % 31);

			current.set(bit, observer);

			tempObservers.set(observer, [newIndex, bit]);
			this.#index++;
		}
	};

	/** @param {Observer} observer */
	removeObserver = (observer) => {
		const [index, bit] = tempObservers.get(observer);
		const current = this.observers.get(index);
		current.delete(bit);
		tempObservers.delete(observer);
		this.#freeBitsStack.push([index, bit]);
	};
}

// ***************************************** test

const a = new Observers();

a.addObserver(() => {});
a.addObserver(() => {});
a.addObserver(() => {});
a.addObserver(() => {});

setInterval(() => {
	a.addObserver(() => {});
	console.log({ tempObservers, observers: a.observers });
}, 1000);

export default new Observers();

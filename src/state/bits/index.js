/** @typedef {() => void} Observer
 * @typedef {number} BitIndex
 * @typedef {number} BitMask
 */

let index = 0;

/** @type {Map<Observer, [BitIndex, BitMask]>} */
export const observersMap = new Map(); //  [() => {}, [1, 256]]

/** @type {[number, number][]} */
const freeBitsStack = [];

/** @type {Map<BitIndex, Map<BitMask, Observer>>} */
export const bitsMap = new Map(); // [0, new Map([ [32, () => {}] ])]

/** @param {Observer} observer */
export const addObserver = (observer) => {
	if (freeBitsStack.length !== 0) {
		const [index, bit] = freeBitsStack.pop();
		observersMap.set(observer, [index, bit]);

		const current = bitsMap.get(index);
		current.set(bit, observer);
	} else {
		const newIndex = Math.floor(index / 31);

		if (!bitsMap.has(newIndex)) {
			bitsMap.set(newIndex, new Map());
		}

		const current = bitsMap.get(newIndex);
		const bit = 2 ** (index % 31);

		current.set(bit, observer);

		observersMap.set(observer, [newIndex, bit]);
		index++;
	}
};

/** @param {Observer} observer */
export const removeObserver = (observer) => {
	const [index, bit] = observersMap.get(observer) || [];
	if (index === undefined || !bit === undefined) return;

	const current = bitsMap.get(index);
	current.delete(bit);
	observersMap.delete(observer);
	freeBitsStack.push([index, bit]);
	console.log("removed");
};

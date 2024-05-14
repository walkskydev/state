/** @typedef {() => void} Observer
 * @typedef {number} BitIndex
 * @typedef {number} BitMask
 */

let globalBitIndex = 0;

/** @type {Map<Observer, [BitIndex, BitMask]>} */
export const observersMap = new Map(); //  [() => {}, [1, 256]]

/** @type {[number, number][]} */
const freeBitsStack = [];

/** @type {Map<BitIndex, Map<BitMask, Observer>>} */
export const bitsMap = new Map(); // [0, new Map([ [32, () => {}] ])]

/** @param {Observer} observer */
export const addObserver = (observer) => {
	const hasFreeBits = freeBitsStack.length !== 0;

	if (hasFreeBits) {
		const [index, bit] = freeBitsStack.pop();
		observersMap.set(observer, [index, bit]);

		const bitIndex = bitsMap.get(index);
		bitIndex.set(bit, observer);
	} else {
		const newBitIndex = Math.floor(globalBitIndex / 31);

		if (!bitsMap.has(newBitIndex)) {
			bitsMap.set(newBitIndex, new Map());
		}

		const bitIndex = bitsMap.get(newBitIndex);
		const bit = 2 ** (globalBitIndex % 31);

		bitIndex.set(bit, observer);
		observersMap.set(observer, [newBitIndex, bit]);
		globalBitIndex++;
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

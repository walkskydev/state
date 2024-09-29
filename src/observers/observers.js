/** @typedef {() => void} Observer
 * @typedef {number} BitsRangeIndex
 * @typedef {number} BitMask
 */

let globalBitIndex = 0;

/** @type {[number, number][]} */
const freeBitsStack = [];

/** @type {Map<Observer, [BitsRangeIndex, BitMask]>} */
const observersMap = new Map(); //  [() => {}, [1, 256]]

/** @type {Map<BitsRangeIndex, Map<BitMask, Observer>>} */
const bitsMap = new Map(); // [0, new Map([ [32, () => {}] ])]

/** @param {Observer} observer
 *  @return {[BitsRangeIndex, BitMask]}
 */
export const addObserver = (observer) => {
	const registeredBit = getObserverBit(observer);

	if (registeredBit !== undefined) return registeredBit;

	const hasFreeBits = freeBitsStack.length !== 0;

	if (hasFreeBits) {
		// @ts-ignore
		const [index, bit] = freeBitsStack.pop();
		observersMap.set(observer, [index, bit]);

		const bitsRange = bitsMap.get(index);
		// @ts-ignore
		bitsRange.set(bit, observer);

		return [index, bit];
	}
	const currentBitsRange = Math.floor(globalBitIndex / 31);

	if (!bitsMap.has(currentBitsRange)) {
		bitsMap.set(currentBitsRange, new Map());
	}

	const bitIndex = bitsMap.get(currentBitsRange);
	const bit = 2 ** (globalBitIndex % 31);

	// @ts-ignore
	bitIndex.set(bit, observer);
	observersMap.set(observer, [currentBitsRange, bit]);
	globalBitIndex++;

	return [currentBitsRange, bit];
};

/** @param {Observer} observer */
export const removeObserver = (observer) => {
	const [index, bit] = observersMap.get(observer) || [];
	if (index === undefined || bit === undefined) return;

	const current = bitsMap.get(index);
	// @ts-ignore
	current.delete(bit);
	observersMap.delete(observer);
	freeBitsStack.push([index, bit]);
};

/**
 * @param {Observer} observer
 * @return {[BitsRangeIndex, BitMask] | undefined}
 */
export function getObserverBit(observer) {
	return observersMap.get(observer);
}

/**
 * @param {[BitsRangeIndex, BitMask]} bit
 * @return {Observer | undefined}
 */
export function getObserver([bitIndex, bitMask]) {
	const bitsRange = bitsMap.get(bitIndex);

	return bitsRange?.get(bitMask);
}

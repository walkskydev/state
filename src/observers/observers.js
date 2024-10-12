/** @typedef {() => void} Observer
 * @typedef {number} BitsRangeIndex
 * @typedef {number} BitMask
 */

let globalBitIndex = 0;

/** @type {[number, number][]} */
const freeBitsStack = [];

/** @type {WeakSet<Observer>} */
const globalObserversWeakSet = new WeakSet();

const registry = new FinalizationRegistry((heldValue) => {
	console.log(`Object with held value "${heldValue}" was garbage collected`);
	const [index, bit] = heldValue;

	if (index === undefined || bit === undefined) return;

	const current = bitsMap.get(index);
	current?.delete(bit);
	freeBitsStack.push([index, bit]);
});

/**
 * @param {Observer} fn
 * @param {[BitsRangeIndex, BitMask]} address
 */
function createWeakObserver(fn, address) {
	registry.register(fn, address);
	return new WeakRef(fn);
}

/** @type {Map<BitsRangeIndex, Map<BitMask, WeakRef<Observer>>>} */
const bitsMap = new Map(); // [0, Map([ [32, () => {}] ])]

/** @param {Observer} observer
 *  @return {[BitsRangeIndex, BitMask] | undefined}
 */
export const addObserver = (observer) => {
	const isRegistered = isObserverHasRegistered(observer);

	if (isRegistered) return undefined;

	const hasFreeBits = freeBitsStack.length !== 0;

	if (hasFreeBits) {
		// @ts-ignore
		const [index, bit] = freeBitsStack.pop();
		globalObserversWeakSet.add(observer);

		const bitsRange = bitsMap.get(index);
		// @ts-ignore
		bitsRange.set(bit, createWeakObserver(observer, [index, bit]));

		return [index, bit];
	}
	const currentBitsRange = Math.floor(globalBitIndex / 31);

	if (!bitsMap.has(currentBitsRange)) {
		bitsMap.set(currentBitsRange, new Map());
	}

	const bitIndex = bitsMap.get(currentBitsRange);
	const bit = 2 ** (globalBitIndex % 31);

	// @ts-ignore
	bitIndex.set(bit, createWeakObserver(observer, [currentBitsRange, bit]));
	globalObserversWeakSet.add(observer);
	globalBitIndex++;

	return [currentBitsRange, bit];
};

/** @param {Observer} observer */
export const removeObserver = (observer) => {
	// const [index, bit] = globalObserversWeakSet.get(observer) || [];
	// if (index === undefined || bit === undefined) return;

	// const current = bitsMap.get(index);
	// @ts-ignore
	// current.delete(bit);
	globalObserversWeakSet.delete(observer);
	// freeBitsStack.push([index, bit]);
};

/**
 * @param {Observer} observer
 * @return {boolean}
 */
export function isObserverHasRegistered(observer) {
	return globalObserversWeakSet.has(observer);
}

/**
 * @param {[BitsRangeIndex, BitMask]} bit
 * @return {Observer | undefined}
 */
export function getObserver([bitIndex, bitMask]) {
	const bitsRange = bitsMap.get(bitIndex);

	return bitsRange?.get(bitMask)?.deref();
}

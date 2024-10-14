/** @typedef {() => void} Observer
 *
 * @typedef {(index: number, bit: number) => void} Callback
 * @typedef {number} BitsRangeIndex
 * @typedef {number} BitMask
 */

/**
 *
 * @typedef {{
 *   address: [BitsRangeIndex, BitMask],
 *   removeFromState: Callback
 * }} WeakRegistryData
 */

let globalBitIndex = 0;

/** @type {[number, number][]} */
const freeBitsStack = [];

/** @type {WeakMap<Observer, [BitsRangeIndex, BitMask]>} */
const globalObserversWeakMap = new WeakMap();

/**
 *
 * @type {FinalizationRegistry<WeakRegistryData>}
 */
const registry = new FinalizationRegistry(({ address, removeFromState }) => {
	console.log(`Object with held value "${address}" was garbage collected`);
	const [index, bit] = address;

	if (index === undefined || bit === undefined) return;

	removeFromState(index, bit);
	bitsMap.get(index)?.delete(bit);
	freeBitsStack.push([index, bit]);
});

/**
 * @param {Observer} fn
 * @param {WeakRegistryData} data
 */
function createWeakObserver(fn, data) {
	registry.register(fn, data);

	return new WeakRef(fn);
}

/** @type {Map<BitsRangeIndex, Map<BitMask, WeakRef<Observer>>>} */
const bitsMap = new Map(); // [0, Map([ [32, () => {}] ])]

/** @param {Observer} observer
 *  @param {Callback}  removeFromState
 *  @return {[BitsRangeIndex, BitMask] | undefined}
 */
export const addObserver = (observer, removeFromState) => {
	const isRegistered = getObserversBit(observer);

	if (isRegistered) return undefined;

	const hasFreeBits = freeBitsStack.length !== 0;

	if (hasFreeBits) {
		// @ts-ignore
		const [index, bit] = freeBitsStack.pop();
		globalObserversWeakMap.set(observer, [index, bit]);

		const bitsRange = bitsMap.get(index);
		// @ts-ignore
		bitsRange.set(
			bit,
			createWeakObserver(observer, { address: [index, bit], removeFromState }),
		);

		return [index, bit];
	}
	const currentBitsRange = Math.floor(globalBitIndex / 31);

	if (!bitsMap.has(currentBitsRange)) {
		bitsMap.set(currentBitsRange, new Map());
	}

	const bitIndex = bitsMap.get(currentBitsRange);
	const bit = 2 ** (globalBitIndex % 31);

	// @ts-ignore
	bitIndex.set(
		bit,
		createWeakObserver(observer, {
			address: [currentBitsRange, bit],
			removeFromState,
		}),
	);
	globalObserversWeakMap.set(observer, [currentBitsRange, bit]);
	globalBitIndex++;

	return [currentBitsRange, bit];
};

/** @param {Observer} observer */
export const removeObserver = (observer) => {
	const [index, bit] = globalObserversWeakMap.get(observer);
	if (index === undefined || bit === undefined) return;

	const current = bitsMap.get(index);
	// @ts-ignore
	current.delete(bit);
	globalObserversWeakMap.delete(observer);
	freeBitsStack.push([index, bit]);
};

/**
 * @param {Observer} observer
 * @return {[number, number] | undefined}
 */
export function getObserversBit(observer) {
	return globalObserversWeakMap.get(observer);
}

/**
 * @param {[BitsRangeIndex, BitMask]} bit
 * @return {Observer | undefined}
 */
export function getObserver([bitIndex, bitMask]) {
	const bitsRange = bitsMap.get(bitIndex);

	return bitsRange?.get(bitMask)?.deref();
}

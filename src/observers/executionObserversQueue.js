import { getObserver } from "./observers.js";

const BITS = [
	1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768,
	65536, 131072, 262144, 524288, 1048576, 2097152, 4194304, 8388608, 16777216,
	33554432, 67108864, 134217728, 268435456, 536870912, 1073741824,
];

/**
 * Observers which waiting for execution
 * @type {Map<number, number>}
 */
const executionQueue = new Map();

/**
 *
 * @param {[number, number]} bits
 */
export function isObserverInExecutionQueue([bigRangeIndex, bitMask]) {
	return ((executionQueue.get(bigRangeIndex) || 0) & bitMask) !== 0;
}

let isPending = false;

/**
 *
 * @param {number} bitRangeIndex
 * @param {number} observersBitMask
 */
function executeObserversInRange(bitRangeIndex, observersBitMask) {
	// TODO check if observer was already executed
	// TODO: do while bit less or equal than mask
	for (const bit of BITS) {
		if ((observersBitMask & bit) !== 0) {
			const observer = getObserver([bitRangeIndex, bit]);

			if (observer !== undefined) {
				observer();
			}
		}
	}
}

function executeObservers() {
	for (const [bitRangeIndex, observersBitMask] of executionQueue) {
		executeObserversInRange(bitRangeIndex, observersBitMask);
	}

	isPending = false;
}

function scheduleExecution() {
	if (isPending === false && typeof window !== "undefined") {
		isPending = true;
		queueMicrotask(executeObservers);
	} else {
		executeObservers();
	}
}

/**
 *
 * @param {[number, number]} Observer
 */
export function addObserverToExecutionQueue([bitRangeIndex, bitMask]) {
	const pending = executionQueue.get(bitRangeIndex) || 0;
	executionQueue.set(bitRangeIndex, pending | bitMask);

	scheduleExecution();
}

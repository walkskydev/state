/**
 * Checks if the provided value is an object
 * @param {unknown} value - the value to check
 * @returns {boolean} - returns true if the value is an object and not an array, otherwise false
 */
export function isObject(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

import State, { observe, batch } from "./state/index.js";

function collectProps(obj) {
	const props = {};
	const funcs = {};

	for (const prop in obj) {
		if (typeof obj[prop] !== "function") {
			props[prop] = obj[prop];
		} else {
			funcs[prop] = obj[prop];
		}
	}
	return [props, funcs];
}

export function createState(getter, setter) {
	const state = new State({});

	const getters = getter(state.getState);
	const [props, computeds] = collectProps(getters);

	state.setState(props);

	const gets = {
		...computeds,
	};

	const sets = setter(state.setState, state.getState);

	for (const prop in props) {
		gets[prop] = () => state.getState()[prop];
	}

	return [gets, sets];
}

export { observe, batch };
export default State;

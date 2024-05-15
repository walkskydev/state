# State
Performance-oriented and highly adaptable state manager for all types of JS applications: 
Node.js, Web Components, WASM, React, etc.

## Motivation
The most important requirements for state managers is: 
- [x] **Automatic subscriptions** - you don't need to care about
dependencies or configure selectors to get reactive updates.
- [x] **Batch updates** - you could call `setState` function multiple times for one or different
states. It will run only one update
- [ ] **Computed values** - run updates only one of values has been changed.
- [ ] **Optimized UI rendering** - observers tracking system prevent multiple calls of functions during the rendering phase. 


## Getting started
```shell
npm i @walksky/state
```
### createState()
State provides a convenient way to organize values, computed values and setters. It returns an array with two values:
**[getters, setters]** - a functions for getting and setting values.
To get value from state you need to call a signal: `state.value()`;
```tsx
import { createState } from '@walksky/state'

const [state, setState] = createState({
  apples: 1,
  price: 100,
});

const MyComponent = () => <div>Apples: {state.apples}</div>
```



#### Computed values
Under construction

### observe()
If you are using UI library based on functional components, to make your component reactive, wrap it with the `observe` function.
```tsx
import { observe } from '@walksky/state';

const MyComponent = ({someProp}) => {
    return <div>
       Apples: {state.apples}
       MyProps: {someProp}
    </div>
}

export default observe(MyComponent);
```


### State class
If you need a classic state, you could create an instance of State.
```tsx
import State from '@walksky/state'

const state = new State({apples: 0});
// define action
const increaseApples = () => state.setState({apples: state.getState().apples + 1})

// use in your component
const Fruits = () => <div>Total price is: {totalPrice()}</div>
const IncreaseButton = () => <button onClick={increaseApples}>Increase</button>
```

#### subscribe()
In most cases, subscribe are rarely needed. For example:
 * Data logging
 * Calling rendering function in Web Components or other solutions with custom rendering

```typescript
state.subscribe(() => console.log('Vaue updated:', state.getState().apples));
```

## Use cases
### Web components
All you need to do is subscribe in `connectedCallback` in your lifecycle callbacks
```javascript
 // Create a class for the element
class MyCustomElement extends HTMLElement {
  static observedAttributes = ["color", "size"];
  connectedCallback() {
    state.subscribe(this.render)
  }

  disconnectedCallback() {
    state.unsubscribe(this.render)
  }
}

customElements.define("my-custom-element", MyCustomElement);

```

### Webassembly
If you write your business logic with Webassembly, all you need is
write a bridge

```rust
 #[wasm_bindgen(method)]
 pub fn execute(cart_item: JsCartItem) {
     let new_cart = // result of hard business logic
     self.js_state.set_state(new_cart);
 }
```
```typescript
import State from '@walksky/state'
import { State as WasmStateInterface, AddToCart } from 'path_to_your_generated_wasm_typed_file';

const cartState = new State({cart: []});

// implementation of WASM interface
class StateAdapter extends WasmStateInterface {
    getState = cartState.getState
    setState = cartState.setState
}

// create instance of  usecase
let addToCartUseCase = new AddToCartUseCase(stateAdaper);

// now Application state will be updaten on usecase execution
addToCartUseCase.execute(item);
```



## Documentation
:construction_worker: Under construction... 

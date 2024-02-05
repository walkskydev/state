# State
Performance-oriented and highly adaptable state manager for JS applications.

## Motivation
1. State is a pragmatic solution which aims to be useful in any JS application: NodeJS, Web Components, WASM, React, Vue, etc.
2. You don't need to worry about rendering optimization as the state uses automatic dependencies.
3. From the simplest scenarios to the most complex, all you need to know are a few functions:
   * `createState`+`get/set` - to create a state and manipulate the values
   * `subscribe`/`observe` - for functions/components to watch for updates
   * `batch` - to update multiple states in one operation

## Getting started
```shell
npm i @walksky/state
```

### State class
If you need only a classic state, and you will care about where to store computed values and actions,
you can create an instance of State.
```typescript
import State from 'walksky/state'

const state = new State({apples: 0});
// create computed values
const totalPrice = () => 100 * state.getState().apples; 
// subcribe your callback 
state.subscribe(() => console.log('Total price:', totalPrice()));
// update the state
state.setState({apples: 2}); // 'Total price: 200'
```
### createState()
If you want to store your values, computed values, and setters/actions in one place,
the function createState will be more useful for you.
#### Computed values
 `createState` returns an array with two values **[getters, setters]**: 
```typescript
import { createState } from 'walksky/state'

const [state, setState] = createState((get) => ({
   apples: 1,
   price: 100,
   count: (quantity) => quantity * get().price,
   totalPrice: () => get().price * get().apples,
}));
```
#### Actions
As well, you can create some actions by passing second argument. 
```typescript
const [state, actions] = createState((getState) => ({
   apples: 1,
   price: 100,
   count: (quantity) => quantity * getState().price,
   totalPrice: () => getState().price * getState().apples,
}),
(setState, getState) => ({
   increaseApples: () => {setState({apples: getState().apples + 1})}
 })
);
```
```tsx
const MyComponent = () => (<div>
   Apples: {state.apples()}
   Total price: {state.totalPrice()}
   <button onClick={action.increaseApples}/>
</div>)
```

### observe()
To make your functional component reactive, wrap it with the observe function.
```tsx
observe(MyComponent)
```
Or, if you are using React you could just use this hook:
```tsx
import createHook from 'walksky/state/hook'

const useApplesState = createHook({apples: 1});

const MyComponent = () => {
    const [getApples, setApples] = useApplesState();
// ...
}
```
### batch()
In cases when you need to update values from multiple stores, you
can use `batch` function to optimize components re-render. After wrapping
your setters, component will be re-rendered just once.
```tsx
batch(() => {
    appleState.setState({apples: 10});
    bannanaState.setState({bannanas: 20});
})
```




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
import { State as WasmState } from 'path_to_your_generated_wasm_typed_file';

const state = new State({apples: 0});

// just extend WASM class
class WasmBridge extends WasmState {
    getState = state.getState
    setState = state.setState
}

// create instances of state and use case
let stateInstance = new WasmBridge();
let addToCart = new AddToCartUseCase(stateInstance);

// sowhere in application
let item = {product_id: 1, quantity: 1};
addToCart.execute(item);
```

...



## Documentation
:construction_worker: Under construction... 


## Todo

- [x] add logging
- [x] add unsubscribe functionality
- [x] write tests
- [x] cancel side effects from listeners
- [x] generic type for State  
- [ ] add benchmarks
- [ ] ?support for primitives
- [ ] ?mutable/immutable options
- [ ] add middlewares
- [ ] persistence
- [ ] devtools integrations
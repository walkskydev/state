# State
Performance-oriented and highly adaptable state manager for any types of JS applications: NodeJS, Web Components, WASM, React, Vue, etc..

## Motivation
State was designed as a pragmatic solution with important optimizations and convenient syntax. 

## Key points
* You don't need to care about rendering optimization as the state uses automatic dependencies.
* From the simplest scenarios to the most complex, all you need to know are a few functions:
   * `createState`+`geters/setters` - to create a state and manipulate the values
   * `observe`/`subscribe` - for functions/components to watch for updates
   * `batch` - to update multiple states in one operation

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

const MyComponent = ({count}) => <div>Apples: {state.apples()}</div>
```
#### Computed values
To create computed values, define a **getter** that you can call anytime in your code.
```typescript

const [state, setState] = createState((getState) => ({
   apples: 1,
   price: 100,
   count: (quantity) => quantity * getState().price,
   totalPrice: () => getState().price * getState().apples,
}));
```
#### Actions
As well, you can create actions by passing second argument to `createState`. 
```typescript
const [state, actions] = createState((getState) => ({
   apples: 1,
   price: 100,
   totalPrice: () => getState().price * getState().apples,
}),
(setState, getState) => ({
   increaseApples: () => {setState({apples: getState().apples + 1})}
 })
);
```
```tsx
const MyComponent = ({count}) => (<div>
   Apples: {state.apples()}
   Total price: {state.totalPrice()}
   <button onClick={action.increaseApples}/>
</div>)
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

### React
If you are using React all you need is create a hook.
```tsx
import createHook from '@walksky/state/hook'

const useApplesState = createHook({apples: 1});

const MyComponent = () => {
    const [apples, setApples] = useApplesState()
    return <div>Apples: {apples()}</div>
// ...
}
```

### observe()
If you are using another UI library based on functional components, to make your component reactive, wrap it with the `observe` function.
```tsx
const MyComponent = ({someProp}) => {
    return <div>
       Apples: {state.apples()}
       MyProps: {someProp}
    </div>
}

export default observe(MyComponent);
```


### State class
If you need only a classic state, and you will care about where to store computed values and actions,
you can create an instance of State.
```tsx
import State from '@walksky/state'

const state = new State({apples: 0});
// define computed values
const totalPrice = () => 100 * state.getState().apples
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
import { State as WasmState, AddToCartUseCase } from 'path_to_your_generated_wasm_typed_file';

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



## Documentation
:construction_worker: Under construction... 


## Todo

- [x] add logging
- [x] add unsubscribe functionality
- [x] write tests
- [x] cancel side effects from listeners
- [x] generic type for State  
- [ ] add benchmarks
- [ ] support for primitives (proposal)
- [ ] mutable/immutable options (idea)
- [ ] memoization support (planned)
- [ ] nested getters (coming soon)
- [ ] add middlewares
- [ ] persistence support
- [ ] integration with devtools
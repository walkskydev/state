# State
Performance-oriented and highly adaptable state manager with convenient syntax for all types of JS applications: 
Node.js, Web Components, WASM, React, Vue, etc.

## Motivation
The most important requirements for state managers is: 
- [x] Automatic subscriptions (or signals)
- [x] batch updates
- [x] zero configuration
- [ ] computed values


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

const MyComponent = ({count}) => <div>Apples: {state.apples}</div>
```



#### Computed values
To create computed values, define a **getter** that you can call anytime in your code.
Under construction


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
   Apples: {state.apples}
   Total price: {state.totalPrice}
   <button onClick={action.increaseApples}/>
</div>)
```



```tsx
appleState.setState({apples: 10});
bannanaState.setState({bannanas: 20});
```

### React
If you are using React all you need is create a hook.
```tsx
import createHook from '@walksky/state/hook'

const useApplesState = createHook({apples: 1});

const MyComponent = () => {
    const [apples, setApples] = useApplesState()
    return <div>Apples: {apples}</div>
// ...
}
```

### observe()
If you are using another UI library based on functional components, to make your component reactive, wrap it with the `observe` function.
```tsx
const MyComponent = ({someProp}) => {
    return <div>
       Apples: {state.apples}
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

# State

## Overview
Performance-oriented and highly adaptable state manager.

## Why State
1. State is a pragmatic solution which aims to be useful in any JS application: NodeJS, Web Components, WASM, React, Vue, etc.
2. You don't need to worry about rendering optimization as the state uses automatic dependencies.
3. From the simplest scenarios to the most complex, all you need to know are a few functions:
   * `createState`+`get/set` - to create a state and manipulate the values
   * `subscribe`/`observe` - for functions/ for components to watch for updates
   * `batch` - to update multiple states in one operation

## Getting started
If you need just a 'classic' state, you can create an instance of State.
### State class
```typescript
import State from 'walksky/state'

const state = new State({apples: 0});
const unsubscribe = state.subscribe(() => console.log(state.getState().apples));
state.setState({apples: 2});
```
### createState()
#### Add computed values
 A more useful function is `createState` which returns an array with two values **[getters, setters]**: 
```typescript
import { createState } from 'walksky/state'

const [state, setState] = createState((get) => ({
   apples: 1,
   price: 100,
   count: (quantity) => quantity * get().price,
   totalPrice: () => get().price * get().apples,
}));
```
#### Add actions
As well, you can define some actions and store them in **setters** 
```typescript
const [state, actions] = createState((getState) => ({
   apples: 1,
   price: 100,
   count: (quantity) => quantity * getState().price,
   totalPrice: () => getState().price * getState().apples,
}),
  (set, get) => ({
     increaseApples: () => {set({apples: get().apples + 1})}
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
Make it observable
```tsx
observe(MyComponent)
```
if you are using Rect you could just use this hook:
```tsx
import useHook from 'walksky/state/hook'

const useApplesState = useHook({apples: 1});

const MyComponent = () => {
    const [apples, setApples] = useApplesState();
// ...
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
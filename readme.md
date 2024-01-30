# State

## Overview
Efficient, framework agnostic state manager, 
and highly adaptable state manager optimized for robust functionality.

### Automatic selectors
You don`t need to care about dependencies in your components or functions.
Your callback will be called only if certain used was changed.

### 


### Signals
useFruitsState.ts

```typescript
import createSignal from '@walksky/state/signal'

// initialize the global state
const [fruitsState, setState] = createSignal({
    apples: 1,
    oranges: 3
}); 

// Define some global actions
export const increaseApples = () => {
    // you can use getter for values
    const { apples } = fruitsState;
    setState({apples: apples + 1});
};
// 
export const increaseOranges = () => {
    // or pass the function
    setState(({oranges}) => {
        return  {oranges: oranges + 1}
    });
};

export default fruitsState;
```
MyComponent.tsx
```tsx
import useFruitState, {increaseApples, increaseOranges} from './useFruitsState.ts'

const MyComponent = () => {
    const fruits = useFruitState();

    useEffect(() => {
        setTimeout(() => {
            // mutations is allowed by default (optional)
            fruits.apples = fruits.apples + 1;
        }, 1000)
    }, []);

  return (
      <div>
        <h1>Apples: {fruits.apples}</h1>
        <h1>Oranges: {fruits.oranges}</h1>
        <button onClick={increaseApples}>Increase Apples</button>
        <button onClick={increaseOranges}>Increase Oranges</button>
      </div>
  );
};
```
### Web components
All you need is subscribe in `connectedCallback` in your lifecycle callbacks
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
### React
```tsx
import create from 'walksky/react'

const usestate = create({apples: 1});

const MyComponent = () => {
    const {apples} = usestate();
    
    const increaseApples = () => {
        apples += 1;
    }

    return (
        <div>
            <h1>Apples: {fruits.apples}</h1>
            <button onClick={increaseApples}>Increase Apples</button>
        </div>
    );
};


```

## Documentation
:construction_worker: Under construction... 


### getState()
This method returns the current state.

### subscribe()
This method allows components to subscribe and listen for any changes happening to the state. On subscribe, it returns a function that can later be called to unsubscribe.

### setState()
Sets the state

## Todo

- [x] add logging
- [x] add unsubscribe functionality
- [x] write tests
- [x] cancel side effects from listeners
- [x] generic type for State  
- [ ] add benchmarks
- [ ] primitives support
- [ ] mutable/immutable options
- [ ] add readme
- [ ] add middlewares
- [ ] persistence
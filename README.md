# lazyload-typescript

공부
```
import { LazyLoadElement, LazyLoadElementCallbacks, LazyLoadElementState, LazyLoadElementResult, LazyLoadElementOptions} from '.....lazy-load-element';

let lazyloadOptions: LazyLoadElementOptions = {}
let lazyloadCallback: LazyLoadElementCallbacks = {
  load: (state: LazyLoadElementState, result: LazyLoadElementResult): void => {
    console.log('state', state);
    console.log('result', result);
  }
}

this.lazyLoadElement = new LazyLoadElement(null, lazyloadOptions, lazyloadCallback);
```
```
import { LazyLoadElement, LazyLoadElementCallbacks, LazyLoadElementState, LazyLoadElementResult, LazyLoadElementOptions} from '.....lazy-load-element';

this.lazyLoadElement = new LazyLoadElement();
```

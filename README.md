# lazyload-typescript

공부
```ts
import { LazyLoadElement, LazyLoadElementCallbacks, LazyLoadElementState, LazyLoadElementResult, LazyLoadElementOptions} from '.....lazy-load-element';

let lazyloadOptions: LazyLoadElementOptions = {}
let lazyloadCallback: LazyLoadElementCallbacks = {
  load: (state: LazyLoadElementState, result: LazyLoadElementResult): void => {
    console.log('state', state);
    console.log('result', result);
  },
  call: (state: LazyLoadElementState, result: LazyLoadElementResult): void => {
    console.log('state', state);
    console.log('result', result);
  },
  error: (state: LazyLoadElementState, result: LazyLoadElementResult): void => {
    console.log('state', state);
    console.log('result', result);
  }
}

this.lazyLoadElement = new LazyLoadElement(null, lazyloadOptions, lazyloadCallback);
```
```ts
import { LazyLoadElement, LazyLoadElementCallbacks, LazyLoadElementState, LazyLoadElementResult, LazyLoadElementOptions} from '.....lazy-load-element';

this.lazyLoadElement = new LazyLoadElement();
```
**data-lazy-..., lazy-load**
```html
<div data-lazy-class="eff-fade-in" lazy-load></div>
<img [attr.data-lazy-src]="image.url" data-lazy-class="eff-fade-in" lazy-load>
<div [attr.data-lazy-style]="'background: url('+image.url+')'" data-lazy-class="eff-fade-in" lazy-load></div>
```

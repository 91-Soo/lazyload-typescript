# lazyload-typescript

공부
```
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
this.lazyLoadElement = new LazyLoadElement();
```

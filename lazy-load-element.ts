/**
 * Copyright (c) 2017
 *
 * lazy-load-element.ts
 * dom element lazy load
 *
 * @author KimMinSoo
 * @date 2018/10/11
 */
export interface LazyLoadElementOptions {
  root?: Element,
  rootMargin?: string,
  threshold?: number[],
  isDisposable?: boolean
}

export interface LazyLoadElementCallbacks {
  load?(state: LazyLoadElementState, result?: LazyLoadElementResult): void;
  call?(state: LazyLoadElementState, result?: LazyLoadElementResult): void;
  error?(state: LazyLoadElementState, result?: LazyLoadElementResult): void;
}

export interface LazyLoadElementResult {
  element: Element,
  attr: string,
  isIntersecting: boolean,
  intersectionRatio: number
}

export interface LazyLoadElementState {
  code: number,
  msg: string
}

export class LazyLoadElement {
  private observer: IntersectionObserver;
  private debug: boolean;
  private isDisposable: boolean;
  private config: IntersectionObserverInit;
  private callbacks: LazyLoadElementCallbacks;
  private stateCodes: {
    NOTSUPPORT: LazyLoadElementState,
    ERRORELEMENT: LazyLoadElementState,
    LOAD: LazyLoadElementState,
    CALL: LazyLoadElementState
  };

  constructor(element?: Element | NodeListOf<Element>, options?: LazyLoadElementOptions, callbacks?: LazyLoadElementCallbacks) {
    this.init(options, callbacks);

    let elements: NodeListOf<Element> = this.makeElementNodeList(element);

    if(elements && elements.length) {
      this.addObserve(elements);
    }
    else {
      if(this.callbacks && this.callbacks.error) {
        this.callbacks.error(this.stateCodes['ERRORELEMENT']);
      }
    }
  }

  private init(options: LazyLoadElementOptions, callbacks: LazyLoadElementCallbacks) {
    this.config = {
      root: options && options.root ? options.root : null,
      rootMargin: options && options.rootMargin ? options.rootMargin : '0px',
      threshold: options && options.threshold ? options.threshold : 0.01
    };
    this.isDisposable = options && undefined !== options.isDisposable ? options.isDisposable : true;
    this.callbacks = {
      load: callbacks ? callbacks.load : null,
      call: callbacks ? callbacks.call : null,
      error: callbacks ? callbacks.error : null
    }
    this.stateCodes = {
      NOTSUPPORT: {
        code: 0,
        msg: 'LazyLoadElement Not Support'
      },
      ERRORELEMENT: {
        code: 1,
        msg: 'LazyLoadElement Element Error'
      },
      LOAD: {
        code: 2,
        msg: 'LazyLoadElement load'
      },
      CALL: {
        code: 3,
        msg: 'LazyLoadElement call'
      }
    };
  }
  
  private makeElementNodeList(element: Element | NodeListOf<Element>): NodeListOf<Element> {
    let elements: NodeListOf<Element> = null;

    if(element) {
      if(element instanceof Element) {
        elements = element.querySelectorAll('[lazy-load]:not([lazy-load-loaded])');
      }
      else if(element instanceof NodeList) {
        elements = element;
      }
      else {
        if(this.callbacks && this.callbacks.error) {
          this.callbacks.error(this.stateCodes['ERRORELEMENT']);
        }
      }
    }
    else {
      elements = document.querySelectorAll('[lazy-load]:not([lazy-load-loaded])');
    }

    return elements;
  }

  private addObserve(elements: NodeListOf<Element>): void {
    if(!('IntersectionObserver' in window)) {
      if(this.debug) console.log('IntersectionObserver not support');

      if(this.callbacks && this.callbacks.error) {
        this.callbacks.error(this.stateCodes['NOTSUPPORT']);
      }

      [].forEach.call(elements, function (element) {
        this.preLoad(element);
      }.bind(this));
    }
    else {
      if(this.debug) console.log('IntersectionObserver support');

      this.observer = new IntersectionObserver(function (entries: any, config: IntersectionObserverInit) {
        entries.forEach(function (entry) {
          if(0 < entry.intersectionRatio) {
            this.preLoad(entry, this.observer);
          }

          if(this.callbacks && this.callbacks.call) {
            this.callbacks.call(this.stateCodes['CALL'], { element: entry.target, isIntersecting: entry.isIntersecting, intersectionRatio: entry.intersectionRatio });
          }
        }.bind(this));
      }.bind(this), this.config);

      [].forEach.call(elements, function (element, index) {
        // samsung browser error
        setTimeout(function () {
          element.setAttribute('lazy-load-unloaded', '');
          this.observer.observe(element);
        }.bind(this), 1);
      }.bind(this));
    }
  }

  private preLoad(entry: IntersectionObserverEntry, observer?: IntersectionObserver): void {
    let element: any = entry.target;

    if(!element.getAttribute('lazy-load-loaded')) {
      [].forEach.call(element.attributes, (function (attribute, index) {
        if(attribute.nodeName.match(/data-lazy/)) {
          let inputAttribute: string = attribute.nodeName.replace(/data-lazy-/, '');

          if('class' == inputAttribute) {
            element.classList.add(element.getAttribute(attribute.nodeName));
          }
          else {
            element.onerror = function (e) { element.onerror = null; element.removeAttribute('src'); };
            element.setAttribute(inputAttribute, element.getAttribute(attribute.nodeName));
          }

          if(this.callbacks && this.callbacks.load) {
            this.callbacks.load(this.stateCodes['LOAD'], { element: element, attr: inputAttribute, isIntersecting: entry.isIntersecting, intersectionRatio: entry.intersectionRatio });
          }
        }
      }).bind(this));

      element.removeAttribute('lazy-load-unloaded');
      element.setAttribute('lazy-load-loaded', '');

      if(observer && this.isDisposable) {
        observer.unobserve(element);
      }
    }
  }
}


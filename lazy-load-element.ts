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
  root?: Element;
  rootMargin?: string;
  threshold?: number[];
  isDisposable?: boolean;
}

export interface LazyLoadElementCallbacks {
  load?(state: LazyLoadElementState, result?: LazyLoadElementResult): void;
  call?(state: LazyLoadElementState, result?: LazyLoadElementResult): void;
  error?(state: LazyLoadElementState, result?: LazyLoadElementResult): void;
}

export interface LazyLoadElementResult {
  element: Element;
  attr: string;
  isIntersecting: boolean;
  intersectionRatio: number;
}

export interface LazyLoadElementState {
  code: number;
  msg: string;
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
        this.callbacks.error(this.stateCodes['ERRORELEMENT'], this.makeResult(null, null, null));
      }
    }
  }

  public apply(){

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
          this.callbacks.error(this.stateCodes['ERRORELEMENT'], this.makeResult(null, null, null));
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
        this.callbacks.error(this.stateCodes['NOTSUPPORT'], this.makeResult(null, null, null));
      }

      [].forEach.call(elements, function (element) {
        this.preLoad(element);
      }.bind(this));
    }
    else {
      if(this.debug) console.log('IntersectionObserver support');

      this.observer = new IntersectionObserver(function (entries: PerformanceEntryList) {
        entries.forEach(function (entry) {
          if(0 < entry.intersectionRatio) {
            this.preLoad(entry.target, entry, this.observer);
          }

          if(this.callbacks && this.callbacks.call) {
            this.callbacks.call(this.stateCodes['CALL'], this.makeResult(entry.target, null, entry));
          }
        }.bind(this));
      }.bind(this), this.config);

      [].forEach.call(elements, function (element) {
        // samsung browser error
        setTimeout(function () {
          element.setAttribute('lazy-load-unloaded', '');
          this.observer.observe(element);
        }.bind(this), 1);
      }.bind(this));
    }
  }

  private preLoad(element: any, entry: IntersectionObserverEntry, observer: IntersectionObserver): void {
    if(!element.getAttribute('lazy-load-loaded')) {
      [].forEach.call(element.attributes, (function (attribute) {
        if(attribute.nodeName.match(/data-lazy/)) {
          let inputAttribute: string = attribute.nodeName.replace(/data-lazy-/, '');
          let inputValue: string = element.getAttribute(attribute.nodeName);

          switch(inputAttribute) {
            case "class":
              element.classList.add(inputValue);
            break;
            case "style":
              element.setAttribute(inputAttribute, (element.getAttribute('style') || '') + inputValue);
            break;
            case "src":
              element.onerror = function () { element.onerror = null; element.removeAttribute('src'); };
              element.setAttribute(inputAttribute, inputValue);
            break;
            default:
              element.setAttribute(inputAttribute, inputValue);
            break;
          }

          if(this.callbacks && this.callbacks.load) {
            this.callbacks.load(this.stateCodes['LOAD'], this.makeResult(element, inputAttribute, entry));
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

  private makeResult(element: Element, attr: string, entry: IntersectionObserverEntry): LazyLoadElementResult {
    return {
      element: element,
      attr: attr,
      isIntersecting: entry ? entry.isIntersecting : null,
      intersectionRatio: entry ? entry.intersectionRatio : null,
    }
  }
}
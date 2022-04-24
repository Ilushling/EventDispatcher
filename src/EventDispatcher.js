export class EventDispatcher {
  constructor() {
    this.init();
  }

  init() {
    // Array for fast backward iteration without functions
    this.listeners = {};
    // Map of function-index
    this.listenersMap = {};
  }

  clear() {
    this.listeners = {};
    this.listenersMap = {};
  }

  addEventListener(eventName, listener) {
    if (this.hasEventListener(eventName, listener)) {
      return;
    }

    if (this.listeners[eventName] == null) {
      this.listeners[eventName] = [];
    }

    const index = this.listeners[eventName].push(listener) - 1;
    if (this.listenersMap[eventName] == null) {
      this.listenersMap[eventName] = new Map();
    }
    this.listenersMap[eventName].set(listener, index);

    const removeEventListener = () => {
      this.removeEventListener(eventName, listener);
    };

    return removeEventListener;
  }

  once(eventName, listener) {
    const callback = data => {
      this.removeEventListener(eventName, callback);
      listener(data);
    };

    return this.addEventListener(eventName, callback);
  }

  hasEventListener(eventName, listener) {
    return this.listenersMap[eventName] && this.listenersMap[eventName].has(listener);
  }

  hasEventListeners(eventName) {
    return this.listeners[eventName] != null;
  }

  removeEventListener(eventName, listener) {
    if (!this.hasEventListener(eventName, listener)) {
      return;
    }

    if (listener == null) {
      delete this.listeners[eventName];
      delete this.listenersMap[eventName];
      return;
    }

    const listeners = this.listeners[eventName];
    const listenersMap = this.listenersMap[eventName];

    const listenerIndex = listenersMap.get(listener);

    if (listenerIndex !== -1) {
      const lastListener = listeners.pop();
      if (listeners.length !== 0) {
        const listenerToDelete = listeners[listenerIndex];
        listenersMap.delete(listenerToDelete);
        listenersMap.set(lastListener, listenerIndex);

        listeners[listenerIndex] = lastListener;
      } else {
        delete this.listenersMap[eventName];
        // listenersMap.delete(lastListener);
      }
    }
  }

  dispatchEvent(eventName, data) {
    const listeners = this.listeners[eventName];
    const listenersCount = listeners ? listeners.length : 0;
    if (listenersCount === 0) {
      return;
    }

    for (let i = listenersCount; i--;) {
      listeners[i](data);
    }
  }

  on = this.addEventListener;
  one = this.once;
  off = this.hasEventListener;
  remove = this.removeEventListener;
  emit = this.dispatchEvent;
  trigger = this.dispatchEvent;
}
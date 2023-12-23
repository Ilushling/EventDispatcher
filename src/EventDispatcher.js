/**
 * @typedef {(data?: any) => any} Listener
 * @typedef {Record<string, Listener[]>} Listeners
 * 
 * @typedef {Record<string, Map<Listener, number>>} ListenerMap
 */
export default class EventDispatcher {
  /** @type {Listeners} */
  #listeners;
  /** @type {ListenerMap} */
  #listenersMap;

  constructor() {
    this.#listeners = {};
    // Map of function-index
    this.#listenersMap = {};
  }

  clear() {
    this.#listeners = {};
    this.#listenersMap = {};
  }

  /**
   * @param {string} eventName
   * @param {Listener} listener
   */
  on(eventName, listener) {
    if (this.has(eventName, listener)) {
      return;
    }

    const listeners = this.#listeners;
    const listenersMap = this.#listenersMap;

    const eventListeners = listeners[eventName] ??= [];
    const eventListenersMap = listenersMap[eventName] ??= new Map();

    const index = eventListeners.push(listener) - 1;
    eventListenersMap.set(listener, index);

    const remove = () => {
      this.remove(eventName, listener);
    };

    return remove;
  }

  /**
   * @param {string} eventName
   * @param {Listener} listener
   */
  once(eventName, listener) {
    const callback = (/** @type {any} */ data) => {
      this.remove(eventName, callback);
      listener(data);
    };

    return this.on(eventName, callback);
  }

  /**
   * @param {string} eventName
   * @param {Listener} listener
   */
  has(eventName, listener) {
    const listenersMap = this.#listenersMap;

    return listenersMap[eventName]?.has(listener) ?? false;
  }

  /**
   * @param {string} eventName
   */
  hasEventListeners(eventName) {
    return eventName in this.#listeners;
  }

  /**
   * @param {string} eventName
   * @param {Listener} listener
   */
  remove(eventName, listener) {
    if (!this.has(eventName, listener)) {
      return;
    }
    const listeners = this.#listeners;
    const listenersMap = this.#listenersMap;

    if (listener == null) {
      delete listeners[eventName];
      delete listenersMap[eventName];
      return;
    }

    const eventListeners = listeners[eventName];
    const eventListenersMap = listenersMap[eventName];

    let listenersCount = eventListeners.length ?? 0;
    if (listenersCount == null) {
      return;
    }

    if (listenersCount === 0) {
      delete listenersMap[eventName];
      return;
    }

    const listenerIndex = eventListenersMap.get(listener);

    if (listenerIndex == null || listenerIndex === -1) {
      return;
    }

    const lastListener = eventListeners.pop();

    listenersCount = eventListeners.length;
    const isLastListener = listenerIndex === listenersCount;

    if (listenersCount === 0) {
      delete listeners[eventName];
      delete listenersMap[eventName];

      return;
    }

    if (lastListener == null) {
      return;
    }

    const listenerToDelete = eventListeners[listenerIndex];
    eventListenersMap.delete(listenerToDelete);

    if (!isLastListener) {
      eventListenersMap.set(lastListener, listenerIndex);
      eventListeners[listenerIndex] = lastListener;
    }
  }

  /**
   * @param {string} eventName
   * @param {any=} data
   */
  emit(eventName, data) {
    const eventListeners = this.#listeners[eventName];

    const eventListenersCount = eventListeners.length ?? 0;
    if (eventListenersCount === 0) {
      return;
    }

    for (let i = 0; i < eventListenersCount; i++) {
      eventListeners[i](data);
    }
  }
}

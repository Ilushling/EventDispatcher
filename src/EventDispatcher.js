/**
 * @implements {IEventDispatcher}
 */
export default class EventDispatcher {
  /**
   * @typedef {import('./IEventDispatcher.js').IEventDispatcher} IEventDispatcher
   */

  /**
   * @typedef {import('./IEventDispatcher.js').EventDispatcherProperties} EventDispatcherProperties
   */

  /**
   * @typedef {import('./IEventDispatcher.js').Listener} Listener
   */

  /** @type {EventDispatcherProperties['listeners']} */
  #listeners;

  /** @type {EventDispatcherProperties['listenersMap']} */
  #listenersMap;

  constructor() {
    this.#listeners = {};
    this.#listenersMap = {};
  }

  clear() {
    this.#listeners = {};
    this.#listenersMap = {};
  }

  /** @type {IEventDispatcher['on']} */
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

    const remove = () => this.remove(eventName, listener);

    return remove;
  }

  /** @type {IEventDispatcher['once']} */
  once(eventName, listener) {
    const callback = (/** @type {any} */ data) => {
      this.remove(eventName, callback);
      listener(data);
    };

    return this.on(eventName, callback);
  }

  /** @type {IEventDispatcher['has']} */
  has(eventName, listener) {
    const listenersMap = this.#listenersMap;
    const eventListenersMap = listenersMap[eventName];

    if (eventListenersMap == null) {
      return false;
    }

    return eventListenersMap.has(listener);
  }

  /** @type {IEventDispatcher['hasEventListeners']} */
  hasEventListeners(eventName) {
    return eventName in this.#listeners;
  }

  /**
   * @overload
   * @param {string} eventName
   * @param {Listener} listener
   * @returns {void}
   *
   * @overload
   * @param {string} eventName
   * @returns {void}
   * 
   * @param {string} eventName
   * @param {Listener=} listener
   * 
   * @type {IEventDispatcher['remove']}
   */
  remove(eventName, listener) {
    const listeners = this.#listeners;
    const listenersMap = this.#listenersMap;

    if (listener == null) {
      delete listeners[eventName];
      delete listenersMap[eventName];
      return;
    }

    if (!this.has(eventName, listener)) {
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
   * @overload
   * @param {string} eventName
   * @param {unknown} data
   * @returns {void}
   *
   * @overload
   * @param {string} eventName
   * @returns {void}
   * 
   * @param {string} eventName
   * @param {unknown=} data
   * 
   * @type {IEventDispatcher['emit']}
   */
  emit(eventName, data) {
    const eventListeners = this.#listeners[eventName];

    if (eventListeners == null) {
      return;
    }

    const eventListenersCount = eventListeners.length ?? 0;
    if (eventListenersCount === 0) {
      return;
    }

    for (let i = 0; i < eventListenersCount; i++) {
      try {
        eventListeners[i](data);
      } catch (e) {

      }
    }
  }
}

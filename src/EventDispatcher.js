/**
 * @import {
 *  IEventDispatcher,
 *  Listener
 * } from './IEventDispatcher.js'
 */

/**
 * @implements {IEventDispatcher}
 */
export default class EventDispatcher {
  /**
   * @typedef {EventDispatcherStates} EventDispatcherProperties
   * 
   * @typedef {object} EventDispatcherStates
   * @property {Listeners<unknown>} listeners
   * @property {ListenerMap<unknown>} listenerMap
   * @property {Record<string, number>} listenerCount
   */

  /**
   * @template {unknown} T
   * 
   * @typedef {Record<string, Listener<T>[] | undefined>} Listeners
   */

  /**
   * @template {unknown} T
   * 
   * @typedef {Record<string, Map<Listener<T>, number> | undefined>} ListenerMap
   */

  /** @type {EventDispatcherProperties['listeners']} */
  #listeners;

  /** @type {EventDispatcherProperties['listenerMap']} */
  #listenerMap;

  /** @type {EventDispatcherProperties['listenerCount']} */
  #listenerCount;

  constructor() {
    this.#listeners = {};
    this.#listenerMap = {};
    this.#listenerCount = {};
  }

  //#region Interfaces
  /**
   * @param {string} eventName
   * @param {Listener<unknown>} listener
   * 
   * @type {IEventDispatcher['on']}
   */
  on(eventName, listener) {
    if (this.has(eventName, listener)) {
      return;
    }

    const listeners = this.#listeners;
    const listenerMap = this.#listenerMap;
    const listenerCount = this.#listenerCount;

    const eventListeners = listeners[eventName] ??= [];
    const eventListenerMap =
      listenerMap[eventName]
      ??= /** @type {Map<Listener<unknown>, number>} */ (new Map());
    const eventListenerCount = listenerCount[eventName] ??= 0;

    eventListeners[eventListenerCount] = listener;

    const index = listenerCount[eventName]++;
    eventListenerMap.set(listener, index);

    const remove = () => this.remove(eventName, listener);

    return remove;
  }

  /** @type {IEventDispatcher['once']} */
  once(eventName, listener) {
    /**
     * @template {Function} T
     * 
     * @typedef {T extends (arg: infer R) => unknown ? R : unknown} GetArgType
     */

    /**
     * @param {GetArgType<typeof listener>} data
     */
    const callback = data => {
      this.remove(eventName, callback);
      listener(data);
    };

    return this.on(eventName, callback);
  }

  /**
   * @param {string} eventName
   * @param {Listener<unknown>} listener
   * 
   * @type {IEventDispatcher['has']}
   */
  has(eventName, listener) {
    const listenerMap = this.#listenerMap;

    const eventListenerMap = listenerMap[eventName];
    if (eventListenerMap == null) {
      return false;
    }

    return eventListenerMap.has(listener);
  }

  /** @type {IEventDispatcher['hasListeners']} */
  hasListeners(eventName) {
    return eventName in this.#listeners;
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
   * @returns {void}
   * 
   * @type {IEventDispatcher['emit']}
   */
  emit(eventName, data) {
    const eventListeners = this.#listeners[eventName];
    if (eventListeners == null) {
      return;
    }

    const listenerCount = this.#listenerCount;

    const eventListenersCount = listenerCount[eventName];
    switch (eventListenersCount) {
      case 0:
        break;
      case 1:
        try {
          eventListeners[0](data);
        } catch (e) {

        }

        break;
      default:
        this.#loopTryCallbackArrayWithData(eventListeners, data, 0, eventListenersCount);
        break;
    }
  }

  /**
   * @template {unknown} T
   * 
   * @overload
   * @param {string} eventName
   * @param {Listener<T>} listener
   * @returns {void}
   *
   * @overload
   * @param {string} eventName
   * @returns {void}
   * 
   * @param {string} eventName
   * @param {Listener<unknown>=} listener
   */
  remove(eventName, listener) {
    const listeners = this.#listeners;
    const listenerMap = this.#listenerMap;
    const listenerCount = this.#listenerCount;

    if (listener == null) {
      delete listeners[eventName];
      delete listenerMap[eventName];
      delete listenerCount[eventName];

      return;
    }

    if (!this.has(eventName, listener)) {
      return;
    }

    const eventListeners = listeners[eventName];
    if (eventListeners == null) {
      return;
    }

    const eventListenerMap = listenerMap[eventName];
    if (eventListenerMap == null) {
      return;
    }

    let eventListenerCount = listenerCount[eventName];
    if (eventListenerCount == null) {
      return;
    }

    switch (eventListenerCount) {
      case 0:
        delete listenerMap[eventName];

        return;
      case 1:
        delete listeners[eventName];
        delete listenerMap[eventName];
        delete listenerCount[eventName];

        return;
    }

    const listenerIndex = eventListenerMap.get(listener);
    if (listenerIndex == null) {
      return;
    }

    eventListenerCount = --listenerCount[eventName];

    const lastListenerIndex = eventListenerCount;
    const lastListener = eventListeners[lastListenerIndex];

    const listenerToDelete = eventListeners[listenerIndex];
    const isLastListener = listenerIndex === lastListenerIndex;

    eventListenerMap.delete(listenerToDelete);

    if (isLastListener) {
      delete eventListeners[listenerIndex];
    } else {
      eventListenerMap.set(lastListener, listenerIndex);
      eventListeners[listenerIndex] = lastListener;
    }
  }

  /** @type {IEventDispatcher['clear']} */
  clear() {
    this.#listeners = {};
    this.#listenerMap = {};
    this.#listenerCount = {};
  }
  //#endregion

  //#region Logic
  /**
   * @param {((data: unknown) => void | Promise<void>)[]} callbacks
   * @param {unknown} data
   * @param {number} start
   * @param {number} end
   */
  #loopTryCallbackArrayWithData(callbacks, data, start, end) {
    const count = end - start;
    if (count < 1) {
      return;
    }

    if (count === 1) {
      try {
        callbacks[start](data);
      } catch (e) {

      }

      return;
    }

    const threads = 4;
    if (count < threads) {
      for (let i = start; i < end; i++) {
        try {
          callbacks[i](data);
        } catch (e) {

        }
      }

      return;
    }

    const countRemaining = count % threads;
    if (countRemaining === 0) {
      for (let i = start; i < end; i += threads) {
        const i2 = i + 1;
        const i3 = i + 2;
        const i4 = i + 3;

        try {
          callbacks[i](data);
        } catch (e) {

        }
        try {
          callbacks[i2](data);
        } catch (e) {

        }
        try {
          callbacks[i3](data);
        } catch (e) {

        }
        try {
          callbacks[i4](data);
        } catch (e) {

        }
      }

      return;
    }

    // Analog
    // const endRemaining = start + count - countRemaining;
    const endRemaining = end - countRemaining;

    for (let i = start; i < endRemaining; i += threads) {
      const i2 = i + 1;
      const i3 = i + 2;
      const i4 = i + 3;

      try {
        callbacks[i](data);
      } catch (e) {

      }
      try {
        callbacks[i2](data);
      } catch (e) {

      }
      try {
        callbacks[i3](data);
      } catch (e) {

      }
      try {
        callbacks[i4](data);
      } catch (e) {

      }
    }

    for (let i = endRemaining; i < end; i++) {
      try {
        callbacks[i](data);
      } catch (e) {

      }
    }
  }
  //#endregion
}

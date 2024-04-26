/**
 * @typedef {object} IEventDispatcher
 * @property {() => void} clear
 * @property {(eventName: string, listener: Listener) => RemoveCallback | undefined} on
 * @property {(eventName: string, listener: Listener) => RemoveCallback | undefined} once
 * @property {(eventName: string, listener: Listener) => boolean} has
 * @property {(eventName: string) => boolean} hasEventListeners
 * @property {{
 *  (eventName: string, listener: Listener): void;
 *  (eventName: string): void;
 * }} remove
 * @property {{
 *  (eventName: string, data: unknown): void;
 *  (eventName: string): void;
 * }} emit
 */

/**
 * @typedef {object} EventDispatcherProperties
 * @property {Listeners} listeners
 * @property {ListenerMap} listenersMap
 */

/**
 * @typedef {(data?: unknown) => Promise<void> | void} Listener
 * 
 * @typedef {Record<string, Listener[]>} Listeners
 * @typedef {Record<string, Map<Listener, number>>} ListenerMap
 * 
 * @typedef {() => void} RemoveCallback
 */

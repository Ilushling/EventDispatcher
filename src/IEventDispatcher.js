/**
 * @typedef {object} IEventDispatcher
 * @property {<T extends unknown>(eventName: string, listener: Listener<T>) => RemoveCallback | undefined} on
 * @property {<T extends unknown>(eventName: string, listener: Listener<T>) => RemoveCallback | undefined} once
 * 
 * @property {<T extends unknown>(eventName: string, listener: Listener<T>) => boolean} has
 * @property {(eventName: string) => boolean} hasListeners
 * 
 * @property {{
 *  (eventName: string, data: unknown): void;
 *  (eventName: string): void;
 * }} emit
 * 
 * @property {{
 *  <T extends unknown>(eventName: string, listener: Listener<T>): void;
 *  (eventName: string): void;
 * }} remove
 * @property {() => void} clear
 */

/**
 * @template {unknown} T
 * 
 * @typedef {(data: T) => Promise<void> | void} Listener
 */

/**
 * @typedef {() => void} RemoveCallback
 */

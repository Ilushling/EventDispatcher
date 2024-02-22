import assert from 'node:assert';
import { describe, it } from 'node:test';

import EventDispatcher from '../src/EventDispatcher.js';

describe('eventDispatcher', () => {
  it('single emit', () => {
    const eventDispatcher = new EventDispatcher();

    eventDispatcher.emit('1', 1);

    assert.ok('success emit');
  });

  it('single remove', () => {
    const eventDispatcher = new EventDispatcher();

    eventDispatcher.remove('1');

    assert.ok('success remove');
  });

  it('on error & emit', () => {
    const eventDispatcher = new EventDispatcher();

    const callback = () => {
      throw new Error('Error');
    };

    eventDispatcher.on('1', callback);

    eventDispatcher.emit('1', 1);

    assert.ok('success emit');
  });

  it('on & emit', () => {
    const eventDispatcher = new EventDispatcher();

    let isCall = false;

    const callback = (/** @type {number} */ data) => {
      isCall = true;
      assert.strictEqual(data, 1);
    };

    eventDispatcher.on('1', callback);

    eventDispatcher.emit('1', 1);

    if (!isCall) {
      assert.fail('callback not called');
    }
  });

  it('multiple on & emit', () => {
    const eventDispatcher = new EventDispatcher();

    let isCall1 = false;
    let isCall2 = false;

    const callback1 = (/** @type {number} */ data) => {
      isCall1 = true;
      assert.strictEqual(data, 1);
    };
    const callback2 = (/** @type {number} */ data) => {
      isCall2 = true;
      assert.strictEqual(data, 2);
    };

    eventDispatcher.on('1', callback1);
    eventDispatcher.on('2', callback2);

    eventDispatcher.emit('1', 1);
    eventDispatcher.emit('2', 2);

    if (!isCall1 && !isCall2) {
      assert.fail('callback 1 & 2 not called');
    }
    if (!isCall1) {
      assert.fail('callback 1 not called');
    }
    if (!isCall2) {
      assert.fail('callback 2 not called');
    }
  });

  it('on & emit same callback', () => {
    const eventDispatcher = new EventDispatcher();

    let isCall1 = false;
    let isCall2 = false;

    const callback1 = (/** @type {number} */ data) => {
      isCall1 = true;
      assert.strictEqual(data, 1);
    };
    const callback2 = (/** @type {number} */ data) => {
      isCall2 = true;
      assert.strictEqual(data, 1);
    };

    eventDispatcher.on('1', callback1);
    eventDispatcher.on('1', callback2);

    eventDispatcher.emit('1', 1);

    if (!isCall1 && !isCall2) {
      assert.fail('callback 1 & 2 not called');
    }
    if (!isCall1) {
      assert.fail('callback 1 not called');
    }
    if (!isCall2) {
      assert.fail('callback 2 not called');
    }
  });

  it('on & remove first & emit', () => {
    const eventDispatcher = new EventDispatcher();

    let isCall1 = false;
    let isCall2 = false;

    const callback1 = (/** @type {number} */ data) => {
      isCall1 = true;
      assert.strictEqual(data, 1);
    };
    const callback2 = (/** @type {number} */ data) => {
      isCall2 = true;
      assert.strictEqual(data, 1);
    };

    eventDispatcher.on('1', callback1);
    eventDispatcher.on('1', callback2);
    eventDispatcher.remove('1', callback1);
    eventDispatcher.emit('1', 1);

    if (isCall1 && !isCall2) {
      assert.fail('callback 1 called & 2 not called');
    }
    if (isCall1) {
      assert.fail('callback 1 called');
    }
    if (!isCall2) {
      assert.fail('callback 2 not called');
    }
  });

  it('on & remove last & emit', () => {
    const eventDispatcher = new EventDispatcher();

    let isCall1 = false;
    let isCall2 = false;

    const callback1 = (/** @type {number} */ data) => {
      isCall1 = true;
      assert.strictEqual(data, 1);
    };
    const callback2 = (/** @type {number} */ data) => {
      isCall2 = true;
      assert.strictEqual(data, 1);
    };

    eventDispatcher.on('1', callback1);
    eventDispatcher.on('1', callback2);

    eventDispatcher.remove('1', callback2);

    eventDispatcher.emit('1', 1);

    if (!isCall1 && isCall2) {
      assert.fail('callback 1 not called & 2 called');
    }
    if (!isCall1) {
      assert.fail('callback 1 not called');
    }
    if (isCall2) {
      assert.fail('callback 2 called');
    }
  });

  it('on & remove middle & emit', () => {
    const eventDispatcher = new EventDispatcher();

    let isCall1 = false;
    let isCall2 = false;
    let isCall3 = false;

    const callback1 = (/** @type {number} */ data) => {
      isCall1 = true;
      assert.strictEqual(data, 1);
    };
    const callback2 = (/** @type {number} */ data) => {
      isCall2 = true;
      assert.strictEqual(data, 1);
    };
    const callback3 = (/** @type {number} */ data) => {
      isCall3 = true;
      assert.strictEqual(data, 1);
    };

    eventDispatcher.on('1', callback1);
    eventDispatcher.on('1', callback2);
    eventDispatcher.on('1', callback3);

    eventDispatcher.remove('1', callback2);

    eventDispatcher.emit('1', 1);

    if (!isCall1 && isCall2 && !isCall3) {
      assert.fail('callback 1 not called & 2 called & callback 3 not called');
    }
    if (!isCall1) {
      assert.fail('callback 1 not called');
    }
    if (isCall2) {
      assert.fail('callback 2 called');
    }
    if (!isCall3) {
      assert.fail('callback 3 not called');
    }
  });
});

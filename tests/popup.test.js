const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const vm = require('node:vm');

// Setup Mock Environment
const dom = {
  elements: [],
  getElementById(id) {
    return this.elements.find(el => el.id === id) || null;
  },
  body: { id: 'body' }
};

class MockElement {
  constructor(tagName, parentElement = null) {
    this.tagName = tagName.toUpperCase();
    this.parentElement = parentElement;
    this.classList = {
      classes: new Set(),
      toggle(className, force) {
        if (force) {
          this.classes.add(className);
        } else {
          this.classes.delete(className);
        }
      },
      contains(className) {
        return this.classes.has(className);
      }
    };
    this.id = '';
    this.checked = false;
    this._selector = null;
    this.listeners = {};
    dom.elements.push(this);
  }

  addEventListener(event, cb) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(cb);
  }

  closest(selector) {
    let current = this;
    while (current) {
      if (
        (selector.startsWith('.') && current.classList.contains(selector.slice(1))) ||
        selector === current.tagName.toLowerCase() ||
        selector === current._selector
      ) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }
}

global.window = global;
global.document = dom;
global.chrome = {
  storage: {
    sync: {
      get: (keys, cb) => cb({}),
      set: () => {}
    }
  },
  runtime: {
    lastError: null
  }
};
// browser shim
global.browser = global.chrome;

// Pre-create elements for SETTINGS_CONFIG
const configIds = [
  'toggle-status', 'toggle-channels', 'toggle-community', 'toggle-meta',
  'toggle-emojis', 'toggle-gifs', 'toggle-stickers', 'toggle-advertise', 'toggle-tools'
];
configIds.forEach(id => {
  const el = new MockElement('input');
  el.id = id;
  el.type = 'checkbox';
  // Wrap in a .quick-setting div
  const wrapper = new MockElement('div');
  wrapper.classList.toggle('quick-setting', true);
  el.parentElement = wrapper;
});

// Load popup.js
const popupJs = fs.readFileSync('./popup.js', 'utf8');
const context = vm.createContext(global);
vm.runInContext(popupJs, context);

const updateButtonStyle = context.updateButtonStyle;

test('updateButtonStyle - adds active class when isActive is true', () => {
  const container = new MockElement('div');
  container.classList.toggle('quick-setting', true);

  const input = new MockElement('input', container);

  updateButtonStyle(input, true);

  assert.strictEqual(container.classList.contains('active'), true, 'Container should have active class');
});

test('updateButtonStyle - removes active class when isActive is false', () => {
  const container = new MockElement('div');
  container.classList.toggle('quick-setting', true);
  container.classList.toggle('active', true); // already active

  const input = new MockElement('input', container);

  updateButtonStyle(input, false);

  assert.strictEqual(container.classList.contains('active'), false, 'Container should not have active class');
});

test('updateButtonStyle - handles deep nesting', () => {
  const container = new MockElement('div');
  container.classList.toggle('quick-setting', true);

  const middle = new MockElement('div', container);
  const input = new MockElement('input', middle);

  updateButtonStyle(input, true);

  assert.strictEqual(container.classList.contains('active'), true, 'Ancestor container should have active class');
});

test('updateButtonStyle - throws when no .quick-setting ancestor is found', () => {
  const input = new MockElement('input'); // no parent
  assert.throws(() => {
    updateButtonStyle(input, true);
  }, {
    name: 'TypeError',
    message: "Cannot read properties of null (reading 'classList')"
  });
});

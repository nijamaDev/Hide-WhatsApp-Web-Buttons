const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const vm = require('node:vm');

// Mock DOM classes
class MockElement {
  constructor(tagName, parentElement = null) {
    this.tagName = tagName.toUpperCase();
    this.parentElement = parentElement;
    this.style = { display: '' };
    this.childNodes = [];
    this._attributes = {};
  }

  setAttribute(name, value) {
    this._attributes[name] = value;
  }

  getAttribute(name) {
    return this._attributes[name];
  }

  closest(selector) {
    let current = this;
    while (current) {
      if (current.tagName.toLowerCase() === selector.toLowerCase()) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }
}

class MockTitleElement extends MockElement {
  constructor(text, parentElement) {
    super('TITLE', parentElement);
    this.textContent = text;
  }
}

// Set up global mock environment
const dom = {
  document: {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    body: new MockElement('BODY')
  }
};

const sandbox = {
  document: dom.document,
  console: console,
  Array: Array,
  Object: Object,
  MutationObserver: class {
    constructor() {}
    observe() {}
  },
  requestAnimationFrame: () => {},
  cancelAnimationFrame: () => {},
  browser: {
    storage: {
      sync: {
        get: (keys, cb) => cb({}),
        set: () => {}
      },
      onChanged: {
        addListener: () => {}
      }
    },
    runtime: {
      lastError: null
    }
  },
  setTimeout: setTimeout
};

const context = vm.createContext(sandbox);
const contentScriptSource = fs.readFileSync('./content.js', 'utf8');
vm.runInContext(contentScriptSource, context);

const titleEGSValue = 'wds-ic-sticker-smiley';

// Test cases
test('updateSpecificButton - standard button found via query', (t) => {
  const container = new MockElement('DIV');
  const button = new MockElement('BUTTON', container);
  const span = new MockElement('SPAN', button);

  const originalQuerySelector = dom.document.querySelector;
  dom.document.querySelector = (query) => query === '.test-selector' ? span : null;

  context.updateSpecificButton(true, '.test-selector');
  assert.strictEqual(container.style.display, 'none', 'Container should be hidden');

  dom.document.querySelector = originalQuerySelector;
});

test('updateSpecificButton - button with span parent', (t) => {
  const wrapper = new MockElement('DIV');
  const spanParent = new MockElement('SPAN', wrapper);
  const button = new MockElement('BUTTON', spanParent);
  const icon = new MockElement('SPAN', button);

  const originalQuerySelector = dom.document.querySelector;
  dom.document.querySelector = (query) => query === '.test-icon' ? icon : null;

  context.updateSpecificButton(true, '.test-icon');
  assert.strictEqual(wrapper.style.display, 'none', 'Wrapper should be hidden when button parent is a span');

  dom.document.querySelector = originalQuerySelector;
});

test('updateSpecificButton - EGS button special case', (t) => {
  const grandWrapper = new MockElement('DIV');
  const wrapper = new MockElement('DIV', grandWrapper);
  const spanParent = new MockElement('SPAN', wrapper);
  const button = new MockElement('BUTTON', spanParent);
  const svg = new MockElement('SVG', button);
  const title = new MockTitleElement(titleEGSValue, svg);

  const originalQuerySelectorAll = dom.document.querySelectorAll;
  dom.document.querySelectorAll = (query) => {
    if (query === 'svg title') return [title];
    return [];
  };

  // Explicitly pass the value to avoid any context issues
  context.updateSpecificButton(true, null, titleEGSValue);

  assert.strictEqual(grandWrapper.style.display, 'none', 'Grand wrapper should be hidden for EGS button');

  dom.document.querySelectorAll = originalQuerySelectorAll;
});

test('updateSpecificButton - button without span parent', (t) => {
    const wrapper = new MockElement('DIV');
    const button = new MockElement('BUTTON', wrapper);
    const icon = new MockElement('SPAN', button);

    const originalQuerySelector = dom.document.querySelector;
    dom.document.querySelector = (query) => query === '.test-icon' ? icon : null;

    context.updateSpecificButton(true, '.test-icon');
    assert.strictEqual(wrapper.style.display, 'none', 'Wrapper should be hidden');

    dom.document.querySelector = originalQuerySelector;
  });

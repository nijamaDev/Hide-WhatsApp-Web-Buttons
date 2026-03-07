const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const vm = require('node:vm');

// Setup Mock Environment
const dom = {
  elements: [],
  querySelector(query) {
    return this.elements.find(el => el._selector === query) || null;
  },
  querySelectorAll(query) {
    if (query === 'svg title') {
      return this.elements.filter(el => el.tagName === 'TITLE');
    }
    return this.elements.filter(el => el._selector === query);
  },
  getElementById(id) {
    return this.elements.find(el => el.id === id) || null;
  },
  body: { id: 'body' }
};

class MockElement {
  constructor(tagName, parentElement = null) {
    this.tagName = tagName.toUpperCase();
    this.parentElement = parentElement;
    this.style = { display: '' };
    this.textContent = '';
    this.id = '';
    this._selector = null;
    dom.elements.push(this);
  }

  closest(selector) {
    let el = this;
    while (el) {
      if (selector === 'button' && el.tagName === 'BUTTON') {
        return el;
      }
      if (selector === '.quick-setting' && el._selector === '.quick-setting') {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  }
}

global.window = global;
global.document = dom;
global.navigator = { userAgent: 'node' };
global.chrome = {
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
};
// browser is not defined yet, content.js will do: var browser = chrome;
global.MutationObserver = class {
  constructor() {}
  observe() {}
};
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = () => {};

// Load content.js
const contentJs = fs.readFileSync('./content.js', 'utf8');
const context = vm.createContext(global);
vm.runInContext(contentJs, context);

// Access functions and variables from context
const updateSpecificButton = context.updateSpecificButton;
// titleEGS is not exported because it's defined with const in content.js
// and we are running in a script context.
// Let's re-define it here or extract it if possible.
const titleEGS = 'wds-ic-sticker-smiley';

test('updateSpecificButton - query based hiding', () => {
  dom.elements = [];
  const container = new MockElement('div');
  const button = new MockElement('button', container);
  const icon = new MockElement('span', button);
  icon._selector = '.hide-me';

  updateSpecificButton(true, '.hide-me');
  assert.strictEqual(container.style.display, 'none', 'Container should be hidden');

  updateSpecificButton(false, '.hide-me');
  assert.strictEqual(container.style.display, 'flex', 'Container should be shown');
});

test('updateSpecificButton - title based hiding', () => {
  dom.elements = [];
  const container = new MockElement('div');
  const button = new MockElement('button', container);
  const svg = new MockElement('svg', button);
  const title = new MockElement('title', svg);
  title.textContent = 'Status';

  updateSpecificButton(true, null, 'Status');
  assert.strictEqual(container.style.display, 'none', 'Container should be hidden by title');

  updateSpecificButton(false, null, 'Status');
  assert.strictEqual(container.style.display, 'flex', 'Container should be shown by title');
});

test('updateSpecificButton - span parent case', () => {
  dom.elements = [];
  const grandContainer = new MockElement('div');
  const spanParent = new MockElement('span', grandContainer);
  const button = new MockElement('button', spanParent);
  const icon = new MockElement('span', button);
  icon._selector = '.span-test';

  updateSpecificButton(true, '.span-test');
  assert.strictEqual(grandContainer.style.display, 'none', 'Grand container should be hidden when button parent is span');

  updateSpecificButton(false, '.span-test');
  assert.strictEqual(grandContainer.style.display, 'flex', 'Grand container should be shown when button parent is span');
});

test('updateSpecificButton - titleEGS special case', () => {
  dom.elements = [];
  // Structure: root (div) -> grandParent (span) -> parent (div) -> button
  const root = new MockElement('div');
  const grandParent = new MockElement('span', root);
  const parent = new MockElement('div', grandParent);
  const button = new MockElement('button', parent);
  const svg = new MockElement('svg', button);
  const title = new MockElement('title', svg);
  title.textContent = titleEGS;

  updateSpecificButton(true, null, titleEGS);
  assert.strictEqual(grandParent.style.display, 'none', 'grandParent should be hidden for titleEGS');

  updateSpecificButton(false, null, titleEGS);
  assert.strictEqual(grandParent.style.display, 'flex', 'grandParent should be shown for titleEGS');
});

test('updateSpecificButton - titleEGS + span parent case', () => {
  dom.elements = [];
  // Structure: root (div) -> extraLevel (div) -> spanParent (span) -> button
  const root = new MockElement('div');
  const extraLevel = new MockElement('div', root);
  const spanParent = new MockElement('span', extraLevel);
  const button = new MockElement('button', spanParent);
  const svg = new MockElement('svg', button);
  const title = new MockElement('title', svg);
  title.textContent = titleEGS;

  // Trace:
  // 1. element = button
  // 2. buttonParent = spanParent (span)
  // 3. elementToToggle = spanParent (span)
  // 4. buttonParent is span, so elementToToggle = spanParent.parentElement = extraLevel (div)
  // 5. titleText === titleEGS, so elementToToggle = extraLevel.parentElement = root (div)
  // Result: root should be hidden

  updateSpecificButton(true, null, titleEGS);
  assert.strictEqual(root.style.display, 'none', 'Root should be hidden for titleEGS with span parent');

  updateSpecificButton(false, null, titleEGS);
  assert.strictEqual(root.style.display, 'flex', 'Root should be shown for titleEGS with span parent');
});

test('updateSpecificButton - element not found', () => {
  dom.elements = [];
  // Should not throw
  updateSpecificButton(true, '.non-existent');
  updateSpecificButton(true, null, 'NonExistentTitle');
});

test('updateSpecificButton - no button parent', () => {
  dom.elements = [];
  const div = new MockElement('div');
  div._selector = '.no-button';

  updateSpecificButton(true, '.no-button');
  assert.strictEqual(div.style.display, '', 'Nothing should change if no button parent is found');
});

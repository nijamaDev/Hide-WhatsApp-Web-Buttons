// Mocking the DOM environment
global.document = {
  querySelectorAll: (selector) => {
    // Return a dummy array of elements to mock finding DOM nodes
    return [{
      parentElement: {
        style: {}
      },
      closest: (s) => null
    }];
  },
  querySelector: (selector) => {
    return {
      tagName: 'div',
      parentElement: null,
      style: {},
      closest: (s) => null
    };
  },
  getElementById: (id) => {
    return {
      tagName: 'div',
      parentElement: null,
      style: {},
      closest: (s) => null
    };
  },
  body: {}
};

// Mocking the browser object
global.browser = {
  storage: {
    sync: {
      get: (keys, callback) => {
        const result = {};
        keys.forEach(k => result[k] = true);
        callback(result);
      },
      set: () => {}
    },
    onChanged: {
      addListener: () => {}
    }
  },
  runtime: {}
};

// A simple queue to run requestAnimationFrame immediately for benchmark
let rafQueue = [];
let nextRafId = 1;
global.requestAnimationFrame = (callback) => {
  const id = nextRafId++;
  rafQueue.push({ id, callback });
  return id;
};
global.cancelAnimationFrame = (id) => {
  rafQueue = rafQueue.filter(item => item.id !== id);
};
global.flushRAF = () => {
  const currentQueue = rafQueue;
  rafQueue = [];
  currentQueue.forEach(item => item.callback());
};


// Load the content.js code
const fs = require('fs');
const vm = require('vm');
const contentScript = fs.readFileSync('./content.js', 'utf8');

// We need to extract the observer so we can trigger it
let capturedObserver = null;
class CapturingMutationObserver {
  constructor(callback) {
    this.callback = callback;
    capturedObserver = this;
  }
  observe(target, options) {}

  trigger(mutations) {
    this.callback(mutations);
  }
}
global.MutationObserver = CapturingMutationObserver;

// Run the content script in the current context
vm.runInThisContext(contentScript);

// Wait a bit for the async get to complete (though it's synchronous in our mock)
setTimeout(() => {
  if (!capturedObserver) {
    console.error("Failed to capture observer.");
    process.exit(1);
  }

  const NUM_MUTATIONS = 10000;
  // Create a large number of mutations to simulate
  const mutations = [];
  for (let i = 0; i < NUM_MUTATIONS; i++) {
    mutations.push({ addedNodes: [{}] }); // Added nodes triggers updateAllButtons
  }

  // Baseline Benchmark (Simulating WhatsApp firing individual mutation batches rapidly)
  console.log(`Running benchmark with ${NUM_MUTATIONS} mutation batches...`);

  const startTime = process.hrtime.bigint();

  for (let i = 0; i < NUM_MUTATIONS; i++) {
    // Pass a small batch of mutations
    capturedObserver.trigger([mutations[i]]);
  }

  // After all triggers, if we have RAF, we need to flush them
  global.flushRAF();

  const endTime = process.hrtime.bigint();

  const durationMs = Number(endTime - startTime) / 1000000;
  console.log(`Time taken: ${durationMs.toFixed(2)} ms`);
}, 100);

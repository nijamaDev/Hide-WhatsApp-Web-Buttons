
function runBenchmark() {
    const depth = 50;
    const iterations = 1000000;

    // Mock DOM Node
    function createMockNode(tagName, parent = null) {
        return {
            tagName: tagName.toUpperCase(),
            parentElement: parent,
            closest: function(selector) {
                if (selector.toLowerCase() === 'button') {
                    let curr = this;
                    while (curr) {
                        if (curr.tagName === 'BUTTON') return curr;
                        curr = curr.parentElement;
                    }
                }
                return null;
            }
        };
    }

    // Build a tree of depth 50, with a BUTTON at the top
    let root = createMockNode('BUTTON');
    let leaf = root;
    for (let i = 0; i < depth; i++) {
        leaf = createMockNode('DIV', leaf);
    }

    console.log(`Starting benchmark with depth=${depth}, iterations=${iterations}\n`);

    // 1. Manual While Loop (current implementation)
    const startManual = process.hrtime.bigint();
    for (let i = 0; i < iterations; i++) {
        let currentElement = leaf;
        while (currentElement.parentElement) {
            if (currentElement.tagName.toLowerCase() === 'button') {
                // found button logic (simulated)
                const buttonParent = currentElement.parentElement;
                break;
            }
            currentElement = currentElement.parentElement;
        }
    }
    const endManual = process.hrtime.bigint();
    const manualTime = Number(endManual - startManual) / 1000000;
    console.log(`Manual While Loop: ${manualTime.toFixed(2)}ms`);

    // 2. element.closest('button') (optimized implementation)
    const startClosest = process.hrtime.bigint();
    for (let i = 0; i < iterations; i++) {
        const button = leaf.closest('button');
        if (button) {
            // found button logic (simulated)
            const buttonParent = button.parentElement;
        }
    }
    const endClosest = process.hrtime.bigint();
    const closestTime = Number(endClosest - startClosest) / 1000000;
    console.log(`element.closest(): ${closestTime.toFixed(2)}ms`);

    const improvement = ((manualTime - closestTime) / manualTime) * 100;
    console.log(`\nImprovement: ${improvement.toFixed(2)}% (Note: In Node.js, both are JS-based. Native browser closest() will be even faster)`);
}

runBenchmark();

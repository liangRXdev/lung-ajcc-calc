'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../js/clipboard.js');

// ---- 測試替身 ----
function fakeDoc({ execResult = true, execThrows = false } = {}) {
    const children = [];
    return {
        children,
        body: {
            appendChild: (el) => children.push(el),
            removeChild: (el) => children.splice(children.indexOf(el), 1)
        },
        createElement: () => ({ style: {}, focus() {}, select() {} }),
        execCommand: () => {
            if (execThrows) throw new Error('SecurityError');
            return execResult;
        }
    };
}

function fakeTimers() {
    let next = 1;
    const pending = new Map();
    return {
        schedule: (fn, ms) => { const id = next++; pending.set(id, fn); return id; },
        cancel: (id) => pending.delete(id),
        // 依排程順序觸發第 i 個仍存活的 timer
        fire(i = 0) {
            const [id, fn] = [...pending.entries()][i];
            pending.delete(id);
            fn();
        },
        get size() { return pending.size; }
    };
}

function harness() {
    const timers = fakeTimers();
    const states = [];
    const fb = C.createCopyFeedback({
        render: (s) => states.push(s),
        schedule: timers.schedule,
        cancel: timers.cancel
    });
    return { fb, timers, last: () => states[states.length - 1] };
}

// ---- copyText ----
test('copyText：Clipboard API 成功 → true，不呼叫 legacy', async () => {
    let legacyCalled = false;
    const ok = await C.copyText('x', {
        clipboard: { writeText: () => Promise.resolve() },
        legacyCopy: () => { legacyCalled = true; return true; }
    });
    assert.equal(ok, true);
    assert.equal(legacyCalled, false);
});

test('copyText：Clipboard API reject → 改用 legacy 的結果', async () => {
    const env = (r) => ({ clipboard: { writeText: () => Promise.reject(new Error('denied')) }, legacyCopy: () => r });
    assert.equal(await C.copyText('x', env(true)), true);
    assert.equal(await C.copyText('x', env(false)), false);
});

test('copyText：無 Clipboard API 且 legacy 拋例外 → false（不 reject）', async () => {
    const ok = await C.copyText('x', { clipboard: undefined, legacyCopy: () => { throw new Error('boom'); } });
    assert.equal(ok, false);
});

test('legacyCopy：execCommand 成功/失敗皆移除 textarea', () => {
    for (const execResult of [true, false]) {
        const doc = fakeDoc({ execResult });
        assert.equal(C.legacyCopy('x', doc), execResult);
        assert.equal(doc.children.length, 0);
    }
});

// ---- 回饋狀態 ----
test('feedback：成功 → copied，計時到 → idle', () => {
    const { fb, timers, last } = harness();
    fb.succeed(fb.begin());
    assert.equal(last(), 'copied');
    timers.fire();
    assert.equal(last(), 'idle');
});

test('feedback：reset → idle', () => {
    const { fb, last } = harness();
    fb.succeed(fb.begin());
    fb.reset();
    assert.equal(last(), 'idle');
});

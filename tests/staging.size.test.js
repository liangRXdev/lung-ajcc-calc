'use strict';
// 腫瘤徑自動推 T（PR #1 待決 #5）
// 重現（修正前）：手動選 T4（侵犯縱膈）後輸入腫瘤徑 2 → T 被改成 T1b，分期由 IIIA 降為 IA2；
//                手動選 Tis 後輸入 0.5 → 變 T1a；輸入 0 → T1a
const test = require('node:test');
const assert = require('node:assert/strict');
const S = require('../js/staging.js');

test('一般情況依徑長推 T（門檻含上界）', () => {
    const cases = [[0.5, 'T1a'], [1, 'T1a'], [1.1, 'T1b'], [2, 'T1b'], [3, 'T1c'], [4, 'T2a'],
        [5, 'T2b'], [5.1, 'T3'], [7, 'T3'], [7.1, 'T4']];
    for (const [cm, want] of cases) {
        assert.equal(S.tBySize(cm, 'TX', true).t, want, `${cm} cm`);
    }
});

test('徑長 ≤ 0、空白、非數值 → 不改 T，並提示', () => {
    for (const v of [0, -1, '', 'abc', NaN]) {
        const r = S.tBySize(v, 'T2a', false);
        assert.equal(r.t, 'T2a', String(v));
        assert.equal(r.changed, false, String(v));
    }
    assert.match(S.tBySize(0, 'T2a', false).note, /大於 0/);
    assert.equal(S.tBySize('', 'T2a', false).note, '');
});

test('手動選的 T 高於徑長推估（侵犯結構）→ 保留手動值', () => {
    const r = S.tBySize(2, 'T4', false);
    assert.equal(r.t, 'T4');
    assert.equal(r.changed, false);
    assert.match(r.note, /保留.*T4.*T1b/);
    assert.equal(S.tBySize(3.5, 'T3', false).t, 'T3');
});

test('手動選 Tis／T1mi → 徑長不覆蓋', () => {
    assert.equal(S.tBySize(0.5, 'Tis', false).t, 'Tis');
    assert.equal(S.tBySize(0.5, 'T1mi', false).t, 'T1mi');
    assert.match(S.tBySize(0.5, 'T1mi', false).note, /保留/);
});

test('手動選的 T 低於徑長推估 → 依徑長升級', () => {
    const r = S.tBySize(6, 'T1b', false);
    assert.equal(r.t, 'T3');
    assert.equal(r.changed, true);
});

test('T 原本就由徑長推得 → 徑長改小時跟著改', () => {
    assert.equal(S.tBySize(2, 'T3', true).t, 'T1b');
});

test('手動 TX 輸入徑長 → 依徑長推 T（有徑長即可評估）', () => {
    assert.equal(S.tBySize(2.5, 'TX', false).t, 'T1c');
});

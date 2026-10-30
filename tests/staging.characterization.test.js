'use strict';
// Characterization test：鎖住 bcb1ffe 內嵌 script 的 250 組輸出
// （baseline 由 tests/tools/make-baseline.js 從 git 歷史產生）。
// 刻意修正造成的差異必須列在 INTENDED_CHANGES，並於 PR 逐一說明。
const test = require('node:test');
const assert = require('node:assert/strict');
const S = require('../js/staging.js');
const baseline = require('./fixtures/baseline-bcb1ffe.json');
const D = require('./descriptions');

// key: 'stage' 或 'desc'；value: (baselineRow) => 修正後的預期值，回傳 undefined 表示不變
const INTENDED_CHANGES = {
    stage: () => undefined,
    valid: () => undefined,
    // fix(staging) #1：Stage IIIA/IIIB/IIIC 原本誤得 Stage II 描述（startsWith 順序）
    // 2026-10 待決 #4：II／III／IV 描述改寫為與組合相符的中性敘述（期望值見 description test）
    desc: (row) => {
        if (row.stage.startsWith('Stage III')) return D.STAGE_III_TEXT;
        if (row.stage.startsWith('Stage II')) return D.STAGE_II_TEXT;
        if (row.stage === 'Stage IVA') return D.STAGE_IVA_TEXT;
        if (row.stage === 'Stage IVB') return D.STAGE_IVB_TEXT;
        return undefined;
    }
};

test('baseline 涵蓋 10 T × 5 N × 5 M = 250 組', () => {
    assert.equal(baseline.rows.length, 250);
    const keys = new Set(baseline.rows.map(r => `${r.t}|${r.n}|${r.m}`));
    assert.equal(keys.size, 250);
});

test('determineStage / getStageDescription 與 baseline 一致（扣除刻意修正）', () => {
    const diffs = [];
    for (const row of baseline.rows) {
        const { stage, valid } = S.determineStage(row.t, row.n, row.m);
        const actual = { stage, valid, desc: S.getStageDescription(stage) };
        for (const k of ['stage', 'valid', 'desc']) {
            const changed = INTENDED_CHANGES[k](row);
            const expected = changed === undefined ? row[k] : changed;
            if (actual[k] !== expected) {
                diffs.push(`${row.t} ${row.n} ${row.m} ${k}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual[k])}`);
            }
        }
    }
    assert.deepEqual(diffs, []);
});

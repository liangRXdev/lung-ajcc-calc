'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const S = require('../js/staging.js');
const { T_VALUES, N_VALUES, M_VALUES } = require('./combos');

function copyFor(t, n, m, lang) {
    const { stage } = S.determineStage(t, n, m);
    return S.buildCopyText(t, n, m, stage, lang);
}

test('中文複製格式（鎖住現行輸出）', () => {
    assert.equal(copyFor('T2a', 'N1', 'M0', 'zh'),
        '肺癌 AJCC 第 9 版分期：\nTNM：cT2a N1 M0\n期別：Stage IIB\n（僅供教學參考，實際仍以臨床醫師與正式指引為準）');
});

test('英文複製格式（鎖住現行輸出）', () => {
    assert.equal(copyFor('T2a', 'N1', 'M0', 'en'),
        'Lung Cancer AJCC 9th Staging\nTNM: cT2a N1 M0\nStage: Stage IIB\nFor educational use only; not for clinical decision making.');
});

test('複製文字的 TNM 與 stage 與畫面（determineStage）一致：250 組 × 2 語言', () => {
    for (const t of T_VALUES) for (const n of N_VALUES) for (const m of M_VALUES) {
        const { stage } = S.determineStage(t, n, m);
        assert.ok(copyFor(t, n, m, 'zh').includes(`TNM：c${t} ${n} ${m}\n期別：${stage}\n`));
        assert.ok(copyFor(t, n, m, 'en').includes(`TNM: c${t} ${n} ${m}\n`));
    }
});

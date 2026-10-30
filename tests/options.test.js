'use strict';
// 下拉選單文字（PR #1 待決 #3）
// 9th 的 M1c1／M1c2 以「器官系統」區分（single organ system／multiple organ systems）。
// 舊文字「單一器官／多器官」會把例如多處骨轉移誤判為 M1c2。
// 出處：Rami-Porta R, et al. J Thorac Oncol 2024;19:1007（PMID 38447919 摘要）；
//       Argentieri G, et al. Eur Radiol 2025（PMC12165876）
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const optionText = (v) => {
    const m = new RegExp(`<option value="${v}">([^<]*)</option>`).exec(html);
    assert.ok(m, `找不到 option ${v}`);
    return m[1];
};

test('M1c1 為單一器官系統、M1c2 為多個器官系統', () => {
    assert.match(optionText('M1c1'), /單一器官系統/);
    assert.match(optionText('M1c2'), /多個器官系統/);
});

test('下拉 option value 與 tests/combos.js 一致', () => {
    const { T_VALUES, N_VALUES, M_VALUES } = require('./combos');
    for (const [id, vals] of [['t-stage', T_VALUES], ['n-stage', N_VALUES], ['m-stage', M_VALUES]]) {
        const sel = new RegExp(`<select id="${id}">([\\s\\S]*?)</select>`).exec(html)[1];
        const got = [...sel.matchAll(/<option value="([^"]+)"/g)].map((m) => m[1]);
        assert.deepEqual(got, vals, id);
    }
});

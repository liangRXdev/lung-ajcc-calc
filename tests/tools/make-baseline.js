// 從指定 git 版本的 index.html 內嵌 <script> 取出原始 determineStage /
// getStageDescription，跑 10 T × 5 N × 5 M = 250 組，輸出 baseline JSON。
// 用法：node tests/tools/make-baseline.js bcb1ffe > tests/fixtures/baseline-bcb1ffe.json
'use strict';
const { execFileSync } = require('node:child_process');
const vm = require('node:vm');
const { T_VALUES, N_VALUES, M_VALUES } = require('../combos');

const rev = process.argv[2] || 'bcb1ffe';
const html = execFileSync('git', ['show', `${rev}:index.html`], { encoding: 'utf8' });
const start = html.indexOf('const t1_group');
const end = html.indexOf('function updateResultAppearance');
if (start < 0 || end < 0) throw new Error(`找不到分期函式於 ${rev}:index.html`);

const ctx = {};
vm.createContext(ctx);
vm.runInContext(
    html.slice(start, end) + '\nthis.determineStage = determineStage; this.getStageDescription = getStageDescription;',
    ctx
);

const rows = [];
for (const t of T_VALUES) for (const n of N_VALUES) for (const m of M_VALUES) {
    const { stage, valid } = ctx.determineStage(t, n, m);
    rows.push({ t, n, m, stage, valid, desc: ctx.getStageDescription(stage) });
}
process.stdout.write(JSON.stringify({ source: `${rev}:index.html`, rows }, null, 1) + '\n');

'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const S = require('../js/staging.js');

const STAGE_II_TEXT = '局部進展期，可能累及鄰近結構或同側肺門淋巴結。';
const STAGE_III_TEXT = '區域進展期，常累及縱膈或多站淋巴結，需多模式治療評估。';

// 重現：T4 N0 M0 → Stage IIIA，畫面描述卻是 Stage II 的文字
for (const stage of ['Stage IIIA', 'Stage IIIB', 'Stage IIIC']) {
    test(`${stage} 取得 Stage III 描述而非 Stage II`, () => {
        assert.equal(S.getStageDescription(stage), STAGE_III_TEXT);
    });
}

for (const stage of ['Stage IIA', 'Stage IIB']) {
    test(`${stage} 仍取得 Stage II 描述`, () => {
        assert.equal(S.getStageDescription(stage), STAGE_II_TEXT);
    });
}

test('每個可產生的 stage 都對應到自己層級的描述（不落入預設句）', () => {
    const { T_VALUES, N_VALUES, M_VALUES } = require('./combos');
    const fallback = S.getStageDescription('__unknown__');
    for (const t of T_VALUES) for (const n of N_VALUES) for (const m of M_VALUES) {
        const { stage } = S.determineStage(t, n, m);
        assert.notEqual(S.getStageDescription(stage), fallback, `${t} ${n} ${m} → ${stage}`);
    }
});

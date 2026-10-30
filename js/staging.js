/*
 * 肺癌 AJCC 第 9 版分期：純函式（無 DOM 相依）。
 * 瀏覽器以 <script src="js/staging.js"> 載入後掛在 window.LungStaging；
 * Node 以 require('./js/staging.js') 取得（node --test 用）。
 *
 * 分期表（T×N×M → stage）屬臨床裁決：程式與原文不符時不自行改值，
 * 先列待決交由臨床確認。見 CLAUDE.md。
 */
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    } else {
        root.LungStaging = api;
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const t1_group = ['T1mi', 'T1a', 'T1b', 'T1c'];
    const t2_group = ['T2a', 'T2b'];
    const t1_t2_group = t1_group.concat(t2_group);

    function determineStage(t, n, m) {
        // 先依 M 決定是否為 IV 期
        if (m === 'M1c1' || m === 'M1c2') {
            return { stage: 'Stage IVB', valid: true };
        }
        if (m === 'M1a' || m === 'M1b') {
            return { stage: 'Stage IVA', valid: true };
        }
        if (m !== 'M0') {
            return {
                stage: '無對應分期',
                valid: false
            };
        }

        // 以下為 M0 時依 T/N 組合
        if (n === 'N3') {
            if (t === 'T3' || t === 'T4') {
                return { stage: 'Stage IIIC', valid: true };
            }
            if (t1_t2_group.includes(t)) {
                return { stage: 'Stage IIIB', valid: true };
            }
            return { stage: '無對應分期', valid: false };
        }

        if (n === 'N2b') {
            if (t === 'T4') {
                return { stage: 'Stage IIIB', valid: true };
            }
            if (t === 'T3' || t2_group.includes(t)) {
                return { stage: 'Stage IIIB', valid: true };
            }
            if (t1_group.includes(t)) {
                return { stage: 'Stage IIIA', valid: true };
            }
            return { stage: '無對應分期', valid: false };
        }

        if (n === 'N2a') {
            if (t === 'T4') {
                return { stage: 'Stage IIIB', valid: true };
            }
            if (t === 'T3' || t2_group.includes(t)) {
                return { stage: 'Stage IIIA', valid: true };
            }
            if (t1_group.includes(t)) {
                return { stage: 'Stage IIB', valid: true };
            }
            return { stage: '無對應分期', valid: false };
        }

        if (n === 'N1') {
            if (t === 'T3' || t === 'T4') {
                return { stage: 'Stage IIIA', valid: true };
            }
            if (t2_group.includes(t)) {
                return { stage: 'Stage IIB', valid: true };
            }
            if (t1_group.includes(t)) {
                return { stage: 'Stage IIA', valid: true };
            }
            return { stage: '無對應分期', valid: false };
        }

        if (n === 'N0') {
            if (t === 'T4') {
                return { stage: 'Stage IIIA', valid: true };
            }
            if (t === 'T3') {
                return { stage: 'Stage IIB', valid: true };
            }
            if (t === 'T2b') {
                return { stage: 'Stage IIA', valid: true };
            }
            if (t === 'T2a') {
                return { stage: 'Stage IB', valid: true };
            }
            if (t === 'T1c') {
                return { stage: 'Stage IA3', valid: true };
            }
            if (t === 'T1b') {
                return { stage: 'Stage IA2', valid: true };
            }
            if (t === 'T1mi' || t === 'T1a') {
                return { stage: 'Stage IA1', valid: true };
            }
            if (t === 'Tis') {
                return { stage: 'Stage 0', valid: true };
            }
            if (t === 'TX') {
                return { stage: 'Occult Carcinoma', valid: true };
            }
            return { stage: '無對應分期', valid: false };
        }

        return { stage: '無對應分期', valid: false };
    }

    function getStageDescription(stageText) {
        if (stageText === 'Occult Carcinoma') {
            return '以痰細胞學等發現癌細胞，但影像學未見明確原發腫瘤（隱匿癌）。';
        }
        if (stageText === 'Stage 0') {
            return '原位癌，局限於上皮層，尚未侵犯基底膜，屬最早期病變。';
        }
        if (stageText.startsWith('Stage IA')) {
            return '局限於肺內小腫瘤，無淋巴結或遠端轉移，預後相對較佳。';
        }
        if (stageText === 'Stage IB') {
            return '腫瘤稍大但仍局限於肺部，無淋巴結或遠端轉移。';
        }
        // 'Stage III*' 也以 'Stage II' 開頭，必須先判斷 III
        if (stageText.startsWith('Stage III')) {
            return '區域進展期，常累及縱膈或多站淋巴結，需多模式治療評估。';
        }
        if (stageText.startsWith('Stage II')) {
            return '局部進展期，可能累及鄰近結構或同側肺門淋巴結。';
        }
        if (stageText.startsWith('Stage IV')) {
            return '遠端轉移期，代表存在胸腔外或多處轉移，以全身性治療為主。';
        }
        if (stageText.includes('無對應分期')) {
            return '此 T / N / M 組合不在 AJCC 第 9 版標準分期表中，請檢查輸入是否正確，或參考原文指引。';
        }
        return '請搭配 AJCC 第 9 版正式指引與臨床評估解讀此分期結果。';
    }

    function buildCopyText(t, n, m, stageText, lang) {
        if (lang === 'zh') {
            return `肺癌 AJCC 第 9 版分期：\n` +
                `TNM：c${t} ${n} ${m}\n` +
                `期別：${stageText}\n` +
                `（僅供教學參考，實際仍以臨床醫師與正式指引為準）`;
        }
        return `Lung Cancer AJCC 9th Staging\n` +
            `TNM: c${t} ${n} ${m}\n` +
            `Stage: ${stageText}\n` +
            `For educational use only; not for clinical decision making.`;
    }

    return {
        determineStage,
        getStageDescription,
        buildCopyText
    };
}));

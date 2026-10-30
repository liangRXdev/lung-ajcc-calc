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
        // 敘述須涵蓋該期所有組合（例如 IIIA 含 T4 N0，不可寫「常累及縱膈」）
        if (stageText.startsWith('Stage III')) {
            return '區域進展期：較大或侵犯鄰近結構的腫瘤（T3–T4），和／或縱膈（N2）、對側或鎖骨上（N3）淋巴結轉移；需多專科評估治療。';
        }
        if (stageText.startsWith('Stage II')) {
            return '局部進展：較大或侵犯鄰近結構的腫瘤（T2b–T3），或已有同側肺門（N1）淋巴結轉移；T1 合併單站縱膈（N2a）亦屬此期。';
        }
        if (stageText === 'Stage IVA') {
            return '遠端轉移（IVA）：胸腔內轉移（對側肺結節、肋膜或心包膜結節／惡性積液，M1a），或單一胸腔外轉移（M1b）。';
        }
        if (stageText === 'Stage IVB') {
            return '遠端轉移（IVB）：多處胸腔外轉移，位於單一器官系統（M1c1）或多個器官系統（M1c2）。';
        }
        if (stageText.includes('無對應分期')) {
            return '此 T / N / M 組合不在 AJCC 第 9 版標準分期表中，請檢查輸入是否正確，或參考原文指引。';
        }
        return '請搭配 AJCC 第 9 版正式指引與臨床評估解讀此分期結果。';
    }

    // determineStage 的「無對應分期」為中文 UI 字串，英文複製需另譯
    const EN_STAGE_LABEL = {
        '無對應分期': 'No matching stage group (not in AJCC 9th table)'
    };

    function buildCopyText(t, n, m, stageText, lang) {
        if (lang === 'zh') {
            return `肺癌 AJCC 第 9 版分期：\n` +
                `TNM：c${t} ${n} ${m}\n` +
                `期別：${stageText}\n` +
                `（僅供教學參考，實際仍以臨床醫師與正式指引為準）`;
        }
        const stageEn = EN_STAGE_LABEL[stageText] || stageText;
        return `Lung Cancer AJCC 9th Staging\n` +
            `TNM: c${t} ${n} ${m}\n` +
            `Stage: ${stageEn}\n` +
            `For educational use only; not for clinical decision making.`;
    }

    // 腫瘤徑（cm）只能推出以大小定義的 T；侵犯結構（T3／T4）與 Tis／T1mi 須由使用者手動選擇。
    // currentFromSize：目前的 T 是否由上一次徑長推得（是 → 可直接覆蓋）。
    const SIZE_T_ORDER = ['T1a', 'T1b', 'T1c', 'T2a', 'T2b', 'T3', 'T4'];

    function tBySize(sizeCm, currentT, currentFromSize) {
        // 無效輸入沿用原狀態；保留手動值時 fromSize 為 false
        const keep = (note, fromSize) => ({ t: currentT, changed: false, fromSize: !!fromSize, note: note });
        if (sizeCm === '' || sizeCm === null || sizeCm === undefined) return keep('', currentFromSize);
        const v = Number(sizeCm);
        if (!isFinite(v)) return keep('', currentFromSize);
        if (v <= 0) return keep('腫瘤徑須大於 0 cm', currentFromSize);

        const sizeT = v <= 1 ? 'T1a' : v <= 2 ? 'T1b' : v <= 3 ? 'T1c' : v <= 4 ? 'T2a'
            : v <= 5 ? 'T2b' : v <= 7 ? 'T3' : 'T4';
        if (!currentFromSize) {
            const manualRank = SIZE_T_ORDER.indexOf(currentT);
            if (currentT === 'Tis' || currentT === 'T1mi' || manualRank > SIZE_T_ORDER.indexOf(sizeT)) {
                return keep(`保留手動選擇的 ${currentT}（腫瘤徑推估為 ${sizeT}）`);
            }
        }
        return { t: sizeT, changed: sizeT !== currentT, fromSize: true, note: '' };
    }

    return {
        determineStage,
        getStageDescription,
        buildCopyText,
        tBySize
    };
}));

'use strict';
// 2026-10 改寫：舊描述與部分組合不符（PR #1 待決 #4，維護者裁決改為中性描述）
//   III 舊句「常累及縱膈或多站淋巴結」→ T4 N0、T3 N1、T4 N1（IIIA）沒有縱膈淋巴結
//   II  舊句只提「同側肺門」→ T1 N2a（IIB）已有單站縱膈淋巴結
//   IV  舊句「胸腔外或多處轉移」→ M1a 為胸腔內、可為單處
const STAGE_II_TEXT = '局部進展：較大或侵犯鄰近結構的腫瘤（T2b–T3），或已有同側肺門（N1）淋巴結轉移；T1 合併單站縱膈（N2a）亦屬此期。';
const STAGE_III_TEXT = '區域進展期：較大或侵犯鄰近結構的腫瘤（T3–T4），和／或縱膈（N2）、對側或鎖骨上（N3）淋巴結轉移；需多專科評估治療。';
const STAGE_IVA_TEXT = '遠端轉移（IVA）：胸腔內轉移（對側肺結節、肋膜或心包膜結節／惡性積液，M1a），或單一胸腔外轉移（M1b）。';
const STAGE_IVB_TEXT = '遠端轉移（IVB）：多處胸腔外轉移，位於單一器官系統（M1c1）或多個器官系統（M1c2）。';

module.exports = { STAGE_II_TEXT, STAGE_III_TEXT, STAGE_IVA_TEXT, STAGE_IVB_TEXT };

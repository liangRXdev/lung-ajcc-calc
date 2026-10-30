# lung-ajcc-calc — 專案規則

肺癌 AJCC 第 9 版 TNM 分期計算機（NSCLC 臨床分期 cTNM）。vanilla JS，無框架、無相依套件，部署於 GitHub Pages。

**定位：教學／練習用，非臨床決策依據。**

---

## 架構

- `js/staging.js` — **全部分期邏輯**（`determineStage` / `getStageDescription` / `buildCopyText`）。UMD 包裝，瀏覽器掛 `window.LungStaging`、Node 走 `module.exports`，就是為了能純 Node 測試
- `js/clipboard.js` — 複製流程（`copyText` / `legacyCopy` / `createCopyFeedback`）。DOM 與計時器以參數注入，瀏覽器掛 `window.LungClipboard`
- `index.html` — 只做 UI 接線與配色，**不要在這裡放分期邏輯**。以 `<script src>` 依序載入上述兩檔，再跑行內 script
- `tests/` — `node --test` 測試，**這就是規格**
  - `staging.characterization.test.js` + `fixtures/baseline-bcb1ffe.json`：鎖住 10 T × 5 N × 5 M = 250 組輸出
  - `tools/make-baseline.js`：從 git 歷史的 `index.html` 重產 baseline（`node tests/tools/make-baseline.js bcb1ffe`）
  - `combos.js`：T/N/M 選項值，**須與 `index.html` 下拉 option value 一致**
- 無 PWA／`sw.js`、無 `_headers`、無 CSP；改行內 script 不需重算 hash
- `index.html` 為 CRLF 行尾，編輯時保持，避免整檔 diff

## 改動流程

1. **動 `js/*.js` 前先看 `tests/`** — 期望值與重現輸入都寫在測試註解裡。
2. 修 bug：**先寫會紅的測試**，再改程式；確認拿掉修正時測試轉紅。
3. 改完跑 `node --test`（Node ≥ 18，純 Node，無外部依賴），**須全綠**。
4. 若修正刻意改變 250 組中的任何輸出：在 characterization test 的 `INTENDED_CHANGES` 登記，並於 PR 逐一說明。**不要直接改 baseline fixture。**
5. 瀏覽器實測直接開 `index.html`（`file://` 可用）或任一本機靜態伺服器。

## 分期表是臨床裁決，不自行改

- 「哪個 T×N×M 對應哪個 stage」、下拉選單的 T/N/M 定義文字、`getStageDescription` 的臨床敘述，都屬**臨床內容**
- 程式與原文不符時**不自行改值**：在 PR 列「待決」，附原文表號與該格內容，交由維護者裁決
- 對照來源（開放取用）：
  - 分期表：Rami-Porta R, et al. *Proposals for Revision of the TNM Stage Groups in the Forthcoming (Ninth) Edition of the TNM Classification for Lung Cancer.* J Thorac Oncol 2024;19(7):1007–1027. doi:10.1016/j.jtho.2024.02.011
  - T／N／M 定義：同系列 IASLC Staging Project 9th edition T、N、M component 論文
- 核對須**實際打開原文表格**，不憑記憶；取不到原文就標「未核對」
- 核對狀態（2026-10-30）：Rami-Porta 2024 全文需付費，未能逐格開表。改以兩份公開來源核對：
  - [PubMed 38447919 摘要](https://pubmed.ncbi.nlm.nih.gov/38447919/)：T1N1 → IIA、T1N2a → IIB、T3N2a → IIIA、T2N2b → IIIB、M1c1／M1c2 → IVB
  - Argentieri G, et al. *Eur Radiol* 2025（PMC12165876，開放取用）：N2a／N2b 在 T1–T4 的分期逐一列出；M1c1 = single organ system、M1c2 = multiple organ systems
  - 第 9 版有變動的格子程式全部相符；其餘格（N0、N3、T2–T4 N1、M1a／M1b）屬「摘要未列變動 → 沿用第 8 版」的**推論**，尚未逐格對原文
- 腫瘤徑推 T（`tBySize`）：只推以大小定義的 T；手動選的 Tis、T1mi 或高於徑長推估的 T（侵犯結構）不被覆蓋

## 分期邏輯現況（以測試為準）

- M1a / M1b → Stage IVA；M1c1 / M1c2 → Stage IVB（不論 T、N，含 TX、Tis）
- M0：依 N3 → N2b → N2a → N1 → N0 判斷，T 分 T1 group（T1mi/T1a/T1b/T1c）、T2 group（T2a/T2b）、T3、T4
- 特殊列：TX N0 M0 → `Occult Carcinoma`；Tis N0 M0 → `Stage 0`；T1mi N0 M0 → `Stage IA1`
- TX／Tis × N1–N3 × M0（8 組）→ `無對應分期`（`valid: false`）；英文複製譯為 `No matching stage group`
- `getStageDescription` 以 `startsWith` 判斷層級：**`Stage III` 必須在 `Stage II` 之前判斷**（2026-10 修過此 bug）

## UI 慣例

- 配色依 stage 前綴：IV 紅、III 橘、II 琥珀、0/I/Occult 藍、無對應分期 深紅；判斷順序同樣 IV → III → II
- 複製回饋一律走 `createCopyFeedback`：每次複製 `begin()` 取 token，改選或重設呼叫 `reset()`，晚到的舊結果不得顯示「已複製」
- 不收集、不傳送、不儲存任何病患資料；新增功能不得引入網路請求或 localStorage 存病患資訊

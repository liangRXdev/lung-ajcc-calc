# Lung Cancer Staging Calculator (AJCC 9th Edition) (試作練習用)

[English](README.md) | **繁體中文**

**結論：** 本專案為一基於網頁前端技術開發之醫療輔助運算工具，專為臨床醫師、醫學生與研究人員設計。系統透過接收 T (Tumor)、N (Node)、M (Metastasis) 參數，即時運算並輸出符合 AJCC 第 9 版規範的肺癌分期結果。

## 🔗 Live Demo
線上預覽與實際操作工具：[https://liangrxdev.github.io/lung-ajcc-calc/](https://liangrxdev.github.io/lung-ajcc-calc/)

---

## 📊 系統規格與客觀數據

| 項目 | 說明與規格 |
| :--- | :--- |
| **醫學依據** | AJCC Cancer Staging Manual, 9th Edition (Lung Cancer) |
| **系統架構** | 單頁式應用程式 (SPA), 100% Client-side rendering |
| **開發技術** | HTML5, Vanilla JavaScript, CSS3 |
| **部署環境** | GitHub Pages (靜態託管) |
| **資料隱私** | 無資料庫、無伺服器端資料傳輸，符合病患隱私安全要求 |

---

## ⚙️ 核心功能與操作步驟

1. **參數輸入**：使用者於下拉選單選擇 T、N、M 之次分類 (例如：T1b, N2a, M0)。選項定義皆已對齊 AJCC 9th 臨床規範。
2. **即時運算**：DOM (Document Object Model) 監聽 `onchange` 事件，無須點擊送出，JavaScript 引擎即時執行分期邏輯演算法。
3. **結果輸出與視覺標示**：動態顯示最終分期 (如 Stage IIA)。系統將依據疾病嚴重程度 (Stage I 至 Stage IV) 賦予不同的視覺化警示色階。
4. **EMR 整合輔助 (一鍵複製)**：內建 Clipboard API（失敗時改用 `execCommand('copy')`），點擊即匯出中文或英文多行格式字串，例：
   ```
   肺癌 AJCC 第 9 版分期：
   TNM：cT2a N1 M0
   期別：Stage IIB
   （僅供教學參考，實際仍以臨床醫師與正式指引為準）
   ```

---

## 🧠 判讀演算法設計基礎

實作於 `js/staging.js` 的 `determineStage(t, n, m)`，採**由重至輕 (Top-down)** 的降階檢驗：

1. **M 優先級檢驗 (遠端轉移)**
   * M = `M1c1` 或 `M1c2` $\rightarrow$ 判定為 **Stage IVB**
   * M = `M1a` 或 `M1b` $\rightarrow$ 判定為 **Stage IVA**
   * M1 時不論 T（含 `TX`、`Tis`）與 N 一律判為 IV 期。
2. **N 優先級檢驗 (僅 M0)**：依序 `N3` → `N2b` → `N2a` → `N1` → `N0`。
3. **T 組合映射 (原發腫瘤)**
   * 確認 N 狀態後，將 T 與內建群組（T1 group = T1mi, T1a, T1b, T1c；T2 group = T2a, T2b）比對，映射出最終 Stage。
   * *跨級別合併：T4 合併 N2a/N2b 均為 Stage IIIB；T2 合併 N2b 為 Stage IIIB。*
4. **N0 M0 特殊列**：`TX N0 M0` → **Occult Carcinoma**；`Tis N0 M0` → **Stage 0**；`T1mi N0 M0` → **Stage IA1**。
5. **無對應分期**：`TX` 或 `Tis` 合併 `N1`–`N3`、`M0`（共 8 組）回傳「無對應分期」（英文複製為 `No matching stage group`）。

## 🧪 開發

* 無建置步驟、無外部相依；`index.html` 以 `<script src>` 載入 `js/staging.js` 與 `js/clipboard.js`。
* 測試使用 Node.js 內建 runner（Node ≥ 18）：`node --test`。

---

## ⚠️ 免責聲明與推論限制

* **客觀事實**：本工具之底層演算法完全轉譯自 AJCC 第 9 版之公開圖表。
* **推論限制**：本程式僅為臨床參數運算輔助工具。分期之最終確立，仍需仰賴專業臨床醫師綜合病患之影像學報告、病理學切片與臨床表徵進行全面性判讀。本工具不承擔醫療診斷之法律責任。

# Lung Cancer Staging Calculator (AJCC 9th Edition) (practice prototype)

**English** | [繁體中文](README.zh-TW.md)

**Summary:** A web-frontend clinical calculation aid designed for clinicians, medical students and researchers. It takes T (Tumor), N (Node) and M (Metastasis) inputs and instantly outputs the lung cancer stage according to the AJCC 9th edition. The interface is in Traditional Chinese.

## 🔗 Live Demo
Try the tool online: [https://liangrxdev.github.io/lung-ajcc-calc/](https://liangrxdev.github.io/lung-ajcc-calc/)

---

## 📊 Specifications

| Item | Description |
| :--- | :--- |
| **Medical basis** | AJCC Cancer Staging Manual, 9th Edition (Lung Cancer) |
| **Architecture** | Single-page application (SPA), 100% client-side rendering |
| **Technology** | HTML5, vanilla JavaScript, CSS3 |
| **Hosting** | GitHub Pages (static hosting) |
| **Data privacy** | No database and no server-side data transfer, meeting patient privacy requirements |

---

## ⚙️ Core Features and Usage

1. **Input**: choose T, N and M subcategories from dropdowns (e.g. T1b, N2a, M0). Option definitions are aligned with the AJCC 9th clinical criteria.
2. **Instant calculation**: the DOM (Document Object Model) listens for `onchange` events, so there is no submit button; the JavaScript engine runs the staging algorithm immediately.
3. **Result output and visual cues**: the final stage (e.g. Stage IIA) is shown dynamically, with a different warning color scale for each severity level (Stage I to Stage IV).
4. **EMR helper (one-click copy)**: uses the Clipboard API (falls back to `execCommand('copy')`); one click exports a formatted multi-line string in Chinese or English, e.g.:
   ```
   Lung Cancer AJCC 9th Staging
   TNM: cT2a N1 M0
   Stage: Stage IIB
   For educational use only; not for clinical decision making.
   ```

---

## 🧠 Staging Algorithm Design

Implemented in `determineStage(t, n, m)` in `js/staging.js`, evaluated **top-down** from most to least severe:

1. **M check first (distant metastasis)**
   * M = `M1c1` or `M1c2` $\rightarrow$ **Stage IVB**
   * M = `M1a` or `M1b` $\rightarrow$ **Stage IVA**
   * Any T (including `TX` and `Tis`) and any N with M1 is staged as IV.
2. **N check next (M0 only)**: `N3` → `N2b` → `N2a` → `N1` → `N0`.
3. **T mapping (primary tumor)**
   * With the N status known, T is matched against groups (T1 group = T1mi, T1a, T1b, T1c; T2 group = T2a, T2b) to map to the final stage.
   * *Cross-level merges in the table are handled (e.g. T4 with N2a/N2b are both Stage IIIB; T2 with N2b is Stage IIIB).*
4. **Special N0 M0 rows**: `TX N0 M0` → **Occult Carcinoma**; `Tis N0 M0` → **Stage 0**; `T1mi N0 M0` → **Stage IA1**.
5. **No matching stage group**: `TX` or `Tis` with `N1`–`N3` and `M0` (8 combinations) returns `無對應分期` (English copy: `No matching stage group`).

## 🧪 Development

* No build step and no external dependencies; `index.html` loads `js/staging.js` and `js/clipboard.js` with plain `<script src>`.
* Tests use the Node.js built-in runner (Node ≥ 18): `node --test`.

---

## ⚠️ Disclaimer and Limitations

* **Fact**: the underlying algorithm is translated entirely from the published AJCC 9th edition tables.
* **Limitation**: this program is only an aid for calculating clinical parameters. Final staging still depends on a professional clinician's comprehensive interpretation of the patient's imaging reports, pathology and clinical presentation. This tool assumes no legal responsibility for medical diagnosis.

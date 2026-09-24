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
4. **EMR helper (one-click copy)**: uses the Clipboard API; one click exports a formatted string (e.g. `Lung Cancer AJCC 9th Staging: T2a + N1 + M0 👉 Result: Stage IIB`), greatly speeding up EMR documentation.

---

## 🧠 Staging Algorithm Design

The algorithm's order of evaluation strictly follows clinical logic, using a **top-down** step-down check from most to least severe:

1. **M check first (distant metastasis)**
   * M = `M1a` or `M1b` $\rightarrow$ **Stage IVA**
   * M = `M1c1` or `M1c2` $\rightarrow$ **Stage IVB**
2. **N check next (regional lymph nodes)**
   * After ruling out M1, the system checks `N3`, `N2b`, `N2a`, `N1` in order.
3. **T mapping (primary tumor)**
   * With the N status known, the T input is matched against built-in logical groups (e.g. T1 group = T1mi, T1a, T1b, T1c) to map to the final stage.
   * *Logic note: special cross-level merges in the AJCC table are handled (e.g. T4 with N2a/N2b are both Stage IIIB).*

---

## ⚠️ Disclaimer and Limitations

* **Fact**: the underlying algorithm is translated entirely from the published AJCC 9th edition tables.
* **Limitation**: this program is only an aid for calculating clinical parameters. Final staging still depends on a professional clinician's comprehensive interpretation of the patient's imaging reports, pathology and clinical presentation. This tool assumes no legal responsibility for medical diagnosis.

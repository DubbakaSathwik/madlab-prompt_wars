# MedLens — Clinical Information Intelligence Platform

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Vitest-Tests_Passing-25A162?logo=vitest&logoColor=white)](https://vitest.dev/)
[![HL7 FHIR](https://img.shields.io/badge/Interoperability-HL7_FHIR_R4-E06522)](https://hl7.org/fhir/)
[![Google Gemini](https://img.shields.io/badge/AI_Engine-Gemini_2.5_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)

> **Understand your records. Stay in control.**
> An AI-powered clinical intelligence platform designed to organize, structure, explain, and review medical records and diagnostic laboratory reports without formulating medical diagnoses or prescribing treatments.

---

## 🏛️ System Architecture

```
[Medical Document] (PDF / JPG / PNG)
       │
       ▼
[Document Processing Layer]
  ├─ Vector PDFs: pdfjs-dist (Multi-Page Text & Layout Parsing)
  └─ Scanned Images: Tesseract.js WebAssembly OCR Engine
       │
       ▼
[Gemini 2.5 Flash + Zod Validation]
  ├─ Structured Medical JSON Extraction
  ├─ Runtime Schema Verification (Zod)
  └─ Ambiguity Detection Engine (OCR Smudge Flags)
       │
       ▼
[Reference Range Engine]
  ├─ Biological Interval Parsing (Low, High, Thresholds)
  └─ Out-of-Bounds Flagging (NORMAL, LOW, HIGH, CRITICAL)
       │
       ▼
[Clinical Workstation & Storage]
  ├─ Dual-Mode Document & Structured Record Viewer
  ├─ Contextual MedLabs AI Chatbot (Grounding + Red Medication Alert)
  ├─ HL7 FHIR R4 Interoperability Bundle Export
  └─ Client Persistence: IndexedDB (Blobs) + LocalStorage (Records)
```

---

## 🌟 Key Features

* **Multi-Page Optical Document Processing**: Extracts text and tabular parameters across multi-page medical PDFs (`pdfjs-dist`) and scanned images/photos (`tesseract.js`) with verbatim provenance tracking.
* **Google Gemini AI Engine with Zod Schema**: Deep clinical structuring powered by Google Gemini 2.5 Flash, extracting all lab metrics, values, units, biological reference intervals, and pathologist interpretations into validated **Medical JSON**.
* **HL7 FHIR R4 Interoperability**: Generates and exports standard HL7 FHIR R4 `Bundle`, `DiagnosticReport`, and `Observation` resources ready for Electronic Health Record (EHR) ingestion (Epic, Cerner).
* **Source Document Viewer**: Interactive dual-mode reader featuring full embedded original PDF/image previews alongside structured digital records.
* **Three-Panel Clinical Workspace**:
  * **Left Panel**: Patient context, document drawer, and clinical category filters.
  * **Center Panel**: Multi-tab workspace with interactive Document Viewer, structured Medical JSON explorer, clinical timeline, and report comparison matrix.
  * **Right Panel**: Clinical Assistant with grounding chips, provenance inspector, and verification queue.
* **Report Studio**: Laboratory template engine allowing organizations to map verified Medical JSON onto customized report layouts and export print-ready clinical documents.
* **Clinical Guardrails & Human-in-the-Loop**:
  * Ambiguity detection for OCR digit/character artifacts (e.g., `'I1.2'`, `'O.85'`).
  * Out-of-bounds flag calculations (`NORMAL`, `HIGH`, `LOW`, `CRITICAL`).
  * Explicit disclaimers and high-visibility red alerts on medication questions advising physician consultation.
* **Automated Unit Testing & Zero-Leak Bundling**: Vitest test suite and Vite code-splitting reducing initial JS bundle to under 250 kB gzipped.

---

## 🛠️ Tech Stack

* **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React
* **Build Tool & Bundler**: Vite 6 (with Rollup `manualChunks` code-splitting)
* **Testing Framework**: Vitest (Automated unit tests for range and ambiguity engines)
* **Schema Validation**: Zod runtime schema validation
* **AI & NLP**: Google Gemini 2.5 Flash API (`gemini-2.5-flash`)
* **Document Processing**: `pdfjs-dist` (local worker asset), `tesseract.js` (WebAssembly OCR)
* **Clinical Standards**: HL7 FHIR R4 JSON standard
* **Local Storage**: IndexedDB (original file binary storage), browser LocalStorage with quota guards

---

## 🚀 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v18 or newer recommended)
* A [Google Gemini API Key](https://aistudio.google.com/)

### Installation

1. **Clone the repository**:
   `ash
   git clone https://github.com/DubbakaSathwik/madlab-prompt_wars.git
   cd madlab-prompt_wars
   `

2. **Install dependencies**:
   `ash
   npm install
   `

3. **Configure Environment Variables**:
   Copy the example environment configuration file:
   `ash
   cp .env.example .env
   `
   Open .env and add your Google Gemini API key:
   `env
   GEMINI_API_KEY=your_actual_gemini_api_key
   `
   *(Note: You can also enter or update your API key directly inside the app's Settings view or Upload modal).*

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

5. **Run automated unit tests (Vitest)**:
   ```bash
   npm test
   ```
   Executes unit tests verifying biological range evaluations, smudge ambiguity detection, and HL7 FHIR R4 Bundle exports.

6. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🌐 Deploy to Render

MedLens is fully configured for zero-configuration deployment on [Render](https://render.com/).

### Method 1: Render Blueprint (Recommended — 1-Click)
1. Go to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Blueprint**.
3. Connect your repository: `https://github.com/DubbakaSathwik/madlab-prompt_wars.git`.
4. Render will detect [`render.yaml`](./render.yaml) automatically.
5. In the Environment Variables section, enter your `GEMINI_API_KEY`.
6. Click **Apply Blueprint**. Your app will build and deploy on a global CDN.

### Method 2: Manual Static Site Deployment
1. Go to [Render Dashboard](https://dashboard.render.com/) → **New +** → **Static Site**.
2. Connect `https://github.com/DubbakaSathwik/madlab-prompt_wars.git`.
3. Configure the settings:
   * **Name**: `medlens-ai` (or your choice)
   * **Branch**: `main`
   * **Build Command**: `npm run build`
   * **Publish Directory**: `dist`
4. In **Advanced** → **Environment Variables**:
   * Add `GEMINI_API_KEY`: `your_gemini_api_key`
   * Add `VITE_GEMINI_API_KEY`: `your_gemini_api_key`
5. Click **Create Static Site**.

*SPA Routing*: The included `public/_redirects` and `render.yaml` rewrite rules ensure deep routes resolve to `/index.html` without 404s.

---

## 🛡️ Medical Disclaimer & Safety Notice

MedLens is an informational intelligence tool intended for structuring, organizing, and explaining clinical data from patient-provided documents. **MedLens does not provide medical diagnoses, treatment recommendations, or clinical determinations.** Always consult a qualified healthcare provider for clinical decisions.

---

## 📄 License

MIT License. Designed and built for Prompt Wars Hackathon.

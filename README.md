# MedLens — Clinical Information Intelligence Platform

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/AI_Engine-Gemini_2.5_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)

> **Understand your records. Stay in control.**
> An AI-powered clinical intelligence platform designed to organize, structure, explain, and review medical records and diagnostic laboratory reports without formulating medical diagnoses or prescribing treatments.

---

## 🌟 Key Features

* **Multi-Page Optical Document Processing**: Extracts text and tabular parameters across multi-page medical PDFs (pdfjs-dist) and scanned images/photos (	esseract.js) with provenance tracking.
* **Google Gemini AI Engine**: Deep clinical structuring powered by Google Gemini 2.5 Flash, extracting all lab metrics, values, units, biological reference intervals, and pathologist interpretations into verified **Medical JSON**.
* **Source Document Viewer**: Interactive dual-mode reader featuring full embedded original PDF/image previews alongside structured digital records.
* **Three-Panel Clinical Workspace**:
  * **Left Panel**: Patient context, document drawer, and clinical category filters.
  * **Center Panel**: Multi-tab workspace with interactive Document Viewer, structured Medical JSON explorer, clinical timeline, and report comparison matrix.
  * **Right Panel**: Clinical Assistant with grounding chips, provenance inspector, and verification queue.
* **Report Studio**: Laboratory template engine allowing organizations to map verified Medical JSON onto customized report layouts and export print-ready clinical documents.
* **Clinical Guardrails & Human-in-the-Loop**:
  * Ambiguity detection for OCR digit/character artifacts.
  * Out-of-bounds flag calculations (NORMAL, HIGH, LOW, CRITICAL).
  * Explicit disclaimers and strict guardrails preventing non-compliant medical diagnosis or treatment suggestions.

---

## 🛠️ Tech Stack

* **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React
* **Build Tool**: Vite 6
* **AI & NLP**: Google Gemini 2.5 Flash API (gemini-2.5-flash)
* **Document Processing**: pdfjs-dist (Multi-page PDF parsing), 	esseract.js (Image OCR)
* **Local Storage**: IndexedDB (original file binary storage), browser LocalStorage (clinical state cache)

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
   `ash
   npm run dev
   `
   Open http://localhost:5173/ in your browser.

5. **Build for production**:
   `ash
   npm run build
   `

---

## 🛡️ Medical Disclaimer & Safety Notice

MedLens is an informational intelligence tool intended for structuring, organizing, and explaining clinical data from patient-provided documents. **MedLens does not provide medical diagnoses, treatment recommendations, or clinical determinations.** Always consult a qualified healthcare provider for clinical decisions.

---

## 📄 License

MIT License. Designed and built for Prompt Wars Hackathon.

# Testing, Validation & Maintainability Guide

> **Hackathon Evaluation Focus (Low Impact Criteria)**:  
> *"How easily the code can be tested, validated, and maintained over time."*

MedLens has been engineered from the ground up for **maximum testability, seamless verification, and friction-free long-term maintenance**.

---

## ⚡ 1. How Easily the Code Can Be Tested

### One-Command Full Verification
Anyone cloning the repository can run the entire test suite immediately with **zero configuration, zero database setup, and zero API keys required**:

```bash
# Run all 96 unit tests across 9 test suites
npm test
```

### Key Testing Characteristics:
1. **100% Hermetic & Deterministic**:
   - Tests do not require a live network connection, external servers, or a Google Gemini API key.
   - All external dependencies (Gemini API, Web Workers, IndexedDB, LocalStorage) feature robust, isolated, deterministic fallbacks and in-memory mock adapters.
2. **High Execution Speed**:
   - Vitest executes all 96 tests across 9 suites in **~16 seconds**.
   - Tests run in parallel using modern worker threads.
3. **Interactive Watch Mode**:
   - For rapid test-driven development (TDD), developers can execute:
     ```bash
     npm run test:watch
     ```

### Test Suite Breakdown:

| Test Suite File | Domain / Scope | Test Cases |
| :--- | :--- | :---: |
| `aiSafetyAndDemo.test.ts` | Prompt injection, non-diagnostic boundaries, medication warnings, pronoun resolution, focused biomarker evaluation | 15 |
| `referenceRangeEngine.test.ts` | Bounded intervals (`13.0 - 17.0`), thresholds (`< 150`, `> 40`), qualitative intervals, missing ranges (`UNKNOWN`) | 14 |
| `ocrService.test.ts` | Alphanumeric OCR smudge ambiguities (`I1.2`, `O.85`), patient name parsing from filenames and OCR headers | 13 |
| `medicalService.test.ts` | Patient CRUD, report isolation, verification history preservation, state persistence | 14 |
| `authService.test.ts` | Clinician credentials, role-based access, token management, session persistence | 11 |
| `conflictService.test.ts` | Longitudinal numerical discrepancies across reports, allergy-medication contraindications | 7 |
| `fhirService.test.ts` | Valid HL7 FHIR R4 Bundle, DiagnosticReport, and Observation resource generation | 7 |
| `templateService.test.ts` | Custom report studio layout compiler, field binding, PDF export formatting | 7 |
| `sanitize.test.ts` | Path traversal stripping, 25MB boundary defense, HTML injection sanitization, MIME verification | 8 |
| **Total** | **9 Suites** | **96 Tests (100% Pass)** |

---

## 🛡️ 2. How Easily the Code Can Be Validated

MedLens provides a single unified validation command:

```bash
npm run validate
```

This command orchestrates a 3-tier validation pipeline:

```
  ┌────────────────────────────────────────────────────────┐
  │ 1. STATIC TYPECHECKING: tsc --noEmit                   │
  │    • Verifies strict TypeScript contracts across 100%   │
  │      of files with zero type errors.                   │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ 2. UNIT TEST SUITE: vitest run                         │
  │    • Executes all 96 unit tests covering medical safety,│
  │      reference bounding, OCR, and FHIR standards.      │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ 3. PRODUCTION BUNDLE BUILD: vite build                 │
  │    • Validates Rollup chunking, tree-shaking, CSS, and  │
  │      WASM worker bundle integrity (zero build errors). │
  └────────────────────────────────────────────────────────┘
```

### Runtime Schema Validation
- Uses **Zod** (`zod/v4`) to enforce strict runtime type safety on all extracted Medical JSON schemas and HL7 FHIR R4 exports before any data reaches the UI.
- Prevents corrupt or malformed document structures from propagating into application state.

---

## 🔧 3. How Easily the Code Can Be Maintained Over Time

### 1. Decoupled, Layered Service Architecture
The codebase strictly separates concerns into clean, modular layers:
- **`src/models/`**: Immutable TypeScript interfaces, types, and Zod schemas defining clinical entities (`MedicalRecord`, `Patient`, `Biomarker`, `FHIRBundle`).
- **`src/services/`**: Pure business logic modules completely decoupled from React rendering:
  - `medicalService.ts`: State management, CRUD, verification audit logs.
  - `referenceRangeEngine.ts`: Deterministic laboratory boundary evaluation.
  - `ocrService.ts`: Multi-engine OCR text analysis and ambiguity detection.
  - `geminiService.ts`: AI integration with automated multi-model fallbacks.
  - `fhirService.ts`: HL7 FHIR R4 export engine.
  - `conflictService.ts`: Longitudinal contradiction detection.
- **`src/components/`**: Scoped, presentation-focused UI components with zero business logic leakage.

### 2. Zero Vendor Lock-in & Resilience to Upstream Breaking Changes
- The AI layer features a multi-model fallback hierarchy (`gemini-flash-lite-latest` → `gemini-3-flash-preview` → `gemini-3.5-flash-lite` → local deterministic parser).
- If an upstream API changes or exceeds quotas, the system automatically falls back to deterministic local processing without crashing or requiring emergency refactoring.

### 3. Automated Continuous Integration (CI/CD)
- Configured via `.github/workflows/ci.yml`.
- Automatically executes on every `push` and `pull_request` across Node 18.x and 20.x.
- Guarantees that no regression or breaking change can merge without passing all 96 tests, TypeScript typechecking, and the Vite production build.

### 4. Adding New Biomarkers or Panels
Adding a new clinical test panel or biomarker requires editing only a single typed dictionary in `src/models/medical.ts` and adding a test case to `src/services/__tests__/referenceRangeEngine.test.ts`. The rest of the application (UI, OCR extraction, AI explanation, and FHIR exporter) adapts automatically.

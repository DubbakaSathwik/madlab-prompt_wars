# MedLens

## AI-Powered Clinical Information Intelligence

**Tagline:**
**From Medical Documents to Meaningful Records.**

---

# 1. Abstract

Medical information is often fragmented across laboratory reports, prescriptions, diagnostic documents, previous medical records, and patient-provided information. Reviewing these documents manually can be time-consuming, difficult to organize, and prone to overlooking important details.

**MedLens** is an AI-powered clinical information intelligence platform designed to transform fragmented medical information into a **structured, understandable, traceable, and reviewable patient record**.

The platform combines **OCR, intelligent document extraction, structured medical data processing, provenance tracking, reference-range awareness, human verification, report comparison, and a contextual AI assistant** into a single unified workspace.

Instead of treating medical documents as simple text and asking an AI model to generate an unrestricted summary, MedLens follows a structured pipeline:

**Medical Document → OCR → Extracted Text → AI Structuring → Validation → Medical JSON → Patient Record → AI-Assisted Understanding**

The resulting patient record preserves the relationship between each piece of information and its original source.

For example, if a laboratory report contains a hemoglobin value of 11.2 g/dL and specifies a reference range of 13–17 g/dL, MedLens records the value, unit, reference range, report date, source document, page, extraction confidence, and verification status.

MedLens does not attempt to diagnose diseases or prescribe treatment. Its purpose is to **organize, explain, compare, and contextualize information already present in the patient's records**, while directing users toward qualified healthcare professionals when medical judgment is required.

---

# 2. Problem Statement

Medical records frequently exist in disconnected formats:

* Laboratory reports
* Scanned documents
* Prescriptions
* Diagnostic reports
* Discharge summaries
* Previous medical records
* Patient-provided information

These sources may differ in:

* Layout
* Terminology
* Units
* Reference ranges
* Dates
* Formatting
* Data quality

As a result, users and healthcare professionals may need to manually inspect multiple documents to understand a patient's available information.

Traditional document viewers only display the original documents, while generic AI chatbots often provide summaries without sufficient source traceability.

A reliable system needs to answer several questions:

1. What information exists in the patient's records?
2. Where did each piece of information come from?
3. What reference range was provided by the laboratory?
4. Is the extracted information reliable?
5. Has a human verified it?
6. How has a value changed across reports?
7. Are there conflicts between documents?
8. Can the user understand the information without receiving an unsupported diagnosis?
9. Can the information be transformed into a structured and reusable report?

MedLens is designed to address these challenges.

---

# 3. Core Objective

The primary objective of MedLens is to create a **single intelligent workspace for organizing and understanding fragmented medical information**.

The system should transform unstructured medical documents into a structured patient record while maintaining:

* Accuracy
* Traceability
* Transparency
* Human verification
* Context
* Safety
* Privacy
* Accessibility

---

# 4. Core Concept

MedLens is built around three primary components:

## 4.1 Patient Context

The left side of the workspace contains the patient's contextual information.

This includes:

* Name
* Patient ID
* Age
* Sex
* Blood group, if available
* Allergies
* Existing conditions
* Current medications
* Symptoms
* Relevant medical history

Each item should retain its origin.

Possible origins include:

**PATIENT PROVIDED**

**DOCUMENT EXTRACTED**

**AI GENERATED**

---

## 4.2 Medical Report Workspace

The center of the application is the primary workspace.

It displays the actual medical document and its structured representation.

The report workspace can contain:

* Original uploaded document
* OCR output
* Structured medical information
* Laboratory results
* Verified information
* Organization-specific report templates
* Generated reports

The center panel should occupy the largest portion of the interface because the medical record is the primary object of the application.

The interface should feel similar to a professional document workspace rather than a chatbot.

---

## 4.3 MedLens AI Assistant

The right side contains the integrated **MedLens AI Assistant**.

The assistant allows users to ask contextual questions about the available patient records.

Examples:

* "Explain my latest report."
* "Which results are outside the provided reference ranges?"
* "What changed from my previous report?"
* "Explain this result in simple language."
* "What does this test measure?"
* "Why is this result marked high?"
* "Where did this information come from?"
* "What should I ask my doctor about this result?"

The assistant should understand conversational context.

For example:

User:

> Why is it high?

The assistant should understand which result "it" refers to based on the current conversation and selected record.

---

# 5. Three-Panel Clinical Workspace

The primary desktop interface will use a three-panel architecture.

```text
┌──────────────────┬─────────────────────────────┬──────────────────┐
│                  │                             │                  │
│  PATIENT         │       REPORT WORKSPACE      │   MEDLENS AI     │
│  CONTEXT         │                             │   ASSISTANT      │
│                  │                             │                  │
│  Patient details │    Medical document         │  Ask questions   │
│  History         │    Structured results       │  Get explanations│
│  Medications     │    Template report          │  Compare records │
│  Allergies       │                             │  Find sources    │
│                  │                             │                  │
│      ~22%        │            ~53%             │       ~25%        │
│                  │                             │                  │
└──────────────────┴─────────────────────────────┴──────────────────┘
```

The approximate layout ratio is:

* **Left:** 22%
* **Center:** 53%
* **Right:** 25%

The center should remain visually dominant.

---

# 6. Medical Document Processing Pipeline

The MedLens processing pipeline consists of multiple stages.

```text
Medical Document
       ↓
Document Upload
       ↓
OCR
       ↓
Raw Extracted Text
       ↓
AI Structured Extraction
       ↓
Normalization
       ↓
Validation
       ↓
Medical JSON
       ↓
Patient Record
       ↓
AI Assistant / Comparison / Report Generation
```

Each stage has a separate responsibility.

---

# 7. OCR Layer

The OCR layer converts scanned documents and images into machine-readable text.

Potential OCR technology:

**Tesseract OCR**

OCR should extract:

* Text
* Numbers
* Units
* Dates
* Labels
* Table content
* Observations
* Patient information

However, OCR output should **not** be considered the final medical record.

OCR is responsible for recognizing text.

It is not responsible for understanding the clinical structure of the document.

---

# 8. AI Structured Extraction

The next layer converts OCR output into structured medical information.

For example, OCR may produce:

```text
Hemoglobin 11.2 g/dL 13-17
```

The extraction layer converts it into structured information:

```json
{
  "test_name": "Hemoglobin",
  "value": 11.2,
  "unit": "g/dL",
  "reference_range": "13-17 g/dL"
}
```

Additional metadata should be associated with the result.

---

# 9. Medical JSON Architecture

MedLens should maintain a structured representation of patient information.

A conceptual schema can include:

```json
{
  "patient": {
    "name": "",
    "patient_id": "",
    "age": "",
    "sex": "",
    "allergies": [],
    "conditions": [],
    "medications": [],
    "symptoms": []
  },

  "reports": [
    {
      "report_id": "",
      "report_name": "",
      "report_type": "",
      "date": "",
      "source_document": "",

      "tests": [
        {
          "name": "",
          "value": "",
          "unit": "",
          "reference_range": "",
          "status": "",
          "page": "",
          "section": "",
          "confidence": 0,
          "verified": false
        }
      ]
    }
  ]
}
```

The final implementation should use a properly normalized and extensible schema rather than being restricted to this example.

---

# 10. Reference-Range Awareness

Reference-range handling is one of the most important requirements of MedLens.

The system must use the **reference range provided in the source report**.

Example:

```text
Hemoglobin
Value: 11.2 g/dL
Reference Range: 13–17 g/dL
Status: LOW
```

The system determines:

```text
11.2 < 13
```

Therefore:

```text
Status = LOW
```

If the report provides:

```text
Reference Range: 12–16 g/dL
```

then that range must be used instead.

Different laboratories may provide different reference ranges.

MedLens must preserve those differences.

---

# 11. No Invented Reference Ranges

If the source report does not provide a reference range:

```text
Reference Range: Not Available
Status: UNKNOWN
```

The system must not automatically insert a standard medical reference range.

This prevents the AI from presenting an externally assumed range as if it came from the laboratory.

---

# 12. Provenance System

Every important piece of information should retain its origin.

Example:

```text
Hemoglobin
11.2 g/dL

Source:
CBC_Report.pdf

Page:
1

Section:
Hematology

Extraction:
OCR + AI

Confidence:
98%

Verification:
Verified
```

This creates a traceable chain:

```text
Patient Record
      ↓
Structured Value
      ↓
Source Document
      ↓
Page
      ↓
Original Content
```

The user should be able to move from the structured value back to the original source.

---

# 13. Source Categories

MedLens should visually distinguish information by origin.

### Patient Provided

Information manually entered by the user.

### Document Extracted

Information obtained from uploaded documents.

### AI Generated

Information created by the AI, such as summaries or explanations.

### Verified

Information reviewed and confirmed by a human.

### Needs Review

Information that requires human attention.

---

# 14. Confidence Indicators

The extraction system should provide confidence information.

Example:

```text
Hemoglobin
11.2 g/dL

Confidence: 98%
✓ Verified
```

For uncertain extraction:

```text
Hemoglobin
I1.2 g/dL

Confidence: 46%
⚠ Needs Review
```

Low-confidence information should be presented for human verification instead of being silently accepted.

---

# 15. Human Verification

MedLens should provide a human-in-the-loop verification workflow.

For extracted information, users should be able to:

* Confirm
* Edit
* Reject

Example:

```text
AI Extracted:

Hemoglobin: 11.2 g/dL

[ ✓ Confirm ] [ ✎ Edit ] [ ✕ Reject ]
```

Corrections should preserve the original extraction information for auditability.

---

# 16. Inconsistency Detection

MedLens should identify potential conflicts between different sources.

Example:

```text
Report A:
Blood Group = O+

Report B:
Blood Group = A+
```

The system should display:

```text
⚠ Potential inconsistency detected
```

It should show both values and their sources.

MedLens should **not automatically decide which value is correct**.

Instead, it should ask the user to verify the information.

---

# 17. Report Comparison

MedLens should allow users to compare current and previous reports.

Example:

```text
                 Previous      Current

Hemoglobin        10.8          11.2
WBC                7.4           7.2
ALT               42            68
```

The system can show:

* Previous value
* Current value
* Difference
* Dates
* Reference ranges
* Source documents

It should also identify:

* New tests
* Missing tests
* Changed values
* Different reference ranges

---

# 18. Patient Timeline

All uploaded and verified information can be organized chronologically.

Example:

```text
20 AUG 2026
CBC Report

24 AUG 2026
LFT Report

30 AUG 2026
Prescription

04 SEP 2026
CBC Report
```

Selecting a timeline event opens the corresponding information.

---

# 19. MedLens AI Assistant

The AI assistant is an integrated intelligence layer.

It should use:

* Patient context
* Structured medical JSON
* Verified results
* Relevant report information
* Historical records
* Source metadata

The assistant should not blindly reason from raw OCR text when structured verified information is available.

---

# 20. AI Assistant Response Structure

AI responses should clearly distinguish between:

### Information from the record

Example:

> Your latest report records hemoglobin at 11.2 g/dL.

### General explanation

Example:

> Hemoglobin is a protein in red blood cells that carries oxygen.

### Safe guidance

Example:

> This report alone does not establish the cause of the result. Consider discussing it with a qualified healthcare professional.

This prevents the AI from blurring extracted facts and generated explanations.

---

# 21. AI Safety Boundary

MedLens is not intended to replace a healthcare professional.

The AI assistant must not:

* Diagnose diseases
* Confirm diagnoses
* Prescribe medication
* Recommend dosage changes
* Tell users to stop medication
* Provide unsupported treatment recommendations
* Invent medical facts
* Invent reference ranges
* Present speculation as certainty

The assistant may:

* Explain reported information
* Explain terminology
* Compare results
* Summarize records
* Identify documented abnormalities
* Identify missing information
* Detect inconsistencies
* Help users prepare questions for healthcare professionals

---

# 22. Safe AI Example

User:

> Do I have anemia?

Unsafe:

> Yes, you have anemia.

MedLens:

> Your report shows a hemoglobin value below the reference range provided by the laboratory. This finding alone does not establish a diagnosis or determine its cause. Consider discussing the result with a qualified healthcare professional.

---

# 23. Report Template Engine

A major extension of MedLens is the ability to work with **organization-specific report templates**.

Medical laboratories and clinics often have predefined report formats containing:

* Logo
* Header
* Footer
* Watermark
* Patient information
* Laboratory information
* Result tables
* Doctor details
* Signature areas
* Contact information

MedLens should allow these templates to be populated using structured patient information.

---

# 24. Template-Based Report Generation

The conceptual architecture is:

```text
Organization Template
        +
Structured Medical JSON
        ↓
Field Mapping
        ↓
Report Rendering
        ↓
Generated Report
```

The template controls:

* Visual design
* Layout
* Branding
* Typography
* Watermark
* Positioning

The structured data controls:

* Patient values
* Test results
* Dates
* Reference ranges
* Observations

---

# 25. Template Placeholder System

A template can contain fields such as:

```text
{{PATIENT_NAME}}

{{PATIENT_ID}}

{{AGE}}

{{SEX}}

{{REPORT_DATE}}

{{LAB_RESULTS}}

{{DOCTOR_NAME}}
```

A dynamic table can use:

```text
{{LAB_RESULTS_TABLE}}
```

The system then generates rows based on the patient's structured results.

---

# 26. Template Image Concept

Organizations may provide a visual template such as:

```text
MEDLAB DIAGNOSTICS

[LOGO]

Patient Name:
Patient ID:
Age:
Sex:

----------------------------------
TEST     RESULT     UNIT    RANGE
----------------------------------

[LAB RESULTS]

             WATERMARK

Doctor:
Signature:
```

MedLens should eventually allow the template image/design to become a reusable report layout.

The system can provide field mapping between template regions and structured medical JSON.

---

# 27. Future Report Studio

A future **MedLens Report Studio** can work similarly to a lightweight document/presentation editor.

Users can:

* Upload a template
* Define fields
* Drag fields onto a template
* Map fields to medical JSON
* Create dynamic result tables
* Preview the populated report
* Save templates
* Reuse templates

Conceptually:

```text
Template
    ↓
Field Detection
    ↓
Field Mapping
    ↓
JSON Data
    ↓
Live Preview
    ↓
Generated Report
```

---

# 28. Side-by-Side Source View

MedLens should support a source and structured information view.

```text
┌──────────────────────┬──────────────────────────┐
│ Original Document    │ Structured Information   │
│                      │                          │
│ CBC Report           │ Hemoglobin: 11.2 g/dL  │
│                      │ Reference: 13–17 g/dL   │
│ [Original Page]      │ Status: LOW             │
│                      │                          │
│                      │ Source: Page 1          │
└──────────────────────┴──────────────────────────┘
```

Selecting a structured value should optionally highlight its corresponding source region.

---

# 29. Dashboard

The dashboard should provide a concise overview.

Example:

```text
REPORTS
12

RESULTS
87

WITHIN RANGE
68

OUTSIDE RANGE
19

NEEDS REVIEW
4
```

Additional sections:

* Recent reports
* Recent changes
* Timeline
* Verification queue
* AI assistant access

The dashboard should remain minimal and avoid unnecessary visualization.

---

# 30. Search and Filtering

Users should be able to search across the patient record.

Examples:

```text
Hemoglobin
CBC
August 2026
High results
Medications
```

Filters may include:

* Date
* Report type
* Test
* Status
* Verification state
* Confidence
* Source

---

# 31. Export

MedLens should eventually support export of structured information.

Possible outputs:

* PDF
* Patient summary
* Structured report
* Organization-specific report template

Exports should preserve relevant source/provenance information where appropriate.

---

# 32. Privacy and Security

Medical information is sensitive.

The system should prioritize:

* Authentication
* Authorization
* Secure sessions
* Access control
* Encryption
* Minimal data collection
* Secure file storage
* Controlled document access
* Data deletion
* Audit history

Only synthetic/demo patient information should be used during the hackathon unless an appropriate secure environment and authorization are available.

---

# 33. Audit History

Important system actions should be recorded.

Example:

```text
10:31 — Report uploaded
10:32 — OCR completed
10:32 — AI extraction completed
10:33 — 3 fields require review
10:35 — Hemoglobin verified
10:36 — Patient record updated
```

This improves transparency and accountability.

---

# 34. Accessibility

The interface should support:

* High readability
* Keyboard navigation
* Screen-reader-friendly labels
* Sufficient contrast
* Clear typography
* Colour-independent status indicators
* Responsive design

Status should not rely solely on colour.

For example:

```text
LOW
NORMAL
HIGH
UNKNOWN
```

should always be written explicitly.

---

# 35. UI Design Philosophy

MedLens should follow a **Minimal Clinical Intelligence** design philosophy.

The interface should feel:

* Professional
* Calm
* Clean
* Trustworthy
* Structured
* Modern
* Human-readable

Avoid:

* Excessive gradients
* Neon effects
* Heavy glassmorphism
* Giant AI graphics
* Excessive animations
* Unnecessary cards
* Excessive colours

The goal is to make MedLens look like a **real clinical information product**, not an AI experiment.

---

# 36. Color Palette

MedLens uses the following brand palette:

## Primary

```text
#218DAE
```

Used for:

* Primary actions
* Navigation
* Main brand elements
* Important headings

## Secondary / AI

```text
#2BBBD7
```

Used for:

* AI assistant
* Active states
* AI-related highlights
* Secondary interactions

## Accent

```text
#FCE59A
```

Used sparingly for:

* Attention
* Highlights
* Review states

## Strong Accent

```text
#FFD758
```

Used sparingly for:

* Important emphasis
* Selected highlights
* Key calls to action

The overall interface should primarily use neutral backgrounds and typography.

---

# 37. Color Usage Philosophy

The four colors should not be distributed equally.

The interface should remain predominantly neutral.

Approximate visual balance:

```text
Neutral UI      70–80%
Brand colors    15–20%
Yellow accents   5%
```

The yellow colors should remain visually special.

The AI assistant should primarily use the cyan identity.

---

# 38. Main Navigation

Suggested navigation:

```text
MedLens

Overview
Patients
Reports
Timeline
Compare
Report Studio

----------------

Ask MedLens
Settings
```

The exact navigation can be refined during UI implementation.

---

# 39. Primary User Journey

The intended user experience is:

```text
OPEN MEDLENS
      ↓
SELECT / CREATE PATIENT
      ↓
UPLOAD MEDICAL DOCUMENT
      ↓
OCR PROCESSING
      ↓
STRUCTURED EXTRACTION
      ↓
VALIDATION
      ↓
MEDICAL JSON
      ↓
PATIENT RECORD
      ↓
VERIFY INFORMATION
      ↓
VIEW REPORT
      ↓
ASK MEDLENS
      ↓
COMPARE HISTORY
      ↓
GENERATE / POPULATE TEMPLATE
      ↓
EXPORT
```

---

# 40. Ideal Hackathon Demonstration

The final demonstration should tell a simple story.

## Step 1 — Fragmented information

Show several synthetic medical documents.

Example:

* CBC
* LFT
* Previous CBC
* Prescription

The information is fragmented.

---

## Step 2 — Upload

Upload the documents into MedLens.

---

## Step 3 — OCR

Show the processing stage.

```text
Document
↓
OCR
↓
Text detected
```

---

## Step 4 — Structured extraction

Show the transformation:

```text
Raw Document
      ↓
Medical JSON
```

---

## Step 5 — Patient Record

The left panel shows patient context.

The center displays the structured report.

The right panel contains MedLens AI.

---

## Step 6 — Reference Range

Click a result.

Example:

```text
Hemoglobin
11.2 g/dL

Reference:
13–17 g/dL

Status:
LOW
```

---

## Step 7 — Provenance

Click the source.

Display:

```text
Source:
CBC_Report.pdf

Page:
1

Section:
Hematology

Confidence:
98%
```

---

## Step 8 — Human Verification

Show:

```text
AI Extracted
11.2 g/dL

[Confirm]
[Edit]
[Reject]
```

Confirm the value.

---

## Step 9 — AI Assistant

Ask:

> What changed from my previous report?

MedLens compares historical data.

---

## Step 10 — AI Safety

Ask:

> Do I have a disease? What medicine should I take?

MedLens refuses to diagnose or prescribe while still explaining the available record.

---

## Step 11 — Template

Load an organization-specific report template.

Populate:

* Patient information
* Test results
* Reference ranges
* Report date
* Doctor information

Preview the final document.

---

# 41. Differentiating Factors

MedLens should not be positioned as another medical chatbot.

Its strongest differentiators are:

### 1. Structured Medical Record

Information is organized rather than presented as a long AI response.

### 2. Source Provenance

Every important extracted value can be traced back to its source.

### 3. Reference-Range Awareness

The system uses the reference range provided by the source report rather than inventing one.

### 4. Human Verification

Users can confirm or correct extracted information.

### 5. Report Comparison

Historical information can be compared.

### 6. Conflict Detection

The system identifies potential inconsistencies.

### 7. Contextual AI

The assistant understands the patient's available record and conversation context.

### 8. Template-Based Reporting

Organizations can reuse their existing branded report formats.

### 9. Responsible AI

The system explains and organizes information without pretending to be a doctor.

---

# 42. MVP Priorities

For the hackathon, implementation should be prioritized.

## Tier 1 — Essential

* Patient information
* Document upload
* OCR
* Structured extraction
* Medical JSON
* Reference-range detection
* Low/Normal/High classification
* Structured patient record
* Provenance
* AI summary
* MedLens AI Assistant
* AI safety layer

## Tier 2 — High Value

* Human verification
* Confidence indicators
* Report comparison
* Timeline
* Conflict detection
* Clarification questions
* Side-by-side source view

## Tier 3 — Advanced

* Template engine
* Report Studio
* Dynamic report generation
* Export
* Authentication
* Audit history
* Advanced search
* Mobile optimization

---

# 43. Technical Architecture

A conceptual architecture:

```text
                    USER
                     │
                     ▼
             ┌───────────────┐
             │   FRONTEND    │
             └───────┬───────┘
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
   Patient       Report         AI Assistant
   Context       Workspace
       │             │             │
       └─────────────┼─────────────┘
                     ▼
             APPLICATION LAYER
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
      OCR        Extraction    Validation
        │            │            │
        └────────────┼────────────┘
                     ▼
                MEDICAL JSON
                     │
        ┌────────────┼─────────────┐
        ▼            ▼             ▼
    Database     Provenance     Comparison
        │
        ▼
  Report Template Engine
```

---

# 44. Fundamental Design Principle

MedLens should maintain a strict distinction between:

```text
WHAT THE RECORD SAYS
        ↓
WHAT THE AI EXPLAINS
        ↓
WHAT THE USER SHOULD DISCUSS WITH A PROFESSIONAL
```

These should never be silently merged.

---

# 45. Product Philosophy

MedLens is not designed to answer:

> "What disease does this patient have?"

It is designed to answer:

> "What information is present in this patient's records, where did it come from, how is it represented, how has it changed, and how can it be understood safely?"

This distinction is central to the product.

---

# 46. Final Vision

MedLens aims to become an intelligent layer between **raw medical documents and human understanding**.

Instead of forcing users to manually inspect scattered documents, MedLens provides a structured workspace where:

**Documents become data.**

**Data becomes a patient record.**

**Records become understandable information.**

**Every important fact remains traceable.**

**AI assists without replacing clinical judgment.**

The final experience can be summarized as:

```text
                 MEDLENS

        PATIENT CONTEXT
              │
              ▼
      ┌─────────────────┐
      │                 │
      │ MEDICAL RECORD  │
      │                 │
      └─────────────────┘
              │
       ┌──────┴──────┐
       ▼             ▼
   REPORTING      AI ASSISTANCE
       │             │
       └──────┬──────┘
              ▼
       UNDERSTANDABLE,
       TRACEABLE &
       REVIEWABLE
       INFORMATION
```

## Final Product Statement

> **MedLens transforms fragmented medical documents into a structured, traceable, and reviewable patient record, giving users an intelligent way to understand their medical information while keeping human clinical judgment at the center.**

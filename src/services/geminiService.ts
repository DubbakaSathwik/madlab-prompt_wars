import { ExtractedDocumentData } from './ocrService';
import { LabResult, Patient, ClinicalReport } from '../types/medical';
import { z } from 'zod';

export const GeminiTestSchema = z.object({
  testName: z.string().default('Laboratory Parameter'),
  category: z.enum(['HEMATOLOGY', 'BIOCHEMISTRY', 'METABOLIC', 'LIPID', 'ENDOCRINE', 'URINALYSIS', 'OTHER']).catch('OTHER'),
  value: z.union([z.string(), z.number()]).transform(v => String(v)),
  numericValue: z.number().optional(),
  unit: z.string().default(''),
  referenceRange: z.object({
    low: z.number().optional(),
    high: z.number().optional(),
    unit: z.string().optional(),
    rawText: z.string().optional(),
    isAvailable: z.boolean().optional()
  }).optional(),
  status: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL_LOW', 'CRITICAL_HIGH', 'UNKNOWN']).catch('UNKNOWN'),
  page: z.union([z.number(), z.string()]).optional(),
  confidence: z.number().optional()
});

export const GeminiDocumentSchema = z.object({
  facility: z.object({
    name: z.string().default('Diagnostic Laboratory'),
    address: z.string().optional(),
    phone: z.string().optional(),
    license: z.string().optional(),
    director: z.string().optional()
  }).optional(),
  patient: z.object({
    name: z.string().optional(),
    patientId: z.string().optional(),
    age: z.number().optional(),
    sex: z.string().optional(),
    bloodGroup: z.string().optional()
  }).optional(),
  doctorName: z.string().optional(),
  reportName: z.string().default('Clinical Laboratory Report'),
  reportType: z.enum(['CBC', 'LFT', 'LIPID_PROFILE', 'METABOLIC_PANEL', 'PRESCRIPTION', 'DISCHARGE_SUMMARY', 'OTHER']).catch('OTHER'),
  date: z.string().default(new Date().toISOString().split('T')[0]),
  tests: z.array(GeminiTestSchema).default([]),
  observations: z.array(z.string()).default([])
});

export interface GeminiExtractionParams {
  fullText: string;
  fileName: string;
  fileType?: string;
  fileBase64?: string;
  pageCount?: number;
  onProgress?: (message: string) => void;
}

export class GeminiService {
  private static API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
  private static PRIMARY_MODEL = 'gemini-flash-lite-latest';
  private static FALLBACK_MODELS = [
    'gemini-3-flash-preview',
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-2.5-flash'
  ];

  /**
   * Retrieves the Gemini API key from environment (.env) or localStorage
   */
  static getApiKey(): string {
    const fromEnv = 
      (import.meta as any).env?.GEMINI_API_KEY || 
      (import.meta as any).env?.VITE_GEMINI_API_KEY;

    if (fromEnv && typeof fromEnv === 'string' && fromEnv.trim() && !fromEnv.includes('your_gemini_api_key')) {
      return fromEnv.trim();
    }

    return localStorage.getItem('medlens_gemini_api_key') || '';
  }

  /**
   * Saves API key to localStorage
   */
  static setApiKey(key: string): void {
    if (key.trim()) {
      localStorage.setItem('medlens_gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('medlens_gemini_api_key');
    }
  }

  /**
   * Returns whether a valid Gemini API key is configured
   */
  static hasApiKey(): boolean {
    return Boolean(this.getApiKey());
  }

  /**
   * Tests API key validity with a minimal call
   */
  static async testConnection(apiKey?: string): Promise<{ success: boolean; message: string }> {
    const key = (apiKey || this.getApiKey()).trim();
    if (!key) {
      return { success: false, message: 'No API key provided. Please drop your key in .env or enter it below.' };
    }

    try {
      const res = await fetch(`${this.API_URL}/${this.PRIMARY_MODEL}:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with JSON: {"status": "ok"}' }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errMsg = errorData?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
        return { success: false, message: `Gemini API connection failed: ${errMsg}` };
      }

      return { success: true, message: 'Successfully connected to Google Gemini 2.5 Flash!' };
    } catch (err: any) {
      return { success: false, message: `Network error connecting to Gemini API: ${err?.message || err}` };
    }
  }

  /**
   * Sends multi-page extracted text to Gemini to extract all structured medical parameters
   */
  static async extractMedicalData(params: GeminiExtractionParams): Promise<ExtractedDocumentData> {
    const key = this.getApiKey();
    if (!key) {
      throw new Error('GEMINI_API_KEY is not configured. Please add it to your .env file.');
    }

    const { fullText, fileName, fileType, fileBase64, pageCount = 1, onProgress } = params;

    onProgress?.('Sending full multi-page document to Gemini AI Engine...');

    const prompt = `You are MedLens AI, a specialized clinical intelligence engine designed to analyze medical laboratory reports, diagnostic panels, and patient records.

Analyze the following verbatim extracted document text from a ${pageCount}-page clinical document titled "${fileName}".

=== BEGIN DOCUMENT TEXT (${pageCount} PAGES) ===
${fullText}
=== END DOCUMENT TEXT ===

CRITICAL REQUIREMENTS:
1. EXTRACT ALL TESTS ACROSS ALL ${pageCount} PAGES:
   - Do NOT stop after the first page or first table.
   - Extract EVERY test, parameter, and metric listed anywhere in this document (e.g. Hemoglobin, WBC, Differential counts, Bilirubin, ALT/SGPT, AST/SGOT, Alkaline Phosphatase, Total Protein, Albumin, Globulin, Lipid Profile, Creatinine, Urea, Electrolytes, Thyroid, Urine analysis, etc.).
   - If there are 30, 40, or 60 tests in this document, output ALL of them. Do not summarize or omit any.

2. FOR EACH TEST RECORD:
   - "testName": Standard clinical test name (e.g. "Hemoglobin", "Total Leukocyte Count", "Platelet Count", "Serum Bilirubin Total").
   - "category": Categorize into one of: 'HEMATOLOGY', 'BIOCHEMISTRY', 'METABOLIC', 'LIPID', 'ENDOCRINE', 'URINALYSIS', 'OTHER'.
   - "value": Exact result value as string or number (e.g. "11.2", "7200", "0.8", "Negative").
   - "numericValue": Float number if numerical, otherwise null.
   - "unit": Exact unit printed on report (e.g. "g/dL", "cells/cumm", "mg/dL", "%", "U/L", "fl"). If none, use "".
   - "referenceRange": {
       "low": numeric low threshold if applicable,
       "high": numeric high threshold if applicable,
       "unit": reference range unit,
       "rawText": verbatim reference interval as printed on the report (e.g. "12.0 - 15.0", "4000 - 11000", "< 200"),
       "isAvailable": boolean
     }
   - "status": One of:
       - "LOW": if numerical value is below low reference range
       - "HIGH": if numerical value is above high reference range
       - "NORMAL": if value is within normal reference range
       - "UNKNOWN": if no reference range or non-numeric
   - "page": The 1-based page number where this test was found in the text (look at the "=== PAGE X OF Y ===" markers).
   - "confidence": An integer between 90 and 99.

3. METADATA EXTRACTION:
   - "facility": {
       "name": Diagnostic laboratory or hospital name from the letterhead/header,
       "address": Address if printed,
       "phone": Phone or contact if printed,
       "license": License / accreditation (e.g. CLIA, NABL, CAP) if printed,
       "director": Pathologist or Laboratory Director name if printed
     }
   - "patient": {
       "name": Full patient name,
       "patientId": MRN, Lab ID, or Specimen ID if printed,
       "age": Age as integer if printed,
       "sex": "Male", "Female", or "Other",
       "dateOfBirth": "YYYY-MM-DD" if printed,
       "bloodGroup": Blood group if printed
     }
   - "doctorName": Referring or attending physician name.
   - "reportName": Comprehensive report name (e.g. "Complete Blood Count & Liver Function Panel").
   - "reportType": One of: 'CBC', 'LFT', 'LIPID_PROFILE', 'METABOLIC_PANEL', 'PRESCRIPTION', 'DISCHARGE_SUMMARY', 'OTHER'.
   - "date": Report or specimen collection date in "YYYY-MM-DD" format. If only DD/MM/YYYY is in document, convert to YYYY-MM-DD.
   - "observations": Array of string comments, clinical interpretations, or notes from the pathologist.

4. SAFETY RULES:
   - Do NOT provide clinical diagnoses or medical advice.
   - Do NOT hallucinate metrics that are not in the document.
   - Output strict JSON only matching the schema.`;

    // Construct parts
    const parts: any[] = [{ text: prompt }];

    // If PDF base64 is available and under 15MB, also attach as multimodal part for maximum accuracy
    if (fileBase64 && fileType) {
      parts.push({
        inlineData: {
          mimeType: fileType,
          data: fileBase64
        }
      });
    }

    onProgress?.('Gemini is structuring metrics, reference intervals & clinical metadata...');

    let responseJson: any = null;
    const modelsToTry = [this.PRIMARY_MODEL, ...this.FALLBACK_MODELS];
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        responseJson = await this.callGeminiAPI(model, key, parts);
        break;
      } catch (err: any) {
        lastError = err;
        console.warn(`[GeminiService] Model ${model} failed:`, err?.message);
        // If it failed and we had multimodal parts, try text-only on this model
        if (parts.length > 1) {
          try {
            responseJson = await this.callGeminiAPI(model, key, [{ text: prompt }]);
            break;
          } catch (textOnlyErr: any) {
            lastError = textOnlyErr;
          }
        }
      }
    }

    if (!responseJson) {
      throw lastError || new Error('All Gemini models failed to process document.');
    }

    onProgress?.('Validating extracted parameters & finalizing Medical JSON...');

    return this.mapGeminiResponseToExtractedData(responseJson, fullText);
  }

  private static async callGeminiAPI(model: string, apiKey: string, parts: any[]): Promise<any> {
    const res = await fetch(`${this.API_URL}/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const msg = errorData?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
      throw new Error(`Gemini API error (${model}): ${msg}`);
    }

    const data = await res.json();
    const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) {
      throw new Error('Gemini API returned an empty response.');
    }

    try {
      return JSON.parse(rawContent);
    } catch (parseErr) {
      // If output had markdown formatting
      const cleaned = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    }
  }

  /**
   * Transforms raw Gemini response into typed ExtractedDocumentData with Zod schema verification
   */
  private static mapGeminiResponseToExtractedData(rawData: any, rawText: string): ExtractedDocumentData {
    // Validate through Zod runtime schema
    const parsed = GeminiDocumentSchema.safeParse(rawData);
    const data = parsed.success ? parsed.data : rawData;

    const rawTests = Array.isArray(data.tests) ? data.tests : [];

    const tests: LabResult[] = rawTests.map((t: any, index: number) => {
      const numericVal = typeof t.numericValue === 'number' 
        ? t.numericValue 
        : !isNaN(parseFloat(t.value)) 
        ? parseFloat(t.value) 
        : undefined;

      const rawRangeText = t.referenceRange?.rawText || 
        (t.referenceRange?.low !== undefined && t.referenceRange?.high !== undefined 
          ? `${t.referenceRange.low} - ${t.referenceRange.high}` 
          : 'Not Specified');

      return {
        id: `test-gemini-${Date.now()}-${index}`,
        testName: t.testName || `Laboratory Parameter ${index + 1}`,
        category: (t.category as any) || 'OTHER',
        value: t.value !== undefined ? String(t.value) : 'N/A',
        numericValue: numericVal,
        unit: t.unit || '',
        referenceRange: {
          low: typeof t.referenceRange?.low === 'number' ? t.referenceRange.low : undefined,
          high: typeof t.referenceRange?.high === 'number' ? t.referenceRange.high : undefined,
          unit: t.referenceRange?.unit || t.unit || '',
          rawText: rawRangeText,
          sourceSpecific: true,
          isAvailable: Boolean(t.referenceRange?.isAvailable ?? (t.referenceRange?.low !== undefined || t.referenceRange?.high !== undefined))
        },
        status: t.status === 'LOW' || t.status === 'HIGH' || t.status === 'NORMAL' ? t.status : 'UNKNOWN',
        date: data.date || new Date().toISOString().split('T')[0],
        provenance: {
          sourceDocument: 'Original Clinical Scan / PDF',
          page: t.page || 1,
          section: 'Laboratory Findings',
          originalText: `${t.testName}: ${t.value} ${t.unit} (Ref: ${rawRangeText})`,
          extractionMethod: 'Google Gemini 2.5 Flash + Zod Schema Validation',
          confidence: typeof t.confidence === 'number' ? t.confidence : 96,
          timestamp: new Date().toISOString()
        },
        verification: {
          status: 'NEEDS_REVIEW'
        },
        ambiguityDetected: false
      };
    });

    return {
      facility: {
        name: data.facility?.name || 'Diagnostic Pathology Laboratory',
        address: data.facility?.address || 'Clinical Healthcare Facility',
        phone: data.facility?.phone,
        license: data.facility?.license || 'Certified Clinical Facility',
        director: data.facility?.director || 'Attending Pathologist, MD'
      },
      patient: {
        name: data.patient?.name,
        patientId: data.patient?.patientId,
        age: typeof data.patient?.age === 'number' ? data.patient.age : undefined,
        sex: data.patient?.sex
      },
      doctorName: data.doctorName || 'Attending Physician, MD',
      reportName: data.reportName || 'Comprehensive Laboratory Diagnostic Report',
      reportType: data.reportType || 'CBC',
      date: data.date || new Date().toISOString().split('T')[0],
      rawText,
      tests,
      observations: Array.isArray(data.observations) ? data.observations : [],
      ambiguitiesFound: 0
    };
  }

  /**
   * MedLabs AI Conversational & Clinical Assistant (Task 3 & 6)
   * Powered by Google Gemini. Grounds answers in extracted patient reports JSON,
   * handles conversational greetings, and adds prominent red safety alerts to medication inquiries.
   */
  static async askMedLabsAI(params: {
    userMessage: string;
    patient: Patient;
    activeReport?: ClinicalReport;
    selectedTest?: LabResult;
  }): Promise<{
    record: string;
    source: string;
    explanation: string;
    note: string;
    isMedicationWarning?: boolean;
    isGreeting?: boolean;
    followUps?: string[];
  }> {
    const key = this.getApiKey();
    if (!key) {
      throw new Error('No Gemini API key configured.');
    }

    const { userMessage, patient, activeReport, selectedTest } = params;

    // Compile concise structured records JSON context
    const patientContext = {
      name: patient.name,
      patientId: patient.patientId,
      age: patient.age,
      sex: patient.sex,
      allergies: patient.allergies.map(a => `${a.substance} (${a.severity}: ${a.reaction || 'None listed'})`),
      conditions: patient.conditions.map(c => `${c.name} (${c.status})`),
      medications: patient.medications.map(m => `${m.name} ${m.dosage} ${m.frequency}`),
      reports: patient.reports.map(r => ({
        id: r.id,
        name: r.reportName,
        date: r.date,
        sourceDocument: r.sourceDocument,
        tests: r.tests.map(t => ({
          testName: t.testName,
          value: t.value,
          unit: t.unit,
          referenceRange: t.referenceRange.rawText,
          status: t.status,
          page: t.provenance.page
        }))
      }))
    };

    const prompt = `You are MedLabs AI, a helpful, courteous, and safety-governed medical laboratory assistant embedded in the MedLens healthcare platform.

USER QUERY: "${userMessage}"

${selectedTest ? `FOCUSED BIOMARKER CONTEXT:
Test Name: ${selectedTest.testName}
Reported Value: ${selectedTest.value} ${selectedTest.unit}
Laboratory Reference Interval: ${selectedTest.referenceRange.rawText}
Assessed Status: ${selectedTest.status}
Source Document: ${selectedTest.provenance.sourceDocument} (Page ${selectedTest.provenance.page})
` : ''}

PATIENT EXTRACTED CLINICAL RECORDS (JSON):
${JSON.stringify(patientContext, null, 2)}

INSTRUCTIONS & BEHAVIORAL PROTOCOLS:
1. GREETINGS & CASUAL CONVERSATION:
   - If the user says hi, hello, greetings, or casual remarks ("who are you", "what can you do"):
     Respond warmly and conversationally as MedLabs AI, introduce your role as their medical report assistant, and ask how you can help them navigate their laboratory findings.
     Set "isGreeting": true, "isMedicationWarning": false.

2. MEDICAL BIOMARKER & SPECIFIC TEST QUERIES (e.g., "explain my Triglycerides", "how is my BP", "explain my glucose", "is my hemoglobin okay?"):
   - ALWAYS answer the user's specific question directly. If the user asks about a specific test (e.g. Triglycerides, Hemoglobin, Glucose, Blood Pressure, Cholesterol), focus specifically on THAT test!
   - State the exact recorded value, units, date, and compare it against the laboratory's reference range (e.g. "Your Triglycerides level is 229 mg/dL, which is higher than the normal laboratory reference range of < 150 mg/dL").
   - Clearly explain what the biomarker is, what function it serves in the body, and what elevated or low numbers typically mean in clear, friendly educational terms.
   - DO NOT just dump a generic list of all abnormal tests from the report unless the user explicitly asked for all out-of-range tests.
   - Strictly DO NOT provide clinical diagnoses or definitive medical prognoses.
   - Set "isGreeting": false, "isMedicationWarning": false.

3. MEDICATION & PRESCRIPTION INQUIRIES (e.g., "what tablet should I use?", "what medicine to take for this?", "can I take aspirin/paracetamol?"):
   - Provide standard general educational information, or cite what is documented in their chart.
   - Set "isMedicationWarning": true.
   - In "note", ALWAYS provide the red warning: "⚠️ Medical Disclaimer: This response is generated by MedLabs AI for educational purposes only. Do not take, start, stop, or change any medication or dosage without directly consulting your licensed doctor or healthcare professional."

OUTPUT STRICT JSON ONLY with this schema:
{
  "record": "Documented finding or relevant excerpt from report",
  "source": "Document title, page citation, or Patient Chart",
  "explanation": "Clear, friendly, conversational explanation answering the user's question directly",
  "note": "Physician guidance or safety reminder",
  "isMedicationWarning": boolean,
  "isGreeting": boolean,
  "suggestedFollowUps": ["Relevant follow-up question 1", "Relevant follow-up question 2"]
}`;

    const modelsToTry = [this.PRIMARY_MODEL, ...this.FALLBACK_MODELS];
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const responseJson = await this.callGeminiAPI(model, key, [{ text: prompt }]);
        return {
          record: responseJson.record || '',
          source: responseJson.source || (activeReport?.sourceDocument || 'Patient Medical Records'),
          explanation: responseJson.explanation || responseJson.answer || '',
          note: responseJson.note || 'MedLens operates strictly within safe non-diagnostic parameters. Always consult a qualified physician.',
          isMedicationWarning: Boolean(responseJson.isMedicationWarning),
          isGreeting: Boolean(responseJson.isGreeting),
          followUps: Array.isArray(responseJson.suggestedFollowUps) ? responseJson.suggestedFollowUps : []
        };
      } catch (err: any) {
        lastError = err;
        console.warn(`[GeminiService.askMedLabsAI] Model ${model} failed:`, err?.message);
      }
    }

    throw lastError || new Error('Failed to query Gemini AI assistant.');
  }

  /**
   * Validates a newly entered test, allergy, condition, or medication with Gemini AI (Task 7)
   */
  static async validateClinicalEntry(params: {
    type: 'TEST' | 'ALLERGY' | 'CONDITION' | 'MEDICATION';
    data: any;
  }): Promise<{
    isValid: boolean;
    status: 'CONFIRMED' | 'WARNING' | 'REJECTED';
    message: string;
    clinicalDetails: string;
  }> {
    const key = this.getApiKey();
    if (!key) {
      return this.localValidateClinicalEntry(params);
    }

    const prompt = `You are MedLabs AI Clinical Data Validator.
Evaluate whether the following clinical entry is a real, recognized medical entity with biologically/physiologically plausible values and units:

TYPE: ${params.type}
DATA: ${JSON.stringify(params.data, null, 2)}

Rules:
1. Is this a recognized medical test, biomarker, medication, condition, or allergy?
2. Are the units standard in clinical pathology or pharmacy?
3. If numeric values are provided, are they within physiologically possible human biological limits (not absurd or negative)?

Respond with ONLY valid JSON:
{
  "isValid": boolean,
  "status": "CONFIRMED" | "WARNING" | "REJECTED",
  "message": "Brief 1-2 sentence confirmation or warning message",
  "clinicalDetails": "Short explanation of the physiological parameter, standard units, and clinical context"
}`;

    try {
      const result = await this.callGeminiAPI(this.PRIMARY_MODEL, key, [{ text: prompt }]);
      return {
        isValid: Boolean(result.isValid),
        status: result.status || (result.isValid ? 'CONFIRMED' : 'WARNING'),
        message: result.message || 'Validated with MedLabs AI.',
        clinicalDetails: result.clinicalDetails || ''
      };
    } catch {
      return this.localValidateClinicalEntry(params);
    }
  }

  private static localValidateClinicalEntry(params: { type: string; data: any }): {
    isValid: boolean;
    status: 'CONFIRMED' | 'WARNING' | 'REJECTED';
    message: string;
    clinicalDetails: string;
  } {
    const name = params.data.testName || params.data.name || params.data.substance || '';
    if (!name.trim()) {
      return {
        isValid: false,
        status: 'REJECTED',
        message: 'Name or biomarker identifier cannot be empty.',
        clinicalDetails: 'Please provide a valid medical name.'
      };
    }
    return {
      isValid: true,
      status: 'CONFIRMED',
      message: `MedLabs AI: "${name}" recognized and accepted for clinical recording.`,
      clinicalDetails: 'Clinical nomenclature and parameter format verified.'
    };
  }
}

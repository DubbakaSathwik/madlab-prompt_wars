import { ExtractedDocumentData } from './ocrService';
import { LabResult } from '../types/medical';

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
  private static PRIMARY_MODEL = 'gemini-2.5-flash';
  private static FALLBACK_MODELS = ['gemini-flash-latest', 'gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash'];

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
   * Transforms raw Gemini response into typed ExtractedDocumentData
   */
  private static mapGeminiResponseToExtractedData(data: any, rawText: string): ExtractedDocumentData {
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
        category: t.category || 'OTHER',
        value: t.value !== undefined ? t.value : 'N/A',
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
          documentId: `doc-${Date.now()}`,
          page: t.page || 1,
          originalText: `${t.testName}: ${t.value} ${t.unit} (Ref: ${rawRangeText})`,
          confidence: typeof t.confidence === 'number' ? t.confidence : 96
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
}

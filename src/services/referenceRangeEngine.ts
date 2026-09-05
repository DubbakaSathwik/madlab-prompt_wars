import { ReferenceRange, ResultStatus } from '../types/medical';

export interface EvaluationResult {
  status: ResultStatus;
  isAmbiguous: boolean;
  notes?: string;
}

export class ReferenceRangeEngine {
  /**
   * Parses raw reference range string printed on the medical document.
   * NEVER invents missing ranges or substitutes standard ranges.
   */
  static parse(rawText?: string, unit: string = ''): ReferenceRange {
    if (!rawText || !rawText.trim() || rawText.toLowerCase().includes('not available') || rawText.toLowerCase().includes('n/a')) {
      return {
        rawText: rawText?.trim() || 'Not Available',
        unit,
        sourceSpecific: false,
        isAvailable: false,
        isAmbiguous: false
      };
    }

    const clean = rawText.trim();

    // 1. Two-sided intervals: "13.0 - 17.0", "13–17", "13 to 17", "4.00 - 5.20"
    // Match en-dash, em-dash, hyphen, or word 'to'
    const intervalRegex = /^([0-9]+(?:\.[0-9]+)?)\s*(?:-|–|—|to)\s*([0-9]+(?:\.[0-9]+)?)(?:\s*.*)?$/i;
    const intervalMatch = clean.match(intervalRegex);
    if (intervalMatch) {
      const low = parseFloat(intervalMatch[1]);
      const high = parseFloat(intervalMatch[2]);
      if (!isNaN(low) && !isNaN(high) && low <= high) {
        return {
          low,
          high,
          unit,
          rawText: clean,
          sourceSpecific: true,
          isAvailable: true,
          isAmbiguous: false
        };
      }
    }

    // 2. Less than / Upper threshold: "< 150", "<17", "<= 200", "≤ 200", "< 200 Desirable"
    const lessThanRegex = /^(?:<|<=|≤)\s*([0-9]+(?:\.[0-9]+)?)(?:\s*.*)?$/;
    const lessThanMatch = clean.match(lessThanRegex);
    if (lessThanMatch) {
      const high = parseFloat(lessThanMatch[1]);
      if (!isNaN(high)) {
        return {
          low: 0,
          high,
          unit,
          rawText: clean,
          sourceSpecific: true,
          isAvailable: true,
          isAmbiguous: false
        };
      }
    }

    // 3. Greater than / Lower threshold: "> 13", ">= 13", "≥ 13", "13+"
    const greaterThanRegex = /^(?:>|>=|≥)\s*([0-9]+(?:\.[0-9]+)?)(?:\s*.*)?$/;
    const greaterThanMatch = clean.match(greaterThanRegex);
    if (greaterThanMatch) {
      const low = parseFloat(greaterThanMatch[1]);
      if (!isNaN(low)) {
        return {
          low,
          high: undefined,
          unit,
          rawText: clean,
          sourceSpecific: true,
          isAvailable: true,
          isAmbiguous: false
        };
      }
    }

    const plusRegex = /^([0-9]+(?:\.[0-9]+)?)\+$/;
    const plusMatch = clean.match(plusRegex);
    if (plusMatch) {
      const low = parseFloat(plusMatch[1]);
      if (!isNaN(low)) {
        return {
          low,
          high: undefined,
          unit,
          rawText: clean,
          sourceSpecific: true,
          isAvailable: true,
          isAmbiguous: false
        };
      }
    }

    // If string is present but cannot be deterministically parsed, flag as ambiguous for human review
    return {
      rawText: clean,
      unit,
      sourceSpecific: true,
      isAvailable: true,
      isAmbiguous: true
    };
  }

  /**
   * Evaluates numerical test value strictly against source reference range.
   * If range is not available -> UNKNOWN
   * If ambiguous -> UNKNOWN with isAmbiguous flag
   */
  static evaluate(value: number | string | undefined, range: ReferenceRange): EvaluationResult {
    if (!range.isAvailable || range.rawText === 'Not Available') {
      return {
        status: 'UNKNOWN',
        isAmbiguous: false,
        notes: 'No reference interval provided by reporting laboratory.'
      };
    }

    if (range.isAmbiguous) {
      return {
        status: 'UNKNOWN',
        isAmbiguous: true,
        notes: 'Reference range format is ambiguous; requires human clinician review.'
      };
    }

    let numVal: number | undefined;
    if (typeof value === 'number') {
      numVal = value;
    } else if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
      if (!isNaN(parsed)) numVal = parsed;
    }

    if (numVal === undefined) {
      return {
        status: 'UNKNOWN',
        isAmbiguous: false,
        notes: 'Non-numeric test result; clinical observation.'
      };
    }

    // Two-sided check
    if (range.low !== undefined && range.high !== undefined) {
      if (numVal < range.low) {
        return { status: 'LOW', isAmbiguous: false };
      }
      if (numVal > range.high) {
        return { status: 'HIGH', isAmbiguous: false };
      }
      return { status: 'NORMAL', isAmbiguous: false };
    }

    // Upper bound only: "< 150"
    if (range.high !== undefined && range.low === 0) {
      if (numVal > range.high) {
        return { status: 'HIGH', isAmbiguous: false };
      }
      return { status: 'NORMAL', isAmbiguous: false };
    }

    // Lower bound only: "> 13" or "13+"
    if (range.low !== undefined && range.high === undefined) {
      if (numVal < range.low) {
        return { status: 'LOW', isAmbiguous: false };
      }
      return { status: 'NORMAL', isAmbiguous: false };
    }

    return {
      status: 'UNKNOWN',
      isAmbiguous: true,
      notes: 'Unable to deterministically evaluate value against source bounds.'
    };
  }
}

import { describe, it, expect } from 'vitest';
import { SecuritySanitizer } from '../sanitize';

describe('SecuritySanitizer', () => {
  describe('sanitizeText()', () => {
    it('returns empty string for null or undefined input', () => {
      // @ts-expect-error Testing null input
      expect(SecuritySanitizer.sanitizeText(null)).toBe('');
      expect(SecuritySanitizer.sanitizeText(undefined)).toBe('');
      expect(SecuritySanitizer.sanitizeText('')).toBe('');
    });

    it('strips malicious script tags and inline javascript', () => {
      const malicious = '<script>alert("xss")</script>Normal clinical note';
      expect(SecuritySanitizer.sanitizeText(malicious)).toBe('Normal clinical note');
    });

    it('strips html markup tags', () => {
      const htmlText = '<div class="banner"><b>Hemoglobin:</b> 14.2 g/dL</div>';
      expect(SecuritySanitizer.sanitizeText(htmlText)).toBe('Hemoglobin: 14.2 g/dL');
    });

    it('strips non-printable ASCII control characters', () => {
      const controlChars = 'Patient\u0000Name\u0008Test';
      expect(SecuritySanitizer.sanitizeText(controlChars)).toBe('PatientNameTest');
    });

    it('preserves clean clinical text', () => {
      const clean = 'White Blood Cells: 6.8 x10^3/uL (Reference: 4.5 - 11.0)';
      expect(SecuritySanitizer.sanitizeText(clean)).toBe(clean);
    });
  });

  describe('sanitizeFileName()', () => {
    it('returns default fallback when file name is blank', () => {
      expect(SecuritySanitizer.sanitizeFileName('')).toBe('clinical_document.pdf');
    });

    it('neutralizes path traversal attempts', () => {
      const traversal = '../../../../etc/passwd';
      const sanitized = SecuritySanitizer.sanitizeFileName(traversal);
      expect(sanitized).not.toContain('..');
      expect(sanitized).toBe('etc_passwd');
    });

    it('replaces dangerous and illegal characters with underscores', () => {
      const dangerous = 'report*file?<name>|test.pdf';
      const sanitized = SecuritySanitizer.sanitizeFileName(dangerous);
      expect(sanitized).toBe('report_file__name__test.pdf');
    });

    it('removes null bytes from file names', () => {
      const nullByteName = 'patient_report\0.pdf.exe';
      const sanitized = SecuritySanitizer.sanitizeFileName(nullByteName);
      expect(sanitized).not.toContain('\0');
    });
  });

  describe('validateUploadFile()', () => {
    const createMockFile = (name: string, type: string, sizeBytes: number): File => {
      const buffer = new Uint8Array(sizeBytes > 100 ? 100 : sizeBytes);
      const file = new File([buffer], name, { type });
      Object.defineProperty(file, 'size', { value: sizeBytes });
      return file;
    };

    it('returns false when file is null or undefined', () => {
      // @ts-expect-error Testing invalid parameter
      const result = SecuritySanitizer.validateUploadFile(null);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('No file provided');
    });

    it('accepts valid PDF documents within 25MB boundary', () => {
      const file = createMockFile('lab_results.pdf', 'application/pdf', 5 * 1024 * 1024);
      const result = SecuritySanitizer.validateUploadFile(file);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('accepts valid medical PNG and JPEG scans', () => {
      const pngFile = createMockFile('chest_xray.png', 'image/png', 2 * 1024 * 1024);
      expect(SecuritySanitizer.validateUploadFile(pngFile).isValid).toBe(true);

      const jpgFile = createMockFile('scan.jpg', 'image/jpeg', 1 * 1024 * 1024);
      expect(SecuritySanitizer.validateUploadFile(jpgFile).isValid).toBe(true);
    });

    it('rejects files exceeding 25MB size limit', () => {
      const oversized = createMockFile('huge_dataset.pdf', 'application/pdf', 30 * 1024 * 1024);
      const result = SecuritySanitizer.validateUploadFile(oversized);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('exceeds safety limit (30.0 MB)');
    });

    it('rejects forbidden file extensions like .exe, .sh, or .html', () => {
      const exeFile = createMockFile('malicious.exe', 'application/x-msdownload', 1024);
      const result = SecuritySanitizer.validateUploadFile(exeFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Unsupported file extension ".exe"');
    });

    it('rejects MIME type mismatches or spoofed types', () => {
      const spoofed = createMockFile('fake.pdf', 'text/html', 1024);
      const result = SecuritySanitizer.validateUploadFile(spoofed);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid file MIME type');
    });
  });
});

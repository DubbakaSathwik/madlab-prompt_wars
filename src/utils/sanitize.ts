/**
 * Clinical Security & Input Sanitization Utility
 * Provides protection against XSS, file-upload spoofing, and path traversal.
 */

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp'
]);

const ALLOWED_EXTENSIONS = new Set(['pdf', 'png', 'jpg', 'jpeg', 'webp']);
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export class SecuritySanitizer {
  /**
   * Sanitizes string input by stripping HTML tags, script injection artifacts,
   * and non-printable control characters while preserving clinical symbols (<, >, %, ±).
   */
  static sanitizeText(input?: string): string {
    if (!input || typeof input !== 'string') return '';
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .trim();
  }

  /**
   * Cleans file names to prevent directory traversal and null-byte injection.
   */
  static sanitizeFileName(fileName: string): string {
    if (!fileName) return 'clinical_document.pdf';
    return fileName
      .replace(/[\0\r\n]/g, '')
      .replace(/(\.\.[\/\\])+/g, '')
      .replace(/[^a-zA-Z0-9._\- ]/g, '_')
      .trim();
  }

  /**
   * Validates uploaded files against allowed MIME types, extensions, and size limits.
   */
  static validateUploadFile(file: File): { isValid: boolean; error?: string } {
    if (!file) {
      return { isValid: false, error: 'No file provided.' };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return {
        isValid: false,
        error: `File size exceeds safety limit (${sizeMb} MB). Maximum allowable file size is 25 MB.`
      };
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return {
        isValid: false,
        error: `Unsupported file extension ".${ext}". Only PDF and medical image scans (.png, .jpg, .webp) are supported.`
      };
    }

    if (file.type && !ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
      return {
        isValid: false,
        error: `Invalid file MIME type "${file.type}". Must be application/pdf or image/* format.`
      };
    }

    return { isValid: true };
  }
}

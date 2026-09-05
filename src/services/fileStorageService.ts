/**
 * FileStorageService
 * Handles persisting and retrieving actual uploaded files (PDFs, images)
 * using browser IndexedDB storage with in-memory URL caching.
 * Ensures original source documents survive page reloads and can be previewed seamlessly.
 */

const DB_NAME = 'medlens_files_db';
const DB_VERSION = 1;
const STORE_NAME = 'report_files';

export class FileStorageService {
  private static dbPromise: Promise<IDBDatabase> | null = null;
  private static urlCache = new Map<string, string>(); // reportId -> blobUrl

  private static getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB not supported in this browser environment'));
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  /**
   * Saves an uploaded File or Blob for a given reportId
   * Returns a live blob URL for immediate preview
   */
  static async saveFile(reportId: string, file: Blob | File): Promise<string> {
    const url = URL.createObjectURL(file);
    this.urlCache.set(reportId, url);

    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(file, reportId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[FileStorageService] Failed to persist file in IndexedDB, using in-memory cache:', err);
    }

    return url;
  }

  /**
   * Retrieves the object URL for a given reportId from memory or IndexedDB
   */
  static async getFileUrl(reportId: string): Promise<string | null> {
    if (this.urlCache.has(reportId)) {
      return this.urlCache.get(reportId)!;
    }

    try {
      const db = await this.getDB();
      const blob = await new Promise<Blob | null>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(reportId);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });

      if (blob) {
        const url = URL.createObjectURL(blob);
        this.urlCache.set(reportId, url);
        return url;
      }
    } catch (err) {
      console.warn('[FileStorageService] Failed to load file from IndexedDB:', err);
    }

    return null;
  }

  /**
   * Synchronously checks if URL is already available in memory cache
   */
  static getCachedUrl(reportId: string): string | null {
    return this.urlCache.get(reportId) || null;
  }

  /**
   * Removes a file for a deleted report
   */
  static async removeFile(reportId: string): Promise<void> {
    const cached = this.urlCache.get(reportId);
    if (cached) {
      URL.revokeObjectURL(cached);
      this.urlCache.delete(reportId);
    }

    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(reportId);
    } catch (err) {
      console.warn('[FileStorageService] Failed to delete file from IndexedDB:', err);
    }
  }
}

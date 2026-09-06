/**
 * Quran Offline Storage & Sync Engine
 * Uses IndexedDB with localStorage fallback to ensure that all Quran pages,
 * Surah texts, Tafseers, and word meanings work 100% offline without internet.
 */

import { stripAllFormatting, removeBismillahFromAyah1 } from './quranText';
import { extractAyahWordMeanings } from '../data/ayahInsightsData';
import { toArabicNumerals, PAGE_1_DATA, PAGE_604_DATA } from '../data/quranData';

const DB_NAME = 'jannat_quran_offline_v2';
const STORE_NAME = 'quran_pages';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'pageNumber' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });

  return dbPromise;
}

export interface OfflineQuranPageRecord {
  pageNumber: number;
  surahs: any[];
  savedAt: number;
}

/**
 * Saves a Quran page to offline persistent storage (IndexedDB + localStorage fallback)
 */
export async function saveOfflinePage(pageNumber: number, surahs: any[]): Promise<void> {
  if (!pageNumber || !surahs || surahs.length === 0) return;

  const record: OfflineQuranPageRecord = {
    pageNumber,
    surahs,
    savedAt: Date.now()
  };

  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    // Fallback to localStorage for key pages if IndexedDB fails
    try {
      localStorage.setItem(`jannat_page_${pageNumber}`, JSON.stringify(record));
    } catch {
      // Storage quota exceeded or disabled
    }
  }
}

/**
 * Retrieves a cached page from offline storage
 */
export async function getOfflinePage(pageNumber: number): Promise<any[] | null> {
  if (!pageNumber) return null;

  try {
    const db = await getDB();
    const result = await new Promise<OfflineQuranPageRecord | null>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(pageNumber);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });

    if (result && result.surahs && result.surahs.length > 0) {
      return result.surahs;
    }
  } catch (err) {
    console.warn('IndexedDB get offline page error:', err);
  }

  // Fallback to localStorage check (always checked if IndexedDB did not have it or failed)
  try {
    const raw = localStorage.getItem(`jannat_page_${pageNumber}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.surahs?.length > 0) {
        return parsed.surahs;
      }
    }
  } catch {}

  // Built-in fallback data for initial and final pages
  if (pageNumber === 604 && PAGE_604_DATA?.surahs) {
    return PAGE_604_DATA.surahs;
  }
  if (pageNumber === 1 && PAGE_1_DATA?.surahs) {
    return PAGE_1_DATA.surahs;
  }

  return null;
}

/**
 * Returns the count of Quran pages stored offline
 */
export async function getCachedPagesCount(): Promise<number> {
  try {
    const db = await getDB();
    return await new Promise<number>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.count();
      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => resolve(0);
    });
  } catch {
    let count = 0;
    try {
      for (let i = 1; i <= 604; i++) {
        if (localStorage.getItem(`jannat_page_${i}`)) count++;
      }
    } catch {}
    return count;
  }
}

/**
 * Returns the list of all page numbers stored offline
 */
export async function getCachedPagesNumbers(): Promise<number[]> {
  try {
    const db = await getDB();
    return await new Promise<number[]>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAllKeys();
      req.onsuccess = () => {
        const keys = (req.result || []).map(Number);
        resolve(keys.sort((a, b) => a - b));
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    const numbers: number[] = [];
    try {
      for (let i = 1; i <= 604; i++) {
        if (localStorage.getItem(`jannat_page_${i}`)) numbers.push(i);
      }
    } catch {}
    return numbers;
  }
}

/**
 * Clears all cached Quran pages from offline storage
 */
export async function clearAllOfflinePages(): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {}

  try {
    for (let i = 1; i <= 604; i++) {
      localStorage.removeItem(`jannat_page_${i}`);
    }
  } catch {}
}

/**
 * Fetches and processes a single page from remote API and caches it
 */
export async function fetchAndCacheSinglePage(pageNumber: number): Promise<any[] | null> {
  try {
    const [uthmaniJson, tafseerJson] = await Promise.all([
      fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/quran-uthmani`).then((res) => res.json()).catch(() => null),
      fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/ar.muyassar`).then((res) => res.json()).catch(() => null)
    ]);

    if (!uthmaniJson?.data?.ayahs) return null;

    const tafseerMap: Record<string, string> = {};
    if (tafseerJson?.data?.ayahs) {
      tafseerJson.data.ayahs.forEach((ta: any) => {
        const k = `${ta.surah.number}:${ta.numberInSurah}`;
        tafseerMap[k] = ta.text;
      });
    }

    const grouped: Record<number, { number: number; name: string; bismillah: string; ayahs: any[] }> = {};

    uthmaniJson.data.ayahs.forEach((a: any) => {
      const sNum = a.surah.number;
      if (!grouped[sNum]) {
        grouped[sNum] = {
          number: sNum,
          name: a.surah.name.replace('سُورَةُ ', ''),
          bismillah: sNum !== 1 && sNum !== 9 ? 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' : '',
          ayahs: []
        };
      }

      const k = `${sNum}:${a.numberInSurah}`;
      const resolvedTafseer = tafseerMap[k] || `تفسير الآية ${toArabicNumerals(a.numberInSurah)} من سورة ${a.surah.name}.`;

      let rawText = a.text;
      if (a.numberInSurah === 1 && sNum !== 1 && sNum !== 9) {
        rawText = removeBismillahFromAyah1(rawText);
      }

      const cleanText = stripAllFormatting(rawText);
      const wordMeanings = extractAyahWordMeanings(cleanText);

      grouped[sNum].ayahs.push({
        number: a.numberInSurah,
        text: cleanText,
        tafseer: resolvedTafseer,
        wordMeanings
      });
    });

    const surahsArray = Object.values(grouped);
    await saveOfflinePage(pageNumber, surahsArray);
    return surahsArray;
  } catch {
    return null;
  }
}

/**
 * Batch downloader to download and save all Quran pages for offline access
 */
export async function downloadAllQuranPages(
  onProgress: (done: number, total: number, percentage: number) => void,
  shouldCancel: () => boolean
): Promise<{ success: boolean; cachedCount: number }> {
  const TOTAL_PAGES = 604;
  const existingPages = new Set(await getCachedPagesNumbers());
  let completed = existingPages.size;

  onProgress(completed, TOTAL_PAGES, Math.round((completed / TOTAL_PAGES) * 100));

  const pagesToDownload: number[] = [];
  for (let i = 1; i <= TOTAL_PAGES; i++) {
    if (!existingPages.has(i)) {
      pagesToDownload.push(i);
    }
  }

  if (pagesToDownload.length === 0) {
    return { success: true, cachedCount: TOTAL_PAGES };
  }

  // Batch download 4 pages concurrently to be gentle with API and network
  const BATCH_SIZE = 4;
  for (let i = 0; i < pagesToDownload.length; i += BATCH_SIZE) {
    if (shouldCancel()) {
      return { success: false, cachedCount: completed };
    }

    const batch = pagesToDownload.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (pageNum) => {
        try {
          const res = await fetchAndCacheSinglePage(pageNum);
          if (res) completed++;
        } catch {}
      })
    );

    const percent = Math.min(100, Math.round((completed / TOTAL_PAGES) * 100));
    onProgress(completed, TOTAL_PAGES, percent);

    // Minor delay between batches to avoid network congestion
    await new Promise((r) => setTimeout(r, 60));
  }

  return { success: true, cachedCount: completed };
}

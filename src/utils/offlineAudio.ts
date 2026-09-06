import { DownloadedSurahRecord, ReciterId } from '../types';
import { RECITERS_LIST, SURAHS_LIST, getSurahAudioUrl } from '../data/quranData';
import { fetchAndCacheSinglePage } from './quranOfflineStorage';

const CACHE_NAME = 'jannat-quran-audio-v1';
const STORAGE_KEY = 'jannat_downloaded_recitations_v1';

/**
 * Loads list of recorded downloaded surahs from localStorage
 */
export function getDownloadedSurahs(): DownloadedSurahRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load downloaded surahs', e);
  }
  return [];
}

/**
 * Saves downloaded surahs registry to localStorage
 */
export function saveDownloadedSurahs(list: DownloadedSurahRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save downloaded surahs', e);
  }
}

/**
 * Checks if a specific Surah for a specific Reciter is downloaded
 */
export function isSurahDownloaded(reciterId: ReciterId, surahNumber: number): boolean {
  const list = getDownloadedSurahs();
  const id = `${reciterId}_${surahNumber}`;
  return list.some((item) => item.id === id);
}

/**
 * Downloads and caches a Surah audio file for offline listening
 */
export async function downloadSurahAudio(
  reciterId: ReciterId,
  surahNumber: number,
  surahName: string,
  onProgress?: (percent: number) => void
): Promise<{ success: boolean; blobUrl?: string; error?: string }> {
  const reciter = RECITERS_LIST.find((r) => r.id === reciterId);
  if (!reciter) {
    return { success: false, error: 'القارئ غير موجود' };
  }

  const audioUrl = getSurahAudioUrl(reciter.serverUrl, surahNumber);
  const recordId = `${reciterId}_${surahNumber}`;

  try {
    if (onProgress) onProgress(15);

    // Try fetching the audio stream
    const response = await fetch(audioUrl, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    if (onProgress) onProgress(50);

    // Clone response for Cache Storage if supported
    if ('caches' in window) {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(audioUrl, response.clone());
      } catch (cacheErr) {
        console.warn('Cache Storage write failed, continuing with Blob', cacheErr);
      }
    }

    const blob = await response.blob();
    if (onProgress) onProgress(90);

    const sizeInMb = (blob.size / (1024 * 1024)).toFixed(1);
    const sizeEstimate = `${sizeInMb} ميجابايت`;

    // Save record in localStorage registry
    const currentList = getDownloadedSurahs();
    const existingIdx = currentList.findIndex((item) => item.id === recordId);
    
    const newRecord: DownloadedSurahRecord = {
      id: recordId,
      surahNumber,
      surahName,
      reciterId,
      reciterName: reciter.name,
      audioUrl,
      downloadedAt: Date.now(),
      sizeEstimate,
      isCached: true
    };

    if (existingIdx >= 0) {
      currentList[existingIdx] = newRecord;
    } else {
      currentList.unshift(newRecord);
    }
    saveDownloadedSurahs(currentList);

    // Pre-cache the Quran text pages for this surah in the background so offline reading works 100% seamlessly
    try {
      const currentMeta = SURAHS_LIST.find((s) => s.number === surahNumber);
      if (currentMeta) {
        const nextMeta = SURAHS_LIST.find((s) => s.number === surahNumber + 1);
        const startP = currentMeta.startPage;
        const endP = nextMeta ? nextMeta.startPage : 604;
        for (let p = startP; p <= endP; p++) {
          fetchAndCacheSinglePage(p).catch(() => {});
        }
      }
    } catch {}

    if (onProgress) onProgress(100);

    const localBlobUrl = URL.createObjectURL(blob);
    return { success: true, blobUrl: localBlobUrl };
  } catch (err: any) {
    console.error('Download audio failed:', err);
    return { success: false, error: err.message || 'حدث خطأ أثناء تحميل التلاوة' };
  }
}

/**
 * Retrieves cached audio URL if available offline, otherwise returns remote url
 */
export async function getPlayableAudioUrl(reciterId: ReciterId, surahNumber: number): Promise<string> {
  const reciter = RECITERS_LIST.find((r) => r.id === reciterId);
  if (!reciter) return '';
  const defaultUrl = getSurahAudioUrl(reciter.serverUrl, surahNumber);

  if ('caches' in window) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const matched = await cache.match(defaultUrl);
      if (matched) {
        const blob = await matched.blob();
        return URL.createObjectURL(blob);
      }
    } catch (e) {
      console.warn('Could not read from audio cache', e);
    }
  }

  return defaultUrl;
}

/**
 * Removes a downloaded surah from cache and storage
 */
export async function removeDownloadedSurah(reciterId: ReciterId, surahNumber: number): Promise<void> {
  const reciter = RECITERS_LIST.find((r) => r.id === reciterId);
  const recordId = `${reciterId}_${surahNumber}`;

  if (reciter && 'caches' in window) {
    try {
      const audioUrl = getSurahAudioUrl(reciter.serverUrl, surahNumber);
      const cache = await caches.open(CACHE_NAME);
      await cache.delete(audioUrl);
    } catch (e) {
      console.warn('Cache delete error', e);
    }
  }

  const list = getDownloadedSurahs().filter((item) => item.id !== recordId);
  saveDownloadedSurahs(list);
}

/**
 * Triggers native browser download for saving MP3 to user files/device
 */
export function triggerDirectFileDownload(reciterId: ReciterId, surahNumber: number, surahName: string): void {
  const reciter = RECITERS_LIST.find((r) => r.id === reciterId);
  if (!reciter) return;
  const audioUrl = getSurahAudioUrl(reciter.serverUrl, surahNumber);
  
  const paddedNumber = surahNumber.toString().padStart(3, '0');
  const filename = `سورة_${surahName}_${reciter.name}_${paddedNumber}.mp3`;

  // Create temporary link
  const a = document.createElement('a');
  a.href = audioUrl;
  a.download = filename;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

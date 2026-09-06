import { DayTrackerData, AppSettings, Bookmark, PrayerStatus, ReciterId } from '../types';

export const STORAGE_KEYS = {
  SETTINGS: 'jannat_settings_v1',
  TRACKER_PREFIX: 'jannat_tracker_',
  BOOKMARKS: 'jannat_bookmarks_v1',
  ATHKAR_PROGRESS: 'jannat_athkar_progress_v1',
  DOWNLOADED_RECITATIONS: 'jannat_downloads_v1',
  LAST_READ_PAGE: 'jannat_last_read_page_v1',
  SEBHA_COUNT: 'jannat_sebha_count_v1',
  FAVORITE_AUDIO_LESSONS: 'jannat_fav_audio_lessons_v1',
  FAVORITE_SCHOLARS: 'jannat_fav_scholars_v1',
  LAST_RECITER: 'jannat_last_reciter_v1'
};

/* ==========================================================================
   IndexedDB Core Engine for Ultra-Reliable Offline Persistence
   Database Name: jannat_user_sync_v2
   ========================================================================== */
export const SYNC_DB_NAME = 'jannat_user_sync_v2';
export const SYNC_DB_VERSION = 1;
export const STATE_STORE = 'app_state';
export const TRACKER_STORE = 'daily_trackers';

let dbPromise: Promise<IDBDatabase> | null = null;

export function openSyncDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return reject(new Error('IndexedDB not supported in current environment'));
    }
    try {
      const request = indexedDB.open(SYNC_DB_NAME, SYNC_DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STATE_STORE)) {
          db.createObjectStore(STATE_STORE, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(TRACKER_STORE)) {
          db.createObjectStore(TRACKER_STORE, { keyPath: 'date' });
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        db.onclose = () => {
          dbPromise = null;
        };
        db.onerror = () => {
          dbPromise = null;
        };
        resolve(db);
      };

      request.onerror = () => {
        dbPromise = null;
        reject(request.error);
      };

      request.onblocked = () => {
        console.warn('IndexedDB sync blocked by older version');
      };
    } catch (err) {
      dbPromise = null;
      reject(err);
    }
  });

  return dbPromise;
}

/**
 * Save an arbitrary state entry into IndexedDB asynchronously
 */
export async function setIndexedDBItem(key: string, value: any): Promise<void> {
  try {
    const db = await openSyncDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STATE_STORE, 'readwrite');
      const store = tx.objectStore(STATE_STORE);
      store.put({ key, value, updatedAt: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // Graceful silent fallback
  }
}

/**
 * Retrieve a state entry from IndexedDB
 */
export async function getIndexedDBItem<T>(key: string): Promise<T | null> {
  try {
    const db = await openSyncDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STATE_STORE, 'readonly');
      const store = tx.objectStore(STATE_STORE);
      const req = store.get(key);
      req.onsuccess = () => {
        if (req.result && req.result.value !== undefined) {
          resolve(req.result.value as T);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Save daily tracker item in dedicated IndexedDB store
 */
export async function setIndexedDBTracker(tracker: DayTrackerData): Promise<void> {
  try {
    const db = await openSyncDB();
    return new Promise((resolve) => {
      const tx = db.transaction(TRACKER_STORE, 'readwrite');
      const store = tx.objectStore(TRACKER_STORE);
      store.put({ ...tracker, updatedAt: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // Graceful fallback
  }
}

/**
 * Retrieve daily tracker item from IndexedDB
 */
export async function getIndexedDBTracker(date: string): Promise<DayTrackerData | null> {
  try {
    const db = await openSyncDB();
    return new Promise((resolve) => {
      const tx = db.transaction(TRACKER_STORE, 'readonly');
      const store = tx.objectStore(TRACKER_STORE);
      const req = store.get(date);
      req.onsuccess = () => {
        if (req.result) {
          const { updatedAt, ...cleanTracker } = req.result;
          resolve(cleanTracker as DayTrackerData);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Notify the active Service Worker of any state mutation so it can persist or broadcast
 */
export function notifyServiceWorker(key: string, value: any): void {
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'STATE_UPDATED',
        key,
        value,
        timestamp: Date.now()
      });
    }
  }
}

/**
 * Broadcast state update locally inside the current window
 */
export function broadcastLocalChange(key: string, value: any): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('jannat_storage_changed', {
        detail: { key, value, timestamp: Date.now() }
      })
    );
  }
}

/**
 * Subscribe to storage updates from any tab or service worker
 */
export function onStorageChange(callback: (key: string, value: any) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => {
    const custom = e as CustomEvent;
    if (custom.detail) {
      callback(custom.detail.key, custom.detail.value);
    }
  };
  window.addEventListener('jannat_storage_changed', handler);
  return () => window.removeEventListener('jannat_storage_changed', handler);
}

/* ==========================================================================
   Application Default Settings & Sync Hydration
   ========================================================================== */
export const DEFAULT_SETTINGS: AppSettings = {
  isDarkMode: false,
  enableEyeComfortMode: false,
  selectedReciter: 'alafasy',
  quranFontSize: 24,
  enableAutoScroll: true,
  enableAudioChimes: true,
  dailyMorningReminder: true,
  dailyEveningReminder: true,
  workModeIntervalMinutes: 15,
  enableWorkModeThoughts: false
};

export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function loadLastReciter(): ReciterId {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_RECITER);
    if (raw) return raw as ReciterId;
    const rawSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (rawSettings) {
      const parsed = JSON.parse(rawSettings);
      if (parsed.selectedReciter) return parsed.selectedReciter;
    }
  } catch {}
  return 'alafasy';
}

export function saveLastReciter(reciterId: ReciterId): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_RECITER, reciterId);
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.selectedReciter = reciterId;
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
      setIndexedDBItem(STORAGE_KEYS.SETTINGS, parsed);
    }
  } catch {}
  setIndexedDBItem(STORAGE_KEYS.LAST_RECITER, reciterId);
  notifyServiceWorker(STORAGE_KEYS.LAST_RECITER, reciterId);
  broadcastLocalChange(STORAGE_KEYS.LAST_RECITER, reciterId);
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const lastReciter = loadLastReciter();
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed, selectedReciter: lastReciter || parsed.selectedReciter || 'alafasy' };
    }
    return { ...DEFAULT_SETTINGS, selectedReciter: lastReciter };
  } catch {
    // Fallback
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  try {
    if (settings.selectedReciter) {
      localStorage.setItem(STORAGE_KEYS.LAST_RECITER, settings.selectedReciter);
      setIndexedDBItem(STORAGE_KEYS.LAST_RECITER, settings.selectedReciter);
    }
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {}
  setIndexedDBItem(STORAGE_KEYS.SETTINGS, settings);
  notifyServiceWorker(STORAGE_KEYS.SETTINGS, settings);
  broadcastLocalChange(STORAGE_KEYS.SETTINGS, settings);
}

export function loadDayTracker(dateKey = getTodayKey()): DayTrackerData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRACKER_PREFIX + dateKey);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  return {
    date: dateKey,
    prayers: {
      fajr: 'missed',
      dhuhr: 'missed',
      asr: 'missed',
      maghrib: 'missed',
      isha: 'missed'
    },
    habits: {},
    quranPagesRead: 0,
    quranTargetPages: 4,
    athkarCompletedCount: 0,
    athkarTargetCount: 12,
    treeGrowthPercentage: 0
  };
}

export function calculateTreePercentage(data: DayTrackerData): number {
  let completedPoints = 0;
  const totalPoints = 10; // 5 prayers + 3 athkar + 1 quran + 1 tadabbur

  // Prayers (alone gives 0.7, congregation gives 1.0)
  Object.values(data.prayers).forEach((status: PrayerStatus) => {
    if (status === 'congregation') completedPoints += 1;
    else if (status === 'alone') completedPoints += 0.7;
  });

  // Athkar habits
  if (data.habits['morning_athkar']) completedPoints += 1;
  if (data.habits['evening_athkar']) completedPoints += 1;
  if (data.habits['sleep_athkar']) completedPoints += 1;

  // Quran ward
  if (data.quranPagesRead >= data.quranTargetPages || data.habits['quran_ward']) {
    completedPoints += 1;
  }

  // Tadabbur / Sunnah
  if (data.habits['tadabbur']) completedPoints += 1;

  return Math.min(100, Math.round((completedPoints / totalPoints) * 100));
}

export function saveDayTracker(data: DayTrackerData): void {
  try {
    data.treeGrowthPercentage = calculateTreePercentage(data);
    localStorage.setItem(STORAGE_KEYS.TRACKER_PREFIX + data.date, JSON.stringify(data));
  } catch {}
  setIndexedDBTracker(data);
  setIndexedDBItem(STORAGE_KEYS.TRACKER_PREFIX + data.date, data);
  notifyServiceWorker(STORAGE_KEYS.TRACKER_PREFIX + data.date, data);
  broadcastLocalChange(STORAGE_KEYS.TRACKER_PREFIX + data.date, data);
}

/* ==========================================================================
   Bookmarks Engine (Offline & IndexedDB Synchronized)
   ========================================================================== */
export function loadBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveBookmarks(bookmarks: Bookmark[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  } catch {}
  setIndexedDBItem(STORAGE_KEYS.BOOKMARKS, bookmarks);
  notifyServiceWorker(STORAGE_KEYS.BOOKMARKS, bookmarks);
  broadcastLocalChange(STORAGE_KEYS.BOOKMARKS, bookmarks);
}

export async function loadBookmarksAsync(): Promise<Bookmark[]> {
  const local = loadBookmarks();
  if (local && local.length > 0) return local;
  const idb = await getIndexedDBItem<Bookmark[]>(STORAGE_KEYS.BOOKMARKS);
  if (idb && Array.isArray(idb) && idb.length > 0) {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(idb));
    } catch {}
    return idb;
  }
  return [];
}

/* ==========================================================================
   Last Read Page (Quran Reading History)
   ========================================================================== */
export function loadLastReadPage(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_READ_PAGE);
    if (raw) {
      const parsed = parseInt(raw, 10);
      if (parsed >= 1 && parsed <= 604) return parsed;
    }
  } catch {}
  return 1;
}

export function saveLastReadPage(page: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_READ_PAGE, String(page));
  } catch {}
  setIndexedDBItem(STORAGE_KEYS.LAST_READ_PAGE, page);
  notifyServiceWorker(STORAGE_KEYS.LAST_READ_PAGE, page);
  broadcastLocalChange(STORAGE_KEYS.LAST_READ_PAGE, page);
}

export async function loadLastReadPageAsync(): Promise<number> {
  const local = loadLastReadPage();
  if (local > 1) return local;
  const idb = await getIndexedDBItem<number>(STORAGE_KEYS.LAST_READ_PAGE);
  if (idb && typeof idb === 'number' && idb >= 1 && idb <= 604) {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_READ_PAGE, String(idb));
    } catch {}
    return idb;
  }
  return local;
}

/* ==========================================================================
   Sebha, Lessons & Scholars
   ========================================================================== */
export function loadSebhaCount(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SEBHA_COUNT);
    if (raw) return parseInt(raw, 10) || 0;
  } catch {}
  return 0;
}

export function saveSebhaCount(count: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SEBHA_COUNT, String(count));
  } catch {}
  setIndexedDBItem(STORAGE_KEYS.SEBHA_COUNT, count);
  notifyServiceWorker(STORAGE_KEYS.SEBHA_COUNT, count);
  broadcastLocalChange(STORAGE_KEYS.SEBHA_COUNT, count);
}

export function loadFavoriteAudioLessons(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITE_AUDIO_LESSONS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return ['lesson-1', 'lesson-3']; // Default starter favorites
}

export function saveFavoriteAudioLessons(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITE_AUDIO_LESSONS, JSON.stringify(ids));
  } catch {}
  setIndexedDBItem(STORAGE_KEYS.FAVORITE_AUDIO_LESSONS, ids);
  notifyServiceWorker(STORAGE_KEYS.FAVORITE_AUDIO_LESSONS, ids);
  broadcastLocalChange(STORAGE_KEYS.FAVORITE_AUDIO_LESSONS, ids);
}

export function toggleFavoriteAudioLesson(id: string): string[] {
  const current = loadFavoriteAudioLessons();
  const exists = current.includes(id);
  const updated = exists ? current.filter((x) => x !== id) : [...current, id];
  saveFavoriteAudioLessons(updated);
  return updated;
}

export function loadFavoriteScholars(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITE_SCHOLARS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return ['الشيخ محمد بن صالح العثيمين', 'الشيخ عبد الرزاق البدر', 'الشيخ صالح المغامسي'];
}

export function saveFavoriteScholars(scholars: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITE_SCHOLARS, JSON.stringify(scholars));
  } catch {}
  setIndexedDBItem(STORAGE_KEYS.FAVORITE_SCHOLARS, scholars);
  notifyServiceWorker(STORAGE_KEYS.FAVORITE_SCHOLARS, scholars);
  broadcastLocalChange(STORAGE_KEYS.FAVORITE_SCHOLARS, scholars);
}

export function toggleFavoriteScholar(scholarName: string): string[] {
  const current = loadFavoriteScholars();
  const exists = current.includes(scholarName);
  const updated = exists ? current.filter((x) => x !== scholarName) : [...current, scholarName];
  saveFavoriteScholars(updated);
  return updated;
}

/* ==========================================================================
   Comprehensive Backup, Export & Import
   ========================================================================== */
export async function syncAllToIndexedDB(): Promise<void> {
  const keysToSync = [
    { key: STORAGE_KEYS.SETTINGS, val: loadSettings() },
    { key: STORAGE_KEYS.BOOKMARKS, val: loadBookmarks() },
    { key: STORAGE_KEYS.LAST_READ_PAGE, val: loadLastReadPage() },
    { key: STORAGE_KEYS.LAST_RECITER, val: loadLastReciter() },
    { key: STORAGE_KEYS.SEBHA_COUNT, val: loadSebhaCount() },
    { key: STORAGE_KEYS.FAVORITE_AUDIO_LESSONS, val: loadFavoriteAudioLessons() },
    { key: STORAGE_KEYS.FAVORITE_SCHOLARS, val: loadFavoriteScholars() },
    { key: STORAGE_KEYS.TRACKER_PREFIX + getTodayKey(), val: loadDayTracker() }
  ];

  for (const item of keysToSync) {
    await setIndexedDBItem(item.key, item.val);
  }
}

export async function restoreFromIndexedDB(): Promise<boolean> {
  try {
    const db = await openSyncDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STATE_STORE, 'readonly');
      const store = tx.objectStore(STATE_STORE);
      const req = store.getAll();

      req.onsuccess = () => {
        const items: Array<{ key: string; value: any }> = req.result || [];
        if (items.length === 0) {
          resolve(false);
          return;
        }
        for (const item of items) {
          if (item.key && item.value !== undefined) {
            try {
              if (typeof item.value === 'string') {
                localStorage.setItem(item.key, item.value);
              } else {
                localStorage.setItem(item.key, JSON.stringify(item.value));
              }
            } catch {}
          }
        }
        broadcastLocalChange('ALL', true);
        resolve(true);
      };

      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

export function exportBackupJSON(): string {
  const data: Record<string, unknown> = {
    exportedAt: new Date().toISOString(),
    settings: loadSettings(),
    bookmarks: loadBookmarks(),
    lastReadPage: loadLastReadPage(),
    todayTracker: loadDayTracker(),
    sebhaCount: loadSebhaCount(),
    favoriteAudioLessons: loadFavoriteAudioLessons(),
    favoriteScholars: loadFavoriteScholars(),
    lastReciter: loadLastReciter()
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupJSON(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.settings) saveSettings(parsed.settings);
    if (parsed.bookmarks) saveBookmarks(parsed.bookmarks);
    if (parsed.lastReadPage) saveLastReadPage(parsed.lastReadPage);
    if (parsed.todayTracker) saveDayTracker(parsed.todayTracker);
    if (parsed.sebhaCount !== undefined) saveSebhaCount(parsed.sebhaCount);
    if (parsed.favoriteAudioLessons) saveFavoriteAudioLessons(parsed.favoriteAudioLessons);
    if (parsed.favoriteScholars) saveFavoriteScholars(parsed.favoriteScholars);
    if (parsed.lastReciter) saveLastReciter(parsed.lastReciter);
    syncAllToIndexedDB().catch(() => {});
    return true;
  } catch {
    return false;
  }
}

/* ==========================================================================
   Automatic Storage Hydration & Cross-Layer Synchronization
   ========================================================================== */
export async function initStorageSync(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const db = await openSyncDB();
    const tx = db.transaction(STATE_STORE, 'readonly');
    const store = tx.objectStore(STATE_STORE);
    const req = store.getAll();

    req.onsuccess = () => {
      const items: Array<{ key: string; value: any; updatedAt: number }> = req.result || [];
      const dbKeysMap = new Map<string, any>();
      for (const item of items) {
        dbKeysMap.set(item.key, item.value);
      }

      let restoredAny = false;

      // 1. If localStorage lost data (browser storage pressure eviction / private window), restore from IndexedDB
      for (const [key, value] of dbKeysMap.entries()) {
        const localVal = localStorage.getItem(key);
        if (!localVal && value !== undefined && value !== null) {
          try {
            if (typeof value === 'string') {
              localStorage.setItem(key, value);
            } else {
              localStorage.setItem(key, JSON.stringify(value));
            }
            restoredAny = true;
          } catch {}
        }
      }

      // 2. Mirror any existing localStorage items into IndexedDB if not present
      const keysToCheck = [
        STORAGE_KEYS.SETTINGS,
        STORAGE_KEYS.BOOKMARKS,
        STORAGE_KEYS.LAST_READ_PAGE,
        STORAGE_KEYS.LAST_RECITER,
        STORAGE_KEYS.SEBHA_COUNT,
        STORAGE_KEYS.FAVORITE_AUDIO_LESSONS,
        STORAGE_KEYS.FAVORITE_SCHOLARS,
        STORAGE_KEYS.TRACKER_PREFIX + getTodayKey()
      ];

      for (const k of keysToCheck) {
        const localVal = localStorage.getItem(k);
        if (localVal && !dbKeysMap.has(k)) {
          try {
            const parsed = JSON.parse(localVal);
            setIndexedDBItem(k, parsed);
          } catch {
            setIndexedDBItem(k, localVal);
          }
        }
      }

      if (restoredAny) {
        window.dispatchEvent(new CustomEvent('jannat_storage_restored'));
      }
    };
  } catch (err) {
    console.warn('initStorageSync error:', err);
  }

  // Listen for Service Worker broadcast messages
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SYNC_STATE_BROADCAST') {
        const { key, value } = event.data;
        if (key && value !== undefined) {
          try {
            const strVal = typeof value === 'string' ? value : JSON.stringify(value);
            if (localStorage.getItem(key) !== strVal) {
              localStorage.setItem(key, strVal);
              broadcastLocalChange(key, value);
            }
          } catch {}
        }
      }
    });
  }

  // Cross-tab storage synchronization
  window.addEventListener('storage', (e) => {
    if (e.key && e.newValue) {
      try {
        const val = JSON.parse(e.newValue);
        setIndexedDBItem(e.key, val);
        broadcastLocalChange(e.key, val);
      } catch {
        setIndexedDBItem(e.key, e.newValue);
        broadcastLocalChange(e.key, e.newValue);
      }
    }
  });
}

// Auto-initialize when running in browser
if (typeof window !== 'undefined') {
  initStorageSync().catch(() => {});
}

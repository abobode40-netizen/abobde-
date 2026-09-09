import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  BookOpen, 
  Play, 
  Pause, 
  Volume2, 
  Bookmark as BookmarkIcon, 
  BookmarkCheck,
  Trash2,
  Settings2, 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown,
  ChevronUp,
  X,
  Mic, 
  Share2, 
  RotateCcw, 
  HelpCircle,
  Sparkles,
  ArrowRight,
  Headphones,
  Check,
  Download,
  HardDrive,
  CheckCircle2,
  ListFilter,
  Layers,
  FileText,
  Copy,
  Hash,
  SkipForward,
  SkipBack,
  Repeat,
  Repeat1,
  Lock,
  Unlock,
  Sun,
  RotateCw,
  Palette,
  Type
} from 'lucide-react';
import { SurahMeta, ReciterId, AppSettings, Bookmark, QuranThemeId } from '../types';
import { SURAHS_LIST, RECITERS_LIST, PAGE_604_DATA, PAGE_1_DATA, toArabicNumerals, getSurahAudioUrl, getAyahAudioUrl } from '../data/quranData';
import { QURAN_COMMON_WORDS } from '../data/ayahInsightsData';
import { playChime, triggerHaptic } from '../utils/audio';
import { getPlayableAudioUrl, isSurahDownloaded } from '../utils/offlineAudio';
import { loadBookmarks, loadBookmarksAsync, saveBookmarks, loadLastReadPage, saveLastReadPage, loadLastReciter, saveLastReciter, onStorageChange } from '../utils/storage';
import { saveOfflinePage, getOfflinePage } from '../utils/quranOfflineStorage';
import { getQuranTheme, loadSavedQuranTheme, saveSavedQuranTheme } from '../utils/quranThemes';
import { wakeLockManager } from '../utils/wakeLock';
import { AyahDetailsModal } from './AyahDetailsModal';
import { RecitersModal } from './RecitersModal';
import { PageTafseerModal } from './PageTafseerModal';
import { BookmarksModal } from './BookmarksModal';
import { CelebrationModal } from './CelebrationModal';
import { QuranThemeModal } from './QuranThemeModal';
import { QuranFrameOrnaments } from './QuranFrameOrnaments';
import { fireCelebrationConfetti } from '../utils/confetti';
import { cleanQuranText, removeBismillahFromAyah1, stripAllFormatting } from '../utils/quranText';

interface QuranViewProps {
  initialPage?: number;
  lastReadPage?: number;
  settings: AppSettings;
  onSaveBookmark: (page: number, surahName?: string) => void;
  onOpenVoicePractice: (ayahText: string, surahName: string) => void;
  onToggleFocusMode?: (isFocus: boolean) => void;
  onPageChange?: (page: number) => void;
  onUpdateSettings?: (newSettings: AppSettings) => void;
}

// Module-level cache to prevent re-fetching and layout shifts when navigating back and forth
const quranPageCache = new Map<number, any>();

// Memoized Skeleton loader for traditional Quran Mushaf Page View
const MushafSkeleton: React.FC = React.memo(() => (
  <div className="py-2 space-y-5 animate-pulse select-none" aria-busy="true" aria-label="جارٍ تجهيز صفحة المصحف الشريف">
    {/* Shimmering Surah Header Frame */}
    <div className="my-3 py-3 px-6 rounded-xl bg-gradient-to-r from-amber-100/60 via-amber-200/80 to-amber-100/60 dark:from-amber-950/30 dark:via-amber-900/40 dark:to-amber-950/30 border border-amber-300/40 text-center flex flex-col items-center justify-center gap-1.5 shadow-xs">
      <div className="h-2.5 w-16 bg-amber-400/50 dark:bg-amber-600/50 rounded-full" />
      <div className="h-6 w-36 bg-amber-500/40 dark:bg-amber-500/30 rounded-lg" />
    </div>

    {/* Shimmering Bismillah */}
    <div className="flex justify-center my-2">
      <div className="h-5 w-52 bg-emerald-200/70 dark:bg-emerald-900/50 rounded-full" />
    </div>

    {/* Shimmering Lines of Quranic Uthmani Text */}
    <div className="space-y-4 px-2 pt-2">
      <div className="flex items-center gap-2">
        <div className="h-5 bg-[#E6DEC9] dark:bg-[#253930] rounded-md flex-1" />
        <div className="w-6 h-6 rounded-full bg-amber-200/80 dark:bg-amber-800/60 shrink-0" />
        <div className="h-5 bg-[#E6DEC9] dark:bg-[#253930] rounded-md w-1/3" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-5 bg-[#E6DEC9] dark:bg-[#253930] rounded-md w-2/5" />
        <div className="w-6 h-6 rounded-full bg-amber-200/80 dark:bg-amber-800/60 shrink-0" />
        <div className="h-5 bg-[#E6DEC9] dark:bg-[#253930] rounded-md flex-1" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-5 bg-[#E6DEC9] dark:bg-[#253930] rounded-md flex-1" />
        <div className="w-6 h-6 rounded-full bg-amber-200/80 dark:bg-amber-800/60 shrink-0" />
        <div className="h-5 bg-[#E6DEC9] dark:bg-[#253930] rounded-md w-1/4" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-5 bg-[#E6DEC9] dark:bg-[#253930] rounded-md w-3/5" />
        <div className="w-6 h-6 rounded-full bg-amber-200/80 dark:bg-amber-800/60 shrink-0" />
        <div className="h-5 bg-[#E6DEC9] dark:bg-[#253930] rounded-md flex-1" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-5 bg-[#E6DEC9] dark:bg-[#253930] rounded-md flex-1" />
        <div className="w-6 h-6 rounded-full bg-amber-200/80 dark:bg-amber-800/60 shrink-0" />
        <div className="h-5 bg-[#E6DEC9] dark:bg-[#253930] rounded-md w-1/2" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-5 bg-[#E6DEC9] dark:bg-[#253930] rounded-md w-4/5 mx-auto" />
      </div>
    </div>
  </div>
));
MushafSkeleton.displayName = 'MushafSkeleton';

// Memoized Skeleton loader for Tafseer and Word Meanings View
const TafseerListSkeleton: React.FC = React.memo(() => (
  <div className="space-y-4 animate-pulse select-none" aria-busy="true" aria-label="جارٍ تحميل التفسير ومعاني الكلمات">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#17241F] border border-[#E7DFC8] dark:border-[#273B32] space-y-3 shadow-xs"
      >
        <div className="flex items-center justify-between border-b border-[#EAE3D2] dark:border-[#22362D] pb-2.5">
          <div className="h-7 w-24 bg-emerald-100 dark:bg-emerald-950/60 rounded-lg" />
          <div className="h-5 w-28 bg-amber-100 dark:bg-amber-950/50 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-5 bg-amber-50 dark:bg-[#21332A] rounded-md w-full" />
          <div className="h-5 bg-amber-50 dark:bg-[#21332A] rounded-md w-4/5" />
        </div>
        <div className="p-3 rounded-2xl bg-[#FAF8F2] dark:bg-[#131E19] border border-[#ECE5D6] dark:border-[#1E2E26] space-y-2">
          <div className="h-3.5 bg-gray-200 dark:bg-[#283C32] rounded w-full" />
          <div className="h-3.5 bg-gray-200 dark:bg-[#283C32] rounded w-11/12" />
          <div className="h-3.5 bg-gray-200 dark:bg-[#283C32] rounded w-3/4" />
        </div>
      </div>
    ))}
  </div>
));
TafseerListSkeleton.displayName = 'TafseerListSkeleton';


export const QuranView: React.FC<QuranViewProps> = ({
  initialPage,
  lastReadPage,
  settings,
  onSaveBookmark,
  onOpenVoicePractice,
  onToggleFocusMode,
  onPageChange,
  onUpdateSettings
}) => {
  const [activeMode, setActiveMode] = useState<'index' | 'reader'>('reader');
  const [isFocusMode, setIsFocusMode] = useState(false);
  
  const toggleFocusMode = () => {
    const next = !isFocusMode;
    setIsFocusMode(next);
    if (onToggleFocusMode) onToggleFocusMode(next);
    showToast(next ? 'وضع القراءة بتركيز: انقر منتصف الشاشة مجدداً لإظهار الشريط' : 'تم إظهار أشرطة القراءة والتنقل');
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(() => {
    if (initialPage && initialPage >= 1 && initialPage <= 604) {
      return initialPage;
    }
    const saved = loadLastReadPage();
    if (saved && saved >= 1 && saved <= 604) {
      return saved;
    }
    if (lastReadPage && lastReadPage >= 1 && lastReadPage <= 604) {
      return lastReadPage;
    }
    return 1;
  });
  const [jumpPageInput, setJumpPageInput] = useState<string>('');
  const [selectedReciter, setSelectedReciter] = useState<ReciterId>(() => {
    return loadLastReciter() || settings.selectedReciter || 'alafasy';
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showRecitersModal, setShowRecitersModal] = useState(false);
  const [resolvedAudioSrc, setResolvedAudioSrc] = useState<string>('');
  const [currentPlayingAyah, setCurrentPlayingAyah] = useState<{
    surahNumber: number;
    surahName: string;
    ayahNumber: number;
    text: string;
  } | null>(null);
  const [repeatMode, setRepeatMode] = useState<'continuous' | 'single' | 'page_loop'>('continuous');
  const [repeatTimes, setRepeatTimes] = useState<number>(1); // 1, 2, 3, 4, 5, 7, 10, or Infinity
  const [currentRepeatCounter, setCurrentRepeatCounter] = useState<number>(1);
  const [showRepeatModal, setShowRepeatModal] = useState<boolean>(false);
  const [keepScreenAwake, setKeepScreenAwake] = useState<boolean>(() => {
    return localStorage.getItem('quran_keep_screen_awake') !== 'false';
  });
  const [autoPlayNextPageOnLoad, setAutoPlayNextPageOnLoad] = useState(false);
  const [selectedAyahDetails, setSelectedAyahDetails] = useState<{
    surahNumber: number;
    surahName: string;
    ayahNumber: number;
    ayahText: string;
    defaultTafseer?: string;
  } | null>(null);
  const [pageAyahs, setPageAyahs] = useState<any[]>([]);
  const [loadingPage, setLoadingPage] = useState(false);
  const [fontSize, setFontSize] = useState<number>(settings.quranFontSize || 26);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedAyahKey, setCopiedAyahKey] = useState<string | null>(null);
  const [isSurahDropdownOpen, setIsSurahDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [dropdownJuzFilter, setDropdownJuzFilter] = useState<number | 'all'>('all');
  const [showPageTafseerModal, setShowPageTafseerModal] = useState(false);
  const [showBookmarksModal, setShowBookmarksModal] = useState(false);
  const [bookmarksList, setBookmarksList] = useState<Bookmark[]>(() => loadBookmarks());
  const [isTopTafseerExpanded, setIsTopTafseerExpanded] = useState(false);
  const [topTafseerFontSize, setTopTafseerFontSize] = useState<number>(18);
  const [showKhatmaCelebration, setShowKhatmaCelebration] = useState(false);

  // Quran Page Theme Selection State
  const [quranThemeId, setQuranThemeId] = useState<QuranThemeId>(() => {
    return settings.quranTheme || loadSavedQuranTheme() || 'royal_gold';
  });
  const [showThemeModal, setShowThemeModal] = useState<boolean>(false);

  // Synchronize theme with parent settings prop or external changes
  useEffect(() => {
    if (settings.quranTheme && settings.quranTheme !== quranThemeId) {
      setQuranThemeId(settings.quranTheme);
    }
  }, [settings.quranTheme]);

  const handleSelectTheme = (newThemeId: QuranThemeId) => {
    setQuranThemeId(newThemeId);
    saveSavedQuranTheme(newThemeId);
    if (onUpdateSettings) {
      onUpdateSettings({
        ...settings,
        quranTheme: newThemeId
      });
    }
    const th = getQuranTheme(newThemeId);
    showToast(`تم تطبيق سمة: ${th.name} ✨`);
  };

  const currentTheme = getQuranTheme(quranThemeId);
  // Autoplay and audio uninterrupted playback state

  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Audio state refs to prevent stale closure during continuous playback
  const currentPlayingRef = useRef(currentPlayingAyah);
  const flattenedAyahsRef = useRef<{ surahNumber: number; surahName: string; ayahNumber: number; text: string; tafseer: string }[]>([]);
  const repeatModeRef = useRef(repeatMode);
  const repeatTimesRef = useRef(repeatTimes);
  const currentRepeatCounterRef = useRef(currentRepeatCounter);
  const selectedReciterRef = useRef(selectedReciter);
  const playbackSpeedRef = useRef(playbackSpeed);
  const currentPageRef = useRef(currentPage);
  const isPlayingRef = useRef(isPlaying);
  const autoPlayNextPageRef = useRef(autoPlayNextPageOnLoad);

  // Cleanup audio, background streams, MediaSession, and wake locks on unmount to prevent leaks or audio overlap
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current.load();
      }
      isPlayingRef.current = false;
      setIsPlaying(false);
      setCurrentPlayingAyah(null);
      currentPlayingRef.current = null;
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
      }
      wakeLockManager.releaseLock();
    };
  }, []);


  useEffect(() => {
    currentPlayingRef.current = currentPlayingAyah;
  }, [currentPlayingAyah]);


  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    repeatTimesRef.current = repeatTimes;
  }, [repeatTimes]);

  useEffect(() => {
    currentRepeatCounterRef.current = currentRepeatCounter;
  }, [currentRepeatCounter]);

  useEffect(() => {
    selectedReciterRef.current = selectedReciter;
    saveLastReciter(selectedReciter);
    if (onUpdateSettings && settings.selectedReciter !== selectedReciter) {
      onUpdateSettings({ ...settings, selectedReciter });
    }
  }, [selectedReciter]);

  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  useEffect(() => {
    currentPageRef.current = currentPage;
    saveLastReadPage(currentPage);
    if (onPageChange) {
      onPageChange(currentPage);
    }
  }, [currentPage]);

  useEffect(() => {
    loadBookmarksAsync().then((list) => {
      if (list && list.length > 0) setBookmarksList(list);
    });
    const unsub = onStorageChange((key) => {
      if (key === 'jannat_bookmarks_v1' || key === 'ALL') {
        setBookmarksList(loadBookmarks());
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (showBookmarksModal) {
      setBookmarksList(loadBookmarks());
    }
  }, [showBookmarksModal]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    autoPlayNextPageRef.current = autoPlayNextPageOnLoad;
  }, [autoPlayNextPageOnLoad]);

  // Wake Lock effect: keep screen on when reading/listening if enabled
  useEffect(() => {
    if (keepScreenAwake && activeMode === 'reader') {
      wakeLockManager.requestLock();
    } else {
      wakeLockManager.releaseLock();
    }
    return () => {
      wakeLockManager.releaseLock();
    };
  }, [keepScreenAwake, activeMode, isPlaying]);

  const handleToggleKeepAwake = () => {
    const nextVal = !keepScreenAwake;
    setKeepScreenAwake(nextVal);
    localStorage.setItem('quran_keep_screen_awake', String(nextVal));
    if (nextVal) {
      wakeLockManager.requestLock();
      showToast('تم تفعيل إبقاء الشاشة مضاءة أثناء القراءة والتلاوة ☀️');
    } else {
      wakeLockManager.releaseLock();
      showToast('تم إيقاف إبقاء الشاشة مضاءة (توفير الطاقة)');
    }
    playChime('click');
  };

  // Sync quranFontSize when settings change
  useEffect(() => {
    if (settings.quranFontSize) {
      setFontSize(settings.quranFontSize);
    }
  }, [settings.quranFontSize]);

  // Sync initialPage when it changes externally
  useEffect(() => {
    if (initialPage && initialPage >= 1 && initialPage <= 604) {
      setCurrentPage(initialPage);
      setActiveMode('reader');
    }
  }, [initialPage]);

  // Filter surahs in index
  const filteredSurahs = SURAHS_LIST.filter((s) => 
    s.name.includes(searchQuery.trim()) ||
    s.number.toString() === searchQuery.trim() ||
    s.englishName.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // Filter surahs in top dropdown
  const filteredDropdownSurahs = SURAHS_LIST.filter((s) => {
    const matchesJuz = dropdownJuzFilter === 'all' || s.juz === dropdownJuzFilter;
    const matchesSearch = !dropdownSearch.trim() ||
      s.name.includes(dropdownSearch.trim()) ||
      s.number.toString() === dropdownSearch.trim() ||
      s.englishName.toLowerCase().includes(dropdownSearch.toLowerCase().trim());
    return matchesJuz && matchesSearch;
  });

  // Calculate currentSurah precisely according to current page & loaded pageAyahs
  const currentSurah = React.useMemo(() => {
    if (pageAyahs && pageAyahs.length > 0) {
      const firstSurahNum = pageAyahs[0].number;
      const match = SURAHS_LIST.find((s) => s.number === firstSurahNum);
      if (match) return match;
    }
    for (let i = SURAHS_LIST.length - 1; i >= 0; i--) {
      if (SURAHS_LIST[i].startPage <= currentPage) {
        return SURAHS_LIST[i];
      }
    }
    return SURAHS_LIST[0];
  }, [currentPage, pageAyahs]);

  // Flatten all ayahs on current page for sequential recitation and synchronized shading
  const flattenedAyahs = React.useMemo(() => {
    const list: { surahNumber: number; surahName: string; ayahNumber: number; text: string; tafseer: string }[] = [];
    pageAyahs.forEach((s) => {
      const sNum = s.number || currentSurah?.number || 1;
      const sName = s.name || currentSurah?.name || '';
      s.ayahs.forEach((a: any) => {
        list.push({
          surahNumber: sNum,
          surahName: sName,
          ayahNumber: a.number,
          text: a.text,
          tafseer: a.tafseer
        });
      });
    });
    return list;
  }, [pageAyahs, currentSurah]);
  useEffect(() => {
    flattenedAyahsRef.current = flattenedAyahs;
  }, [flattenedAyahs]);

  // Calculate lastReadSurah precisely
  const lastReadSurah = React.useMemo(() => {
    for (let i = SURAHS_LIST.length - 1; i >= 0; i--) {
      if (SURAHS_LIST[i].startPage <= lastReadPage) {
        return SURAHS_LIST[i];
      }
    }
    return SURAHS_LIST[0];
  }, [lastReadPage]);

  // Sync reciter changes with active audio
  useEffect(() => {
    if (currentPlayingAyah) {
      const newUrl = getAyahAudioUrl(selectedReciter, currentPlayingAyah.surahNumber, currentPlayingAyah.ayahNumber);
      setResolvedAudioSrc(newUrl);
      if (audioRef.current && isPlaying) {
        audioRef.current.src = newUrl;
        audioRef.current.playbackRate = playbackSpeed;
        audioRef.current.play().catch(() => {});
      }
    }
  }, [selectedReciter]);

  // Helper to extract word meanings for an ayah
  const extractAyahWordMeanings = (ayahText: string) => {
    const rawWords = ayahText.split(/\s+/).filter(Boolean);
    const meanings: { word: string; meaning: string }[] = [];

    rawWords.forEach((word) => {
      const cleanWord = word.replace(/[^\u0621-\u064A]/g, '');
      if (!cleanWord || cleanWord.length <= 1) return;

      let match = QURAN_COMMON_WORDS[word];
      if (!match) {
        const foundKey = Object.keys(QURAN_COMMON_WORDS).find((k) => 
          k.includes(cleanWord) || cleanWord.includes(k.replace(/[^\u0621-\u064A]/g, ''))
        );
        if (foundKey) match = QURAN_COMMON_WORDS[foundKey];
      }

      if (match && !meanings.some((m) => m.word === word)) {
        meanings.push({ word, meaning: match });
      }
    });

    return meanings;
  };

  // Fetch Page data (both Uthmani Text and Real Arabic Tafseer Al-Muyassar)
  useEffect(() => {
    let isMounted = true;
    
    if (onPageChange) onPageChange(currentPage);

    // Audio continues seamlessly across pages without interruption

    if (currentPage === 604) {
      const mapped = PAGE_604_DATA.surahs.map((s) => ({
        ...s,
        ayahs: s.ayahs.map((a) => ({
          ...a,
          wordMeanings: extractAyahWordMeanings(a.text)
        }))
      }));
      setPageAyahs(mapped);
      setLoadingPage(false);
      quranPageCache.set(604, mapped);
      saveOfflinePage(604, mapped);
      return;
    } else if (currentPage === 1) {
      const mapped = PAGE_1_DATA.surahs.map((s) => ({
        ...s,
        ayahs: s.ayahs.map((a) => ({
          ...a,
          wordMeanings: extractAyahWordMeanings(a.text)
        }))
      }));
      setPageAyahs(mapped);
      setLoadingPage(false);
      quranPageCache.set(1, mapped);
      saveOfflinePage(1, mapped);
      return;
    }

    // 1. Check in-memory fast cache
    if (quranPageCache.has(currentPage)) {
      setPageAyahs(quranPageCache.get(currentPage));
      setLoadingPage(false);
      return;
    }

    setLoadingPage(true);

    // 2. Check offline IndexedDB/Storage before network
    getOfflinePage(currentPage).then((cached) => {
      if (!isMounted) return;
      if (cached && cached.length > 0) {
        setPageAyahs(cached);
        quranPageCache.set(currentPage, cached);
        setLoadingPage(false);

        // If offline, we are done
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          return;
        }
      }

      // Parallel fetch from Quran CDN API (Uthmani Text + Tafseer)
      Promise.all([
        fetch(`https://api.alquran.cloud/v1/page/${currentPage}/quran-uthmani`).then((res) => res.json()).catch(() => null),
        fetch(`https://api.alquran.cloud/v1/page/${currentPage}/ar.muyassar`).then((res) => res.json()).catch(() => null)
      ])
        .then(([uthmaniJson, tafseerJson]) => {
          if (!isMounted) return;

          if (uthmaniJson && uthmaniJson.data && uthmaniJson.data.ayahs) {
            // Tafseer map: "surahNum:ayahInSurah" -> tafseer text
            const tafseerMap: Record<string, string> = {};
            if (tafseerJson && tafseerJson.data && tafseerJson.data.ayahs) {
              tafseerJson.data.ayahs.forEach((ta: any) => {
                const k = `${ta.surah.number}:${ta.numberInSurah}`;
                tafseerMap[k] = ta.text;
              });
            }

            // Group by surah
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
              const resolvedTafseer = tafseerMap[k] || `تفسير الآية ${toArabicNumerals(a.numberInSurah)} من سورة ${a.surah.name}: بيان ودلالة الآية الكريمة وهداياتها الإيمانية.`;

              let rawText = a.text;

              // For Ayah 1 of any Surah except Al-Fatihah (1) and At-Tawbah (9),
              // strip the prepended Bismillah so it doesn't duplicate the Surah header
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

            const groupedArray = Object.values(grouped);
            setPageAyahs(groupedArray);
            quranPageCache.set(currentPage, groupedArray);
            saveOfflinePage(currentPage, groupedArray);

            // Intelligent prefetch of adjacent pages for lightning-fast page flipping and offline caching
            const pagesToPrefetch = [currentPage + 1, currentPage - 1, currentPage + 2].filter(p => p >= 1 && p <= 604 && !quranPageCache.has(p));
            pagesToPrefetch.forEach((p) => {
              Promise.all([
                fetch(`https://api.alquran.cloud/v1/page/${p}/quran-uthmani`).then((res) => res.json()).catch(() => null),
                fetch(`https://api.alquran.cloud/v1/page/${p}/ar.muyassar`).then((res) => res.json()).catch(() => null)
              ]).then(([uJson, tJson]) => {
                if (uJson && uJson.data && uJson.data.ayahs) {
                  const tMap: Record<string, string> = {};
                  if (tJson && tJson.data && tJson.data.ayahs) {
                    tJson.data.ayahs.forEach((ta: any) => {
                      tMap[`${ta.surah.number}:${ta.numberInSurah}`] = ta.text;
                    });
                  }
                  const grp: Record<number, { number: number; name: string; bismillah: string; ayahs: any[] }> = {};
                  uJson.data.ayahs.forEach((a: any) => {
                    const sn = a.surah.number;
                    if (!grp[sn]) {
                      grp[sn] = {
                        number: sn,
                        name: a.surah.name.replace('سُورَةُ ', ''),
                        bismillah: sn !== 1 && sn !== 9 ? 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' : '',
                        ayahs: []
                      };
                    }
                    let rt = a.text;
                    if (a.numberInSurah === 1 && sn !== 1 && sn !== 9) {
                      rt = removeBismillahFromAyah1(rt);
                    }
                    const ct = stripAllFormatting(rt);
                    grp[sn].ayahs.push({
                      number: a.numberInSurah,
                      text: ct,
                      tafseer: tMap[`${sn}:${a.numberInSurah}`] || `تفسير الآية ${toArabicNumerals(a.numberInSurah)} من سورة ${a.surah.name}.`,
                      wordMeanings: extractAyahWordMeanings(ct)
                    });
                  });
                  const grpArray = Object.values(grp);
                  quranPageCache.set(p, grpArray);
                  saveOfflinePage(p, grpArray);
                }
              }).catch(() => {});
            });
          } else {
            // Fallback to offline check or graceful surah fallback
            getOfflinePage(currentPage).then((offCached) => {
              if (offCached && offCached.length > 0) {
                setPageAyahs(offCached);
              } else {
                const s = SURAHS_LIST.find((item, idx) => {
                  const next = SURAHS_LIST[idx + 1];
                  return item.startPage <= currentPage && (!next || next.startPage > currentPage);
                }) || SURAHS_LIST[0];
                setPageAyahs([{
                  number: s.number,
                  name: s.name,
                  bismillah: s.number !== 1 && s.number !== 9 ? 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' : '',
                  isOfflineUncached: true,
                  ayahs: [{
                    number: 1,
                    text: `صفحة ${toArabicNumerals(currentPage)} - سورة ${s.name}`,
                    tafseer: `هذه الصفحة غير مخزنة في ذاكرة الهاتف بعد. يمكنك تصفح السور المحفوظة لديك أو تنزيل المصحف كاملاً من الإعدادات للعمل بدون نت.`,
                    wordMeanings: []
                  }]
                }]);
              }
            });
          }
        })
        .catch(() => {
          if (isMounted) {
            getOfflinePage(currentPage).then((offCached) => {
              if (offCached && offCached.length > 0) {
                setPageAyahs(offCached);
              } else {
                const s = SURAHS_LIST.find((item, idx) => {
                  const next = SURAHS_LIST[idx + 1];
                  return item.startPage <= currentPage && (!next || next.startPage > currentPage);
                }) || SURAHS_LIST[0];
                setPageAyahs([{
                  number: s.number,
                  name: s.name,
                  bismillah: s.number !== 1 && s.number !== 9 ? 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' : '',
                  isOfflineUncached: true,
                  ayahs: [{
                    number: 1,
                    text: `صفحة ${toArabicNumerals(currentPage)} - سورة ${s.name}`,
                    tafseer: `هذه الصفحة غير مخزنة في ذاكرة الهاتف بعد. يمكنك تصفح السور المحفوظة لديك أو تنزيل المصحف كاملاً من الإعدادات للعمل بدون نت.`,
                    wordMeanings: []
                  }]
                }]);
              }
            });
          }
        })
        .finally(() => {
          if (isMounted) setLoadingPage(false);
        });
    });

    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  const reciterObj = RECITERS_LIST.find((r) => r.id === selectedReciter) || RECITERS_LIST[0];
  const isCurrentSurahOffline = isSurahDownloaded(selectedReciter, currentSurah?.number || 112);

  // Sync ayah text into active playback state if it was loaded during page change
  useEffect(() => {
    if (currentPlayingAyah && (!currentPlayingAyah.text || currentPlayingAyah.text === '') && flattenedAyahs.length > 0) {
      const match = flattenedAyahs.find(
        (a) => a.surahNumber === currentPlayingAyah.surahNumber && a.ayahNumber === currentPlayingAyah.ayahNumber
      );
      if (match && match.text) {
        setCurrentPlayingAyah((prev) => prev ? { ...prev, text: match.text, surahName: match.surahName } : null);
      }
    }
  }, [flattenedAyahs, currentPlayingAyah]);

  // System MediaSession setup for lock screen & notification controls
  useEffect(() => {
    if ('mediaSession' in navigator && currentPlayingAyah) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `سورة ${currentPlayingAyah.surahName} — الآية ${toArabicNumerals(currentPlayingAyah.ayahNumber)}`,
        artist: `فضيلة الشيخ ${reciterObj.name}`,
        album: `المصحف الشريف (صفحة ${toArabicNumerals(currentPage)})`,
        artwork: [
          { src: '/jannat-icon.png', sizes: '512x512', type: 'image/png' }
        ]
      });
      navigator.mediaSession.setActionHandler('play', () => {
        if (audioRef.current) {
          audioRef.current.play().then(() => {
            setIsPlaying(true);
            isPlayingRef.current = true;
          }).catch(() => {});
        }
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
          isPlayingRef.current = false;
        }
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        handlePrevAyah();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        handleNextAyah();
      });
    }
  }, [currentPlayingAyah, reciterObj, currentPage]);


  // Auto-play next page logic (now only clears flag, since audio plays synchronously)
  useEffect(() => {
    if (autoPlayNextPageOnLoad && !loadingPage && pageAyahs.length > 0 && flattenedAyahs.length > 0) {
      setAutoPlayNextPageOnLoad(false);
      // We no longer call playAyah() here because it interrupts the synchronously started audio
      // We just needed the flag to be true during page transition so it wouldn't pause.
    }
  }, [pageAyahs, loadingPage, autoPlayNextPageOnLoad, flattenedAyahs]);

  // Auto scroll reader smoothly to active highlighted ayah only if off-screen (prevents excessive shaking)
  useEffect(() => {
    if (currentPlayingAyah && isPlaying) {
      const el = document.getElementById(`mushaf-ayah-${currentPlayingAyah.surahNumber}-${currentPlayingAyah.ayahNumber}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        // Check if element is reasonably visible within the viewport (with a margin)
        const isInViewport = (
          rect.top >= 100 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) - 100
        );
        if (!isInViewport) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [currentPlayingAyah, isPlaying]);

  // Global interaction fallback to resume audio if blocked by browser autoplay policy
  useEffect(() => {
    const handleUserInteraction = () => {
      if (isPlayingRef.current && audioRef.current && audioRef.current.paused) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {});
      }
    };
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);
    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  const playAyah = (surahNumber: number, surahName: string, ayahNumber: number, text: string, isRepeatAttempt: boolean = false) => {
    // If offline: check if this surah is downloaded offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (isSurahDownloaded(selectedReciter, surahNumber)) {
        handlePlaySurahOffline(selectedReciter, surahNumber);
        return;
      } else {
        showToast(`أنت في وضع عدم الاتصال: سورة ${surahName} غير محملة. يمكنك اختيار سورة محملة من قائمة القراء 📥`);
        setIsPlaying(false);
        return;
      }
    }

    const url = getAyahAudioUrl(selectedReciter, surahNumber, ayahNumber);
    const ayahInfo = { surahNumber, surahName, ayahNumber, text };
    setCurrentPlayingAyah(ayahInfo);
    currentPlayingRef.current = ayahInfo;
    setResolvedAudioSrc(url);
    if (!isRepeatAttempt) {
      setCurrentRepeatCounter(1);
      currentRepeatCounterRef.current = 1;
    }
    setIsPlaying(true);
    isPlayingRef.current = true;

    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.playbackRate = playbackSpeedRef.current;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            isPlayingRef.current = true;
          })
          .catch((err) => {
            if (err && err.name !== 'AbortError') {
              console.warn('Quran audio playback:', err);
            }
          });
      }
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
      const sNum = currentSurah?.number || 1;

      if (!currentPlayingAyah) {
        if (isOffline) {
          if (isSurahDownloaded(selectedReciter, sNum)) {
            handlePlaySurahOffline(selectedReciter, sNum);
            return;
          } else {
            showToast(`وضع عدم الاتصال: سورة ${currentSurah?.name || ''} غير محملة. يمكنك فتح قائمة القراء لتشغيل السور المحفوظة 📥`);
            return;
          }
        }
        if (flattenedAyahs.length > 0) {
          const first = flattenedAyahs[0];
          playAyah(first.surahNumber, first.surahName, first.ayahNumber, first.text);
        }
      } else {
        audioRef.current.playbackRate = playbackSpeed;
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            if (isOffline && isSurahDownloaded(selectedReciter, currentPlayingAyah.surahNumber)) {
              handlePlaySurahOffline(selectedReciter, currentPlayingAyah.surahNumber);
            } else {
              playAyah(currentPlayingAyah.surahNumber, currentPlayingAyah.surahName, currentPlayingAyah.ayahNumber, currentPlayingAyah.text);
            }
          });
      }
    }
  };

  const handleAudioEnded = () => {
    const activeAyah = currentPlayingRef.current;
    const mode = repeatModeRef.current;
    const times = repeatTimesRef.current;
    const counter = currentRepeatCounterRef.current;
    const ayahsList = flattenedAyahsRef.current;
    const page = currentPageRef.current;

    if (!activeAyah) {
      setIsPlaying(false);
      return;
    }

    // If an entire offline surah was playing
    if (activeAyah.text.startsWith('سورة ')) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      showToast(`تمت تلاوة ${activeAyah.text} بحمد الله ✨`);
      return;
    }

    // 1. Single Ayah repeat mode (or repeating single Ayah N times)
    if (mode === 'single') {
      if (times === Infinity || counter < times) {
        setCurrentRepeatCounter((prev) => prev + 1);
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play()
            .then(() => {
              setIsPlaying(true);
              
            })
            .catch(() => {
              setIsPlaying(false);
              
            });
        }
        return;
      }
    }

    // 2. Continuous mode with per-ayah repetition (if repeatTimes > 1)
    if (mode === 'continuous' && times > 1 && counter < times) {
      setCurrentRepeatCounter((prev) => prev + 1);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            
          })
          .catch(() => {
            setIsPlaying(false);
            
          });
      }
      return;
    }

    // Move to next ayah in current page flattened list first
    const currentIdx = ayahsList.findIndex(
      (a) => a.surahNumber === activeAyah.surahNumber && a.ayahNumber === activeAyah.ayahNumber
    );

    if (currentIdx >= 0 && currentIdx < ayahsList.length - 1) {
      const nextAyah = ayahsList[currentIdx + 1];
      setCurrentRepeatCounter(1);
      playAyah(nextAyah.surahNumber, nextAyah.surahName, nextAyah.ayahNumber, nextAyah.text);
    } else {
      // End of this page! Handle transition across pages & surahs globally
      if (mode === 'page_loop') {
        if (ayahsList.length > 0) {
          const firstAyah = ayahsList[0];
          setCurrentRepeatCounter(1);
          playAyah(firstAyah.surahNumber, firstAyah.surahName, firstAyah.ayahNumber, firstAyah.text);
          showToast('إعادة تلاوة الصفحة الحالية 🔁');
        }
      } else {
        // Continuous mode: advance page by page until Khatmah (page 604)
        if (page < 604) {
          setCurrentRepeatCounter(1);
          
          // Calculate next ayah globally across Surahs
          const surahMeta = SURAHS_LIST.find((s) => s.number === activeAyah.surahNumber);
          let nextSurahNum = activeAyah.surahNumber;
          let nextAyahNum = activeAyah.ayahNumber + 1;
          let nextSurahName = activeAyah.surahName;

          if (surahMeta && nextAyahNum > surahMeta.numberOfAyahs) {
            nextSurahNum += 1;
            nextAyahNum = 1;
            const nextMeta = SURAHS_LIST.find((s) => s.number === nextSurahNum);
            nextSurahName = nextMeta ? nextMeta.name : nextSurahName;
          }

          // Immediately play next ayah synchronously to bypass browser autoplay blocks
          playAyah(nextSurahNum, nextSurahName, nextAyahNum, '');
          
          setAutoPlayNextPageOnLoad(true); // Keeps audio playing during page change
          setCurrentPage((prev) => Math.min(604, prev + 1));
          showToast(`متابعة التلاوة المتواصلة في صفحة ${toArabicNumerals(page + 1)} 📖`);
        } else {
          setIsPlaying(false);
          setCurrentPlayingAyah(null);
          setShowKhatmaCelebration(true);
          fireCelebrationConfetti('khatma');
        }
      }
    }
  };

  const handleNextAyah = () => {
    if (flattenedAyahs.length === 0) return;
    if (!currentPlayingAyah) {
      const first = flattenedAyahs[0];
      playAyah(first.surahNumber, first.surahName, first.ayahNumber, first.text);
      return;
    }
    const currentIdx = flattenedAyahs.findIndex(
      (a) => a.surahNumber === currentPlayingAyah.surahNumber && a.ayahNumber === currentPlayingAyah.ayahNumber
    );
    if (currentIdx >= 0 && currentIdx < flattenedAyahs.length - 1) {
      const nextAyah = flattenedAyahs[currentIdx + 1];
      playAyah(nextAyah.surahNumber, nextAyah.surahName, nextAyah.ayahNumber, nextAyah.text);
    } else if (currentPage < 604) {
      const surahMeta = SURAHS_LIST.find((s) => s.number === currentPlayingAyah.surahNumber);
      let nextSurahNum = currentPlayingAyah.surahNumber;
      let nextAyahNum = currentPlayingAyah.ayahNumber + 1;
      let nextSurahName = currentPlayingAyah.surahName;

      if (surahMeta && nextAyahNum > surahMeta.numberOfAyahs) {
        nextSurahNum += 1;
        nextAyahNum = 1;
        const nextMeta = SURAHS_LIST.find((s) => s.number === nextSurahNum);
        nextSurahName = nextMeta ? nextMeta.name : nextSurahName;
      }
      playAyah(nextSurahNum, nextSurahName, nextAyahNum, '');
      setAutoPlayNextPageOnLoad(true);
      setCurrentPage((prev) => Math.min(604, prev + 1));
    }
  };

  const handlePrevAyah = () => {
    if (flattenedAyahs.length === 0) return;
    if (!currentPlayingAyah) {
      const first = flattenedAyahs[0];
      playAyah(first.surahNumber, first.surahName, first.ayahNumber, first.text);
      return;
    }
    const currentIdx = flattenedAyahs.findIndex(
      (a) => a.surahNumber === currentPlayingAyah.surahNumber && a.ayahNumber === currentPlayingAyah.ayahNumber
    );
    if (currentIdx > 0) {
      const prevAyah = flattenedAyahs[currentIdx - 1];
      playAyah(prevAyah.surahNumber, prevAyah.surahName, prevAyah.ayahNumber, prevAyah.text);
    } else if (currentPage > 1) {
      // Calculate previous ayah globally
      let prevSurahNum = currentPlayingAyah.surahNumber;
      let prevAyahNum = currentPlayingAyah.ayahNumber - 1;
      let prevSurahName = currentPlayingAyah.surahName;

      if (prevAyahNum < 1 && prevSurahNum > 1) {
        prevSurahNum -= 1;
        const prevMeta = SURAHS_LIST.find((s) => s.number === prevSurahNum);
        if (prevMeta) {
          prevAyahNum = prevMeta.numberOfAyahs;
          prevSurahName = prevMeta.name;
        } else {
          prevAyahNum = 1;
        }
      }

      if (prevAyahNum >= 1) {
        playAyah(prevSurahNum, prevSurahName, prevAyahNum, '');
      }
      setAutoPlayNextPageOnLoad(true);
      setCurrentPage((prev) => Math.max(1, prev - 1));
    }
  };

  const handleSpeedChange = () => {
    const speeds = [0.75, 1, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const isCurrentPageBookmarked = bookmarksList.some(
    (b) => b.type !== 'ayah' && Number(b.targetId) === currentPage
  );

  const handleToggleBookmark = () => {
    if (isCurrentPageBookmarked) {
      const updated = bookmarksList.filter((b) => !(b.type !== 'ayah' && Number(b.targetId) === currentPage));
      setBookmarksList(updated);
      saveBookmarks(updated);
      playChime('click');
      showToast(`تمت إزالة الفاصلة المرجعية من صفحة ${toArabicNumerals(currentPage)}`);
    } else {
      const newBm: Bookmark = {
        id: `bm-${Date.now()}`,
        type: 'page',
        title: currentSurah?.name ? `سورة ${currentSurah.name}` : `صفحة ${currentPage}`,
        subtitle: `صفحة ${currentPage} في المصحف`,
        targetId: currentPage,
        createdAt: Date.now(),
        pageNumber: currentPage
      };
      const updated = [newBm, ...bookmarksList.filter((b) => !(b.type !== 'ayah' && Number(b.targetId) === currentPage))];
      setBookmarksList(updated);
      saveBookmarks(updated);
      if (onSaveBookmark) {
        onSaveBookmark(currentPage, currentSurah?.name);
      }
      playChime('success');
      triggerHaptic(40);
      showToast(`تم حفظ الفاصلة المرجعية في صفحة ${toArabicNumerals(currentPage)} (سورة ${currentSurah?.name || ''})`);
    }
  };

  const isCurrentAyahBookmarked = selectedAyahDetails 
    ? bookmarksList.some((b) => b.type === 'ayah' && b.targetId === `${selectedAyahDetails.surahNumber}_${selectedAyahDetails.ayahNumber}`)
    : false;

  const handleToggleAyahBookmark = () => {
    if (!selectedAyahDetails) return;
    const ayahId = `${selectedAyahDetails.surahNumber}_${selectedAyahDetails.ayahNumber}`;
    
    if (isCurrentAyahBookmarked) {
      const updated = bookmarksList.filter((b) => b.targetId !== ayahId);
      setBookmarksList(updated);
      saveBookmarks(updated);
      playChime('click');
      showToast(`تمت إزالة الفاصلة من سورة ${selectedAyahDetails.surahName} آية ${toArabicNumerals(selectedAyahDetails.ayahNumber)}`);
    } else {
      const newBm = {
        id: `bm-ayah-${Date.now()}`,
        type: 'ayah' as const,
        title: `سورة ${selectedAyahDetails.surahName} (آية ${selectedAyahDetails.ayahNumber})`,
        subtitle: `صفحة ${currentPage} - ﴿ ${selectedAyahDetails.ayahText.substring(0, 40)}... ﴾`,
        targetId: ayahId,
        createdAt: Date.now(),
        pageNumber: currentPage
      };
      
      const updated = [newBm, ...bookmarksList];
      setBookmarksList(updated);
      saveBookmarks(updated);
      playChime('success');
      showToast(`تم الحفظ: آية ${toArabicNumerals(selectedAyahDetails.ayahNumber)} من سورة ${selectedAyahDetails.surahName}`);
    }
  };

  const handleRemoveBookmark = (id: string) => {
    const updated = bookmarksList.filter((b) => b.id !== id);
    setBookmarksList(updated);
    saveBookmarks(updated);
    playChime('click');
    showToast('تم حذف العلامة المرجعية');
  };

  const handleUpdateBookmarkTitle = (id: string, newTitle: string) => {
    const updated = bookmarksList.map((b) =>
      b.id === id ? { ...b, title: newTitle } : b
    );
    setBookmarksList(updated);
    saveBookmarks(updated);
    playChime('success');
    showToast('تم تحديث مسمى الفاصلة المرجعية بنجاح');
  };

  const openSurahReader = (startPage: number) => {
    setCurrentPage(startPage);
    setActiveMode('reader');
    playChime('click');
  };

  const handleJumpToPage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const pNum = parseInt(jumpPageInput.trim(), 10);
    if (pNum && pNum >= 1 && pNum <= 604) {
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        isPlayingRef.current = false;
        setCurrentPlayingAyah(null);
        currentPlayingRef.current = null;
      }
      setCurrentPage(pNum);
      setActiveMode('reader');
      setJumpPageInput('');
      playChime('click');
      showToast(`تم الانتقال إلى صفحة ${toArabicNumerals(pNum)}`);
    } else {
      showToast('يرجى كتابة رقم صفحة بين ١ و ٦٠٤');
    }
  };

  const handlePlaySurahOffline = async (reciterId: ReciterId, surahNumber: number) => {
    setSelectedReciter(reciterId);
    saveLastReciter(reciterId);
    if (onUpdateSettings) {
      onUpdateSettings({ ...settings, selectedReciter: reciterId });
    }
    const surah = SURAHS_LIST.find((s) => s.number === surahNumber);
    if (!surah) return;

    // 1. Move to Surah start page & save progress
    setCurrentPage(surah.startPage);
    saveLastReadPage(surah.startPage);
    if (onPageChange) onPageChange(surah.startPage);
    setActiveMode('reader');

    // 2. Load offline audio and start playback
    try {
      const playableUrl = await getPlayableAudioUrl(reciterId, surahNumber);
      if (playableUrl && audioRef.current) {
        audioRef.current.src = playableUrl;
        audioRef.current.playbackRate = playbackSpeedRef.current;
        setResolvedAudioSrc(playableUrl);

        const ayahInfo = {
          surahNumber: surah.number,
          surahName: surah.name,
          ayahNumber: 1,
          text: `سورة ${surah.name}`
        };
        setCurrentPlayingAyah(ayahInfo);
        currentPlayingRef.current = ayahInfo;
        setIsPlaying(true);
        isPlayingRef.current = true;

        await audioRef.current.play();
        const reciterObj = RECITERS_LIST.find((r) => r.id === reciterId);
        showToast(`بدأت تلاوة سورة ${surah.name} بصوت الشيخ ${reciterObj?.name || ''} من الذاكرة المحفوظة 🎧`);
      }
    } catch (err) {
      console.warn('Play offline surah audio error:', err);
      showToast(`تم فتح سورة ${surah.name} للقراءة من الذاكرة المحفوظة 📖`);
    }
  };

  const handleCopySingleAyah = (ayahText: string, surahName: string, ayahNumber: number) => {
    const key = `${surahName}:${ayahNumber}`;
    navigator.clipboard.writeText(`﴿ ${ayahText} ﴾ [سورة ${surahName}: ${ayahNumber}]`);
    setCopiedAyahKey(key);
    playChime('click');
    setTimeout(() => setCopiedAyahKey(null), 2000);
  };

  const handleOpenAyahDetails = (details: {
    surahNumber: number;
    surahName: string;
    ayahNumber: number;
    ayahText: string;
    defaultTafseer: string;
  }) => {
    setSelectedAyahDetails(details);
    playChime('click');
  };

  const handlePrevPage = (restartAudio: boolean = false) => {
    if (currentPage > 1) {
      const prevPageNum = currentPage - 1;
      
      // Stop old audio if playing when user manually flips page (or switch to top of new page if requested)
      if (audioRef.current && isPlaying) {
        if (restartAudio) {
          setAutoPlayNextPageOnLoad(true);
        } else {
          audioRef.current.pause();
          setIsPlaying(false);
          isPlayingRef.current = false;
          setCurrentPlayingAyah(null);
          currentPlayingRef.current = null;
        }
      }
      
      setCurrentPage(prevPageNum);
      playChime('click');
      triggerHaptic(25);
    } else {
      showToast('أنت في الصفحة الأولى من المصحف الشريف');
    }
  };

  const handleNextPage = (restartAudio: boolean = false) => {
    if (currentPage < 604) {
      const nextPageNum = currentPage + 1;
      
      // Stop old audio if playing when user manually flips page (or switch to top of new page if requested)
      if (audioRef.current && isPlaying) {
        if (restartAudio) {
          setAutoPlayNextPageOnLoad(true);
        } else {
          audioRef.current.pause();
          setIsPlaying(false);
          isPlayingRef.current = false;
          setCurrentPlayingAyah(null);
          currentPlayingRef.current = null;
        }
      }
      
      setCurrentPage(nextPageNum);
      playChime('click');
      triggerHaptic(25);
      if (nextPageNum === 604) {
        showToast('وصلت للصفحة الأخيرة من المصحف الشريف (سورة الناس)');
      }
    } else {
      setShowKhatmaCelebration(true);
      playChime('milestone');
      fireCelebrationConfetti('khatma');
    }
  };

  return (
    <div className="pb-24 pt-2 px-3 sm:px-4 max-w-lg mx-auto animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 inset-x-4 max-w-md mx-auto z-50 bg-[#0F6B50] text-white px-4 py-3 rounded-2xl shadow-xl border border-emerald-400/40 text-center text-sm font-bold flex items-center justify-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Audio element with Ayah-by-Ayah synchronization */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        onError={() => {
          setIsPlaying(false);
          isPlayingRef.current = false;
        }}
      />

      {/* Top Segmented Mode Switcher [ 📖 قراءة المصحف ] [ 📑 فهرس السور ] */}
      <div className="flex bg-[#EAE3D2]/70 dark:bg-[#162720] p-1 rounded-2xl border border-[#DCD3BE] dark:border-[#283E34] mb-3">
        <button
          onClick={() => {
            setActiveMode('reader');
            playChime('click');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeMode === 'reader'
              ? 'bg-[#0F6B50] text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-[#0F6B50]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>قراءة المصحف (صفحة {toArabicNumerals(currentPage)})</span>
        </button>

        <button
          onClick={() => {
            setActiveMode('index');
            playChime('click');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeMode === 'index'
              ? 'bg-[#0F6B50] text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-[#0F6B50]'
          }`}
        >
          <ListFilter className="w-4 h-4" />
          <span>فهرس السور والمواضع</span>
        </button>
      </div>

      {/* Index Mode */}
      {activeMode === 'index' ? (
        <div className="space-y-4">
          {/* Resume Last Read Page Banner */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white shadow-md flex items-center justify-between border border-amber-300/40">
            <button
              onClick={() => {
                setCurrentPage(lastReadPage || 604);
                setActiveMode('reader');
                playChime('click');
              }}
              className="bg-white text-amber-900 hover:bg-amber-100 px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <span>متابعة القراءة الآن</span>
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-amber-100 text-xs font-semibold">
                <span>آخر صفحة قرأتها</span>
                <BookmarkIcon className="w-3.5 h-3.5 fill-current text-amber-200" />
              </div>
              <h3 className="text-base font-bold font-amiri mt-0.5">
                صفحة {toArabicNumerals(lastReadPage || 604)} {lastReadSurah ? `(سورة ${lastReadSurah.name})` : ''}
              </h3>
            </div>
          </div>

          {/* Quick Page Jumper Box */}
          <form 
            onSubmit={handleJumpToPage}
            className="p-3.5 rounded-2xl bg-white dark:bg-[#1A2621] border border-[#E5DDCF] dark:border-[#2A3C34] flex items-center gap-2 shadow-sm"
          >
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#0F6B50] hover:bg-[#138061] text-white text-xs font-bold transition-all shadow-sm shrink-0"
            >
              انتقال للصفحة
            </button>
            <input
              type="number"
              min="1"
              max="604"
              placeholder="اكتب رقم الصفحة (١ - ٦٠٤)..."
              value={jumpPageInput}
              onChange={(e) => setJumpPageInput(e.target.value)}
              className="flex-1 bg-[#F7F4EC] dark:bg-[#121E19] border border-[#E5DDCF] dark:border-[#2A3C34] rounded-xl py-2 px-3 text-xs text-right text-[#19302A] dark:text-white outline-none focus:border-[#0F6B50]"
            />
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Hash className="w-4 h-4" />
            </div>
          </form>

          {/* Reciter & Offline Quick Bar */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#0F6B50] to-[#168064] text-white shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="text-right">
                <span className="text-xs text-amber-300 font-bold">رياض القرآن الكريم</span>
                <h2 className="text-xl font-bold font-amiri mt-0.5">مصحفك بين يديك</h2>
                <p className="text-xs text-emerald-100 mt-0.5 leading-relaxed">
                  اقرأ، واستمع لأشهر القراء، واحفظ السور بدون إنترنت.
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-amber-300" />
              </div>
            </div>

            <div className="mt-3.5 p-2.5 rounded-2xl bg-black/20 border border-white/15 flex items-center justify-between">
              <button
                onClick={() => {
                  setShowRecitersModal(true);
                  playChime('click');
                }}
                className="bg-amber-400 hover:bg-amber-300 text-[#0F6B50] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>قائمة المشايخ والتحميل</span>
              </button>

              <div className="text-right">
                <span className="text-[10px] text-emerald-200 block">القارئ المعتمد:</span>
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  <Headphones className="w-3.5 h-3.5 text-amber-300" />
                  <span>{reciterObj.name}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="text-right">
                <h3 className="font-bold text-sm text-[#19302A] dark:text-white">فهرس السور (١١٤ سورة)</h3>
                <p className="text-xs text-[#7A877B] dark:text-[#8E9B93]">اختر السورة لفتح موضعها في المصحف</p>
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="ابحث باسم السورة أو رقمها (مثال: الكهف، البقرة، 18)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-[#1A2621] border border-[#E5DDCF] dark:border-[#2A3C34] focus:border-[#0F6B50] dark:focus:border-[#2DD4BF] rounded-2xl py-3 pr-11 pl-4 text-sm text-right outline-none text-[#19302A] dark:text-white shadow-sm placeholder-[#97A099]"
              />
              <Search className="w-5 h-5 text-[#97A099] absolute right-3.5 top-3.5" />
            </div>
          </div>

          {/* Surahs List */}
          <div className="space-y-2.5">
            {filteredSurahs.map((surah) => (
              <div
                key={surah.number}
                onClick={() => openSurahReader(surah.startPage)}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#1A2621] border border-[#E7E0D4] dark:border-[#2A3C34] hover:border-[#0F6B50] dark:hover:border-[#2DD4BF] flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] shadow-sm group"
              >
                {/* Meta details on left */}
                <div className="flex items-center gap-2 text-xs text-[#7A877B] dark:text-[#8E9B93]">
                  {isSurahDownloaded(selectedReciter, surah.number) && (
                    <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1" title="محملة للاستماع بدون نت">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-md bg-[#F0F5F0] dark:bg-[#14201B] font-medium">
                    {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                  </span>
                  <span>•</span>
                  <span>{toArabicNumerals(surah.numberOfAyahs)} آية</span>
                </div>

                {/* Surah Name & Page */}
                <div className="text-right flex-1 pr-3">
                  <h4 className="text-sm font-bold text-[#19302A] dark:text-white group-hover:text-[#0F6B50] dark:group-hover:text-[#2DD4BF] transition-colors">
                    سورة {surah.name}
                  </h4>
                  <p className="text-[11px] text-[#899287] dark:text-[#8FA59A] mt-0.5">
                    الجزء {toArabicNumerals(surah.juz)} • صفحة {toArabicNumerals(surah.startPage)}
                  </p>
                </div>

                {/* Number badge */}
                <div className="w-10 h-10 rounded-2xl bg-[#F4F8F5] dark:bg-[#152720] border border-[#C9DFCE] dark:border-[#253E32] text-[#0F6B50] dark:text-[#2DD4BF] font-bold text-sm flex items-center justify-center shrink-0">
                  {toArabicNumerals(surah.number)}
                </div>
              </div>
            ))}

            {filteredSurahs.length === 0 && (
              <div className="p-8 text-center bg-white dark:bg-[#1A2621] rounded-2xl border border-dashed border-[#E5DDCF] dark:border-[#2A3C34] text-sm text-[#7A877B]">
                لا توجد سورة مطابقة لبحثك.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Mushaf Page Reader View */
        <div className="space-y-3">
          {/* Focus Mode Banner if Active */}
          {isFocusMode && (
            <button
              onClick={toggleFocusMode}
              className="w-full py-2 px-3 rounded-2xl bg-amber-600/90 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md animate-fadeIn cursor-pointer mb-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>وضع القراءة بتركيز مفعّل — انقر هنا أو منتصف الشاشة لإعادة إظهار القوائم</span>
            </button>
          )}

          {/* Top Control Bar with Dropdown Trigger */}
          {!isFocusMode && (
            <div className="flex items-center justify-between bg-white dark:bg-[#1A2621] p-3 rounded-2xl border border-[#E5DDCF] dark:border-[#2A3C34] shadow-sm relative">
            <button
              onClick={() => setActiveMode('index')}
              className="w-10 h-10 rounded-xl bg-[#E8F3ED] dark:bg-[#162D24] text-[#0F6B50] dark:text-[#2DD4BF] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shrink-0"
              title="العودة للفهرس"
              aria-label="العودة للفهرس"
            >
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Dropdown Menu Trigger Button */}
            <button
              onClick={() => {
                setIsSurahDropdownOpen(!isSurahDropdownOpen);
                playChime('click');
              }}
              className={`px-3.5 py-1.5 rounded-2xl border transition-all flex items-center gap-2 shadow-xs cursor-pointer ${
                isSurahDropdownOpen
                  ? 'bg-[#0F6B50] text-white border-[#0F6B50] ring-2 ring-[#0F6B50]/30'
                  : 'bg-amber-50 dark:bg-[#162720] hover:bg-amber-100 dark:hover:bg-[#1d3229] border-amber-300/60 dark:border-[#2A3C34] text-[#19302A] dark:text-white'
              }`}
              title="اضغط لفتح قائمة السور واختيار السورة أو الصفحة من الأعلى"
              aria-expanded={isSurahDropdownOpen}
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSurahDropdownOpen ? 'rotate-180 text-white' : 'text-amber-600 dark:text-amber-400'}`} />
              <div className="text-right">
                <span className={`text-[9px] font-bold block leading-tight ${isSurahDropdownOpen ? 'text-amber-200' : 'text-[#B45309] dark:text-amber-300'}`}>
                  قائمة السور والصفحات
                </span>
                <h3 className="font-bold text-sm leading-tight font-amiri">
                  سورة {currentSurah?.name || 'القرآن'}
                </h3>
              </div>
              <BookOpen className={`w-4 h-4 mr-0.5 ${isSurahDropdownOpen ? 'text-amber-200' : 'text-[#0F6B50] dark:text-[#2DD4BF]'}`} />
            </button>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Keep Screen Awake / Screen Lock Toggle Button */}
              <button
                onClick={handleToggleKeepAwake}
                className={`w-10 h-10 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all relative ${
                  keepScreenAwake
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-400 shadow-xs'
                    : 'bg-gray-100 dark:bg-[#162D24] text-gray-500 dark:text-gray-400'
                }`}
                title={keepScreenAwake ? 'إبقاء الشاشة مفتوحة ومضاءة مفعّل (انقر للقفل العادي)' : 'قفل الشاشة التلقائي مفعّل (انقر لإبقاء الشاشة مضاءة)'}
                aria-label="إبقاء الشاشة مضاءة أثناء القراءة والتلاوة"
              >
                {keepScreenAwake ? <Sun className="w-5 h-5 text-amber-600 animate-pulse" /> : <Lock className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  setShowRecitersModal(true);
                  playChime('click');
                }}
                className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300/60 flex items-center justify-center text-[#0F6B50] dark:text-amber-300 hover:scale-105 active:scale-95 transition-transform relative"
                title="قائمة المشايخ والتحميل أوفلاين"
                aria-label="قائمة المشايخ والتحميل أوفلاين"
              >
                <Headphones className="w-5 h-5" />
                {isCurrentSurahOffline && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900" />
                )}
              </button>

              {/* Toggle Bookmark for Current Page */}
              <button
                onClick={handleToggleBookmark}
                className={`w-10 h-10 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all relative ${
                  isCurrentPageBookmarked
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300/60 shadow-xs'
                    : 'bg-[#E8F3ED] dark:bg-[#162D24] text-[#0F6B50] dark:text-[#2DD4BF]'
                }`}
                title={isCurrentPageBookmarked ? 'إزالة الفاصلة المرجعية' : 'حفظ الفاصلة المرجعية لهذا الموضع'}
                aria-label="حفظ الفاصلة المرجعية"
              >
                <BookmarkIcon className={`w-5 h-5 ${isCurrentPageBookmarked ? 'fill-amber-500 text-amber-600' : ''}`} />
              </button>

              {/* View Bookmarks Modal Trigger */}
              <button
                onClick={() => {
                  setShowBookmarksModal(true);
                  playChime('click');
                }}
                className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300/60 flex items-center justify-center text-[#8A743F] dark:text-amber-300 hover:scale-105 active:scale-95 transition-transform relative"
                title="عرض قائمة العلامات المرجعية والفواصل"
                aria-label="عرض الفواصل المرجعية"
              >
                <BookmarkCheck className="w-5 h-5" />
                {bookmarksList.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center border border-white dark:border-gray-900">
                    {bookmarksList.length}
                  </span>
                )}
              </button>
            </div>
          </div>
          )}

          {/* TOP-ANCHORED DROPDOWN LIST (Appears directly at the top and clearly visible) */}
          {isSurahDropdownOpen && (
            <div className="p-4 rounded-3xl bg-white dark:bg-[#15231D] border-2 border-[#0F6B50] dark:border-[#2DD4BF] shadow-2xl space-y-3.5 animate-fadeIn text-right relative z-30">
              {/* Dropdown Header */}
              <div className="flex items-center justify-between border-b border-[#EAE3D2] dark:border-[#23382F] pb-2.5">
                <button
                  onClick={() => setIsSurahDropdownOpen(false)}
                  className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-[#1C2C25] flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white"
                  title="إغلاق القائمة"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="text-right">
                  <span className="text-[10px] text-[#B45309] dark:text-amber-300 font-bold block">فهرس المصحف السريع</span>
                  <h4 className="font-bold text-sm text-[#19302A] dark:text-white font-amiri">
                    اختر سورة أو انتقل لأي صفحة
                  </h4>
                </div>
              </div>

              {/* Search input in top dropdown */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث باسم السورة (مثلاً: الكهف، يس، البقرة)..."
                  value={dropdownSearch}
                  onChange={(e) => setDropdownSearch(e.target.value)}
                  className="w-full bg-[#FAF8F2] dark:bg-[#101A16] border border-[#E5DDCF] dark:border-[#263D33] focus:border-[#0F6B50] rounded-xl py-2.5 pr-9 pl-3 text-xs text-right text-[#19302A] dark:text-white outline-none"
                />
                <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
              </div>

              {/* Juz Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                <button
                  onClick={() => setDropdownJuzFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-all ${
                    dropdownJuzFilter === 'all'
                      ? 'bg-[#0F6B50] text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-[#1A2C24] text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  جميع الأجزاء
                </button>
                {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => (
                  <button
                    key={juzNum}
                    onClick={() => setDropdownJuzFilter(juzNum)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-all ${
                      dropdownJuzFilter === juzNum
                        ? 'bg-[#0F6B50] text-white shadow-xs'
                        : 'bg-gray-100 dark:bg-[#1A2C24] text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    الجزء {toArabicNumerals(juzNum)}
                  </button>
                ))}
              </div>

              {/* Direct Page Jump in Dropdown */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleJumpToPage();
                  setIsSurahDropdownOpen(false);
                }}
                className="flex items-center gap-2 p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300/40"
              >
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-[#0F6B50] hover:bg-[#138061] text-white text-xs font-bold shrink-0 transition-all"
                >
                  انتقال فوري
                </button>
                <input
                  type="number"
                  min="1"
                  max="604"
                  placeholder="اكتب رقم أي صفحة (١ - ٦٠٤)..."
                  value={jumpPageInput}
                  onChange={(e) => setJumpPageInput(e.target.value)}
                  className="flex-1 bg-white dark:bg-[#14201B] border border-amber-200 dark:border-[#2A3C34] rounded-lg py-1.5 px-2.5 text-xs text-right text-[#19302A] dark:text-white outline-none"
                />
                <span className="text-xs font-bold text-[#8A743F] dark:text-amber-300 px-1">الصفحة:</span>
              </form>

              {/* Dropdown Scrollable Surah List */}
              <div className="max-h-64 overflow-y-auto space-y-1.5 pr-0.5 no-scrollbar">
                {filteredDropdownSurahs.map((surah) => {
                  const isCurrent = currentSurah?.number === surah.number;
                  return (
                    <div
                      key={surah.number}
                      onClick={() => {
                        openSurahReader(surah.startPage);
                        setIsSurahDropdownOpen(false);
                        setDropdownSearch('');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] ${
                        isCurrent
                          ? 'bg-emerald-50 dark:bg-emerald-950/70 border-[#0F6B50] text-[#0F6B50] dark:text-[#2DD4BF] font-bold shadow-xs'
                          : 'bg-[#FAF8F2] dark:bg-[#162720] border-[#E8DFD0] dark:border-[#24392F] hover:border-[#0F6B50] text-[#19302A] dark:text-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                        <span className="px-1.5 py-0.5 rounded bg-white dark:bg-[#101A16] font-medium border border-gray-200 dark:border-gray-800">
                          صفحة {toArabicNumerals(surah.startPage)}
                        </span>
                        <span>•</span>
                        <span>الجزء {toArabicNumerals(surah.juz)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="text-xs font-bold block">سورة {surah.name}</span>
                          <span className="text-[10px] text-gray-400 block">
                            {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} ({toArabicNumerals(surah.numberOfAyahs)} آية)
                          </span>
                        </div>
                        <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#101A16] border border-[#D5E5DA] dark:border-[#20372B] text-xs font-bold flex items-center justify-center text-[#0F6B50] dark:text-[#2DD4BF]">
                          {toArabicNumerals(surah.number)}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredDropdownSurahs.length === 0 && (
                  <div className="p-4 text-center text-xs text-gray-500">
                    لا توجد سورة مطابقة لبحثك
                  </div>
                )}
              </div>
            </div>
          )}

          
          {/* Quick Reader Action Bar: Theme Selector, Tafseer, Font Size */}
          {!isFocusMode && (
            <div className="flex items-center justify-between gap-1.5 p-2 rounded-2xl bg-white/95 dark:bg-[#162720]/95 border border-[#E5DDCF] dark:border-[#2A3C34] shadow-xs text-xs">
              {/* Quran Page Theme Selector Button */}
              <button
                onClick={() => {
                  setShowThemeModal(true);
                  playChime('click');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300/60 dark:border-[#334D41] bg-amber-50/80 dark:bg-[#1D3229] text-[#19302A] dark:text-white hover:border-[#0F6B50] active:scale-95 transition-all shadow-2xs group"
                title="تغيير سمة وتصميم صفحة المصحف"
              >
                <span 
                  className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0 shadow-2xs" 
                  style={{ backgroundColor: currentTheme.previewColors.accent }}
                />
                <div className="text-right">
                  <span className="text-[9px] text-[#8A743F] dark:text-amber-300 block leading-tight font-bold">سمة المصحف</span>
                  <span className="text-xs font-bold font-amiri block leading-tight truncate max-w-[110px]">
                    {currentTheme.name}
                  </span>
                </div>
                <Palette className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 group-hover:rotate-12 transition-transform" />
              </button>

              <div className="flex items-center gap-1">
                {/* Full Page Tafseer Button */}
                <button
                  onClick={() => {
                    setShowPageTafseerModal(true);
                    playChime('click');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#E8F3ED] dark:bg-[#1B3328] text-[#0F6B50] dark:text-[#2DD4BF] hover:bg-[#D5EADB] font-bold text-xs transition-colors"
                  title="تفسير الصفحة الحالية وكلماتها"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">تفسير الصفحة</span>
                </button>

                {/* Font Size Adjusters */}
                <div className="flex items-center bg-gray-100 dark:bg-[#12201A] rounded-xl p-0.5 border border-gray-200 dark:border-gray-800">
                  <button
                    onClick={() => {
                      setFontSize((prev) => Math.max(18, prev - 2));
                      playChime('click');
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-[#1D3229]"
                    title="تصغير الخط"
                  >
                    -A
                  </button>
                  <span className="text-[10px] px-1 font-bold font-mono text-gray-500 dark:text-gray-400">
                    {toArabicNumerals(fontSize)}
                  </span>
                  <button
                    onClick={() => {
                      setFontSize((prev) => Math.min(42, prev + 2));
                      playChime('click');
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-[#1D3229]"
                    title="تكبير الخط"
                  >
                    +A
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 1: Traditional Quranic Page Frame */}
          <div 
            onClick={(e) => {
              // If clicked directly on canvas/margin or text area rather than interactive button/modal
              const target = e.target as HTMLElement;
              if (!target.closest('button') && !target.closest('input') && !target.closest('a')) {
                toggleFocusMode();
              }
            }}
            className={`rounded-3xl p-5 sm:p-7 border-2 transition-all duration-300 shadow-md relative min-h-[460px] select-none cursor-pointer ${
              settings.enableEyeComfortMode
                ? 'bg-[#FBF2E3] border-[#E1CFAC] text-[#3D281B]'
                : `${currentTheme.containerBgClass} ${currentTheme.containerBorderClass}`
            }`}
          >
            {/* Ornamental Frame Corner Accents */}
            <QuranFrameOrnaments theme={currentTheme} />

            {/* Page Header Ribbon */}
            <div className={`flex items-center justify-between border-b pb-3 mb-4 ${currentTheme.ribbonClass}`}>
              <span className={`text-xs font-bold ${currentTheme.headerSubtextColor}`}>
                الجزء {toArabicNumerals(currentSurah?.juz || 30)}
              </span>
              <div className="text-center">
                <span className={`text-base font-bold font-amiri block ${currentTheme.headerTextColor}`}>
                  {pageAyahs.length > 1
                    ? `سور ${Array.from(new Set(pageAyahs.map((s: any) => s.sName || currentSurah?.name))).filter(Boolean).join(' • ')}`
                    : (currentSurah?.name ? `سورة ${currentSurah.name}` : 'المصحف الشريف')}
                </span>
                <span className={`text-[10px] font-bold block mt-0.5 font-quran ${currentTheme.headerSubtextColor}`}>
                  رسم المدينة النبوي الشريف • {currentTheme.name}
                </span>
              </div>
              <span className={`text-xs font-bold ${currentTheme.headerSubtextColor}`}>
                الحزب {toArabicNumerals(Math.min(60, Math.ceil((currentSurah?.juz || 30) * 2)))}
              </span>
            </div>

            {/* Loading state: Skeleton representation */}
            {loadingPage ? (
              <MushafSkeleton />
            ) : (
              /* Ayahs Stream with Islamic typography */
              <div className="space-y-6">
                {pageAyahs[0]?.isOfflineUncached && (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-center space-y-3 shadow-xs my-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200">
                        صفحة المصحف ({toArabicNumerals(currentPage)}) غير مخزنة أوفلاين
                      </h4>
                      <p className="text-xs text-amber-800 dark:text-amber-300/80 leading-relaxed max-w-xs mx-auto mt-1">
                        لم يتم حفظ نصوص هذه الصفحة مسبقاً على جهازك. يمكنك الانتقال إلى السور المحفوظة للاستماع والقراءة بدون نت، أو العودة لآخر صفحة قرأتها.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      <button
                        onClick={() => setShowRecitersModal(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#0F6B50] text-white text-xs font-bold hover:bg-[#138061] transition-colors shadow-xs"
                      >
                        السور المحفوظة (أوفلاين)
                      </button>
                      {lastReadPage && lastReadPage !== currentPage && (
                        <button
                          onClick={() => {
                            setCurrentPage(lastReadPage);
                            playChime('click');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-[#0F6B50] dark:text-[#2DD4BF] text-xs font-bold transition-colors"
                        >
                          العودة لصفحة {toArabicNumerals(lastReadPage)}
                        </button>
                      )}
                      <button
                        onClick={() => setShowBookmarksModal(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100 text-xs font-bold transition-colors"
                      >
                        الفواصل المرجعية
                      </button>
                    </div>
                  </div>
                )}
                {pageAyahs.map((surahItem, sIdx) => {
                  const isSurahStartOnThisPage = surahItem.ayahs.some((a: any) => a.number === 1);

                  return (
                    <div key={sIdx} className="space-y-4">
                      {/* Surah Title Frame - Shown ONLY when the Surah starts on this page */}
                      {isSurahStartOnThisPage && (
                        <div className={`my-4 py-2 px-4 rounded-xl border text-center shadow-sm ${currentTheme.surahBannerClass}`}>
                          <span className={`text-xs font-bold block ${currentTheme.headerSubtextColor}`}>سُورَةُ</span>
                          <h4 className={`text-xl font-bold font-amiri ${currentTheme.surahTitleColor}`}>
                            {surahItem.name}
                          </h4>
                        </div>
                      )}

                      {/* Bismillah Header - Shown ONLY when the Surah starts on this page */}
                      {isSurahStartOnThisPage && surahItem.bismillah && (
                        <div className={`text-center font-quran text-lg font-bold my-2 ${currentTheme.bismillahColor}`}>
                          {surahItem.bismillah}
                        </div>
                      )}

                    {/* Text block of Ayahs with Synchronized Highlighting */}
                    <div 
                      className={`text-justify font-quran leading-[2.5] tracking-normal font-semibold ${currentTheme.ayahTextColor}`}
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {surahItem.ayahs.map((ayah: any) => {
                        const rawText = cleanQuranText(ayah.text);
                        const sNum = surahItem.number || currentSurah?.number || 1;
                        const isPlayingThisAyah = isPlaying && currentPlayingAyah?.surahNumber === sNum && currentPlayingAyah?.ayahNumber === ayah.number;

                        return (
                          <span 
                            key={ayah.number} 
                            id={`mushaf-ayah-${sNum}-${ayah.number}`}
                            className={`inline relative transition-all duration-300 rounded-xl ${
                              isPlayingThisAyah 
                                ? currentTheme.activeAyahClass
                                : 'hover:bg-amber-200/40 dark:hover:bg-amber-900/40 px-0.5'
                            }`}
                          >
                            <span 
                              onClick={() => {
                                if (isPlayingThisAyah) {
                                  toggleAudio();
                                } else {
                                  playAyah(sNum, surahItem.name, ayah.number, rawText);
                                  playChime('click');
                                }
                              }}
                              title={isPlayingThisAyah ? 'جارٍ تلاوة هذه الآية (انقر للإيقاف)' : 'انقر للاستماع لهذه الآية وتظليلها'}
                              className={`cursor-pointer transition-colors ${
                                isPlayingThisAyah 
                                  ? 'font-bold' 
                                  : 'hover:text-[#0F6B50] dark:hover:text-amber-200'
                              }`}
                            >
                              {rawText}
                            </span>
                            
                            {/* Ayah End Ornamental Symbol */}
                            <span 
                              onClick={() => {
                                handleOpenAyahDetails({
                                  surahNumber: sNum,
                                  surahName: surahItem.name,
                                  ayahNumber: ayah.number,
                                  ayahText: rawText,
                                  defaultTafseer: ayah.tafseer
                                });
                              }}
                              title={`الآية ${toArabicNumerals(ayah.number)} - اضغط لتفاصيل الآية والتفسير`}
                              className={`inline-block px-1 font-bold font-quran select-none cursor-pointer hover:scale-125 transition-transform align-baseline text-[0.9em] ${
                                isPlayingThisAyah 
                                  ? 'text-[#B45309] dark:text-amber-300 animate-pulse font-extrabold scale-110' 
                                  : currentTheme.ayahMarkerColor
                              }`}
                            >
                              ۝{toArabicNumerals(ayah.number)}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            )}

            {/* Page Bottom Number */}
            <div className={`mt-8 pt-3 border-t text-center font-bold text-xs ${currentTheme.ribbonClass} ${currentTheme.pageNumberColor}`}>
              — {toArabicNumerals(currentPage)} —
            </div>
          </div>
          {/* Synchronized Quran Audio Player Bar */}
          <div className="bg-white dark:bg-[#1A2621] p-3.5 rounded-3xl border-2 border-[#E5DDCF] dark:border-[#2A3C34] shadow-md space-y-3">
            {/* Top Row: Live Recitation Status, Repeat Mode, Repetition Count, and Screen Lock */}
            <div className="flex items-center justify-between border-b border-[#EAE3D2] dark:border-[#24372F] pb-2 text-xs flex-wrap gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Repeat Mode Switcher (Continuous / Single Ayah / Page Loop) */}
                <button
                  onClick={() => {
                    const modes: ('continuous' | 'single' | 'page_loop')[] = ['continuous', 'single', 'page_loop'];
                    const nextIdx = (modes.indexOf(repeatMode) + 1) % modes.length;
                    const nextMode = modes[nextIdx];
                    setRepeatMode(nextMode);
                    playChime('click');
                    if (nextMode === 'continuous') {
                      showToast('الوضع: تلاوة متواصلة (صفحة بعد صفحة)');
                    } else if (nextMode === 'single') {
                      showToast('الوضع: تكرار الآية الحالية');
                    } else {
                      showToast('الوضع: تكرار الصفحة الحالية بالكامل');
                    }
                  }}
                  className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition-all text-xs ${
                    repeatMode === 'single'
                      ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-400'
                      : repeatMode === 'page_loop'
                      ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-400'
                      : 'bg-emerald-50 dark:bg-[#15251F] text-[#0F6B50] dark:text-[#2DD4BF] border border-emerald-200/60'
                  }`}
                  title="تغيير نمط التكرار (تلاوة متواصلة / تكرار الآية / تكرار الصفحة)"
                >
                  {repeatMode === 'single' ? (
                    <Repeat1 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300" />
                  ) : repeatMode === 'page_loop' ? (
                    <RotateCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-300" />
                  ) : (
                    <Repeat className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {repeatMode === 'single' ? 'تكرار الآية' : repeatMode === 'page_loop' ? 'تكرار الصفحة' : 'تلاوة متواصلة'}
                  </span>
                </button>

                {/* Repeat Times Counter Selector (1x, 2x, 3x, 5x, 7x, ∞) */}
                {(repeatMode === 'single' || repeatMode === 'continuous') && (
                  <button
                    onClick={() => {
                      const counts = [1, 2, 3, 4, 5, 10, Infinity];
                      const nextIdx = (counts.indexOf(repeatTimes) + 1) % counts.length;
                      const nextCount = counts[nextIdx];
                      setRepeatTimes(nextCount);
                      setCurrentRepeatCounter(1);
                      playChime('click');
                      showToast(nextCount === Infinity ? 'تكرار مستمر بلا نهاية ♾️' : `تم ضبط التكرار: ${toArabicNumerals(nextCount)} مرات لكل آية`);
                    }}
                    className={`px-2 py-1 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                      repeatTimes > 1
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-gray-100 dark:bg-[#14201B] text-gray-700 dark:text-gray-300 hover:text-[#0F6B50]'
                    }`}
                    title="عدد مرات تكرار كل آية للحفظ والمراجعة"
                  >
                    <span>تكرار: {repeatTimes === Infinity ? '∞' : `${toArabicNumerals(repeatTimes)}x`}</span>
                    {isPlaying && repeatTimes > 1 && (
                      <span className="bg-white/30 text-white rounded-full px-1 text-[10px]">
                        {toArabicNumerals(currentRepeatCounter)}/{repeatTimes === Infinity ? '∞' : toArabicNumerals(repeatTimes)}
                      </span>
                    )}
                  </button>
                )}

                {/* Speed toggle */}
                <button
                  onClick={handleSpeedChange}
                  className="px-2 py-1 rounded-xl bg-gray-100 dark:bg-[#14201B] text-gray-700 dark:text-gray-300 hover:text-[#0F6B50] font-bold text-xs transition-colors"
                  title="تغيير سرعة التلاوة"
                >
                  {playbackSpeed}x
                </button>
              </div>

              {/* Reciting Status Title with Active Equalizer Bars & WakeLock indicator */}
              <div className="flex items-center gap-2 text-right">
                {isPlaying && (
                  <div className="flex items-end gap-0.5 h-4">
                    <span className="w-1 bg-emerald-500 rounded-full animate-bounce h-2" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 bg-emerald-500 rounded-full animate-bounce h-3.5" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 bg-emerald-500 rounded-full animate-bounce h-2.5" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
                <div>
                  <span className="font-bold text-[#19302A] dark:text-white block text-xs">
                    {currentPlayingAyah 
                      ? `سورة ${currentPlayingAyah.surahName} — الآية ${toArabicNumerals(currentPlayingAyah.ayahNumber)}`
                      : `تلاوة سورة ${currentSurah?.name || ''}`}
                  </span>
                  <div className="flex items-center justify-end gap-1.5">
                    {keepScreenAwake && (
                      <span className="text-[10px] text-amber-700 dark:text-amber-300 flex items-center gap-0.5 font-bold" title="الشاشة مفتوحة أثناء القراءة والتلاوة">
                        <Sun className="w-2.5 h-2.5 text-amber-500 inline" />
                        <span>الشاشة مضاءة</span>
                      </span>
                    )}
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold block">
                      {isPlaying ? 'تظليل آني مع صوت الشيخ' : 'انقر على أي آية لتلاوتها وتظليلها'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Controls [Prev Ayah | Play/Pause | Next Ayah | Sheikh Info | Tools] */}
            <div className="flex items-center justify-between gap-2">
              {/* Reciter Info Opener */}
              <button 
                onClick={() => {
                  setShowRecitersModal(true);
                  playChime('click');
                }}
                className="flex items-center gap-1.5 p-1.5 px-2.5 rounded-2xl bg-[#F6F4EB] dark:bg-[#14221C] border border-[#E2DAC8] dark:border-[#22352C] hover:border-[#0F6B50] transition-all text-right"
                title="تغيير القارئ أو تحميل السور للاستماع أوفلاين"
              >
                <Headphones className="w-4 h-4 text-[#0F6B50] dark:text-[#2DD4BF]" />
                <div className="hidden sm:block text-right">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 block leading-tight">القارئ:</span>
                  <span className="text-xs font-bold text-[#19302A] dark:text-white block leading-tight truncate max-w-[90px]">
                    {reciterObj.name.split(' ')[0]}
                  </span>
                </div>
                {isCurrentSurahOffline && (
                  <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-1 rounded">
                    أوفلاين
                  </span>
                )}
              </button>

              {/* Main Center Playback Controls */}
              <div className="flex items-center gap-2">
                {/* Previous Ayah Button */}
                <button
                  onClick={handlePrevAyah}
                  className="w-9 h-9 rounded-2xl bg-gray-100 dark:bg-[#14201B] hover:bg-emerald-100 dark:hover:bg-[#1d3329] text-gray-700 dark:text-gray-200 flex items-center justify-center transition-all active:scale-95 shadow-sm"
                  title="الآية السابقة"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                {/* Big Center Play/Pause Button */}
                <button
                  onClick={toggleAudio}
                  className="w-13 h-13 px-4 py-3 rounded-2xl bg-gradient-to-tr from-[#0B543E] to-[#138565] hover:from-[#0E684D] hover:to-[#169974] text-white flex items-center justify-center shadow-lg shadow-emerald-900/20 active:scale-95 transition-all"
                  title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل التلاوة وتظليل الآيات'}
                  aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل التلاوة'}
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current mr-0.5" />}
                </button>

                {/* Next Ayah Button */}
                <button
                  onClick={handleNextAyah}
                  className="w-9 h-9 rounded-2xl bg-gray-100 dark:bg-[#14201B] hover:bg-emerald-100 dark:hover:bg-[#1d3329] text-gray-700 dark:text-gray-200 flex items-center justify-center transition-all active:scale-95 shadow-sm"
                  title="الآية التالية"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
              </div>

              {/* Download / Practice Mic Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setShowRecitersModal(true);
                    playChime('click');
                  }}
                  className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#0F6B50] dark:text-[#2DD4BF] border border-emerald-200/50 hover:scale-105 active:scale-95 transition-transform shadow-sm"
                  title="تحميل السورة للاستماع بدون إنترنت"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    const activeAyah = currentPlayingAyah || (pageAyahs[0]?.ayahs[0] ? {
                      surahNumber: pageAyahs[0]?.number || currentSurah?.number || 112,
                      surahName: pageAyahs[0]?.name || currentSurah?.name || 'الإخلاص',
                      ayahNumber: pageAyahs[0].ayahs[0].number,
                      text: pageAyahs[0].ayahs[0].text
                    } : null);

                    if (activeAyah) {
                      onOpenVoicePractice(activeAyah.text, activeAyah.surahName);
                    } else {
                      onOpenVoicePractice('قُلْ هُوَ اللَّهُ أَحَدٌ', 'الإخلاص');
                    }
                  }}
                  className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-[#B45309] dark:text-amber-300 border border-amber-200/50 hover:scale-105 active:scale-95 transition-transform shadow-sm"
                  title="تمرين التلاوة وتسجيل الصوت للآية المحددة"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Next / Previous Page Navigation */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              disabled={currentPage <= 1}
              onClick={() => handlePrevPage(false)}
              className="py-3 px-4 rounded-xl bg-white dark:bg-[#1A2621] border border-[#E5DDCF] dark:border-[#2A3C34] text-[#0F6B50] dark:text-[#2DD4BF] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#F4F8F5] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
            >
              <ChevronRight className="w-4 h-4" />
              <span>الصفحة السابقة ({toArabicNumerals(Math.max(1, currentPage - 1))})</span>
            </button>

            <button
              onClick={() => handleNextPage(false)}
              className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] ${
                currentPage >= 604
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white animate-pulse'
                  : 'bg-[#0F6B50] hover:bg-[#138061] text-white'
              }`}
            >
              {currentPage >= 604 ? (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>إتمام الختمة المباركة 🎉</span>
                </>
              ) : (
                <>
                  <span>الصفحة التالية ({toArabicNumerals(Math.min(604, currentPage + 1))})</span>
                  <ChevronLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Khatma Celebration Modal */}
      <CelebrationModal
        isOpen={showKhatmaCelebration}
        onClose={() => setShowKhatmaCelebration(false)}
        type="khatma"
      />

      {/* Reciters and Offline Downloads Modal */}
      <RecitersModal
        isOpen={showRecitersModal}
        onClose={() => setShowRecitersModal(false)}
        selectedReciter={selectedReciter}
        onSelectReciter={(rId) => {
          setSelectedReciter(rId);
          if (onUpdateSettings) onUpdateSettings({ ...settings, selectedReciter: rId });
        }}
        currentSurahNumber={currentSurah?.number || 1}
        currentSurahName={currentSurah?.name || 'الفاتحة'}
        onPlaySurahOffline={handlePlaySurahOffline}
      />

      {/* Comprehensive Ayah Details Modal */}
      {selectedAyahDetails && (
        <AyahDetailsModal
          isOpen={!!selectedAyahDetails}
          onClose={() => setSelectedAyahDetails(null)}
          surahNumber={selectedAyahDetails.surahNumber}
          surahName={selectedAyahDetails.surahName}
          ayahNumber={selectedAyahDetails.ayahNumber}
          ayahText={selectedAyahDetails.ayahText}
          defaultTafseer={selectedAyahDetails.defaultTafseer}
          isAyahBookmarked={isCurrentAyahBookmarked}
          onToggleAyahBookmark={handleToggleAyahBookmark}
        />
      )}

      {/* Full Top-Anchored Page Tafseer and Word Meanings Modal */}
      <PageTafseerModal
        isOpen={showPageTafseerModal}
        onClose={() => setShowPageTafseerModal(false)}
        pageNumber={currentPage}
        surahName={currentSurah?.name || 'القرآن الكريم'}
        juzNumber={currentSurah?.juz || 30}
        pageAyahs={pageAyahs}
        onSelectAyahForDetails={(sNum, sName, aNum, aText, defTafseer) => {
          setSelectedAyahDetails({
            surahNumber: sNum,
            surahName: sName,
            ayahNumber: aNum,
            ayahText: aText,
            defaultTafseer: defTafseer,
          });
        }}
      />
      {/* Bookmarks & Reading Page Dividers Modal */}
      <BookmarksModal
        isOpen={showBookmarksModal}
        onClose={() => setShowBookmarksModal(false)}
        bookmarks={bookmarksList}
        currentPage={currentPage}
        currentSurahName={currentSurah?.name}
        onSelectPage={(pageNum) => {
          setCurrentPage(pageNum);
          saveLastReadPage(pageNum);
          if (onPageChange) onPageChange(pageNum);
          setActiveMode('reader');
          showToast(`تم الانتقال إلى الفاصلة في صفحة ${toArabicNumerals(pageNum)} 🔖`);
        }}
        onToggleCurrentPageBookmark={handleToggleBookmark}
        onRemoveBookmark={handleRemoveBookmark}
        onUpdateBookmarkTitle={handleUpdateBookmarkTitle}
      />

      {/* Quran Page Visual Theme Selector Modal */}
      <QuranThemeModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        selectedThemeId={quranThemeId}
        onSelectTheme={handleSelectTheme}
      />
    </div>
  );
};

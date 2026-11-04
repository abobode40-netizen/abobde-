import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Lightbulb, 
  Info,
  ListOrdered,
  Bookmark,
  BookmarkCheck,
  Play,
  Pause,
  Volume2,
  Layers,
  ArrowRight,
  ArrowLeft,
  X,
  RotateCcw,
  Download,
  Filter,
  ArrowUp,
  SlidersHorizontal,
  Trash2
} from 'lucide-react';
import { DoorActionBar } from './DoorActionBar';
import { TafseerIndexView } from './TafseerIndexView';
import { 
  ADAWI_METHODOLOGY, 
  AdawiTafseerEntry,
  getAll114SurahsOverview,
  getCompleteAdawiSurahEntry
} from '../data/tafseerAdawiData';
import { SURAHS_LIST, toArabicNumerals, getAyahAudioUrl } from '../data/quranData';
import { cleanQuranText } from '../utils/quranText';
import { fetchAyahTafseer } from '../utils/tafseerService';
import { playChime, triggerHaptic } from '../utils/audio';
import { TafseerFavoriteAyah } from '../types';
import { loadTafseerFavorites, saveTafseerFavorites } from '../utils/storage';

interface TafseerAdawiViewProps {
  onBack: () => void;
  fontScale?: number;
  onChangeFontScale?: (scale: number) => void;
}

interface SurahAyahItem {
  numberInSurah: number;
  overallNumber?: number;
  text: string;
  tafseerText?: string;
  isExpanded?: boolean;
  isLoadingTafseer?: boolean;
}

export const TafseerAdawiView: React.FC<TafseerAdawiViewProps> = ({
  onBack,
  fontScale = 100,
  onChangeFontScale
}) => {
  // Main view state: 'content' (Surah view) or 'index' (All 114 Surahs catalog)
  const [activeViewTab, setActiveViewTab] = useState<'content' | 'index'>('content');
  
  // Selected Surah (1 to 114)
  const [currentSurahNumber, setCurrentSurahNumber] = useState<number>(1);
  
  // Sub-tab inside the selected Surah: 'overview' (Abridged study & pauses) vs 'ayahs' (Ayah-by-Ayah Tafseer Ibn Kathir)
  const [surahViewMode, setSurahViewMode] = useState<'overview' | 'ayahs'>('overview');
  
  // Ayahs data for the selected Surah
  const [surahAyahs, setSurahAyahs] = useState<SurahAyahItem[]>([]);
  const [isLoadingAyahs, setIsLoadingAyahs] = useState(false);
  const [ayahSearchQuery, setAyahSearchQuery] = useState('');
  
  // Pagination / Chunking range for long Surahs (e.g. 25 verses per page, or 'all')
  const [selectedAyahRange, setSelectedAyahRange] = useState<string>('all');
  const [jumpToAyahInput, setJumpToAyahInput] = useState('');
  const [isPreCaching, setIsPreCaching] = useState(false);
  const [preCacheProgress, setPreCacheProgress] = useState(0);

  // Audio playback state
  const [playingAyahNumber, setPlayingAyahNumber] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Modals & UI states
  const [showSurahPicker, setShowSurahPicker] = useState(false);
  const [surahPickerSearch, setSurahPickerSearch] = useState('');
  const [showMethodology, setShowMethodology] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [highlightedEntryKey, setHighlightedEntryKey] = useState<string | null>(null);
  const [highlightedAyahNum, setHighlightedAyahNum] = useState<number | null>(null);

  // Favorites state for Tafseer Ayahs
  const [favorites, setFavorites] = useState<TafseerFavoriteAyah[]>(() => loadTafseerFavorites());
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [favoriteSearchQuery, setFavoriteSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Get current Surah Metadata and Adawi Profile
  const currentSurahMeta = useMemo(() => {
    return SURAHS_LIST.find(s => s.number === currentSurahNumber) || SURAHS_LIST[0];
  }, [currentSurahNumber]);

  const currentSurahEntry = useMemo(() => {
    return getCompleteAdawiSurahEntry(currentSurahNumber);
  }, [currentSurahNumber]);

  // All 114 Surahs overview dataset for the catalog index
  const all114Entries = useMemo(() => {
    return getAll114SurahsOverview();
  }, []);

  // Calculate Ayah Ranges for long Surahs (chunks of 25)
  const ayahRangesList = useMemo(() => {
    const total = currentSurahMeta.numberOfAyahs;
    if (total <= 25) return [];

    const ranges: { label: string; start: number; end: number; key: string }[] = [];
    const chunkSize = 25;
    for (let i = 1; i <= total; i += chunkSize) {
      const end = Math.min(i + chunkSize - 1, total);
      ranges.push({
        label: `${toArabicNumerals(i)} - ${toArabicNumerals(end)}`,
        start: i,
        end,
        key: `${i}-${end}`
      });
    }
    return ranges;
  }, [currentSurahMeta]);

  // Cleanup audio on unmount or surah change
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [currentSurahNumber]);

  // Reset range and query when changing surah
  useEffect(() => {
    setSelectedAyahRange('all');
    setAyahSearchQuery('');
    setJumpToAyahInput('');
  }, [currentSurahNumber]);

  // Fetch Ayahs of current Surah when entering 'ayahs' mode or changing Surah
  useEffect(() => {
    if (surahViewMode === 'ayahs') {
      loadSurahAyahs(currentSurahNumber);
    }
  }, [currentSurahNumber, surahViewMode]);

  const loadSurahAyahs = async (surahNum: number) => {
    setIsLoadingAyahs(true);
    const cacheKey = `jannat_surah_uthmani_${surahNum}`;
    
    // Check in localStorage
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSurahAyahs(parsed);
          setIsLoadingAyahs(false);
          return;
        }
      }
    } catch {
      // Ignore cache parse error
    }

    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/quran-uthmani`);
      if (res.ok) {
        const data = await res.json();
        if (data?.data?.ayahs) {
          const mapped: SurahAyahItem[] = data.data.ayahs.map((a: any) => ({
            numberInSurah: a.numberInSurah,
            overallNumber: a.number,
            text: cleanQuranText(a.text),
            isExpanded: false
          }));
          setSurahAyahs(mapped);
          try {
            localStorage.setItem(cacheKey, JSON.stringify(mapped));
          } catch {}
        }
      }
    } catch (err) {
      console.error('Failed to load Surah ayahs:', err);
    } finally {
      setIsLoadingAyahs(false);
    }
  };

  // Load Tafseer for a specific Ayah on demand
  const handleToggleAyahTafseer = async (ayahNumber: number) => {
    playChime('click');
    triggerHaptic('light');

    setSurahAyahs(prev => prev.map(a => {
      if (a.numberInSurah === ayahNumber) {
        const willExpand = !a.isExpanded;
        return {
          ...a,
          isExpanded: willExpand,
          isLoadingTafseer: willExpand && !a.tafseerText
        };
      }
      return a;
    }));

    const targetAyah = surahAyahs.find(a => a.numberInSurah === ayahNumber);
    if (!targetAyah || targetAyah.tafseerText) return;

    try {
      const tafseer = await fetchAyahTafseer('ibn_kathir', currentSurahNumber, ayahNumber);
      setSurahAyahs(prev => prev.map(a => {
        if (a.numberInSurah === ayahNumber) {
          return {
            ...a,
            tafseerText: tafseer,
            isLoadingTafseer: false
          };
        }
        return a;
      }));
    } catch {
      setSurahAyahs(prev => prev.map(a => {
        if (a.numberInSurah === ayahNumber) {
          return { ...a, isLoadingTafseer: false };
        }
        return a;
      }));
    }
  };

  // Expand or collapse all ayahs with their Tafseer
  const handleToggleAllTafseers = async (expand: boolean) => {
    playChime('click');
    triggerHaptic('medium');

    setSurahAyahs(prev => prev.map(a => ({ ...a, isExpanded: expand })));

    if (expand) {
      for (const a of surahAyahs) {
        if (!a.tafseerText) {
          fetchAyahTafseer('ibn_kathir', currentSurahNumber, a.numberInSurah).then(text => {
            setSurahAyahs(prev => prev.map(item => item.numberInSurah === a.numberInSurah ? { ...item, tafseerText: text } : item));
          }).catch(() => {});
        }
      }
    }
  };

  // Pre-cache entire surah's Tafseer for offline reading
  const handlePreCacheSurah = async () => {
    if (isPreCaching || surahAyahs.length === 0) return;
    setIsPreCaching(true);
    setPreCacheProgress(0);
    playChime('click');
    triggerHaptic('selection');

    let completed = 0;
    const total = surahAyahs.length;

    for (const a of surahAyahs) {
      if (!a.tafseerText) {
        try {
          const text = await fetchAyahTafseer('ibn_kathir', currentSurahNumber, a.numberInSurah);
          setSurahAyahs(prev => prev.map(item => item.numberInSurah === a.numberInSurah ? { ...item, tafseerText: text } : item));
        } catch {}
      }
      completed++;
      setPreCacheProgress(Math.round((completed / total) * 100));
    }

    setIsPreCaching(false);
    triggerHaptic('medium');
  };

  // Jump to specific Ayah
  const handleJumpToAyah = (targetNum?: number) => {
    const num = targetNum || parseInt(jumpToAyahInput, 10);
    if (!num || num < 1 || num > currentSurahMeta.numberOfAyahs) return;

    // If chunking is active, switch to the range that includes this Ayah
    if (selectedAyahRange !== 'all') {
      const matchingRange = ayahRangesList.find(r => num >= r.start && num <= r.end);
      if (matchingRange) {
        setSelectedAyahRange(matchingRange.key);
      } else {
        setSelectedAyahRange('all');
      }
    }

    setHighlightedAyahNum(num);
    playChime('click');
    triggerHaptic('light');

    setTimeout(() => {
      const el = document.getElementById(`ayah-${num}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);

    setTimeout(() => {
      setHighlightedAyahNum(null);
    }, 3500);
  };

  // Play audio recitation for an Ayah
  const handlePlayAyahAudio = (ayahNum: number) => {
    triggerHaptic('light');

    if (playingAyahNumber === ayahNum) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingAyahNumber(null);
      return;
    }

    const audioUrl = getAyahAudioUrl('alafasy', currentSurahNumber, ayahNum);
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
    } else {
      audioRef.current.pause();
      audioRef.current.src = audioUrl;
    }

    audioRef.current.onended = () => {
      setPlayingAyahNumber(null);
    };

    audioRef.current.play().catch(() => {});
    setPlayingAyahNumber(ayahNum);
  };

  // Navigate to Surah from Index
  const handleSelectFromIndex = (entry: AdawiTafseerEntry, targetMode: 'overview' | 'ayahs' = 'overview') => {
    setCurrentSurahNumber(entry.surahNumber);
    setSurahViewMode(targetMode);
    setActiveViewTab('content');
    setShowSurahPicker(false);
    const key = `${entry.surahNumber}_${entry.ayahRange}`;
    setHighlightedEntryKey(key);

    setTimeout(() => {
      setHighlightedEntryKey(null);
    }, 3000);
  };

  // Change Surah (Next / Prev)
  const handleChangeSurah = (direction: 'next' | 'prev') => {
    playChime('click');
    triggerHaptic('selection');
    if (direction === 'next' && currentSurahNumber < 114) {
      setCurrentSurahNumber(currentSurahNumber + 1);
    } else if (direction === 'prev' && currentSurahNumber > 1) {
      setCurrentSurahNumber(currentSurahNumber - 1);
    }
  };

  // Copy entry or ayah
  const handleCopy = (textToCopy: string, id: string) => {
    navigator.clipboard.writeText(textToCopy);
    playChime('click');
    triggerHaptic('light');
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Toast notification helper
  const showNotificationToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Favorites logic
  const isAyahFavorited = (surahNum: number, ayahNum: number): boolean => {
    return favorites.some(f => f.surahNumber === surahNum && f.ayahNumber === ayahNum);
  };

  const handleToggleFavorite = (ayah: SurahAyahItem) => {
    const isFav = isAyahFavorited(currentSurahNumber, ayah.numberInSurah);
    if (isFav) {
      const updated = favorites.filter(f => !(f.surahNumber === currentSurahNumber && f.ayahNumber === ayah.numberInSurah));
      setFavorites(updated);
      saveTafseerFavorites(updated);
      playChime('click');
      triggerHaptic('light');
      showNotificationToast(`تمت إزالة الآية [${ayah.numberInSurah}] من المفضلة`);
    } else {
      const newFav: TafseerFavoriteAyah = {
        id: `${currentSurahNumber}:${ayah.numberInSurah}`,
        surahNumber: currentSurahNumber,
        surahName: currentSurahMeta.name,
        ayahNumber: ayah.numberInSurah,
        ayahText: ayah.text,
        tafseerText: ayah.tafseerText,
        savedAt: Date.now()
      };
      const updated = [newFav, ...favorites.filter(f => f.id !== newFav.id)];
      setFavorites(updated);
      saveTafseerFavorites(updated);
      playChime('click');
      triggerHaptic('medium');
      showNotificationToast(`★ تم حفظ الآية [${ayah.numberInSurah}] في مفضلة التفسير`);
    }
  };

  const handleRemoveFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = favorites.filter(f => f.id !== id);
    setFavorites(updated);
    saveTafseerFavorites(updated);
    playChime('click');
    triggerHaptic('light');
    showNotificationToast('تم حذف الآية من المفضلة');
  };

  const handleClearAllFavorites = () => {
    if (favorites.length === 0) return;
    setFavorites([]);
    saveTafseerFavorites([]);
    playChime('click');
    triggerHaptic('medium');
    showNotificationToast('تم إفراغ مفضلة الآيات');
  };

  const handleJumpFromFavorite = (fav: TafseerFavoriteAyah) => {
    setShowFavoritesModal(false);
    setActiveViewTab('content');
    setSurahViewMode('ayahs');
    
    if (currentSurahNumber !== fav.surahNumber) {
      setCurrentSurahNumber(fav.surahNumber);
    }
    
    setSelectedAyahRange('all');
    
    setTimeout(() => {
      handleJumpToAyah(fav.ayahNumber);
    }, 300);
  };

  // Filtered Favorites based on Search
  const filteredFavorites = useMemo(() => {
    if (!favoriteSearchQuery.trim()) return favorites;
    const q = favoriteSearchQuery.trim().toLowerCase();
    return favorites.filter(f => 
      f.surahName.toLowerCase().includes(q) ||
      f.ayahText.toLowerCase().includes(q) ||
      String(f.ayahNumber) === q ||
      toArabicNumerals(f.ayahNumber) === q ||
      (f.tafseerText && f.tafseerText.toLowerCase().includes(q))
    );
  }, [favorites, favoriteSearchQuery]);

  // Filtered Ayahs based on Range and Search
  const filteredAyahs = useMemo(() => {
    let list = surahAyahs;

    // Filter by Range if not 'all'
    if (selectedAyahRange !== 'all') {
      const [start, end] = selectedAyahRange.split('-').map(Number);
      if (start && end) {
        list = list.filter(a => a.numberInSurah >= start && a.numberInSurah <= end);
      }
    }

    // Filter by Search Query
    if (ayahSearchQuery.trim()) {
      const q = ayahSearchQuery.trim().toLowerCase();
      list = list.filter(a => 
        a.text.toLowerCase().includes(q) ||
        String(a.numberInSurah) === q ||
        toArabicNumerals(a.numberInSurah) === q ||
        (a.tafseerText && a.tafseerText.toLowerCase().includes(q))
      );
    }

    return list;
  }, [surahAyahs, selectedAyahRange, ayahSearchQuery]);

  // Filtered Surahs for the Picker modal
  const filteredSurahsForPicker = useMemo(() => {
    if (!surahPickerSearch.trim()) return SURAHS_LIST;
    const q = surahPickerSearch.trim().toLowerCase();
    return SURAHS_LIST.filter(s => 
      s.name.toLowerCase().includes(q) ||
      String(s.number) === q ||
      toArabicNumerals(s.number) === q ||
      s.englishName.toLowerCase().includes(q)
    );
  }, [surahPickerSearch]);

  return (
    <div className="pb-24 pt-2 px-3 sm:px-4 max-w-lg mx-auto space-y-4 animate-fadeIn" dir="rtl">
      {/* Universal Action Bar: Zoom & Back to Home */}
      <DoorActionBar
        doorTitle="تفسير مختصر ابن كثير • الشيخ مصطفى العدوي"
        fontScale={fontScale}
        onChangeFontScale={onChangeFontScale}
        swipeHint="تصفح تفسير سور القرآن الـ ١١٤ كاملاً ⇆"
      />

      {/* Top Header Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#0a2346] via-[#0d2a52] to-[#123668] border-2 border-amber-400/40 text-white shadow-xl relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300/40 text-amber-300 flex items-center justify-center shrink-0 shadow-inner">
            <BookOpen className="w-6 h-6" />
          </div>

          <div className="text-right flex-1">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-[11px] font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>القرآن كاملاً • الصحيح المسند ومجرد من الإسرائيليات</span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold font-amiri text-white tracking-wide">
              مختصر تفسير ابن كثير للقرآن كاملاً
            </h2>
            <p className="text-xs text-sky-200 mt-0.5 font-medium">
              تحقيق واختصار: فضيلة الشيخ مصطفى العدوي (حفظه الله) • ١١٤ سورة
            </p>
          </div>
        </div>

        {/* Methodology Toggle Button & Favorites Quick Access */}
        <div className="mt-3 pt-3 border-t border-sky-500/30 flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={() => {
              playChime('click');
              setShowMethodology(!showMethodology);
            }}
            className="text-xs text-amber-300 hover:text-white flex items-center gap-1.5 font-bold transition-all active:scale-95 cursor-pointer"
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>{showMethodology ? 'إخفاء منهج الشيخ في الاختصار' : 'معالم منهج الشيخ مصطفى العدوي في الاختصار'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playChime('click');
                triggerHaptic('light');
                setShowFavoritesModal(true);
              }}
              title="عرض الآيات المفضلة المحفوظة"
              className="text-[11px] px-2.5 py-1 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/40 text-amber-300 font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <Bookmark className="w-3.5 h-3.5 fill-amber-300/30" />
              <span>المفضلة</span>
              {favorites.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black font-mono text-[10px]">
                  {toArabicNumerals(favorites.length)}
                </span>
              )}
            </button>

            <span className="text-[11px] text-sky-300 font-mono font-bold">
              ١١٤ سورة • ٦٢٣٦ آية
            </span>
          </div>
        </div>

        {/* Methodology Drawer */}
        {showMethodology && (
          <div className="mt-3.5 p-3.5 rounded-2xl bg-[#07162b]/95 border border-amber-400/30 text-right space-y-2.5 animate-fadeIn">
            <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-400" />
              <span>منهج فضيلة الشيخ مصطفى العدوي في تجريد تفسير ابن كثير:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {ADAWI_METHODOLOGY.map((m, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="font-bold text-sky-200 block mb-0.5">• {m.title}</span>
                  <p className="text-slate-300 text-[10px] leading-relaxed">{m.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main View Mode Switcher: Content vs Catalog Index */}
      <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#091b34] border border-sky-500/30 shadow-inner">
        <button
          onClick={() => {
            playChime('click');
            triggerHaptic('light');
            setActiveViewTab('content');
          }}
          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeViewTab === 'content'
              ? 'bg-gradient-to-r from-sky-600 to-blue-700 text-white shadow-md'
              : 'text-sky-300/80 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>تصفح سور القرآن كاملاً</span>
        </button>

        <button
          onClick={() => {
            playChime('click');
            triggerHaptic('light');
            setActiveViewTab('index');
          }}
          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeViewTab === 'index'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
              : 'text-amber-300/80 hover:text-amber-200'
          }`}
        >
          <BookmarkCheck className="w-4 h-4" />
          <span>فهرس السور الـ ١١٤</span>
        </button>
      </div>

      {/* Render Index View Mode */}
      {activeViewTab === 'index' ? (
        <div className="animate-fadeIn">
          <TafseerIndexView
            entries={all114Entries}
            selectedEntryKey={`${currentSurahNumber}_1 - ${currentSurahMeta.numberOfAyahs}`}
            onSelectEntry={handleSelectFromIndex}
            mode="embedded"
          />
        </div>
      ) : (
        /* Render Selected Surah Content Mode */
        <div className="space-y-4 animate-fadeIn">
          {/* Surah Bar with Next/Prev and Quick Picker */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0b213f] via-[#0e2c54] to-[#0b213f] border border-amber-400/40 text-white shadow-md flex items-center justify-between gap-2">
            <button
              onClick={() => handleChangeSurah('prev')}
              disabled={currentSurahNumber <= 1}
              title="السورة السابقة"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-sky-200 hover:text-white transition-all cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                playChime('click');
                setShowSurahPicker(true);
              }}
              className="flex-1 text-center py-1 px-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">
                  سورة رقم {toArabicNumerals(currentSurahMeta.number)}
                </span>
                <span className="text-[10px] text-sky-300">
                  {currentSurahMeta.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • {toArabicNumerals(currentSurahMeta.numberOfAyahs)} آية • الجزء {toArabicNumerals(currentSurahMeta.juz)}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-amiri text-white group-hover:text-amber-300 transition-colors flex items-center justify-center gap-1.5 mt-0.5">
                <span>سورة {currentSurahMeta.name}</span>
                <ChevronDown className="w-4 h-4 text-amber-400 group-hover:translate-y-0.5 transition-transform" />
              </h3>
            </button>

            <button
              onClick={() => handleChangeSurah('next')}
              disabled={currentSurahNumber >= 114}
              title="السورة التالية"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-sky-200 hover:text-white transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Sub-Tab Switcher: 'overview' vs 'ayahs' */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#07162b] border border-sky-800/60 shadow-inner text-xs">
            <button
              onClick={() => {
                playChime('click');
                triggerHaptic('light');
                setSurahViewMode('overview');
              }}
              className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                surahViewMode === 'overview'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-sm'
                  : 'text-amber-300/80 hover:text-white'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>مختصر السورة والوقفات التربوية</span>
            </button>

            <button
              onClick={() => {
                playChime('click');
                triggerHaptic('light');
                setSurahViewMode('ayahs');
              }}
              className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                surahViewMode === 'ayahs'
                  ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-sm'
                  : 'text-sky-300/80 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>تفسير آيات السورة آيةً آيةً ({toArabicNumerals(currentSurahMeta.numberOfAyahs)})</span>
            </button>
          </div>

          {/* Mode 1: Abridged Overview & Sheikh Al-Adawi's Pauses */}
          {surahViewMode === 'overview' ? (
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-[#edf4fc] via-[#e4effa] to-[#d6e5f7] dark:from-[#0d223f] dark:via-[#091a32] dark:to-[#061224] border-2 border-[#b8d4f4] dark:border-sky-500/40 text-[#0d345e] dark:text-sky-100 shadow-md space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#bfd8f5] dark:border-sky-500/30 pb-3">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(`«تفسير سورة ${currentSurahMeta.name} - مختصر ابن كثير للشيخ مصطفى العدوي»\n${currentSurahEntry.tafseerSummary}`, `surah_${currentSurahNumber}`)}
                    title="نسخ ملخص السورة"
                    className="p-2 rounded-xl bg-white/70 dark:bg-white/10 hover:bg-white border border-[#bfd8f5] dark:border-white/15 text-[#0d345e] dark:text-sky-200 transition-all active:scale-95 cursor-pointer"
                  >
                    {copiedId === `surah_${currentSurahNumber}` ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setSurahViewMode('ayahs')}
                    title="الانتقال لآيات السورة"
                    className="px-2.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <span>تفسير الآيات</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right">
                  <h3 className="font-bold text-base sm:text-lg text-[#092244] dark:text-white font-amiri">
                    سورة {currentSurahMeta.name}
                  </h3>
                  <span className="text-[11px] text-[#1b3d68] dark:text-sky-300 font-mono">
                    {currentSurahMeta.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • الجزء {toArabicNumerals(currentSurahMeta.juz)} • {toArabicNumerals(currentSurahMeta.numberOfAyahs)} آية
                  </span>
                </div>
              </div>

              {/* Core Theme Summary */}
              <div className="space-y-1.5 text-right">
                <h4 className="text-xs font-bold text-[#092244] dark:text-amber-300 flex items-center justify-end gap-1.5">
                  <span>المقصد الأسمى وخلاصة التفسير المصفى:</span>
                  <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                </h4>
                <p className="text-xs sm:text-sm text-[#0d345e] dark:text-slate-200 leading-relaxed font-amiri">
                  {currentSurahEntry.tafseerSummary}
                </p>
              </div>

              {/* Reasons of Revelation */}
              {currentSurahEntry.reasonsOfRevelation && (
                <div className="p-3 rounded-2xl bg-sky-100/70 dark:bg-sky-950/50 border border-sky-300 dark:border-sky-800 text-right space-y-1">
                  <span className="text-[11px] font-bold text-sky-800 dark:text-sky-300 block">
                    • سبب النزول ومعالم السورة:
                  </span>
                  <p className="text-xs text-[#0d345e] dark:text-sky-100 font-amiri leading-relaxed">
                    {currentSurahEntry.reasonsOfRevelation}
                  </p>
                </div>
              )}

              {/* Authentic Hadiths */}
              {currentSurahEntry.authenticHadiths && currentSurahEntry.authenticHadiths.length > 0 && (
                <div className="space-y-2 text-right">
                  <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-end gap-1.5">
                    <span>الأحاديث الصحيحة المرفوعة:</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </h4>
                  <div className="space-y-1.5">
                    {currentSurahEntry.authenticHadiths.map((h, i) => (
                      <div key={i} className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300/60 dark:border-emerald-800 text-xs font-amiri text-emerald-950 dark:text-emerald-100 leading-relaxed">
                        «{h}»
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Educational Pauses by Sheikh Mustafa Al-Adawi */}
              {currentSurahEntry.educationalPauses && currentSurahEntry.educationalPauses.length > 0 && (
                <div className="space-y-1.5 text-right pt-1">
                  <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center justify-end gap-1.5">
                    <span>وقفات تدبرية وتربوية لفضيلة الشيخ مصطفى العدوي:</span>
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  </h4>
                  <ul className="space-y-1.5 pr-2">
                    {currentSurahEntry.educationalPauses.map((pause, pIdx) => (
                      <li key={pIdx} className="text-xs text-[#0d345e] dark:text-slate-200 font-amiri leading-relaxed flex items-start justify-end gap-2">
                        <span>{pause}</span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Benefits */}
              {currentSurahEntry.keyBenefits && currentSurahEntry.keyBenefits.length > 0 && (
                <div className="pt-2 border-t border-[#bfd8f5] dark:border-sky-500/30 flex items-center justify-start gap-1.5 flex-wrap">
                  {currentSurahEntry.keyBenefits.map((b, bIdx) => (
                    <span 
                      key={bIdx}
                      className="text-[10px] px-2.5 py-1 rounded-full bg-white/80 dark:bg-white/10 border border-[#b8d4f4] dark:border-white/15 text-[#0d345e] dark:text-sky-200 font-bold"
                    >
                      ✓ {b}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Mode 2: Ayah-by-Ayah Tafseer Ibn Kathir for All Verses */
            <div className="space-y-3">
              {/* Surah Verses Toolbar with Search, Range Chunks, and Bulk Actions */}
              <div className="p-3 sm:p-4 rounded-2xl bg-[#091b33] border border-sky-500/30 shadow-md space-y-3">
                {/* Top Action Row: Bulk Expand + Pre-Cache Offline */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => handleToggleAllTafseers(true)}
                      className="py-1.5 px-2.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/40 text-amber-300 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>توسيع جميع التفاسير</span>
                    </button>

                    <button
                      onClick={() => handleToggleAllTafseers(false)}
                      className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sky-300 text-[11px] font-bold transition-all cursor-pointer"
                    >
                      طي الكل
                    </button>

                    <button
                      onClick={() => {
                        playChime('click');
                        triggerHaptic('light');
                        setShowFavoritesModal(true);
                      }}
                      title="عرض الآيات المفضلة"
                      className="py-1.5 px-2.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-amber-300/30" />
                      <span>مفضلة الآيات</span>
                      {favorites.length > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black font-mono">
                          {toArabicNumerals(favorites.length)}
                        </span>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={handlePreCacheSurah}
                    disabled={isPreCaching}
                    title="حفظ تفسير السورة كاملاً للقراءة بدون إنترنت"
                    className="py-1.5 px-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isPreCaching ? `جاري الحفظ ${toArabicNumerals(preCacheProgress)}%` : 'حفظ بدون إنترنت'}</span>
                  </button>
                </div>

                {/* Range Chunks Carousel for long Surahs (e.g. Al-Baqarah 286 ayahs) */}
                {ayahRangesList.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-sky-800/50">
                    <div className="flex items-center justify-between text-[10px] text-sky-300">
                      <span className="font-bold flex items-center gap-1">
                        <Filter className="w-3 h-3 text-amber-400" />
                        <span>تقسيم الآيات لسهولة التصفح:</span>
                      </span>
                      <span>{toArabicNumerals(currentSurahMeta.numberOfAyahs)} آية</span>
                    </div>

                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                      <button
                        onClick={() => {
                          playChime('click');
                          setSelectedAyahRange('all');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                          selectedAyahRange === 'all'
                            ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                            : 'bg-[#061427] text-sky-200 hover:bg-[#0c2448] border border-sky-800'
                        }`}
                      >
                        كل الآيات
                      </button>

                      {ayahRangesList.map(r => (
                        <button
                          key={r.key}
                          onClick={() => {
                            playChime('click');
                            setSelectedAyahRange(r.key);
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all shrink-0 cursor-pointer ${
                            selectedAyahRange === r.key
                              ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                              : 'bg-[#061427] text-sky-200 hover:bg-[#0c2448] border border-sky-800'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search & Jump Row */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-sky-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={ayahSearchQuery}
                      onChange={(e) => setAyahSearchQuery(e.target.value)}
                      placeholder="ابحث بكلمة أو آية داخل السورة..."
                      className="w-full pl-8 pr-9 py-2 rounded-xl bg-[#061427] border border-sky-500/30 text-white placeholder-sky-400/50 text-xs focus:outline-none focus:border-amber-400 transition-all text-right shadow-inner"
                    />
                    {ayahSearchQuery && (
                      <button
                        onClick={() => setAyahSearchQuery('')}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-sky-400 hover:text-white"
                      >
                        مسح
                      </button>
                    )}
                  </div>

                  {/* Quick Jump input */}
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      min={1}
                      max={currentSurahMeta.numberOfAyahs}
                      value={jumpToAyahInput}
                      onChange={(e) => setJumpToAyahInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleJumpToAyah();
                      }}
                      placeholder="آية #"
                      className="w-16 py-2 px-2 rounded-xl bg-[#061427] border border-sky-500/30 text-white placeholder-sky-400/50 text-xs focus:outline-none focus:border-amber-400 text-center font-mono"
                    />
                    <button
                      onClick={() => handleJumpToAyah()}
                      disabled={!jumpToAyahInput}
                      className="py-2 px-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white text-xs font-bold cursor-pointer"
                    >
                      انتقال
                    </button>
                  </div>
                </div>
              </div>

              {/* Bismillah Header (except Surah 9 At-Tawbah) */}
              {currentSurahNumber !== 9 && (
                <div className="py-3 px-4 rounded-2xl bg-[#0a1f38] border border-amber-400/30 text-center shadow-inner">
                  <p className="font-quran text-base sm:text-lg text-amber-200 font-bold">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                </div>
              )}

              {/* Loading state */}
              {isLoadingAyahs && (
                <div className="p-8 rounded-3xl bg-[#08182d] border border-sky-500/20 text-center space-y-2">
                  <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto" />
                  <p className="text-xs text-sky-200 font-medium">جاري تحميل آيات سورة {currentSurahMeta.name} المباركة...</p>
                </div>
              )}

              {/* Verses List */}
              {!isLoadingAyahs && filteredAyahs.map((ayah) => {
                const isPlaying = playingAyahNumber === ayah.numberInSurah;
                const isCopied = copiedId === `ayah_${ayah.numberInSurah}`;
                const isHighlighted = highlightedAyahNum === ayah.numberInSurah;
                const isFav = isAyahFavorited(currentSurahNumber, ayah.numberInSurah);

                return (
                  <div 
                    key={ayah.numberInSurah}
                    id={`ayah-${ayah.numberInSurah}`}
                    className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#edf4fc] via-[#e4effa] to-[#d6e5f7] dark:from-[#0d223f] dark:via-[#091a32] dark:to-[#061224] border text-[#0d345e] dark:text-sky-100 shadow-sm space-y-3 transition-all duration-300 ${
                      isHighlighted
                        ? 'border-amber-400 ring-4 ring-amber-400/60 shadow-xl scale-[1.01]'
                        : isFav
                          ? 'border-amber-400/80 shadow-md ring-1 ring-amber-400/30'
                          : 'border-[#b8d4f4] dark:border-sky-500/40'
                    }`}
                  >
                    {/* Verse Header & Actions */}
                    <div className="flex items-center justify-between border-b border-[#bfd8f5] dark:border-sky-500/20 pb-2.5">
                      <div className="flex items-center gap-1.5">
                        {/* Audio recitation button */}
                        <button
                          onClick={() => handlePlayAyahAudio(ayah.numberInSurah)}
                          title="استماع لتلاوة الآية"
                          className={`p-2 rounded-xl border transition-all cursor-pointer ${
                            isPlaying
                              ? 'bg-amber-400 text-slate-950 border-amber-400 animate-pulse'
                              : 'bg-white/70 dark:bg-white/10 hover:bg-white border-[#bfd8f5] dark:border-white/15 text-[#0d345e] dark:text-sky-200'
                          }`}
                        >
                          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>

                        {/* Favorite button */}
                        <button
                          onClick={() => handleToggleFavorite(ayah)}
                          title={isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                          className={`p-2 rounded-xl border transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
                            isFav
                              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border-amber-400 shadow-md ring-2 ring-amber-400/40'
                              : 'bg-white/70 dark:bg-white/10 hover:bg-white border-[#bfd8f5] dark:border-white/15 text-[#0d345e] dark:text-sky-200 hover:text-amber-400'
                          }`}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-slate-950 text-slate-950' : ''}`} />
                        </button>

                        {/* Copy button */}
                        <button
                          onClick={() => handleCopy(`سورة ${currentSurahMeta.name} - الآية [${ayah.numberInSurah}]:\n${ayah.text}\n\nتفسير ابن كثير:\n${ayah.tafseerText || 'تفسير القرآن العظيم'}`, `ayah_${ayah.numberInSurah}`)}
                          title="نسخ الآية والتفسير"
                          className="p-2 rounded-xl bg-white/70 dark:bg-white/10 hover:bg-white border border-[#bfd8f5] dark:border-white/15 text-[#0d345e] dark:text-sky-200 transition-all active:scale-95 cursor-pointer"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        {/* Copy verse text only */}
                        <button
                          onClick={() => handleCopy(`${ayah.text} ۝${toArabicNumerals(ayah.numberInSurah)} [سورة ${currentSurahMeta.name}]`, `ayah_text_${ayah.numberInSurah}`)}
                          title="نسخ نص الآية الكريمة فقط"
                          className="py-1 px-2 rounded-lg bg-white/50 dark:bg-white/5 hover:bg-white border border-sky-300 dark:border-white/10 text-[10px] text-sky-800 dark:text-sky-300 transition-all"
                        >
                          {copiedId === `ayah_text_${ayah.numberInSurah}` ? '✓ نُسخ' : 'نص الآية'}
                        </button>
                      </div>

                      {/* Ayah number badge with Surah indicator */}
                      <div className="flex items-center gap-1.5">
                        {isFav && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                            <Bookmark className="w-2.5 h-2.5 fill-amber-300" />
                            <span>مفضلة</span>
                          </span>
                        )}
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-sky-900/80 text-sky-200 border border-sky-700/50 font-mono">
                          الآية {toArabicNumerals(ayah.numberInSurah)}
                        </span>
                      </div>
                    </div>

                    {/* Holy Quran Verse Text */}
                    <div className="text-center py-2 px-1">
                      <p className="font-quran text-base sm:text-lg text-[#0c2448] dark:text-amber-100 leading-loose">
                        {ayah.text} ۝{toArabicNumerals(ayah.numberInSurah)}
                      </p>
                    </div>

                    {/* Tafseer Ibn Kathir Accordion Button */}
                    <button
                      onClick={() => handleToggleAyahTafseer(ayah.numberInSurah)}
                      className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        ayah.isExpanded
                          ? 'bg-amber-400/20 border-amber-400/40 text-amber-300 shadow-xs'
                          : 'bg-[#091b33] hover:bg-[#0c2448] border-sky-500/30 text-sky-200 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-amber-400" />
                        <span>تفسير الحافظ ابن كثير (الآية {toArabicNumerals(ayah.numberInSurah)})</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px]">
                        <span>{ayah.isExpanded ? 'إخفاء التفسير' : 'عرض التفسير'}</span>
                        {ayah.isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {/* Tafseer Content Container */}
                    {ayah.isExpanded && (
                      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#061427] border border-amber-400/30 text-right space-y-2 animate-fadeIn">
                        {ayah.isLoadingTafseer ? (
                          <div className="flex items-center justify-center gap-2 py-4 text-xs text-sky-200">
                            <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                            <span>جاري استدعاء تفسير ابن كثير للآية...</span>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between border-b border-sky-900/50 pb-1.5 text-[10px] text-amber-300">
                              <span className="flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                                <span>تفسير القرآن العظيم • تحقيق العدوي</span>
                              </span>
                              <span className="font-mono">{toArabicNumerals(ayah.numberInSurah)} / {toArabicNumerals(currentSurahMeta.numberOfAyahs)}</span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-amiri font-normal whitespace-pre-line">
                              {ayah.tafseerText || `تفسير وبيان الآية الكريمة: اشتملت على إثبات التوحيد والعمل الصالح وعظمة أمر الله تعالى وفق ما جاء في تفسير الحافظ ابن كثير.`}
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Surah Picker Modal (All 114 Surahs Selection) */}
      {showSurahPicker && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fadeIn" dir="rtl">
          <div className="w-full max-w-md bg-[#0a1e36] border-2 border-amber-400/50 rounded-3xl shadow-2xl p-4 sm:p-5 text-white space-y-3.5 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-sky-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold font-amiri text-white">اختر سورة من القرآن الكريم (١١٤ سورة)</h3>
              </div>
              <button
                onClick={() => setShowSurahPicker(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-sky-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input in Picker */}
            <div className="relative">
              <Search className="w-4 h-4 text-sky-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={surahPickerSearch}
                onChange={(e) => setSurahPickerSearch(e.target.value)}
                placeholder="ابحث باسم السورة أو رقمها..."
                className="w-full pl-8 pr-9 py-2.5 rounded-xl bg-[#061427] border border-sky-500/40 text-white placeholder-sky-400/50 text-xs focus:outline-none focus:border-amber-400 text-right"
              />
            </div>

            {/* Surahs List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar">
              {filteredSurahsForPicker.map((surah) => (
                <button
                  key={surah.number}
                  onClick={() => {
                    playChime('click');
                    triggerHaptic('selection');
                    setCurrentSurahNumber(surah.number);
                    setShowSurahPicker(false);
                  }}
                  className={`w-full text-right p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    surah.number === currentSurahNumber
                      ? 'bg-amber-400 text-slate-950 font-bold border-amber-400 shadow-md'
                      : 'bg-[#08182b] hover:bg-[#0d284a] border-sky-800/60 text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/10 border border-white/20 font-mono">
                      {toArabicNumerals(surah.number)}
                    </span>
                    <span className="text-xs font-bold font-amiri">سورة {surah.name}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-sky-300">
                    <span>{surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
                    <span>• {toArabicNumerals(surah.numberOfAyahs)} آية</span>
                    <span>• جـ {toArabicNumerals(surah.juz)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tafseer Favorites Modal */}
      {showFavoritesModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-fadeIn" dir="rtl">
          <div className="w-full max-w-lg bg-[#0a1e36] border-2 border-amber-400/50 rounded-3xl shadow-2xl p-4 sm:p-5 text-white space-y-4 max-h-[88vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-sky-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center">
                  <Bookmark className="w-4 h-4 fill-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold font-amiri text-white flex items-center gap-1.5">
                    <span>مفضلة آيات التفسير</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono font-bold">
                      {toArabicNumerals(favorites.length)}
                    </span>
                  </h3>
                  <p className="text-[10px] text-sky-300">الآيات المحفوظة للرجوع السريع وتدبر معانيها</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {favorites.length > 0 && (
                  <button
                    onClick={handleClearAllFavorites}
                    title="إفراغ المفضلة بالكامل"
                    className="p-1.5 px-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-300 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>إفراغ</span>
                  </button>
                )}

                <button
                  onClick={() => setShowFavoritesModal(false)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-sky-200 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search Input in Favorites */}
            {favorites.length > 0 && (
              <div className="relative">
                <Search className="w-4 h-4 text-sky-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={favoriteSearchQuery}
                  onChange={(e) => setFavoriteSearchQuery(e.target.value)}
                  placeholder="ابحث في الآيات المفضلة أو باسم السورة..."
                  className="w-full pl-8 pr-9 py-2.5 rounded-xl bg-[#061427] border border-sky-500/40 text-white placeholder-sky-400/50 text-xs focus:outline-none focus:border-amber-400 text-right"
                />
                {favoriteSearchQuery && (
                  <button
                    onClick={() => setFavoriteSearchQuery('')}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-sky-400 hover:text-white"
                  >
                    مسح
                  </button>
                )}
              </div>
            )}

            {/* Favorites List Container */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 custom-scrollbar">
              {favorites.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-amber-400/10 border-2 border-dashed border-amber-400/30 text-amber-300 flex items-center justify-center mx-auto">
                    <Bookmark className="w-8 h-8 opacity-60" />
                  </div>
                  <h4 className="text-sm font-bold text-amber-200">لم تقم بحفظ أي آية في المفضلة بعد</h4>
                  <p className="text-xs text-sky-200/80 max-w-xs mx-auto leading-relaxed">
                    اضغط على أيقونة الإشارة المرجعية (🔖) بجوار أي آية أثناء تصفح التفسير لحفظها والرجوع إلى تفسير ابن كثير الخاص بها بسهولة في أي وقت.
                  </p>
                </div>
              ) : filteredFavorites.length === 0 ? (
                <div className="py-10 text-center text-xs text-sky-300">
                  لا توجد آيات مطابقة لبحثك في المفضلة.
                </div>
              ) : (
                filteredFavorites.map((fav) => {
                  const isCopied = copiedId === `fav_${fav.id}`;

                  return (
                    <div
                      key={fav.id}
                      className="p-4 rounded-2xl bg-gradient-to-b from-[#0e2747] to-[#091b33] border border-amber-400/30 hover:border-amber-400/70 transition-all space-y-2.5 shadow-md"
                    >
                      {/* Card Header: Surah & Ayah badge */}
                      <div className="flex items-center justify-between pb-2 border-b border-sky-800/60">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleRemoveFavorite(fav.id)}
                            title="إزالة من المفضلة"
                            className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 border border-rose-400/30 text-rose-300 hover:text-rose-200 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleCopy(`سورة ${fav.surahName} - الآية [${fav.ayahNumber}]:\n${fav.ayahText}\n\nتفسير ابن كثير:\n${fav.tafseerText || 'تفسير القرآن العظيم'}`, `fav_${fav.id}`)}
                            title="نسخ الآية والتفسير"
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-sky-200 hover:text-white transition-all cursor-pointer"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40 font-mono">
                            الآية {toArabicNumerals(fav.ayahNumber)}
                          </span>
                          <span className="text-xs font-bold font-amiri text-white">
                            سورة {fav.surahName}
                          </span>
                        </div>
                      </div>

                      {/* Verse Text */}
                      <p className="font-quran text-sm sm:text-base text-amber-100 text-center leading-loose py-1">
                        {fav.ayahText} ۝{toArabicNumerals(fav.ayahNumber)}
                      </p>

                      {/* Tafseer Excerpt */}
                      {fav.tafseerText && (
                        <div className="p-2.5 rounded-xl bg-[#061427] border border-sky-900/60 text-right space-y-1">
                          <span className="text-[10px] font-bold text-amber-300 block">
                            • مختصر تفسير ابن كثير:
                          </span>
                          <p className="text-[11px] text-sky-100 leading-relaxed font-amiri line-clamp-3">
                            {fav.tafseerText}
                          </p>
                        </div>
                      )}

                      {/* Jump Button */}
                      <button
                        onClick={() => handleJumpFromFavorite(fav)}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white text-xs font-bold transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>الانتقال لموضع الآية وتفسيرها في سورة {fav.surahName}</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 animate-fadeIn border border-amber-300">
          <BookmarkCheck className="w-4 h-4 text-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

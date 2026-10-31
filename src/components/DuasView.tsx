import React, { useState, useMemo, useRef } from 'react';
import { 
  BookCheck, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Search, 
  Copy, 
  Check, 
  Share2, 
  ChevronLeft, 
  RotateCcw, 
  CheckCircle2, 
  Heart, 
  Flame, 
  ArrowRight,
  Download
} from 'lucide-react';
import { DuaItem, DuaCategoryType, Bookmark } from '../types';
import { DUA_CATEGORIES, DUAS_LIST } from '../data/duasData';
import { playChime, triggerHaptic } from '../utils/audio';
import { loadBookmarks, saveBookmarks } from '../utils/storage';
import { toArabicNumerals } from '../data/quranData';
import { DoorActionBar } from './DoorActionBar';
import { UniversalExportModal } from './UniversalExportModal';
import { generateDuasExport } from '../utils/universalExport';

interface DuasViewProps {
  onBack?: () => void;
  onOpenMushafPage?: (page: number) => void;
  fontScale?: number;
  onChangeFontScale?: (scale: number) => void;
}

export const DuasView: React.FC<DuasViewProps> = ({ 
  onBack, 
  onOpenMushafPage,
  fontScale = 100,
  onChangeFontScale
}) => {
  const [selectedCategory, setSelectedCategory] = useState<DuaCategoryType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [counters, setCounters] = useState<Record<string, number>>({});
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => loadBookmarks());
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Swipe handling
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const categoriesList: (DuaCategoryType | 'all')[] = ['all', ...DUA_CATEGORIES.map(c => c.id)];
  const currentCatIndex = categoriesList.indexOf(selectedCategory);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        // Swipe left -> next category
        const nextIdx = (currentCatIndex + 1) % categoriesList.length;
        setSelectedCategory(categoriesList[nextIdx]);
        playChime('click');
        triggerHaptic('light');
      } else {
        // Swipe right -> prev category
        const prevIdx = (currentCatIndex - 1 + categoriesList.length) % categoriesList.length;
        setSelectedCategory(categoriesList[prevIdx]);
        playChime('click');
        triggerHaptic('light');
      }
    }
  };

  const favoriteIds = useMemo(() => {
    return new Set(
      bookmarks
        .filter((b) => b.type === 'dua')
        .map((b) => String(b.targetId))
    );
  }, [bookmarks]);

  const toggleFavorite = (dua: DuaItem) => {
    triggerHaptic('medium');
    playChime('click');
    const isFav = favoriteIds.has(dua.id);
    let updated: Bookmark[];
    if (isFav) {
      updated = bookmarks.filter((b) => !(b.type === 'dua' && String(b.targetId) === dua.id));
    } else {
      const newBm: Bookmark = {
        id: `bm-dua-${dua.id}-${Date.now()}`,
        type: 'dua',
        title: dua.title,
        subtitle: dua.source,
        targetId: dua.id,
        createdAt: Date.now()
      };
      updated = [newBm, ...bookmarks];
    }
    setBookmarks(updated);
    saveBookmarks(updated);
  };

  const handleCopy = (dua: DuaItem) => {
    triggerHaptic('light');
    playChime('click');
    const textToCopy = `${dua.title}\n\n${dua.arabicText}\n\nالمصدر والتخريج: ${dua.source} [${dua.grade || ''}]\n${dua.benefit ? `الفضل: ${dua.benefit}\n` : ''}من تطبيق جنّة الرحمن`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(dua.id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  const handleShare = (dua: DuaItem) => {
    triggerHaptic('light');
    playChime('click');
    const textToShare = `${dua.title}\n\n${dua.arabicText}\n\n${dua.source} [${dua.grade || ''}]\nتطبيق جنّة الرحمن`;
    if (navigator.share) {
      navigator.share({
        title: dua.title,
        text: textToShare
      }).catch(() => {});
    } else {
      handleCopy(dua);
    }
  };

  const incrementCounter = (dua: DuaItem) => {
    const max = dua.repeatCount || 1;
    const current = counters[dua.id] || 0;
    if (current < max) {
      const next = current + 1;
      setCounters((prev) => ({ ...prev, [dua.id]: next }));
      triggerHaptic('selection');
      if (next === max) {
        playChime('success');
      } else {
        playChime('click');
      }
    }
  };

  const resetCounter = (duaId: string) => {
    triggerHaptic('light');
    setCounters((prev) => ({ ...prev, [duaId]: 0 }));
  };

  // Filtered Duas
  const filteredDuas = useMemo(() => {
    return DUAS_LIST.filter((dua) => {
      if (onlyFavorites && !favoriteIds.has(dua.id)) return false;
      if (selectedCategory !== 'all' && dua.category !== selectedCategory) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.trim().toLowerCase();
      return (
        dua.title.toLowerCase().includes(q) ||
        dua.arabicText.toLowerCase().includes(q) ||
        dua.source.toLowerCase().includes(q) ||
        (dua.benefit && dua.benefit.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, searchQuery, onlyFavorites, favoriteIds]);

  const selectedCatTitle = selectedCategory === 'all' 
    ? 'جميع الأدعية المأثورة' 
    : (DUA_CATEGORIES.find(c => c.id === selectedCategory)?.title || 'الأدعية المأثورة');

  const exportData = generateDuasExport(selectedCatTitle, filteredDuas);

  return (
    <div 
      className="pb-24 pt-2 px-3 sm:px-4 max-w-lg mx-auto space-y-4 animate-fadeIn"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Universal Action Bar: Zoom, Swipe Guidance, and Export */}
      <DoorActionBar
        doorTitle="باب الأدعية المأثورة ونصح الشباب"
        fontScale={fontScale}
        onChangeFontScale={onChangeFontScale}
        onOpenExport={() => setIsExportOpen(true)}
        swipeHint="اسحب يميناً ويساراً للتنقل بين الأبواب ⇆"
      />

      {/* Header Banner with Islamic Blue Ambiance */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c2448] via-[#10335e] to-[#184882] text-white p-5 sm:p-6 shadow-md border border-sky-400/30">
        <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-sky-400/15 border-[24px] border-sky-300/10 pointer-events-none" />

        <div className="flex items-center justify-between relative z-10 mb-3">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                aria-label="رجوع"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center transition-all active:scale-95 text-white"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => {
                setOnlyFavorites(!onlyFavorites);
                playChime('click');
              }}
              aria-label="عرض المفضلة"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                onlyFavorites
                  ? 'bg-sky-400 text-slate-900 border-sky-300 shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-slate-900' : ''}`} />
              <span>المفضلة</span>
              {favoriteIds.size > 0 && (
                <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center font-bold">
                  {toArabicNumerals(favoriteIds.size)}
                </span>
              )}
            </button>
          </div>

          <div className="text-right">
            <span className="inline-block text-sky-200 text-xs font-semibold bg-white/10 px-2.5 py-0.5 rounded-full mb-1">
              مُحقّقة • أدعية وهمّة الشباب
            </span>
            <h1 className="text-xl font-bold font-amiri leading-tight">الأدعية المأثورة ونصح الشباب</h1>
          </div>
        </div>

        <p className="text-xs text-sky-100/90 text-right leading-relaxed relative z-10">
          أدعية نبوية للشباب في التوفيق والعفة وتفريج الهموم، ودعاء ختم القرآن، والرقية الشرعية المحققة من الصحاح والسنن.
        </p>

        {/* Quick Search Bar */}
        <div className="mt-4 relative z-10">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن دعاء، سورة، أو كلمة..."
              className="w-full h-11 pr-10 pl-4 rounded-2xl bg-white/15 dark:bg-black/30 text-white placeholder-sky-200/70 text-xs text-right border border-white/20 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all backdrop-blur-sm"
            />
            <Search className="w-4 h-4 text-sky-200 absolute right-3.5 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 text-xs text-sky-200 hover:text-white px-1.5 py-0.5"
              >
                مسح
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Pills Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        <button
          onClick={() => {
            setSelectedCategory('all');
            playChime('click');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            selectedCategory === 'all'
              ? 'bg-[#0284C7] text-white shadow-sm'
              : 'bg-white dark:bg-[#0A192F] text-slate-700 dark:text-slate-300 border border-sky-100 dark:border-sky-950 hover:border-sky-400'
          }`}
        >
          <span>الكل ({toArabicNumerals(DUAS_LIST.length)})</span>
        </button>

        {DUA_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const count = DUAS_LIST.filter((d) => d.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                playChime('click');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#0284C7] text-white shadow-sm'
                  : 'bg-white dark:bg-[#0A192F] text-slate-700 dark:text-slate-300 border border-sky-100 dark:border-sky-950 hover:border-sky-400'
              }`}
            >
              <span>{cat.title}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {toArabicNumerals(count)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Overview Card (When a specific category is selected) */}
      {selectedCategory !== 'all' && (
        <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-[#0c2448] border border-sky-200 dark:border-sky-800 text-right flex items-center justify-between">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#0284C7] text-white">
            {DUA_CATEGORIES.find((c) => c.id === selectedCategory)?.badge}
          </span>
          <div className="text-right">
            <h3 className="text-xs font-bold text-sky-800 dark:text-sky-300">
              {DUA_CATEGORIES.find((c) => c.id === selectedCategory)?.title}
            </h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              {DUA_CATEGORIES.find((c) => c.id === selectedCategory)?.subtitle}
            </p>
          </div>
        </div>
      )}

      {/* Duas List */}
      <div className="space-y-4">
        {filteredDuas.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#0A192F] rounded-3xl border border-sky-100 dark:border-sky-950 p-6 space-y-3">
            <BookCheck className="w-12 h-12 text-slate-400 mx-auto opacity-50" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">لم يتم العثور على أدعية</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {onlyFavorites
                ? 'لم تقم بحفظ أي دعاء في المفضلة بعد. اضغط على أيقونة الحفظ بجانب أي دعاء لإضافته هنا.'
                : 'جرب البحث بكلمات أخرى أو اختر قسماً مختلفاً.'}
            </p>
            {onlyFavorites && (
              <button
                onClick={() => setOnlyFavorites(false)}
                className="mt-2 text-xs font-bold text-[#0284C7] dark:text-sky-400 underline cursor-pointer"
              >
                عرض كل الأدعية
              </button>
            )}
          </div>
        ) : (
          filteredDuas.map((dua) => {
            const isFav = favoriteIds.has(dua.id);
            const isCopied = copiedId === dua.id;
            const maxRepeat = dua.repeatCount || 1;
            const currentCount = counters[dua.id] || 0;
            const isCompleted = currentCount >= maxRepeat;

            return (
              <div
                key={dua.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#0A192F] border border-sky-100 dark:border-sky-950 shadow-sm hover:shadow transition-all space-y-3.5 relative overflow-hidden text-right"
              >
                {/* Top Card Meta Bar */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  {/* Action Icons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleFavorite(dua)}
                      aria-label="حفظ في المفضلة"
                      title="حفظ في المفضلة"
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        isFav
                          ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
                          : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                    </button>

                    <button
                      onClick={() => handleCopy(dua)}
                      aria-label="نسخ الدعاء"
                      title="نسخ الدعاء"
                      className="w-8 h-8 rounded-lg text-slate-400 hover:text-[#0284C7] hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-all cursor-pointer"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-sky-600" /> : <Copy className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleShare(dua)}
                      aria-label="مشاركة الدعاء"
                      title="مشاركة الدعاء"
                      className="w-8 h-8 rounded-lg text-slate-400 hover:text-[#0284C7] hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-all cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title & Badge */}
                  <div className="text-right flex items-center gap-2">
                    {dua.grade && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                        {dua.grade}
                      </span>
                    )}
                    <h2 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {dua.title}
                    </h2>
                  </div>
                </div>

                {/* Dua Arabic Text */}
                <div className="text-right py-1">
                  <p className="text-base sm:text-lg font-amiri font-bold leading-loose text-slate-900 dark:text-sky-50 select-text">
                    {dua.arabicText}
                  </p>
                </div>

                {/* Verification & Source */}
                <div className="p-3 rounded-2xl bg-sky-50/50 dark:bg-[#07172C] border border-sky-100 dark:border-sky-900/60 text-right space-y-1.5">
                  <div className="flex items-center justify-end gap-1.5 text-xs text-[#0284C7] dark:text-sky-300 font-bold">
                    <span>{dua.source}</span>
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>

                  {dua.benefit && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      <span className="font-semibold text-slate-900 dark:text-white">الفضل والمناسبة: </span>
                      {dua.benefit}
                    </p>
                  )}

                  {dua.surahInfo && onOpenMushafPage && (
                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => {
                          playChime('click');
                          onOpenMushafPage((dua.surahInfo as any).page || 1);
                        }}
                        className="text-[11px] font-bold text-[#0284C7] dark:text-sky-300 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>تلاوة في المصحف ({dua.surahInfo.surahName} - آية {toArabicNumerals(dua.surahInfo.ayahNumber)})</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Repeat Counter Button */}
                {maxRepeat > 1 && (
                  <div className="pt-1 flex items-center justify-between">
                    <button
                      onClick={() => resetCounter(dua.id)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>إعادة</span>
                    </button>

                    <button
                      onClick={() => incrementCounter(dua)}
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-xs cursor-pointer ${
                        isCompleted
                          ? 'bg-sky-700 text-white cursor-default'
                          : 'bg-[#0284C7] hover:bg-sky-500 text-white'
                      }`}
                    >
                      <span>{isCompleted ? 'تم بحمد الله' : 'كرّر الدعاء'}</span>
                      <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                        {toArabicNumerals(currentCount)}/{toArabicNumerals(maxRepeat)}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Universal Export Modal */}
      <UniversalExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        payload={exportData}
      />
    </div>
  );
};

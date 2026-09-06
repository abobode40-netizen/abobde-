import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookCheck, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Search, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Share2, 
  Bookmark as BookmarkIcon, 
  BookmarkCheck,
  ChevronLeft,
  RotateCcw,
  CheckCircle2,
  Heart,
  Flame,
  ArrowRight
} from 'lucide-react';
import { DuaItem, DuaCategoryType, Bookmark } from '../types';
import { DUA_CATEGORIES, DUAS_LIST } from '../data/duasData';
import { speakArabicText, stopSpeech } from '../utils/speech';
import { playChime, triggerHaptic } from '../utils/audio';
import { loadBookmarks, saveBookmarks } from '../utils/storage';
import { toArabicNumerals } from '../data/quranData';

interface DuasViewProps {
  onBack?: () => void;
  onOpenMushafPage?: (page: number) => void;
}

export const DuasView: React.FC<DuasViewProps> = ({ onBack, onOpenMushafPage }) => {
  const [selectedCategory, setSelectedCategory] = useState<DuaCategoryType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingDuaId, setPlayingDuaId] = useState<string | null>(null);
  const [counters, setCounters] = useState<Record<string, number>>({});
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => loadBookmarks());
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

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

  const handleToggleSpeech = (dua: DuaItem) => {
    triggerHaptic('light');
    if (playingDuaId === dua.id) {
      stopSpeech();
      setPlayingDuaId(null);
    } else {
      stopSpeech();
      setPlayingDuaId(dua.id);
      playChime('click');
      speakArabicText(dua.arabicText, {
        onEnd: () => setPlayingDuaId(null),
        onError: () => setPlayingDuaId(null),
      });
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
        playChime('streak');
      } else {
        playChime('pop');
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

  return (
    <div className="pb-24 pt-3 px-4 max-w-lg mx-auto space-y-5 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D5944] via-[#126A52] to-[#1E7D63] text-white p-6 shadow-md islamic-border">
        <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-amber-400/10 border-[24px] border-amber-300/15 pointer-events-none" />

        <div className="flex items-center justify-between relative z-10 mb-4">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                aria-label="رجوع"
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center transition-all active:scale-95 text-white"
              >
                <ArrowRight className="w-5 h-5" />
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
                  ? 'bg-amber-400 text-emerald-950 border-amber-300 shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-emerald-950' : ''}`} />
              <span>المفضلة</span>
              {favoriteIds.size > 0 && (
                <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center font-bold">
                  {toArabicNumerals(favoriteIds.size)}
                </span>
              )}
            </button>
          </div>

          <div className="text-right">
            <span className="inline-block text-amber-200 text-xs font-semibold bg-white/10 px-2.5 py-0.5 rounded-full mb-1">
              محققة وموثقة
            </span>
            <h1 className="text-xl font-bold font-amiri leading-tight">باب الأدعية المأثورة</h1>
          </div>
        </div>

        <p className="text-xs text-emerald-100 text-right leading-relaxed relative z-10">
          دعاء ختم القرآن المبارك، وجوامع التضرع من آيات التنزيل وأصح ما ثبت عن النبي ﷺ مع التخريج والبيان.
        </p>

        {/* Quick Search Bar */}
        <div className="mt-4 relative z-10">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن دعاء، سورة، أو كلمة..."
              className="w-full h-11 pr-10 pl-4 rounded-2xl bg-white/15 dark:bg-black/25 text-white placeholder-emerald-100/70 text-xs text-right border border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-300/60 transition-all backdrop-blur-sm"
            />
            <Search className="w-4 h-4 text-emerald-100 absolute right-3.5 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 text-xs text-emerald-200 hover:text-white px-1.5 py-0.5"
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
              ? 'bg-[#0F6B50] text-white shadow-sm'
              : 'bg-white dark:bg-[#1A2621] text-[#4A5568] dark:text-[#CBD5E1] border border-[#E5DDCF] dark:border-[#2A3C34] hover:border-[#0F6B50]'
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
                  ? 'bg-[#0F6B50] text-white shadow-sm'
                  : 'bg-white dark:bg-[#1A2621] text-[#4A5568] dark:text-[#CBD5E1] border border-[#E5DDCF] dark:border-[#2A3C34] hover:border-[#0F6B50]'
              }`}
            >
              <span>{cat.title}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-[#23312B] text-gray-500 dark:text-gray-400'
              }`}>
                {toArabicNumerals(count)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Overview Card (When a specific category is selected) */}
      {selectedCategory !== 'all' && (
        <div className="p-3.5 rounded-2xl bg-[#F0FDF4] dark:bg-[#132B22] border border-[#BBF7D0] dark:border-[#1E4E3B] text-right flex items-center justify-between">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#0F6B50] text-white">
            {DUA_CATEGORIES.find((c) => c.id === selectedCategory)?.badge}
          </span>
          <div className="text-right">
            <h3 className="text-xs font-bold text-[#0F6B50] dark:text-[#34D399]">
              {DUA_CATEGORIES.find((c) => c.id === selectedCategory)?.title}
            </h3>
            <p className="text-[11px] text-[#4B5563] dark:text-[#9CA3AF]">
              {DUA_CATEGORIES.find((c) => c.id === selectedCategory)?.subtitle}
            </p>
          </div>
        </div>
      )}

      {/* Duas List */}
      <div className="space-y-4">
        {filteredDuas.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#1A2621] rounded-3xl border border-[#E5DDCF] dark:border-[#2A3C34] p-6 space-y-3">
            <BookCheck className="w-12 h-12 text-[#94A3B8] mx-auto opacity-50" />
            <h3 className="font-bold text-sm text-[#1F2937] dark:text-white">لم يتم العثور على أدعية</h3>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              {onlyFavorites
                ? 'لم تقم بحفظ أي دعاء في المفضلة بعد. اضغط على أيقونة الحفظ بجانب أي دعاء لإضافته هنا.'
                : 'جرب البحث بكلمات أخرى أو اختر قسماً مختلفاً.'}
            </p>
            {onlyFavorites && (
              <button
                onClick={() => setOnlyFavorites(false)}
                className="mt-2 text-xs font-bold text-[#0F6B50] dark:text-[#2DD4BF] underline"
              >
                عرض كل الأدعية
              </button>
            )}
          </div>
        ) : (
          filteredDuas.map((dua) => {
            const isFav = favoriteIds.has(dua.id);
            const isCopied = copiedId === dua.id;
            const isPlaying = playingDuaId === dua.id;
            const maxRepeat = dua.repeatCount || 1;
            const currentCount = counters[dua.id] || 0;
            const isCompleted = currentCount >= maxRepeat;

            return (
              <div
                key={dua.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#1A2621] border border-[#E5DDCF] dark:border-[#2A3C34] shadow-sm hover:shadow transition-all space-y-3.5 relative overflow-hidden"
              >
                {/* Top Card Meta Bar */}
                <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800/60 pb-3">
                  {/* Action Icons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleFavorite(dua)}
                      aria-label="حفظ في المفضلة"
                      title="حفظ في المفضلة"
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        isFav
                          ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
                          : 'text-gray-400 hover:text-rose-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                    </button>

                    <button
                      onClick={() => handleCopy(dua)}
                      aria-label="نسخ الدعاء"
                      title="نسخ الدعاء"
                      className="w-8 h-8 rounded-lg text-gray-400 hover:text-[#0F6B50] hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-all"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleShare(dua)}
                      aria-label="مشاركة الدعاء"
                      title="مشاركة الدعاء"
                      className="w-8 h-8 rounded-lg text-gray-400 hover:text-[#0F6B50] hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-all"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleToggleSpeech(dua)}
                      aria-label="الاستماع للدعاء"
                      title="الاستماع للدعاء"
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        isPlaying
                          ? 'text-white bg-[#0F6B50] animate-pulse'
                          : 'text-gray-400 hover:text-[#0F6B50] hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Title & Badge */}
                  <div className="text-right flex items-center gap-2">
                    {dua.grade && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#0F6B50] dark:text-[#34D399] border border-emerald-200/60 dark:border-emerald-800/60">
                        {dua.grade}
                      </span>
                    )}
                    <h2 className="text-xs font-bold text-[#1E293B] dark:text-white line-clamp-1">
                      {dua.title}
                    </h2>
                  </div>
                </div>

                {/* Dua Arabic Text */}
                <div className="text-right py-1">
                  <p className="text-base sm:text-lg font-amiri font-bold leading-loose text-[#0F291E] dark:text-[#E2E8F0] select-text">
                    {dua.arabicText}
                  </p>
                </div>

                {/* Verification & Source */}
                <div className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#14201A] border border-[#E2E8F0] dark:border-[#22332A] text-right space-y-1.5">
                  <div className="flex items-center justify-end gap-1.5 text-xs text-[#0F6B50] dark:text-[#34D399] font-bold">
                    <span>{dua.source}</span>
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>

                  {dua.benefit && (
                    <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                      <span className="font-semibold text-[#1E293B] dark:text-gray-200">الفضل والمناسبة: </span>
                      {dua.benefit}
                    </p>
                  )}

                  {dua.surahInfo && onOpenMushafPage && (
                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => {
                          playChime('click');
                          // Calculate approximate page or navigate to Quran
                          onOpenMushafPage(dua.surahInfo?.ayahNumber ? Math.max(1, Math.min(604, Math.ceil(dua.surahInfo.surahNumber * 5))) : 1);
                        }}
                        className="text-[11px] font-bold text-[#0F6B50] dark:text-[#2DD4BF] hover:underline flex items-center gap-1"
                      >
                        <span>فتح سورة {dua.surahInfo.surahName} في المصحف</span>
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Interactive Counter (If repeatCount > 1 or for habit tracking) */}
                {maxRepeat > 1 && (
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => resetCounter(dua.id)}
                      title="إعادة ضبط العداد"
                      className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => incrementCounter(dua)}
                        disabled={isCompleted}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isCompleted
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                            : 'bg-[#0F6B50] text-white hover:bg-[#128162] active:scale-95 shadow-sm'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>اكتمل التكرار</span>
                          </>
                        ) : (
                          <>
                            <Flame className="w-3.5 h-3.5 text-amber-300" />
                            <span>
                              التكرار ({toArabicNumerals(currentCount)} / {toArabicNumerals(maxRepeat)})
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

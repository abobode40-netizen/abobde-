import React, { useState, useMemo, useRef } from 'react';
import { 
  Sparkles, 
  Search, 
  Copy, 
  Check, 
  Share2, 
  Heart, 
  ArrowRight, 
  BookOpen, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Quote,
  Lightbulb,
  Download
} from 'lucide-react';
import { MishkatLesson, Bookmark } from '../types';
import { MISHKAT_CATEGORIES, MISHKAT_LESSONS } from '../data/mishkatData';
import { playChime, triggerHaptic } from '../utils/audio';
import { loadBookmarks, saveBookmarks } from '../utils/storage';
import { toArabicNumerals } from '../data/quranData';
import { DoorActionBar } from './DoorActionBar';
import { UniversalExportModal } from './UniversalExportModal';
import { generateMishkatExport } from '../utils/universalExport';

interface MishkatAlNoorViewProps {
  onBack?: () => void;
  onNavigateToTab?: (tab: any) => void;
  fontScale?: number;
  onChangeFontScale?: (scale: number) => void;
}

export const MishkatAlNoorView: React.FC<MishkatAlNoorViewProps> = ({ 
  onBack, 
  onNavigateToTab,
  fontScale = 100,
  onChangeFontScale
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => loadBookmarks());
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [expandedStoryIds, setExpandedStoryIds] = useState<Record<string, boolean>>({});
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Swipe gesture handling
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const categoriesList = ['all', ...MISHKAT_CATEGORIES.map(c => c.id)];
  const currentCategoryIdx = categoriesList.indexOf(selectedCategory);

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
        const nextIdx = (currentCategoryIdx + 1) % categoriesList.length;
        setSelectedCategory(categoriesList[nextIdx]);
        playChime('click');
        triggerHaptic('light');
      } else {
        // Swipe right -> prev category
        const prevIdx = (currentCategoryIdx - 1 + categoriesList.length) % categoriesList.length;
        setSelectedCategory(categoriesList[prevIdx]);
        playChime('click');
        triggerHaptic('light');
      }
    }
  };

  const favoriteIds = useMemo(() => {
    return new Set(
      bookmarks
        .filter((b) => b.type === 'mishkat')
        .map((b) => String(b.targetId))
    );
  }, [bookmarks]);

  const toggleFavorite = (lesson: MishkatLesson) => {
    triggerHaptic('medium');
    playChime('click');
    const isFav = favoriteIds.has(lesson.id);
    let updated: Bookmark[];
    if (isFav) {
      updated = bookmarks.filter((b) => !(b.type === 'mishkat' && String(b.targetId) === lesson.id));
    } else {
      const newBm: Bookmark = {
        id: `bm-mishkat-${lesson.id}-${Date.now()}`,
        type: 'mishkat',
        title: lesson.title,
        subtitle: lesson.categoryTitle,
        targetId: lesson.id,
        createdAt: Date.now()
      };
      updated = [newBm, ...bookmarks];
    }
    setBookmarks(updated);
    saveBookmarks(updated);
  };

  const handleCopy = (lesson: MishkatLesson) => {
    triggerHaptic('light');
    playChime('click');
    const textToCopy = `*${lesson.title}*\n[${lesson.categoryTitle}]\n\n${lesson.storyText}\n\nالمصدر والتحقيق: ${lesson.authenticitySource} (${lesson.authenticityGrade})\n\nالقبس العملي للشباب: ${lesson.practicalTakeaway}\n\nوصية نبوية: ${lesson.propheticGuidance}\n\nخطوة عملية: ${lesson.actionTip}\n\nمن مشكاة النور - تطبيق جنّة الرحمن`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(lesson.id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  const handleShare = (lesson: MishkatLesson) => {
    triggerHaptic('light');
    playChime('click');
    const textToShare = `${lesson.title}\n\n${lesson.summary}\n\nالقبس للشباب: ${lesson.practicalTakeaway}\n\nمن مشكاة النور - تطبيق جنّة الرحمن`;
    if (navigator.share) {
      navigator.share({
        title: lesson.title,
        text: textToShare
      }).catch(() => {});
    } else {
      handleCopy(lesson);
    }
  };

  const toggleExpandStory = (id: string) => {
    triggerHaptic('selection');
    setExpandedStoryIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filtered Lessons
  const filteredLessons = useMemo(() => {
    return MISHKAT_LESSONS.filter((lesson) => {
      if (onlyFavorites && !favoriteIds.has(lesson.id)) return false;
      if (selectedCategory !== 'all' && lesson.category !== selectedCategory) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.trim().toLowerCase();
      return (
        lesson.title.toLowerCase().includes(q) ||
        lesson.summary.toLowerCase().includes(q) ||
        lesson.storyText.toLowerCase().includes(q) ||
        lesson.practicalTakeaway.toLowerCase().includes(q) ||
        lesson.authenticitySource.toLowerCase().includes(q)
      );
    });
  }, [selectedCategory, searchQuery, onlyFavorites, favoriteIds]);

  const selectedCategoryTitle = selectedCategory === 'all'
    ? 'جميع قبسات السيرة النبوية الشريفة'
    : (MISHKAT_CATEGORIES.find(c => c.id === selectedCategory)?.title || 'مشكاة النور');

  const exportData = generateMishkatExport(selectedCategoryTitle, filteredLessons);

  return (
    <div 
      className="pb-24 pt-2 px-3 sm:px-4 max-w-lg mx-auto space-y-4 animate-fadeIn"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Universal Action Bar: Zoom, Swipe Guidance, and Export */}
      <DoorActionBar
        doorTitle="باب مشكاة النور والسيرة النبوية"
        fontScale={fontScale}
        onChangeFontScale={onChangeFontScale}
        onOpenExport={() => setIsExportOpen(true)}
        swipeHint="اسحب يميناً ويساراً للتنقل بين الأبواب ⇆"
      />

      {/* Header Card with Royal Islamic Blue Ambiance */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c2448] via-[#10335e] to-[#184882] text-white p-5 sm:p-6 shadow-md border border-sky-400/30">
        <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-sky-400/15 blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

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
              قبسات شريفة • هداية وهمّة الشباب
            </span>
            <h1 className="text-xl font-bold font-amiri leading-tight">مشكاة الأنوار: السيرة النبوية الشريفة</h1>
          </div>
        </div>

        <p className="text-xs text-sky-100/90 text-right leading-relaxed relative z-10">
          قبسات نورانية ومواقف نبوية شريفة من سيرة المصطفى ﷺ، محققة بالأسانيد الصحيحة، تُجيب عن أسئلة الشباب، وتصنع الهمة، وتحفظ القلب من الفتن.
        </p>

        {/* Quick Search */}
        <div className="mt-4 relative z-10">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن درس، صحابي، أو موضوع شبابي..."
              className="w-full h-11 pr-10 pl-4 rounded-2xl bg-white/15 dark:bg-black/35 text-white placeholder-sky-200/60 text-xs text-right border border-white/20 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all backdrop-blur-sm"
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

      {/* Categories Filter Tabs */}
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
          <span>الكل ({toArabicNumerals(MISHKAT_LESSONS.length)})</span>
        </button>

        {MISHKAT_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const count = MISHKAT_LESSONS.filter((l) => l.category === cat.id).length;
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

      {/* Lessons List */}
      <div className="space-y-4">
        {filteredLessons.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#0A192F] rounded-3xl border border-sky-100 dark:border-sky-950 p-6 space-y-3">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto opacity-50" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">لم يتم العثور على دروس</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {onlyFavorites
                ? 'لم تقم بحفظ أي درس في المفضلة بعد.'
                : 'جرب البحث بكلمات أخرى.'}
            </p>
          </div>
        ) : (
          filteredLessons.map((lesson) => {
            const isFav = favoriteIds.has(lesson.id);
            const isCopied = copiedId === lesson.id;
            const isExpanded = !!expandedStoryIds[lesson.id];

            return (
              <div
                key={lesson.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#0A192F] border border-sky-100 dark:border-sky-950 shadow-sm hover:shadow transition-all space-y-3.5 relative overflow-hidden text-right"
              >
                {/* Meta Bar */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleFavorite(lesson)}
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
                      onClick={() => handleCopy(lesson)}
                      aria-label="نسخ الدرس"
                      title="نسخ الدرس"
                      className="w-8 h-8 rounded-lg text-slate-400 hover:text-[#0284C7] hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-all cursor-pointer"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-sky-600" /> : <Copy className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleShare(lesson)}
                      aria-label="مشاركة الدرس"
                      title="مشاركة الدرس"
                      className="w-8 h-8 rounded-lg text-slate-400 hover:text-[#0284C7] hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-all cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-right flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                      {lesson.categoryTitle}
                    </span>
                    <h2 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {lesson.title}
                    </h2>
                  </div>
                </div>

                {/* Summary */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {lesson.summary}
                </p>

                {/* Story Text (Expandable) */}
                <div className="space-y-2">
                  <p className={`font-amiri text-base leading-relaxed text-slate-900 dark:text-sky-50 ${isExpanded ? '' : 'line-clamp-3'}`}>
                    {lesson.storyText}
                  </p>
                  <button
                    onClick={() => toggleExpandStory(lesson.id)}
                    className="text-xs font-bold text-[#0284C7] dark:text-sky-300 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>{isExpanded ? 'طي تفاصيل الموقف' : 'قراءة الموقف النبوي كاملاً'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Takeaway / Wisdom */}
                <div className="p-3.5 rounded-2xl bg-sky-50/60 dark:bg-[#0c2448]/60 border border-sky-100 dark:border-sky-900/60 text-right space-y-1.5">
                  <div className="flex items-center justify-end gap-1.5 text-xs text-[#0284C7] dark:text-sky-300 font-bold">
                    <span>القبس العملي للشباب</span>
                    <Lightbulb className="w-3.5 h-3.5 text-sky-500" />
                  </div>
                  <p className="text-xs text-slate-700 dark:text-sky-100 leading-relaxed font-medium">
                    {lesson.practicalTakeaway}
                  </p>
                  <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400 border-t border-sky-100/60 dark:border-sky-900/40">
                    <span className="font-bold text-slate-700 dark:text-slate-300">وصية نبوية: </span>
                    {lesson.propheticGuidance}
                  </div>
                </div>

                {/* Source Verification */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="text-sky-700 dark:text-sky-300 font-medium">
                    {lesson.authenticityGrade}
                  </span>
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-sky-600" />
                    <span>المصدر: {lesson.authenticitySource}</span>
                  </div>
                </div>
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

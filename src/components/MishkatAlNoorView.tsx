import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, 
  Crown, 
  Shield, 
  HeartHandshake, 
  Flame, 
  Lightbulb, 
  Smile, 
  Search, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Share2, 
  Heart, 
  ArrowRight, 
  BookOpen, 
  CheckCircle,
  Compass,
  ChevronDown,
  ChevronUp,
  Quote
} from 'lucide-react';
import { MishkatLesson, Bookmark } from '../types';
import { MISHKAT_CATEGORIES, MISHKAT_LESSONS } from '../data/mishkatData';
import { speakArabicText, stopSpeech } from '../utils/speech';
import { playChime, triggerHaptic } from '../utils/audio';
import { loadBookmarks, saveBookmarks } from '../utils/storage';
import { toArabicNumerals } from '../data/quranData';

interface MishkatAlNoorViewProps {
  onBack?: () => void;
  onNavigateToTab?: (tab: any) => void;
}

export const MishkatAlNoorView: React.FC<MishkatAlNoorViewProps> = ({ onBack, onNavigateToTab }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingLessonId, setPlayingLessonId] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => loadBookmarks());
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [expandedStoryIds, setExpandedStoryIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

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

  const handleToggleSpeech = (lesson: MishkatLesson) => {
    triggerHaptic('light');
    if (playingLessonId === lesson.id) {
      stopSpeech();
      setPlayingLessonId(null);
    } else {
      stopSpeech();
      setPlayingLessonId(lesson.id);
      playChime('click');
      const textToRead = `${lesson.title}. ${lesson.summary}. القصة: ${lesson.storyText}. القبس المستفاد للشباب: ${lesson.practicalTakeaway}`;
      speakArabicText(textToRead, {
        onEnd: () => setPlayingLessonId(null),
        onError: () => setPlayingLessonId(null),
      });
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

  return (
    <div className="pb-24 pt-3 px-4 max-w-lg mx-auto space-y-5 animate-fadeIn">
      {/* Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E293B] via-[#0F382E] to-[#134E3F] text-white p-6 shadow-md islamic-border">
        {/* Glow Accent */}
        <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-amber-400/15 blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

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
                  ? 'bg-amber-400 text-slate-900 border-amber-300 shadow-sm'
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
            <span className="inline-block text-amber-300 text-xs font-semibold bg-white/10 px-2.5 py-0.5 rounded-full mb-1">
              سيرة المصطفى ﷺ للشباب
            </span>
            <h1 className="text-xl font-bold font-amiri leading-tight">مشكاة النور</h1>
          </div>
        </div>

        <p className="text-xs text-emerald-100/90 text-right leading-relaxed relative z-10">
          مقتطفات ودروس مستفادة من حياة النبي ﷺ، محققة من أصح كتب السيرة والحديث، لصناعة الهمة، ومواجهة ضغوط العصر، وبناء شخصية الشاب المسلم.
        </p>

        {/* Quick Search */}
        <div className="mt-4 relative z-10">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن درس، صحابي، أو موضوع شبابي..."
              className="w-full h-11 pr-10 pl-4 rounded-2xl bg-white/15 dark:bg-black/35 text-white placeholder-emerald-100/60 text-xs text-right border border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-300/60 transition-all backdrop-blur-sm"
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

      {/* Categories Filter Tabs */}
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

      {/* Selected Category Intro Banner */}
      {selectedCategory !== 'all' && (
        <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-right flex items-center justify-between">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-600 text-white">
            {MISHKAT_CATEGORIES.find((c) => c.id === selectedCategory)?.badge}
          </span>
          <div className="text-right">
            <h3 className="text-xs font-bold text-amber-900 dark:text-amber-300">
              {MISHKAT_CATEGORIES.find((c) => c.id === selectedCategory)?.title}
            </h3>
            <p className="text-[11px] text-[#78350F] dark:text-[#D97706]">
              {MISHKAT_CATEGORIES.find((c) => c.id === selectedCategory)?.subtitle}
            </p>
          </div>
        </div>
      )}

      {/* Lessons List */}
      <div className="space-y-4">
        {filteredLessons.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#1A2621] rounded-3xl border border-[#E5DDCF] dark:border-[#2A3C34] p-6 space-y-3">
            <Sparkles className="w-12 h-12 text-[#94A3B8] mx-auto opacity-50" />
            <h3 className="font-bold text-sm text-[#1F2937] dark:text-white">لم يتم العثور على دروس</h3>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              {onlyFavorites
                ? 'لم تحفظ أي قصة أو درس في المفضلة بعد. اضغط على أيقونة القلب لحفظ الدروس هنا.'
                : 'جرب البحث بكلمات أخرى أو اختر مساراً آخر.'}
            </p>
            {onlyFavorites && (
              <button
                onClick={() => setOnlyFavorites(false)}
                className="mt-2 text-xs font-bold text-[#0F6B50] dark:text-[#2DD4BF] underline"
              >
                عرض كل الدروس
              </button>
            )}
          </div>
        ) : (
          filteredLessons.map((lesson) => {
            const isFav = favoriteIds.has(lesson.id);
            const isCopied = copiedId === lesson.id;
            const isPlaying = playingLessonId === lesson.id;
            const isExpanded = expandedStoryIds[lesson.id] !== false; // Default expanded for rich experience

            return (
              <div
                key={lesson.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#1A2621] border border-[#E5DDCF] dark:border-[#2A3C34] shadow-sm hover:shadow-md transition-all space-y-4 relative overflow-hidden"
              >
                {/* Header Action & Meta */}
                <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800/60 pb-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleFavorite(lesson)}
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
                      onClick={() => handleCopy(lesson)}
                      aria-label="نسخ الدرس"
                      title="نسخ الدرس"
                      className="w-8 h-8 rounded-lg text-gray-400 hover:text-[#0F6B50] hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-all"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleShare(lesson)}
                      aria-label="مشاركة الدرس"
                      title="مشاركة الدرس"
                      className="w-8 h-8 rounded-lg text-gray-400 hover:text-[#0F6B50] hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-all"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleToggleSpeech(lesson)}
                      aria-label="الاستماع للدرس"
                      title="الاستماع للدرس"
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        isPlaying
                          ? 'text-white bg-[#0F6B50] animate-pulse'
                          : 'text-gray-400 hover:text-[#0F6B50] hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      {lesson.categoryTitle}
                    </span>
                  </div>
                </div>

                {/* Lesson Title & Summary */}
                <div className="text-right space-y-1">
                  <h2 className="text-base font-bold text-[#111827] dark:text-white leading-snug">
                    {lesson.title}
                  </h2>
                  <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF] leading-relaxed">
                    {lesson.summary}
                  </p>
                </div>

                {/* Authentic Prophetic Story Card */}
                <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#14201A] border border-[#E9E4D6] dark:border-[#22332A] text-right space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleExpandStory(lesson.id)}
                      className="text-[11px] font-bold text-[#0F6B50] dark:text-[#2DD4BF] flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'طي القصة' : 'قراءة القصة الشريفة'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F6B50] dark:text-[#2DD4BF]">
                      <span>القصة والموقف الشريف</span>
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="pt-2 text-right space-y-2 border-t border-[#E9E4D6] dark:border-[#22332A] animate-fadeIn">
                      <p className="text-xs sm:text-sm font-amiri leading-loose text-[#1F2937] dark:text-[#E2E8F0]">
                        {lesson.storyText}
                      </p>

                      {/* Source & Authentication Footnote */}
                      <div className="pt-1.5 flex items-center justify-end gap-1.5 text-[11px] text-[#6B7280] dark:text-[#8E9B93] border-t border-dashed border-gray-200 dark:border-gray-800">
                        <span>المصدر والتخريج: {lesson.authenticitySource} ({lesson.authenticityGrade})</span>
                        <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Youth Practical Takeaway (القبس العملي للشباب) */}
                <div className="p-3.5 rounded-2xl bg-[#EFF6FF] dark:bg-[#122232] border border-[#BFDBFE] dark:border-[#1E3A5F] text-right space-y-1.5">
                  <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-[#1D4ED8] dark:text-[#60A5FA]">
                    <span>القبس العملي لواقع الشباب</span>
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <p className="text-xs text-[#1E3A8A] dark:text-[#93C5FD] leading-relaxed">
                    {lesson.practicalTakeaway}
                  </p>
                </div>

                {/* Prophetic Guidance / Hadith */}
                {lesson.propheticGuidance && (
                  <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 text-right">
                    <div className="flex items-center justify-end gap-1.5 text-[11px] font-bold text-[#B45309] dark:text-amber-300 mb-1">
                      <span>وصية نبوية مقترنة</span>
                      <Quote className="w-3 h-3" />
                    </div>
                    <p className="text-xs font-amiri font-semibold leading-relaxed text-[#78350F] dark:text-amber-100">
                      {lesson.propheticGuidance}
                    </p>
                  </div>
                )}

                {/* Action Tip for Today */}
                <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-right flex items-center justify-between">
                  <p className="text-[11px] text-[#065F46] dark:text-[#34D399] font-medium">
                    {lesson.actionTip}
                  </p>
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md whitespace-nowrap mr-2">
                    خطوة اليوم
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

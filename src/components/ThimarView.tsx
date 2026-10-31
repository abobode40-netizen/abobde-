import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Quote, 
  Sparkles, 
  Copy, 
  Check, 
  Share2, 
  Shuffle, 
  ArrowRight, 
  BookOpen, 
  Search, 
  GraduationCap,
  X,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';
import { SCHOLAR_ERAS, THIMAR_CATEGORIES, THIMAR_LIST } from '../data/thimarData';
import { ThimarahItem } from '../types';
import { loadFavoriteScholars } from '../utils/storage';
import { playChime, triggerHaptic } from '../utils/audio';
import { fetchAIThimar, getDailyFeaturedThimarah } from '../utils/aiService';
import { toArabicNumerals } from '../data/quranData';
import { DoorActionBar } from './DoorActionBar';
import { UniversalExportModal } from './UniversalExportModal';
import { generateThimarExport } from '../utils/universalExport';

interface ThimarViewProps {
  onBackToHome?: () => void;
  fontScale?: number;
  onChangeFontScale?: (scale: number) => void;
}

export const ThimarView: React.FC<ThimarViewProps> = ({ 
  onBackToHome,
  fontScale = 100,
  onChangeFontScale
}) => {
  // Quotes State
  const [favoriteScholars, setFavoriteScholars] = useState<string[]>([]);
  const [selectedQuoteCategory, setSelectedQuoteCategory] = useState<string>('الكل');
  const [selectedEra, setSelectedEra] = useState<string>('الكل');
  const [quoteScholarFilter, setQuoteScholarFilter] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customList, setCustomList] = useState<ThimarahItem[]>(THIMAR_LIST);
  const [quoteIndex, setQuoteIndex] = useState<number>(0);
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Swipe handling
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Daily Featured Wisdom
  const dailyWisdom = getDailyFeaturedThimarah();

  useEffect(() => {
    setFavoriteScholars(loadFavoriteScholars());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter Quotes
  const filteredQuotes = useMemo(() => {
    return customList.filter((q) => {
      const matchesCat = selectedQuoteCategory === 'الكل' || q.category === selectedQuoteCategory;
      const matchesEra = selectedEra === 'الكل' || q.era === selectedEra;
      const matchesScholar = quoteScholarFilter === 'الكل' || q.author.includes(quoteScholarFilter) || quoteScholarFilter.includes(q.author);
      const matchesSearch = !searchQuery.trim() ||
        q.quote.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesEra && matchesScholar && matchesSearch;
    });
  }, [customList, selectedQuoteCategory, selectedEra, quoteScholarFilter, searchQuery]);

  const activeQuote = filteredQuotes[quoteIndex % (filteredQuotes.length || 1)] || customList[0] || THIMAR_LIST[0];

  const handleNextQuote = () => {
    if (filteredQuotes.length > 0) {
      setQuoteIndex((prev) => (prev + 1) % filteredQuotes.length);
    }
    playChime('click');
    triggerHaptic('light');
  };

  const handlePrevQuote = () => {
    if (filteredQuotes.length > 0) {
      setQuoteIndex((prev) => (prev - 1 + filteredQuotes.length) % filteredQuotes.length);
    }
    playChime('click');
    triggerHaptic('light');
  };

  // Swipe gesture detection
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

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        // Swipe left -> next quote
        handleNextQuote();
      } else {
        // Swipe right -> prev quote
        handlePrevQuote();
      }
    }
  };

  const handleGenerateAIThimar = async () => {
    setIsGeneratingAI(true);
    triggerHaptic('medium');
    playChime('click');
    showToast('جاري استخراج درّة علمية للشباب بالذكاء الاصطناعي… ✨');

    const result = await fetchAIThimar(
      selectedQuoteCategory !== 'الكل' ? selectedQuoteCategory : undefined,
      selectedEra !== 'الكل' ? selectedEra : undefined
    );

    setIsGeneratingAI(false);

    if (result) {
      setCustomList((prev) => [result, ...prev]);
      setQuoteIndex(0);
      playChime('success');
      showToast('تم استخراج الدرّة وتوصيلها بآية قرآنية بنجاح ✨');
    } else {
      showToast('تم اختيار درّة مباركة من قواعد العلم والمشايخ');
      handleNextQuote();
    }
  };

  const handleCopyQuote = () => {
    const textToCopy = `«${activeQuote.quote}»\n— ${activeQuote.author}${activeQuote.source ? ` (${activeQuote.source})` : ''}\n\nتطبيق جنّة الرحمن`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedQuote(true);
    playChime('success');
    showToast('تم نسخ النص إلى الحافظة');
    setTimeout(() => setCopiedQuote(false), 2000);
  };

  const handleShareQuote = () => {
    const textToShare = `«${activeQuote.quote}»\n— ${activeQuote.author}${activeQuote.source ? ` (${activeQuote.source})` : ''}\n\nتطبيق جنّة الرحمن`;
    if (navigator.share) {
      navigator.share({
        title: 'ثمرة من ثمار المشايخ',
        text: textToShare
      }).catch(() => {});
    } else {
      handleCopyQuote();
    }
  };

  const exportData = generateThimarExport(filteredQuotes);

  return (
    <div 
      className="pb-28 pt-2 px-3 sm:px-4 max-w-lg mx-auto space-y-4 animate-fadeIn"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 inset-x-4 max-w-md mx-auto z-50 bg-[#0284C7] text-white px-4 py-3 rounded-2xl shadow-xl border border-sky-400/50 text-center text-xs font-bold flex items-center justify-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-sky-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Universal Action Bar: Zoom, Swipe Guidance, and Export */}
      <DoorActionBar
        doorTitle="باب ثمار المشايخ ووصايا الشباب"
        fontScale={fontScale}
        onChangeFontScale={onChangeFontScale}
        onOpenExport={() => setIsExportOpen(true)}
        swipeHint="اسحب يميناً ويساراً للتنقل بين الدرر ⇆"
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950 text-[#0284C7] dark:text-sky-300 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            title="العودة للرئيسية"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
        <div className="text-right flex-1 pr-2">
          <h2 className="font-amiri text-xl sm:text-2xl font-bold text-[#0284C7] dark:text-sky-300 flex items-center justify-end gap-2">
            <span>ثمار المشايخ ووصايا الشباب</span>
            <BookOpen className="w-5 h-5 text-sky-400" />
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            كلمات موجزة ومواعظ مباركة لكبار العلماء والسلف الصالح
          </p>
        </div>
      </div>

      {/* Daily Featured Wisdom Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#0c2448] via-[#103463] to-[#184882] text-white shadow-xl border border-sky-400/30 relative overflow-hidden space-y-3">
        <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-sky-400/10 border-[24px] border-sky-300/10 pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-400/20 text-sky-200 border border-sky-300/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-300" />
            <span>درّة اليوم للشباب</span>
          </span>
          <span className="text-xs font-bold text-sky-200">
            {dailyWisdom.author}
          </span>
        </div>

        <p className="font-amiri text-base sm:text-lg font-bold text-white leading-relaxed text-right relative z-10">
          «{dailyWisdom.quote}»
        </p>

        {dailyWisdom.reflectionPrompt && (
          <div className="p-3 rounded-2xl bg-black/20 backdrop-blur-xs border border-white/10 text-right relative z-10">
            <p className="text-[11px] text-sky-100 leading-relaxed font-medium">
              💡 <span className="font-bold text-sky-300">ومضة تدبر:</span> {dailyWisdom.reflectionPrompt}
            </p>
          </div>
        )}
      </div>

      {/* AI Generator Button */}
      <button
        onClick={handleGenerateAIThimar}
        disabled={isGeneratingAI}
        className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#0284C7] via-[#0369A1] to-[#0284C7] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
      >
        <Sparkles className={`w-4 h-4 text-sky-200 ${isGeneratingAI ? 'animate-spin' : ''}`} />
        <span>{isGeneratingAI ? 'جاري استخراج درّة بالذكاء الاصطناعي…' : 'استخراج درّة جديدة وآية قرآنية بالذكاء الاصطناعي 🤖✨'}</span>
      </button>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث في نص الكلمات والمشايخ…"
          className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-white dark:bg-[#0A192F] border border-sky-100 dark:border-sky-950 text-right text-xs focus:outline-none focus:ring-2 focus:ring-[#0284C7] text-slate-900 dark:text-white"
        />
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Era Filter Pills */}
      <div className="space-y-1">
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[11px] font-bold text-slate-500 self-center shrink-0">العصر:</span>
          {SCHOLAR_ERAS.map((era) => {
            const isSelected = selectedEra === era;
            return (
              <button
                key={era}
                onClick={() => {
                  setSelectedEra(era);
                  setQuoteIndex(0);
                  playChime('click');
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0284C7] text-white shadow-xs'
                    : 'bg-white dark:bg-[#0A192F] border border-sky-100 dark:border-sky-950 text-slate-600 dark:text-slate-300'
                }`}
              >
                {era}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Swipeable Quote Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0A192F] border border-sky-100 dark:border-sky-950 shadow-sm relative space-y-4 text-right">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyQuote}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-sky-600 transition-colors cursor-pointer"
              title="نسخ الدرّة"
            >
              {copiedQuote ? <Check className="w-4 h-4 text-sky-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleShareQuote}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-sky-600 transition-colors cursor-pointer"
              title="مشاركة"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950 px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
              {activeQuote.category}
            </span>
            <span className="text-xs text-slate-400">
              {toArabicNumerals((quoteIndex % filteredQuotes.length) + 1)} من {toArabicNumerals(filteredQuotes.length)}
            </span>
          </div>
        </div>

        {/* Big Quote Text */}
        <p className="font-amiri text-lg sm:text-xl leading-relaxed text-slate-900 dark:text-sky-50 font-bold select-text">
          «{activeQuote.quote}»
        </p>

        {/* Author / Source */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1 text-slate-400">
            <span>اسحب للتنقل</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </div>
          <div className="text-right">
            <span className="font-bold text-sky-800 dark:text-sky-300 block">{activeQuote.author}</span>
            {activeQuote.source && (
              <span className="text-[10px] text-slate-400">{activeQuote.source}</span>
            )}
          </div>
        </div>

        {/* Navigation Buttons: Previous / Next */}
        <div className="flex items-center justify-between gap-2 pt-2">
          <button
            onClick={handlePrevQuote}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
            <span>السابقة</span>
          </button>
          <button
            onClick={handleNextQuote}
            className="flex-1 py-2.5 rounded-xl bg-[#0284C7] hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>التالية</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
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

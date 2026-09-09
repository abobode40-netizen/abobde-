import React, { useState, useEffect, useMemo } from 'react';
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
  X
} from 'lucide-react';
import { SCHOLAR_ERAS, THIMAR_CATEGORIES, THIMAR_LIST } from '../data/thimarData';
import { ThimarahItem } from '../types';
import { loadFavoriteScholars } from '../utils/storage';
import { playChime, triggerHaptic } from '../utils/audio';
import { fetchAIThimar, getDailyFeaturedThimarah } from '../utils/aiService';
import { toArabicNumerals } from '../data/quranData';

interface ThimarViewProps {
  onBackToHome?: () => void;
}

export const ThimarView: React.FC<ThimarViewProps> = ({ onBackToHome }) => {
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

  return (
    <div className="pb-28 pt-3 px-3 sm:px-4 max-w-lg mx-auto space-y-4 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 inset-x-4 max-w-md mx-auto z-50 bg-[#0F6B50] text-white px-4 py-3 rounded-2xl shadow-xl border border-emerald-400/40 text-center text-xs font-bold flex items-center justify-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="w-10 h-10 rounded-xl bg-[#E8F3ED] dark:bg-[#162D24] text-[#0F6B50] dark:text-[#2DD4BF] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            title="العودة للرئيسية"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
        <div className="text-right flex-1 pr-2">
          <h2 className="font-amiri text-xl sm:text-2xl font-bold text-[#0F6B50] dark:text-[#2DD4BF] flex items-center justify-end gap-2">
            <span>ثمار المشايخ ووصايا الشباب</span>
            <BookOpen className="w-5 h-5 text-amber-500" />
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            كلمات موجزة ومواعظ مباركة لكبار العلماء والسلف الصالح
          </p>
        </div>
      </div>

      {/* Daily Featured Wisdom Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#0F6B50] via-[#126A52] to-[#0A4D39] text-white shadow-xl border border-emerald-400/30 relative overflow-hidden space-y-3">
        <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-amber-400/10 border-[24px] border-amber-300/15 pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>درّة اليوم للشباب</span>
          </span>
          <span className="text-xs font-bold text-emerald-200">
            {dailyWisdom.author}
          </span>
        </div>

        <p className="font-amiri text-base sm:text-lg font-bold text-white leading-relaxed text-right relative z-10">
          «{dailyWisdom.quote}»
        </p>

        {dailyWisdom.reflectionPrompt && (
          <div className="p-3 rounded-2xl bg-black/20 backdrop-blur-xs border border-white/10 text-right relative z-10">
            <p className="text-[11px] text-emerald-100 leading-relaxed font-medium">
              💡 <span className="font-bold text-amber-300">ومضة تدبر:</span> {dailyWisdom.reflectionPrompt}
            </p>
          </div>
        )}
      </div>

      {/* AI Generator Button */}
      <button
        onClick={handleGenerateAIThimar}
        disabled={isGeneratingAI}
        className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#0F6B50] via-[#138061] to-[#0F6B50] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
      >
        <Sparkles className={`w-4 h-4 text-amber-300 ${isGeneratingAI ? 'animate-spin' : ''}`} />
        <span>{isGeneratingAI ? 'جاري استخراج درّة بالذكاء الاصطناعي…' : 'استخراج درّة جديدة وآية قرآنية بالذكاء الاصطناعي 🤖✨'}</span>
      </button>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث في نص الكلمات والمشايخ…"
          className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-white dark:bg-[#1A2621] border border-[#E5DDCF] dark:border-[#2A3C34] text-right text-xs focus:outline-none focus:ring-2 focus:ring-[#0F6B50] dark:focus:ring-[#2DD4BF] text-gray-900 dark:text-white"
        />
        <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-3 pointer-events-none" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute left-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Era Filter Pills */}
      <div className="space-y-1">
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[11px] font-bold text-gray-500 self-center shrink-0">العصر:</span>
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
                className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#8A6A29] text-white shadow-xs'
                    : 'bg-white dark:bg-[#1A2621] border border-amber-200/60 dark:border-[#2A3C34] text-gray-600 dark:text-gray-300'
                }`}
              >
                {era}
              </button>
            );
          })}
        </div>
      </div>

      {/* Topic Filter Pills */}
      <div className="space-y-1">
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[11px] font-bold text-gray-500 self-center shrink-0">الموضوع:</span>
          {THIMAR_CATEGORIES.map((cat) => {
            const isSelected = selectedQuoteCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedQuoteCategory(cat);
                  setQuoteIndex(0);
                  playChime('click');
                }}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#0F6B50] text-white shadow-xs'
                    : 'bg-white dark:bg-[#1A2621] border border-[#E5DDCF] dark:border-[#2A3C34] text-gray-600 dark:text-gray-300'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Featured Quote Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#1A2621] border-2 border-[#E5DDCF] dark:border-[#2A3C34] shadow-md space-y-4 text-right">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShareQuote}
              className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
              title="مشاركة"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyQuote}
              className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
              title="نسخ"
            >
              {copiedQuote ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#0F6B50] dark:text-[#34D399]">
              {activeQuote.category}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200">
              {activeQuote.era}
            </span>
          </div>
        </div>

        {/* Quote Text */}
        <p className="font-amiri text-lg sm:text-xl font-bold text-[#19302A] dark:text-white leading-relaxed">
          «{activeQuote.quote}»
        </p>

        {/* Reflection prompt if exists */}
        {activeQuote.reflectionPrompt && (
          <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-right">
            <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium">
              💡 <span className="font-bold">فائدة للشباب:</span> {activeQuote.reflectionPrompt}
            </p>
          </div>
        )}

        {/* Related Quranic Verse if exists */}
        {activeQuote.relatedVerse && (
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-right space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 dark:text-amber-200">
              <span>سورة {activeQuote.relatedVerse.surahName} (آية {toArabicNumerals(activeQuote.relatedVerse.ayahNumber)})</span>
              <span>📖 آية مرتبطة</span>
            </div>
            <p className="font-amiri text-sm font-bold text-gray-900 dark:text-white leading-relaxed">
              {activeQuote.relatedVerse.verseText}
            </p>
          </div>
        )}

        {/* Author and Source */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            {activeQuote.source || 'كبار أئمة وعلماء الأمة'}
          </span>
          <span className="text-xs font-bold text-[#0F6B50] dark:text-[#2DD4BF]">
            — {activeQuote.author}
          </span>
        </div>

        {/* Next Quote Button */}
        <button
          onClick={handleNextQuote}
          className="w-full py-2.5 rounded-2xl bg-[#E8F3ED] dark:bg-[#162D24] text-[#0F6B50] dark:text-[#2DD4BF] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#D7EBE1] active:scale-95 transition-all"
        >
          <Shuffle className="w-4 h-4" />
          <span>الدرّة التالية ({toArabicNumerals(quoteIndex + 1)}/{toArabicNumerals(filteredQuotes.length || 1)})</span>
        </button>
      </div>

      {/* List of all filtered quotes in concise cards */}
      <div className="space-y-2 pt-2">
        <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 px-1">
          قائمة الدرر والمواعظ المختصرة ({toArabicNumerals(filteredQuotes.length)} درّة):
        </h3>
        {filteredQuotes.map((q, idx) => (
          <div
            key={q.id || idx}
            onClick={() => {
              const realIdx = filteredQuotes.findIndex(item => item.id === q.id);
              if (realIdx !== -1) {
                setQuoteIndex(realIdx);
                window.scrollTo({ top: 250, behavior: 'smooth' });
                playChime('click');
              }
            }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-right space-y-1.5 ${
              activeQuote.id === q.id
                ? 'bg-emerald-50 dark:bg-[#142B21] border-[#0F6B50] dark:border-[#2DD4BF]'
                : 'bg-white dark:bg-[#1A2621] border-[#E5DDCF] dark:border-[#2A3C34] hover:border-emerald-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#0F6B50] dark:text-[#34D399]">
                {q.author}
              </span>
              <span className="text-[10px] text-gray-500">
                {q.category}
              </span>
            </div>
            <p className="font-amiri text-sm font-bold text-gray-900 dark:text-white line-clamp-2">
              «{q.quote}»
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

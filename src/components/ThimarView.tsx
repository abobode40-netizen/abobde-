import React, { useState, useRef, useEffect } from 'react';
import { 
  Quote, 
  Sparkles, 
  Copy, 
  Check, 
  Share2, 
  Shuffle, 
  ArrowRight, 
  Heart, 
  BookOpen, 
  Headphones, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  Search, 
  SlidersHorizontal, 
  Clock, 
  Bookmark, 
  Radio, 
  Trash2,
  Filter,
  GraduationCap,
  Star,
  UserCheck,
  X
} from 'lucide-react';
import { SCHOLAR_ERAS, SCHOLARS_FILTER_LIST, THIMAR_CATEGORIES, THIMAR_LIST } from '../data/thimarData';

import { ThimarahItem } from '../types';
import { 
  loadFavoriteScholars,
  toggleFavoriteScholar
} from '../utils/storage';
import { playChime, triggerHaptic } from '../utils/audio';
import { fetchAIThimar, getDailyFeaturedThimarah } from '../utils/aiService';

import { FavoriteScholarsModal } from './FavoriteScholarsModal';

interface ThimarViewProps {
  onBackToHome?: () => void;
}

export const ThimarView: React.FC<ThimarViewProps> = ({ onBackToHome }) => {
    // Favorite Scholars State
  const [favoriteScholars, setFavoriteScholars] = useState<string[]>([]);
  const [selectedScholarFilter, setSelectedScholarFilter] = useState<string>('الكل');
  const [onlyFavoriteScholars, setOnlyFavoriteScholars] = useState<boolean>(false);
  const [isScholarsModalOpen, setIsScholarsModalOpen] = useState<boolean>(false);

  // Quotes State
  const [selectedQuoteCategory, setSelectedQuoteCategory] = useState<string>('الكل');
  const [selectedEra, setSelectedEra] = useState<string>('الكل');
  const [quoteScholarFilter, setQuoteScholarFilter] = useState<string>('الكل');
  const [quoteOnlyFavScholars, setQuoteOnlyFavScholars] = useState<boolean>(false);
  const [customList, setCustomList] = useState<ThimarahItem[]>(THIMAR_LIST);
  const [quoteIndex, setQuoteIndex] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);

  // Quran Verse Audio Player State
      // Daily Featured Wisdom
  const dailyWisdom = getDailyFeaturedThimarah();

    
    useEffect(() => {
    // Load favorites from local storage
        setFavoriteScholars(loadFavoriteScholars());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleScholarFavorite = (scholarName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = toggleFavoriteScholar(scholarName);
    setFavoriteScholars(updated);
    const isNowFav = updated.includes(scholarName);
    triggerHaptic(30);
    playChime('click');
    showToast(
      isNowFav 
        ? `تمت إضافة ${scholarName} إلى مشايخك المفضلين ❤️` 
        : `تمت إزالة ${scholarName} من المشايخ المفضلين`
    );
  };

  // Quotes logic
  const filteredQuotes = customList.filter((q) => {
    const matchesCat = selectedQuoteCategory === 'الكل' || q.category === selectedQuoteCategory;
    const matchesEra = selectedEra === 'الكل' || q.era === selectedEra;
    const matchesScholar = quoteScholarFilter === 'الكل' || q.author.includes(quoteScholarFilter) || quoteScholarFilter.includes(q.author);
    const matchesFavScholars = !quoteOnlyFavScholars || favoriteScholars.some(s => s.includes(q.author) || q.author.includes(s));
    return matchesCat && matchesEra && matchesScholar && matchesFavScholars;
  });

  const activeQuote = filteredQuotes[quoteIndex % (filteredQuotes.length || 1)] || customList[0] || THIMAR_LIST[0];

  const handleNextQuote = () => {
    if (filteredQuotes.length > 0) {
      setQuoteIndex((prev) => (prev + 1) % filteredQuotes.length);
    }
    playChime('click');
    triggerHaptic(20);
  };

  const handleGenerateAIThimar = async () => {
    setIsGeneratingAI(true);
    triggerHaptic(30);
    playChime('click');
    showToast('جاري استخراج ثمرة علمية وآية قرآنية بالذكاء الاصطناعي… 🤖✨');

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
    setCopied(true);
    playChime('success');
    showToast('تم نسخ الدرّة إلى الحافظة');
    setTimeout(() => setCopied(false), 2000);
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

  // Filter lessons
  
  const formatTime = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };


  return (
    <div className="pb-28 pt-2 px-3 sm:px-4 max-w-lg mx-auto space-y-4 animate-fadeIn">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 inset-x-4 max-w-md mx-auto z-50 bg-[#0F6B50] text-white px-4 py-3 rounded-2xl shadow-xl border border-emerald-400/40 text-center text-sm font-bold flex items-center justify-center gap-2 animate-bounce">
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
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-[#B45309] dark:text-amber-300">
              مجالس العلم والهدى
            </span>
          </div>
          <h2 className="text-xl font-bold font-amiri text-[#19302A] dark:text-white">
            ثمار المشايخ ومقاطع الدروس
          </h2>
        </div>
      </div>

                    <div className="space-y-4 animate-fadeIn">
          {/* Daily Auto-Updated Wisdom Banner */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-100 via-amber-50 to-amber-100/60 dark:from-amber-950/70 dark:via-amber-900/40 dark:to-amber-950/70 border-2 border-amber-300/80 dark:border-amber-700/60 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-800 dark:text-amber-200 bg-amber-200/80 dark:bg-amber-900/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-300" />
                <span>ثمرة اليوم المحدثة تلقائياً ({new Date().toLocaleDateString('ar-SA')})</span>
              </span>
              <span className="text-xs font-bold text-[#8A6A29] dark:text-amber-300">
                — {dailyWisdom.author}
              </span>
            </div>
            <p className="font-amiri text-base font-bold text-[#1A382C] dark:text-amber-100 leading-relaxed text-right">
              «{dailyWisdom.quote}»
            </p>
          </div>

          {/* AI Generator & Era Filters Controls */}
          <div className="space-y-2">
            <button
              onClick={handleGenerateAIThimar}
              disabled={isGeneratingAI}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#0F6B50] via-[#138061] to-[#0F6B50] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 text-amber-300 ${isGeneratingAI ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAI ? 'جاري استخراج درّة بالذكاء الاصطناعي…' : 'استخراج درّة جديدة وآية قرآنية بالذكاء الاصطناعي 🤖✨'}</span>
            </button>

            {/* Era Filter Pills */}
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

            {/* Scholar Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-[11px] font-bold text-gray-500 self-center shrink-0">العالم / الإمام:</span>
              {SCHOLARS_FILTER_LIST.map((scholar) => {
                const isSelected = quoteScholarFilter === scholar;
                return (
                  <button
                    key={scholar}
                    onClick={() => {
                      setQuoteScholarFilter(scholar);
                      setQuoteIndex(0);
                      playChime('click');
                    }}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white dark:bg-[#1A2621] border border-emerald-200/60 dark:border-[#2A3C34] text-emerald-800 dark:text-emerald-300'
                    }`}
                  >
                    {scholar}
                  </button>
                );
              })}
            </div>

            {/* Topic Filter Pills */}
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
                        : 'bg-white dark:bg-[#1A2621] border border-[#E5DDCF] dark:border-[#2A3C34] text-[#556B5F] dark:text-gray-300 hover:border-[#0F6B50]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Featured Big Wisdom Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#FFF9ED] dark:bg-[#1C180E] border-2 border-[#EADBB8] dark:border-[#3D331A] text-center shadow-md relative min-h-[300px] flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                {activeQuote.era || 'درر العلماء'}
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center shadow-xs">
                <Quote className="w-5 h-5" />
              </div>
            </div>

            <p className="font-amiri text-xl sm:text-2xl font-bold leading-loose text-[#1A382C] dark:text-amber-100 my-2">
              «{activeQuote.quote}»
            </p>

            <div className="pt-3 border-t border-[#E8DAB7] dark:border-[#3D331A] space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className="w-6 h-px bg-amber-400" />
                <h4 className="font-bold text-sm text-[#8A6A29] dark:text-amber-300">
                  — {activeQuote.author}
                </h4>
                <span className="w-6 h-px bg-amber-400" />
              </div>

              <span className="text-[11px] text-gray-500 block">
                {activeQuote.category} {activeQuote.source ? `• ${activeQuote.source}` : ''}
              </span>


              {activeQuote.reflectionPrompt && (
                <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium bg-emerald-50 dark:bg-emerald-950/60 p-2 rounded-xl mt-1">
                  💡 وقفة تدبر: {activeQuote.reflectionPrompt}
                </p>
              )}
            </div>
          </div>
          {/* Card Action Buttons */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleShareQuote}
              className="px-5 py-2.5 rounded-xl bg-white dark:bg-[#1A2621] border border-[#E5DDCF] dark:border-[#2A3C34] text-[#0F6B50] dark:text-[#2DD4BF] text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-[#F4F8F5] active:scale-95 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>مشاركة</span>
            </button>

            <button
              onClick={handleCopyQuote}
              className="px-5 py-2.5 rounded-xl bg-white dark:bg-[#1A2621] border border-[#E5DDCF] dark:border-[#2A3C34] text-[#0F6B50] dark:text-[#2DD4BF] text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-[#F4F8F5] active:scale-95 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>نسخ</span>
            </button>
          </div>

          {/* Next Quote Button */}
          <button
            onClick={handleNextQuote}
            className="w-full py-3.5 rounded-2xl bg-[#0F6B50] hover:bg-[#138061] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
          >
            <Shuffle className="w-4 h-4 text-amber-300" />
            <span>ثمرة أخرى</span>
          </button>
        </div>
      

    </div>
  );
};

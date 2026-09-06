import React, { useState } from 'react';
import { 
  Check, 
  Copy, 
  Share2, 
  RotateCcw, 
  Search, 
  Info,
  Flame,
  Sparkles,
  Layers,
  BookOpen
} from 'lucide-react';
import { ATHKAR_CATEGORIES } from '../data/athkarData';
import { toArabicNumerals } from '../data/quranData';
import { playChime, triggerHaptic } from '../utils/audio';
import { HisnMuslimAccordion } from './HisnMuslimAccordion';

interface AthkarViewProps {
  onThikrCompleted?: (thikrId: string) => void;
  onOpenSebha: () => void;
}

export const AthkarView: React.FC<AthkarViewProps> = ({ onThikrCompleted, onOpenSebha }) => {
  // Mode: 'accordion' (Hisn al-Muslim Collapsible Directory) or 'stream' (Focus Interactive Counter)
  const [viewMode, setViewMode] = useState<'accordion' | 'stream'>('accordion');
  const [selectedCategory, setSelectedCategory] = useState<string>('morning');
  const [searchQuery, setSearchQuery] = useState('');
  const [athkarProgress, setAthkarProgress] = useState<Record<string, number>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeCategory = ATHKAR_CATEGORIES.find((c) => c.id === selectedCategory) || ATHKAR_CATEGORIES[0];

  // Filter items by search query if present in stream mode
  const itemsToDisplay = searchQuery.trim()
    ? ATHKAR_CATEGORIES.flatMap((c) => c.items).filter((i) => 
        i.text.includes(searchQuery.trim()) || (i.fadl && i.fadl.includes(searchQuery.trim()))
      )
    : activeCategory.items;

  const handleIncrement = (thikrId: string, maxCount: number) => {
    const current = athkarProgress[thikrId] || 0;
    if (current < maxCount) {
      const next = current + 1;
      setAthkarProgress(prev => ({ ...prev, [thikrId]: next }));
      triggerHaptic(25);

      if (next >= maxCount) {
        playChime('success');
        triggerHaptic(60);
        if (onThikrCompleted) onThikrCompleted(thikrId);
      } else {
        playChime('click');
      }
    }
  };

  const handleResetCategory = (categoryId?: string) => {
    const targetCatId = categoryId || selectedCategory;
    const cat = ATHKAR_CATEGORIES.find(c => c.id === targetCatId) || activeCategory;
    const updated = { ...athkarProgress };
    cat.items.forEach((item) => {
      updated[item.id] = 0;
    });
    setAthkarProgress(updated);
    playChime('click');
    showToast(`تمت إعادة ضبط عداد: ${cat.title}`);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    playChime('success');
    showToast('تم نسخ الذكر إلى الحافظة بنجاح');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = (text: string, source?: string) => {
    const shareText = `${text}\n\n[المصدر: ${source || 'حصن المسلم'}]\nتطبيق جنّة الرحمن`;
    if (navigator.share) {
      navigator.share({
        title: 'ذكر من جنّة الرحمن',
        text: shareText
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      showToast('تم نسخ الذكر للمشاركة');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Calculate completed count in category
  const completedCount = activeCategory.items.filter(
    (i) => (athkarProgress[i.id] || 0) >= i.repeatCount
  ).length;

  return (
    <div className="pb-28 pt-2 px-3 sm:px-4 max-w-lg mx-auto space-y-4 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 inset-x-4 max-w-md mx-auto z-50 bg-[#0F6B50] text-white px-4 py-3 rounded-2xl shadow-xl border border-emerald-400/40 text-center text-sm font-bold flex items-center justify-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top View Mode Switcher */}
      <div className="bg-white dark:bg-[#1A2621] p-1.5 rounded-2xl border border-[#E5DDCF] dark:border-[#2A3C34] flex items-center shadow-xs">
        <button
          onClick={() => {
            setViewMode('accordion');
            playChime('click');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            viewMode === 'accordion'
              ? 'bg-[#0F6B50] text-white shadow-xs'
              : 'text-[#4F685B] dark:text-gray-300 hover:text-[#0F6B50]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>أبواب حصن المسلم (أكورديون)</span>
        </button>

        <button
          onClick={() => {
            setViewMode('stream');
            playChime('click');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            viewMode === 'stream'
              ? 'bg-[#0F6B50] text-white shadow-xs'
              : 'text-[#4F685B] dark:text-gray-300 hover:text-[#0F6B50]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>العداد التفاعلي السريع</span>
        </button>
      </div>

      {/* Accordion View Mode */}
      {viewMode === 'accordion' ? (
        <HisnMuslimAccordion
          athkarProgress={athkarProgress}
          onIncrementThikr={handleIncrement}
          onResetCategory={handleResetCategory}
          onSelectCategoryForStream={(catId) => {
            setSelectedCategory(catId);
            setViewMode('stream');
            playChime('click');
          }}
          onOpenSebha={onOpenSebha}
          showToast={showToast}
        />
      ) : (
        /* Stream Focus Counter Mode */
        <div className="space-y-4">
          {/* Hero Header for Focus Stream */}
          <div className="p-5 rounded-3xl bg-[#FFF8E7] dark:bg-[#1E190E] border border-[#EADBB8] dark:border-[#3D331A] shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#0F6B50]/10 text-[#0F6B50] dark:text-[#2DD4BF]">
                    حصن المسلم
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold font-amiri text-[#254939] dark:text-amber-100">
                    {activeCategory.title}
                  </h2>
                </div>
                <p className="text-xs text-[#6F786E] dark:text-[#8E9B93] mt-1 leading-relaxed">
                  {activeCategory.subtitle}
                </p>
              </div>
              <div className="w-11 h-11 shrink-0 rounded-2xl bg-[#F9E6C4] dark:bg-[#3D3014] text-[#B45309] dark:text-amber-300 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>

            {/* Category progress bar */}
            {!searchQuery && (
              <div className="mt-4 pt-3 border-t border-[#E8DAB7] dark:border-[#3D331A] flex items-center justify-between gap-2 text-xs flex-wrap">
                <button
                  onClick={() => handleResetCategory(activeCategory.id)}
                  className="text-[#0F6B50] dark:text-[#2DD4BF] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة البدء</span>
                </button>

                <span className="font-bold text-[#234335] dark:text-amber-100">
                  أتممت {toArabicNumerals(completedCount)} من {toArabicNumerals(activeCategory.items.length)} أذكار
                </span>
              </div>
            )}
          </div>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث في الأذكار والأدعية..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#1A2621] border border-[#E5DDCF] dark:border-[#2A3C34] focus:border-[#0F6B50] dark:focus:border-[#2DD4BF] rounded-2xl py-3 pr-11 pl-4 text-sm text-right outline-none text-[#19302A] dark:text-white shadow-sm placeholder-[#97A099]"
            />
            <Search className="w-5 h-5 text-[#97A099] absolute right-3.5 top-3.5" />
          </div>

          {/* Categories Horizontal Pills */}
          {!searchQuery && (
            <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar">
              {ATHKAR_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      playChime('click');
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'bg-[#0F6B50] text-white shadow-sm'
                        : 'bg-white dark:bg-[#1A2621] border border-[#E5DDCF] dark:border-[#2A3C34] text-[#4F685B] dark:text-gray-300 hover:border-[#0F6B50]'
                    }`}
                  >
                    <span>{cat.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                      {toArabicNumerals(cat.items.length)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Sebha shortcut banner */}
          <div 
            onClick={onOpenSebha}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-600/10 to-teal-500/15 border border-[#D4AF37]/40 flex items-center justify-between cursor-pointer hover:border-[#0F6B50] transition-all"
          >
            <span className="text-xs font-bold text-[#0F6B50] dark:text-[#2DD4BF] bg-white dark:bg-[#1A2621] px-2.5 py-1 rounded-lg shadow-xs">
              تسبيح مفتوح
            </span>
            <div className="text-right flex items-center gap-2">
              <div>
                <span className="text-xs font-bold text-[#19302A] dark:text-white block">المسبحة الإلكترونية الحرة</span>
                <span className="text-[10px] text-gray-500">سبّح واستغفر بعداد حر وأصوات هادئة</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[#0F6B50] text-white flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Athkar Cards Stream */}
          <div className="space-y-3.5">
            {itemsToDisplay.map((thikr) => {
              const currentCount = athkarProgress[thikr.id] || 0;
              const isDone = currentCount >= thikr.repeatCount;

              return (
                <div
                  id={`thikr-card-${thikr.id}`}
                  key={thikr.id}
                  className={`p-5 rounded-2xl border transition-all duration-300 relative ${
                    isDone
                      ? 'bg-[#EBF7F0] dark:bg-[#12241C] border-[#84D8A4] dark:border-[#1E523A]'
                      : 'bg-white dark:bg-[#1A2621] border-[#E7E0D4] dark:border-[#2A3C34]'
                  } shadow-sm space-y-3 text-right`}
                >
                  {/* Top Meta Info */}
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-gray-100 dark:border-gray-800">
                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopy(thikr.text, thikr.id)}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#0F6B50] transition-colors cursor-pointer"
                        title="نسخ الذكر"
                      >
                        {copiedId === thikr.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleShare(thikr.text, thikr.source)}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#0F6B50] transition-colors cursor-pointer"
                        title="مشاركة الذكر"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {isDone && (
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>مكتمل</span>
                        </span>
                      )}
                      <span className="font-bold text-xs text-[#8A6A29] dark:text-amber-300">
                        العدد المطلوب: {toArabicNumerals(thikr.repeatCount)}
                      </span>
                    </div>
                  </div>

                  {/* Thikr Main Text */}
                  <p className="font-amiri text-lg sm:text-xl leading-relaxed text-[#19302A] dark:text-[#E2EDE8]">
                    {thikr.text}
                  </p>

                  {/* Virtue / Fadl and Source */}
                  {thikr.fadl && (
                    <div className="p-3 rounded-xl bg-[#FAF7F0] dark:bg-[#14201B] border border-[#EBE3D3] dark:border-[#253930] text-xs space-y-1">
                      <div className="flex items-center gap-1 font-bold text-[#B45309] dark:text-amber-300">
                        <Info className="w-3.5 h-3.5" />
                        <span>الفضل والأثر:</span>
                      </div>
                      <p className="text-[#55695E] dark:text-gray-300 leading-normal">
                        {thikr.fadl}
                      </p>
                      {thikr.source && (
                        <span className="block text-[10px] text-gray-500 font-medium pt-0.5">
                          المصدر: {thikr.source}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Interactive Big Tap Counter Button */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">
                      المتبقي: {toArabicNumerals(Math.max(0, thikr.repeatCount - currentCount))}
                    </span>

                    <button
                      onClick={() => handleIncrement(thikr.id, thikr.repeatCount)}
                      className={`px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer ${
                        isDone
                          ? 'bg-emerald-700 text-white cursor-default'
                          : 'bg-[#0F6B50] hover:bg-[#138061] text-white'
                      }`}
                    >
                      <span>{isDone ? 'تم بحمد الله' : 'اضغط للذكر'}</span>
                      <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                        {toArabicNumerals(currentCount)}/{toArabicNumerals(thikr.repeatCount)}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}

            {itemsToDisplay.length === 0 && (
              <div className="p-8 text-center bg-white dark:bg-[#1A2621] rounded-2xl border border-dashed border-[#E5DDCF] dark:border-[#2A3C34] text-sm text-[#7A877B]">
                لا توجد أذكار مطابقة لبحثك.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

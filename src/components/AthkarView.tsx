import React, { useState, useRef } from 'react';
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
  BookOpen,
  Download
} from 'lucide-react';
import { ATHKAR_CATEGORIES } from '../data/athkarData';
import { toArabicNumerals } from '../data/quranData';
import { playChime, triggerHaptic } from '../utils/audio';
import { HisnMuslimAccordion } from './HisnMuslimAccordion';
import { DoorActionBar } from './DoorActionBar';
import { UniversalExportModal } from './UniversalExportModal';
import { generateAthkarExport } from '../utils/universalExport';

interface AthkarViewProps {
  onThikrCompleted?: (thikrId: string) => void;
  onOpenSebha: () => void;
  fontScale?: number;
  onChangeFontScale?: (scale: number) => void;
}

export const AthkarView: React.FC<AthkarViewProps> = ({ 
  onThikrCompleted, 
  onOpenSebha,
  fontScale = 100,
  onChangeFontScale 
}) => {
  // Mode: 'accordion' (Hisn al-Muslim Collapsible Directory) or 'stream' (Focus Interactive Counter)
  const [viewMode, setViewMode] = useState<'accordion' | 'stream'>('accordion');
  const [selectedCategory, setSelectedCategory] = useState<string>('morning');
  const [searchQuery, setSearchQuery] = useState('');
  const [athkarProgress, setAthkarProgress] = useState<Record<string, number>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Swipe handling
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const activeCategory = ATHKAR_CATEGORIES.find((c) => c.id === selectedCategory) || ATHKAR_CATEGORIES[0];
  const activeCategoryIndex = ATHKAR_CATEGORIES.findIndex((c) => c.id === selectedCategory);

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

    // Only process horizontal swipes
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        // Swipe left -> next category
        const nextIdx = (activeCategoryIndex + 1) % ATHKAR_CATEGORIES.length;
        setSelectedCategory(ATHKAR_CATEGORIES[nextIdx].id);
        playChime('click');
        triggerHaptic('light');
      } else {
        // Swipe right -> previous category
        const prevIdx = (activeCategoryIndex - 1 + ATHKAR_CATEGORIES.length) % ATHKAR_CATEGORIES.length;
        setSelectedCategory(ATHKAR_CATEGORIES[prevIdx].id);
        playChime('click');
        triggerHaptic('light');
      }
    }
  };

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
      triggerHaptic('selection');

      if (next >= maxCount) {
        playChime('success');
        triggerHaptic('heavy');
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

  const currentExportData = generateAthkarExport(activeCategory.title, activeCategory.items);

  return (
    <div 
      className="pb-28 pt-2 px-3 sm:px-4 max-w-lg mx-auto space-y-4 animate-fadeIn"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 inset-x-4 max-w-md mx-auto z-50 bg-[#0284C7] text-white px-4 py-3 rounded-2xl shadow-xl border border-sky-400/50 text-center text-sm font-bold flex items-center justify-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-sky-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Door Action Bar: Zoom, Swipe Indicator, and Export */}
      <DoorActionBar
        doorTitle="باب حصن المسلم وغراس الأذكار"
        fontScale={fontScale}
        onChangeFontScale={onChangeFontScale}
        onOpenExport={() => setIsExportOpen(true)}
        swipeHint="اسحب يميناً ويساراً للتنقل بين الأبواب ⇆"
      />

      {/* Top View Mode Switcher */}
      <div className="bg-white dark:bg-[#0A192F] p-1.5 rounded-2xl border border-sky-100 dark:border-sky-950 flex items-center shadow-xs">
        <button
          onClick={() => {
            setViewMode('accordion');
            playChime('click');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            viewMode === 'accordion'
              ? 'bg-[#0284C7] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-sky-600'
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
              ? 'bg-[#0284C7] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-sky-600'
          }`}
        >
          <Sparkles className="w-4 h-4 text-sky-400" />
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
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0c264a] via-[#103463] to-[#184882] text-white border border-sky-500/30 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-sky-400/20 text-sky-200 border border-sky-300/30">
                    حصن المسلم
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold font-amiri text-white">
                    {activeCategory.title}
                  </h2>
                </div>
                <p className="text-xs text-sky-100/90 mt-1 leading-relaxed">
                  {activeCategory.subtitle}
                </p>
              </div>
              <div className="w-11 h-11 shrink-0 rounded-2xl bg-sky-500/20 text-sky-200 border border-sky-400/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-sky-300" />
              </div>
            </div>

            {/* Category progress bar */}
            {!searchQuery && (
              <div className="mt-4 pt-3 border-t border-sky-500/20 flex items-center justify-between gap-2 text-xs flex-wrap">
                <button
                  onClick={() => handleResetCategory(activeCategory.id)}
                  className="text-sky-200 hover:text-white font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة البدء</span>
                </button>

                <span className="font-bold text-sky-100">
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
              className="w-full bg-white dark:bg-[#0A192F] border border-sky-200 dark:border-sky-950 focus:border-[#0284C7] dark:focus:border-sky-400 rounded-2xl py-3 pr-11 pl-4 text-sm text-right outline-none text-slate-800 dark:text-white shadow-sm placeholder-slate-400"
            />
            <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5" />
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
                        ? 'bg-[#0284C7] text-white shadow-sm'
                        : 'bg-white dark:bg-[#0A192F] border border-sky-100 dark:border-sky-950 text-slate-700 dark:text-slate-300 hover:border-sky-400'
                    }`}
                  >
                    <span>{cat.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
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
            className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-500/10 via-blue-600/10 to-cyan-500/10 border border-sky-300/40 dark:border-sky-700/40 flex items-center justify-between cursor-pointer hover:border-sky-400 transition-all"
          >
            <span className="text-xs font-bold text-sky-700 dark:text-sky-300 bg-white dark:bg-[#0A192F] px-2.5 py-1 rounded-lg shadow-xs border border-sky-200 dark:border-sky-800">
              تسبيح حر
            </span>
            <div className="text-right flex items-center gap-2">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">المسبحة الإلكترونية الحرة</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">سبّح واستغفر بعداد حر وأصوات هادئة</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[#0284C7] text-white flex items-center justify-center">
                <Flame className="w-4 h-4 text-sky-200" />
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
                      ? 'bg-sky-50/70 dark:bg-[#0B213F] border-sky-300 dark:border-sky-700'
                      : 'bg-white dark:bg-[#0A192F] border-sky-100 dark:border-sky-950'
                  } shadow-sm space-y-3 text-right`}
                >
                  {/* Top Meta Info */}
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopy(thikr.text, thikr.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-sky-600 transition-colors cursor-pointer"
                        title="نسخ الذكر"
                      >
                        {copiedId === thikr.id ? <Check className="w-4 h-4 text-sky-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleShare(thikr.text, thikr.source)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-sky-600 transition-colors cursor-pointer"
                        title="مشاركة الذكر"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {isDone && (
                        <span className="bg-sky-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>مكتمل</span>
                        </span>
                      )}
                      <span className="font-bold text-xs text-sky-700 dark:text-sky-300">
                        العدد المطلوب: {toArabicNumerals(thikr.repeatCount)}
                      </span>
                    </div>
                  </div>

                  {/* Thikr Main Text */}
                  <p className="font-amiri text-lg sm:text-xl leading-relaxed text-slate-900 dark:text-sky-50">
                    {thikr.text}
                  </p>

                  {/* Virtue / Fadl and Source */}
                  {thikr.fadl && (
                    <div className="p-3 rounded-xl bg-sky-50/50 dark:bg-[#08182D] border border-sky-200/60 dark:border-sky-900/60 text-xs space-y-1">
                      <div className="flex items-center gap-1 font-bold text-sky-700 dark:text-sky-300">
                        <Info className="w-3.5 h-3.5" />
                        <span>الفضل والأثر:</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-normal">
                        {thikr.fadl}
                      </p>
                      {thikr.source && (
                        <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-medium pt-0.5">
                          المصدر: {thikr.source}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Interactive Big Tap Counter Button */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                      المتبقي: {toArabicNumerals(Math.max(0, thikr.repeatCount - currentCount))}
                    </span>

                    <button
                      onClick={() => handleIncrement(thikr.id, thikr.repeatCount)}
                      className={`px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer ${
                        isDone
                          ? 'bg-sky-700 text-white cursor-default'
                          : 'bg-[#0284C7] hover:bg-sky-500 text-white shadow-sky-600/30'
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
              <div className="p-8 text-center bg-white dark:bg-[#0A192F] rounded-2xl border border-dashed border-sky-200 dark:border-sky-900 text-sm text-slate-400">
                لا توجد أذكار مطابقة لبحثك.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Universal Export Modal */}
      <UniversalExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        payload={currentExportData}
      />
    </div>
  );
};

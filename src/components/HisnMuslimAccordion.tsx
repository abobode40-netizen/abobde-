import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  Sun,
  Moon,
  Bed,
  CheckCircle,
  Building,
  Coffee,
  HeartHandshake,
  Shield,
  Navigation,
  Users,
  CloudRain,
  Compass,
  BookOpen,
  Copy,
  Share2,
  Check,
  RotateCcw,
  Search,
  Sparkles,
  Layers,
  ArrowRight,
  Flame,
  Info,
  Volume2,
  Pause
} from 'lucide-react';
import { ATHKAR_CATEGORIES } from '../data/athkarData';
import { toArabicNumerals } from '../data/quranData';
import { AthkarCategory, ThikrItem } from '../types';
import { playChime, triggerHaptic } from '../utils/audio';
import { speakThikr, stopAthkarAudio } from '../utils/athkarAudio';

interface HisnMuslimAccordionProps {
  athkarProgress: Record<string, number>;
  onIncrementThikr: (thikrId: string, maxCount: number) => void;
  onResetCategory: (categoryId: string) => void;
  onSelectCategoryForStream: (categoryId: string) => void;
  onOpenSebha: () => void;
  showToast: (msg: string) => void;
}

export const HisnMuslimAccordion: React.FC<HisnMuslimAccordionProps> = ({
  athkarProgress,
  onIncrementThikr,
  onResetCategory,
  onSelectCategoryForStream,
  onOpenSebha,
  showToast
}) => {
  // Track open accordion category IDs (default: morning open)
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    morning: true,
    evening: false
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterCategory, setActiveFilterCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Audio player state
  const [playingThikrId, setPlayingThikrId] = useState<string | null>(null);
  const [audioProgressPercent, setAudioProgressPercent] = useState<number>(0);

  // Cleanup audio on unmount
  React.useEffect(() => {
    return () => {
      stopAthkarAudio();
    };
  }, []);

  const handlePlaySingleThikr = (thikrId: string, text: string, maxCount: number) => {
    if (playingThikrId === thikrId) {
      stopAthkarAudio();
      setPlayingThikrId(null);
      setAudioProgressPercent(0);
      showToast('تم إيقاف الاستماع الصوتي');
    } else {
      setPlayingThikrId(thikrId);
      setAudioProgressPercent(0);
      triggerHaptic('light');

      speakThikr(
        thikrId,
        text,
        (id, percent) => {
          setAudioProgressPercent(percent);
        },
        (id) => {
          onIncrementThikr(id, maxCount);
          setAudioProgressPercent(100);
          setPlayingThikrId(null);
        },
        () => {
          setPlayingThikrId(null);
        }
      );
    }
  };

  // Toggle category accordion
  const toggleCategory = (categoryId: string) => {
    playChime('click');
    triggerHaptic('light');
    setOpenCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Expand / Collapse all
  const handleExpandAll = () => {
    playChime('click');
    triggerHaptic('medium');
    const allOpen: Record<string, boolean> = {};
    ATHKAR_CATEGORIES.forEach(c => {
      allOpen[c.id] = true;
    });
    setOpenCategories(allOpen);
  };

  const handleCollapseAll = () => {
    playChime('click');
    triggerHaptic('medium');
    setOpenCategories({});
  };

  // Copy thikr
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    playChime('success');
    showToast('تم نسخ الذكر من حصن المسلم');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Share thikr
  const handleShare = (text: string, source?: string) => {
    const shareText = `${text}\n\n[المصدر: ${source || 'حصن المسلم'}]\nتطبيق جنّة الرحمن`;
    if (navigator.share) {
      navigator.share({
        title: 'ذكر من حصن المسلم - جنّة الرحمن',
        text: shareText
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      showToast('تم نسخ الذكر للمشاركة');
    }
  };

  // Filter categories based on search or category filter
  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    
    return ATHKAR_CATEGORIES.map(category => {
      if (activeFilterCategory !== 'all' && category.id !== activeFilterCategory) {
        return null;
      }

      if (!query) {
        return { category, matchedItems: category.items };
      }

      const matchedItems = category.items.filter(
        item =>
          item.text.toLowerCase().includes(query) ||
          (item.fadl && item.fadl.toLowerCase().includes(query)) ||
          category.title.toLowerCase().includes(query)
      );

      if (matchedItems.length > 0) {
        return { category, matchedItems };
      }
      return null;
    }).filter(Boolean) as { category: AthkarCategory; matchedItems: ThikrItem[] }[];
  }, [searchQuery, activeFilterCategory]);

  // If searching, auto-expand categories with matching items
  React.useEffect(() => {
    if (searchQuery.trim()) {
      const openMap: Record<string, boolean> = {};
      filteredCategories.forEach(({ category }) => {
        openMap[category.id] = true;
      });
      setOpenCategories(openMap);
    }
  }, [searchQuery, filteredCategories]);

  // Render icon helper
  const renderCategoryIcon = (iconName: string, color: string) => {
    const iconColor = color.includes('#0284C7') || color.includes('green') || color.includes('sky') || color.includes('cyan')
      ? '#0284C7'
      : color;
    const props = { className: 'w-5 h-5', style: { color: iconColor } };
    switch (iconName) {
      case 'Sun':
        return <Sun {...props} />;
      case 'Moon':
        return <Moon {...props} />;
      case 'Bed':
        return <Bed {...props} />;
      case 'CheckCircle':
        return <CheckCircle {...props} />;
      case 'Building':
        return <Building {...props} />;
      case 'Coffee':
        return <Coffee {...props} />;
      case 'HeartHandshake':
        return <HeartHandshake {...props} />;
      case 'Shield':
        return <Shield {...props} />;
      case 'Navigation':
        return <Navigation {...props} />;
      case 'Users':
        return <Users {...props} />;
      case 'CloudRain':
        return <CloudRain {...props} />;
      case 'Compass':
        return <Compass {...props} />;
      default:
        return <BookOpen {...props} />;
    }
  };

  // Calculate overall stats
  const totalAllItems = ATHKAR_CATEGORIES.reduce((acc, cat) => acc + cat.items.length, 0);
  const totalCompletedAll = ATHKAR_CATEGORIES.reduce(
    (acc, cat) =>
      acc +
      cat.items.filter(item => (athkarProgress[item.id] || 0) >= item.repeatCount).length,
    0
  );

  return (
    <div className="space-y-4">
      {/* Intro Header & Overall Progress Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-[#0c2448] via-[#10335e] to-[#184882] text-white shadow-md border border-sky-400/30 relative overflow-hidden">
        <div className="absolute -left-6 -bottom-6 w-28 h-28 rounded-full bg-sky-400/15 pointer-events-none blur-sm" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-sky-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold font-amiri text-sky-100">
                  فهرس حصن المسلم المصنّف
                </h3>
                <span className="text-[10px] bg-sky-400/25 border border-sky-300/30 text-sky-100 px-2 py-0.5 rounded-full font-semibold">
                  أبواب الذكر
                </span>
              </div>
              <p className="text-xs text-sky-200/90 mt-0.5">
                تصفح الأذكار والأدعية اليومية مصنفة في قوائم منسدلة سهلة الوصول
              </p>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-3.5 pt-3 border-t border-white/15 relative z-10 flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-black/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-300 rounded-full transition-all duration-500"
                style={{
                  width: `${totalAllItems > 0 ? (totalCompletedAll / totalAllItems) * 100 : 0}%`
                }}
              />
            </div>
            <span className="text-sky-100 text-[11px] font-medium">
              تم إنجاز {toArabicNumerals(totalCompletedAll)} من {toArabicNumerals(totalAllItems)} ذكراً
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExpandAll}
              className="text-[11px] bg-white/10 hover:bg-white/20 text-sky-100 hover:text-white px-2.5 py-1 rounded-lg transition-all active:scale-95"
            >
              فتح الكل
            </button>
            <button
              onClick={handleCollapseAll}
              className="text-[11px] bg-white/10 hover:bg-white/20 text-sky-100 hover:text-white px-2.5 py-1 rounded-lg transition-all active:scale-95"
            >
              طي الكل
            </button>
          </div>
        </div>
      </div>

      {/* Search Input for Hisn Al-Muslim */}
      <div className="relative">
        <input
          type="text"
          placeholder="ابحث في أبواب وأذكار حصن المسلم..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-[#0A192F] border border-sky-200 dark:border-sky-950 focus:border-[#0284C7] dark:focus:border-sky-400 rounded-2xl py-3 pr-11 pl-4 text-sm text-right outline-none text-slate-800 dark:text-white shadow-sm placeholder-slate-400"
        />
        <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute left-3.5 top-3.5 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full"
          >
            مسح
          </button>
        )}
      </div>

      {/* Category Filter Chips */}
      {!searchQuery && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setActiveFilterCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeFilterCategory === 'all'
                ? 'bg-[#0284C7] text-white shadow-xs'
                : 'bg-white dark:bg-[#0A192F] border border-sky-200 dark:border-sky-950 text-slate-700 dark:text-slate-300 hover:border-sky-400'
            }`}
          >
            جميع الأبواب ({toArabicNumerals(ATHKAR_CATEGORIES.length)})
          </button>
          {ATHKAR_CATEGORIES.map(cat => {
            const isSel = activeFilterCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveFilterCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSel
                    ? 'bg-[#0284C7] text-white shadow-xs'
                    : 'bg-white dark:bg-[#0A192F] border border-sky-200 dark:border-sky-950 text-slate-700 dark:text-slate-300 hover:border-sky-400'
                }`}
              >
                {cat.title}
              </button>
            );
          })}
        </div>
      )}

      {/* Quick Electronic Sebha Banner */}
      <div 
        onClick={onOpenSebha}
        className="p-3 rounded-2xl bg-gradient-to-r from-sky-500/10 via-blue-600/10 to-cyan-500/10 border border-sky-300/40 dark:border-sky-700/40 flex items-center justify-between cursor-pointer hover:border-sky-400 transition-all"
      >
        <span className="text-xs font-bold text-sky-700 dark:text-sky-300 bg-white dark:bg-[#0A192F] px-2.5 py-1 rounded-lg shadow-xs border border-sky-200 dark:border-sky-800">
          مسبحة الأذكار
        </span>
        <div className="text-right flex items-center gap-2">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">المسبحة الإلكترونية الحرة</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">سبّح واستغفر بعداد حر وأصوات تسبيح هادئة</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#0284C7] text-white flex items-center justify-center">
            <Flame className="w-4 h-4 text-sky-200" />
          </div>
        </div>
      </div>

      {/* Accordion Categories Stream */}
      <div className="space-y-3">
        {filteredCategories.map(({ category, matchedItems }) => {
          const isOpen = Boolean(openCategories[category.id]);
          const completedCount = category.items.filter(
            i => (athkarProgress[i.id] || 0) >= i.repeatCount
          ).length;
          const isCategoryFullyDone = completedCount === category.items.length && category.items.length > 0;

          return (
            <div
              key={category.id}
              className={`rounded-3xl border transition-all duration-300 overflow-hidden shadow-xs ${
                isOpen
                  ? 'bg-white dark:bg-[#0A192F] border-sky-400/50 dark:border-sky-600/50 ring-1 ring-sky-400/20'
                  : 'bg-white/95 dark:bg-[#0A192F]/80 border-sky-100 dark:border-sky-950 hover:border-sky-300'
              }`}
            >
              {/* Accordion Header Button */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full p-4 flex items-center justify-between text-right cursor-pointer group transition-colors"
                aria-expanded={isOpen}
              >
                {/* Left Side: Chevron & Completed Badge */}
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-300 ${
                      isOpen ? 'bg-[#0284C7] text-white rotate-180' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-sky-50'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>

                  {isCategoryFullyDone ? (
                    <span className="hidden sm:inline-flex bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-[10px] font-bold px-2 py-0.5 rounded-full items-center gap-1 border border-sky-300/40">
                      <Check className="w-3 h-3" />
                      <span>مكتمل</span>
                    </span>
                  ) : completedCount > 0 ? (
                    <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
                      {toArabicNumerals(completedCount)}/{toArabicNumerals(category.items.length)}
                    </span>
                  ) : null}
                </div>

                {/* Right Side: Icon & Title & Item Count */}
                <div className="flex items-center gap-3 pr-1">
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.2 rounded-full">
                        {toArabicNumerals(matchedItems.length)} {matchedItems.length === 1 ? 'ذكر' : 'أذكار'}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold font-amiri text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                        {category.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 max-w-[240px] sm:max-w-md">
                      {category.subtitle}
                    </p>
                  </div>

                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs bg-sky-50 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800"
                  >
                    {renderCategoryIcon(category.iconName, '#0284C7')}
                  </div>
                </div>
              </button>

              {/* Accordion Content Panel */}
              {isOpen && (
                <div className="px-3 sm:px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-fadeIn">
                  {/* Category Action Bar */}
                  <div className="flex items-center justify-between pt-2 pb-1 text-xs border-b border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => onResetCategory(category.id)}
                      className="text-slate-500 hover:text-sky-600 dark:hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="إعادة تصفير عداد أذكار هذا الباب"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>إعادة العدادات</span>
                    </button>

                    <button
                      onClick={() => onSelectCategoryForStream(category.id)}
                      className="text-[#0284C7] dark:text-sky-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <span>عرض في شاشة العداد التفاعلي</span>
                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  </div>

                  {/* List of Thikr Items inside Category */}
                  <div className="space-y-3">
                    {matchedItems.map((thikr, idx) => {
                      const currentCount = athkarProgress[thikr.id] || 0;
                      const isDone = currentCount >= thikr.repeatCount;

                      return (
                        <div
                          key={thikr.id}
                          className={`p-4 rounded-2xl border transition-all duration-200 text-right space-y-2.5 ${
                            isDone
                              ? 'bg-sky-50/70 dark:bg-[#0B213F] border-sky-300 dark:border-sky-700'
                              : 'bg-white dark:bg-[#08182D] border-sky-100 dark:border-sky-900/50'
                          }`}
                        >
                          {/* Item Meta & Actions Header */}
                          <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200/60 dark:border-slate-800">
                            {/* Action Buttons: Audio Listen, Copy, Share */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handlePlaySingleThikr(thikr.id, thikr.text, thikr.repeatCount)}
                                className={`px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                                  playingThikrId === thikr.id
                                    ? 'bg-amber-500 text-white ring-2 ring-amber-300 animate-pulse'
                                    : 'bg-sky-100 dark:bg-sky-950 text-[#0284C7] dark:text-sky-300 hover:bg-sky-200'
                                }`}
                                title={playingThikrId === thikr.id ? 'إيقاف الصوت' : 'استمع لهذا الذكر بصوت خاشع هادئ (عربي فصيح)'}
                              >
                                {playingThikrId === thikr.id ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                                <span>{playingThikrId === thikr.id ? 'إيقاف' : 'استمع 🎧'}</span>
                              </button>

                              <button
                                onClick={() => handleCopy(thikr.text, thikr.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-sky-600 transition-colors cursor-pointer"
                                title="نسخ الذكر"
                              >
                                {copiedId === thikr.id ? (
                                  <Check className="w-3.5 h-3.5 text-sky-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>

                              <button
                                onClick={() => handleShare(thikr.text, thikr.source)}
                                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-sky-600 transition-colors cursor-pointer"
                                title="مشاركة الذكر"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Number in category + Status */}
                            <div className="flex items-center gap-2">
                              {isDone && (
                                <span className="bg-sky-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  <span>مكتمل</span>
                                </span>
                              )}
                              <span className="font-bold text-xs text-sky-700 dark:text-sky-300">
                                التكرار: {toArabicNumerals(thikr.repeatCount)} {thikr.repeatCount === 1 ? 'مرة' : 'مرات'}
                              </span>
                              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center text-[10px] font-bold">
                                {toArabicNumerals(idx + 1)}
                              </span>
                            </div>
                          </div>

                          {/* Main Thikr Text */}
                          <p className="font-amiri text-base sm:text-lg leading-relaxed text-slate-900 dark:text-sky-50 select-text">
                            {thikr.text}
                          </p>

                          {/* Progress Indicators: Repetitions & Live Speech Audio */}
                          <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                              <span>
                                {playingThikrId === thikr.id ? (
                                  <span className="text-amber-600 dark:text-amber-300 font-bold flex items-center gap-1 animate-pulse">
                                    <Volume2 className="w-3 h-3 text-amber-500 inline" />
                                    <span>تلاوة خاشعة ({toArabicNumerals(audioProgressPercent)}%)</span>
                                  </span>
                                ) : (
                                  <span>الإنجاز: {toArabicNumerals(Math.round((currentCount / thikr.repeatCount) * 100))}%</span>
                                )}
                              </span>
                              <span>
                                {toArabicNumerals(currentCount)}/{toArabicNumerals(thikr.repeatCount)}
                              </span>
                            </div>

                            {/* Repetition Completion Progress Bar */}
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-800">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isDone ? 'bg-sky-600' : 'bg-gradient-to-r from-sky-400 to-[#0284C7]'
                                }`}
                                style={{ width: `${Math.min(100, (currentCount / thikr.repeatCount) * 100)}%` }}
                              />
                            </div>

                            {/* Live Speech Audio Progress Bar (Active when audio is playing for this thikr) */}
                            {playingThikrId === thikr.id && (
                              <div className="w-full bg-amber-100 dark:bg-amber-950/60 h-1 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-amber-500 rounded-full transition-all duration-150"
                                  style={{ width: `${audioProgressPercent}%` }}
                                />
                              </div>
                            )}
                          </div>

                          {/* Fadl / Virtue Box */}
                          {thikr.fadl && (
                            <div className="p-2.5 rounded-xl bg-sky-50/50 dark:bg-[#061224] border border-sky-100 dark:border-sky-900/60 text-xs space-y-1">
                              <div className="flex items-center gap-1 font-bold text-sky-700 dark:text-sky-300 text-[11px]">
                                <Info className="w-3 h-3" />
                                <span>الفضل والأثر:</span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 leading-normal text-[11px]">
                                {thikr.fadl}
                              </p>
                              {thikr.source && (
                                <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-medium pt-0.5">
                                  المصدر: {thikr.source}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Interactive Tap Counter */}
                          <div className="pt-1 flex items-center justify-between">
                            <span className="text-[11px] text-slate-500 font-medium">
                              المتبقي: {toArabicNumerals(Math.max(0, thikr.repeatCount - currentCount))}
                            </span>

                            <button
                              onClick={() => onIncrementThikr(thikr.id, thikr.repeatCount)}
                              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-xs cursor-pointer ${
                                isDone
                                  ? 'bg-sky-700 text-white cursor-default'
                                  : 'bg-[#0284C7] hover:bg-sky-500 text-white'
                              }`}
                            >
                              <span>{isDone ? 'تم بحمد الله' : 'سبّح / اذكر'}</span>
                              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                                {toArabicNumerals(currentCount)}/{toArabicNumerals(thikr.repeatCount)}
                              </span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredCategories.length === 0 && (
          <div className="p-8 text-center bg-white dark:bg-[#0A192F] rounded-3xl border border-dashed border-sky-200 dark:border-sky-900 text-sm text-slate-400 space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-slate-400" />
            <p className="font-bold">لم يتم العثور على أذكار مطابقة لبحثك في حصن المسلم.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilterCategory('all');
              }}
              className="text-xs text-[#0284C7] dark:text-sky-300 font-bold underline cursor-pointer"
            >
              عرض جميع أبواب حصن المسلم
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

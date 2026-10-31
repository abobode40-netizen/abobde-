import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Quote, 
  TreePine, 
  Search, 
  Settings, 
  ArrowLeft, 
  ChevronLeft, 
  Heart, 
  Clock, 
  Flame, 
  Compass,
  CheckCircle2,
  Headphones,
  BookmarkCheck,
  BookCheck,
  Lightbulb,
  Download
} from 'lucide-react';
import { AppTab, DayTrackerData, Bookmark } from '../types';
import { toArabicNumerals } from '../data/quranData';
import { playChime, triggerHaptic } from '../utils/audio';
import { loadBookmarks, loadBookmarksAsync, onStorageChange } from '../utils/storage';
import { PrayerTimesWidget } from './PrayerTimesWidget';
import { GitHubBridgeModal } from './GitHubBridgeModal';
import { DoorActionBar } from './DoorActionBar';
import { UniversalExportModal } from './UniversalExportModal';

interface HomeViewProps {
  onNavigate: (tab: AppTab) => void;
  onOpenMushafPage: (page: number) => void;
  onOpenSebha: () => void;
  trackerData: DayTrackerData;
  lastReadPage: number;
  fontScale?: number;
  onChangeFontScale?: (scale: number) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenMushafPage,
  onOpenSebha,
  trackerData,
  lastReadPage,
  fontScale = 100,
  onChangeFontScale
}) => {
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => loadBookmarks());
  const [isExportOpen, setIsExportOpen] = useState(false);

  useEffect(() => {
    setBookmarks(loadBookmarks());
    loadBookmarksAsync().then((bms) => {
      if (bms && bms.length > 0) setBookmarks(bms);
    });
    const unsub = onStorageChange((key) => {
      if (key === 'jannat_bookmarks_v1' || key === 'ALL') {
        setBookmarks(loadBookmarks());
      }
    });
    return unsub;
  }, []);

  const latestBookmark = bookmarks.length > 0 ? bookmarks[0] : null;

  const treePct = trackerData.treeGrowthPercentage || 0;
  const completedHabitsCount = Object.values(trackerData.habits).filter(Boolean).length;
  const totalHabits = 10;

  const dailySummaryText = `بسم الله الرحمن الرحيم
ملخص اليوم الإيماني - تطبيق جنّة الرحمن:
• نسبة إتمام شجرة العبادات: ${toArabicNumerals(treePct)}%
• أعمال البر المنجزة: ${toArabicNumerals(completedHabitsCount)} من ${toArabicNumerals(totalHabits)}
• ورد القرآن: صفحة ${toArabicNumerals(lastReadPage || 1)}
«أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ»`;

  return (
    <div className="pb-24 pt-2 px-3 sm:px-4 max-w-lg mx-auto space-y-4 animate-fadeIn">
      {/* Universal Action Bar: Zoom and Export */}
      <DoorActionBar
        doorTitle="الرئيسية • جنّة الرحمن"
        fontScale={fontScale}
        onChangeFontScale={onChangeFontScale}
        onOpenExport={() => setIsExportOpen(true)}
        swipeHint="اختر أي باب للانطلاق في رحلتك ⇆"
      />

      {/* Top Header Card with Royal Islamic Blue Theme & Subtle Arabesque */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c2448] via-[#103463] to-[#184882] text-white p-6 shadow-md border border-sky-400/30 arabesque-watermark">
        {/* Background Subtle Shape Accent */}
        <div className="absolute -left-12 -top-12 w-44 h-44 rounded-full bg-sky-400/15 border-[28px] border-sky-300/10 pointer-events-none" />

        {/* Action Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('search')}
              aria-label="البحث في التطبيق"
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center transition-all active:scale-95 text-white cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate('settings')}
              aria-label="فتح الإعدادات"
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center transition-all active:scale-95 text-white cursor-pointer"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                triggerHaptic('light');
                playChime('click');
                setIsGitHubModalOpen(true);
              }}
              title="جسر GitHub و الرابط العام المباشر"
              aria-label="جسر GitHub والنشر العام"
              className="w-10 h-10 rounded-xl bg-sky-400/20 hover:bg-sky-400/30 border border-sky-300/30 flex items-center justify-center transition-all active:scale-95 text-sky-200 hover:text-white cursor-pointer"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <h1 className="text-lg font-bold tracking-tight">جنّة الرحمن</h1>
              <p className="text-xs text-sky-200 font-medium">رفيقك في الذكر والقرآن</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center overflow-hidden shadow-sm">
              <img
                src="/jannat-icon.png"
                alt="شعار جنّة الرحمن"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <Sparkles className="w-6 h-6 text-sky-300" />
            </div>
          </div>
        </div>

        {/* Welcoming Text */}
        <div className="mt-7 text-right relative z-10">
          <span className="inline-block text-sky-200 text-sm font-semibold bg-white/10 px-3 py-1 rounded-full mb-1">
            السلام عليكم ورحمة الله
          </span>
          <h2 className="text-2xl font-bold font-amiri leading-snug mt-1 text-white">
            ابدأ بخطوة طيبة، فكل ذكرٍ غرسٌ في جنّتك.
          </h2>
        </div>

        {/* Tree of Today Progress Bar */}
        <div 
          onClick={() => onNavigate('tracker')}
          className="mt-6 bg-black/20 hover:bg-black/30 border border-white/15 rounded-2xl p-3.5 cursor-pointer transition-all active:scale-[0.99] relative z-10"
        >
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-sky-300">{toArabicNumerals(treePct)}%</span>
            <div className="flex items-center gap-1.5 font-semibold text-sky-100">
              <span>شجرة اليوم</span>
              <TreePine className="w-4 h-4 text-sky-300" />
            </div>
          </div>
          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-sky-400 to-cyan-300 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${treePct}%` }}
            />
          </div>
          <p className="text-[11px] text-sky-200 text-right mt-1.5 font-medium">
            أنجزت {toArabicNumerals(completedHabitsCount)} من {toArabicNumerals(totalHabits)} أعمال يومية
          </p>
        </div>
      </div>

      {/* البابان الجديدان المحققان - ظهور مباشر في واجهة الصفحة الرئيسية */}
      <div className="bg-sky-500/10 dark:bg-sky-950/40 p-3 sm:p-4 rounded-3xl border border-sky-400/20 shadow-sm space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#0284C7] text-white shadow-sm flex items-center gap-1">
            <span>جديد ومحقق</span>
            <Sparkles className="w-3 h-3 text-sky-200" />
          </span>
          <div className="text-right">
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-sky-300">
              باب الأدعية المأثورة وباب مشكاة النور
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* كرت باب الأدعية المأثورة */}
          <button
            onClick={() => {
              playChime('click');
              triggerHaptic('selection');
              onNavigate('duas');
            }}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0c264a] to-[#144272] text-white text-right flex flex-col justify-between shadow-md hover:shadow-lg active:scale-95 transition-all min-h-[140px] border border-sky-400/30 group relative overflow-hidden cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-sky-100">
                محققة • رقية
              </span>
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookCheck className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="font-bold text-xs sm:text-sm text-white">باب الأدعية المأثورة</h3>
              <p className="text-[10px] text-sky-100/90 leading-tight mt-1 line-clamp-2">
                صحيح السنة، الرقية والتحصين من السحر والعين، تفريج الكروب، والختم
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-sky-200 mt-2 justify-end">
              <span>افتح الباب</span>
              <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </button>

          {/* كرت باب مشكاة النور */}
          <button
            onClick={() => {
              playChime('click');
              triggerHaptic('selection');
              onNavigate('mishkat');
            }}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0f3460] to-[#16213e] text-white text-right flex flex-col justify-between shadow-md hover:shadow-lg active:scale-95 transition-all min-h-[140px] border border-sky-400/30 group relative overflow-hidden cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-sky-100">
                سيرة الشباب
              </span>
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Lightbulb className="w-4 h-4 text-sky-300" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="font-bold text-xs sm:text-sm text-white">باب مشكاة النور</h3>
              <p className="text-[10px] text-sky-100/90 leading-tight mt-1 line-clamp-2">
                دروس ومواقف نبوية شريفة ملهمة لواقع وهمم الشباب
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-sky-200 mt-2 justify-end">
              <span>افتح الباب</span>
              <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* Mini Widget: مواقيت الصلاة والوقت المتبقي مع الموقع الجغرافي */}
      <PrayerTimesWidget 
        onNavigateToTracker={() => onNavigate('tracker')} 
        onNavigateToQibla={() => onNavigate('qibla')}
      />

      {/* Main Sections Navigation: مواضع الخير */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end text-sky-800 dark:text-sky-300 font-bold text-base">
              <span>مواضع الخير</span>
              <Compass className="w-4 h-4 text-sky-600" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">اختر باباً واستأنف رحلتك المباركة</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: رياض القرآن */}
          <button
            onClick={() => {
              onOpenMushafPage(lastReadPage || 1);
              playChime('click');
            }}
            className="p-4 rounded-2xl bg-white dark:bg-[#0A192F] border border-sky-100 dark:border-sky-950 hover:border-[#0284C7] text-right flex flex-col justify-between transition-all active:scale-[0.98] shadow-sm hover:shadow group min-h-[145px] cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-[#0284C7] dark:text-sky-300 flex items-center justify-center self-end group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#0284C7] dark:group-hover:text-sky-300 transition-colors">
                رياض القرآن
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1 line-clamp-2">
                افتح مصحفك، واحفظ موضعك، وأنصت للتلاوة العذبة.
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#0284C7] dark:text-sky-300 mt-2 justify-end">
              <span>افتح القسم</span>
              <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 2: غراس الأذكار */}
          <button
            onClick={() => onNavigate('athkar')}
            className="p-4 rounded-2xl bg-white dark:bg-[#0A192F] border border-sky-100 dark:border-sky-950 hover:border-[#0284C7] text-right flex flex-col justify-between transition-all active:scale-[0.98] shadow-sm hover:shadow group min-h-[145px] cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 flex items-center justify-center self-end group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#0284C7] dark:group-hover:text-sky-300 transition-colors">
                غراس الأذكار
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1 line-clamp-2">
                أوراق صغيرة من الذكر تُثمر طمأنينة وسكينة في القلب.
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#0284C7] dark:text-sky-300 mt-2 justify-end">
              <span>افتح القسم</span>
              <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 3: باب الأدعية المأثورة */}
          <button
            onClick={() => {
              onNavigate('duas');
              playChime('click');
            }}
            className="p-4 rounded-2xl bg-gradient-to-b from-white to-sky-50/40 dark:from-[#0A192F] dark:to-[#0B213F] border border-sky-200 dark:border-sky-900 hover:border-sky-400 text-right flex flex-col justify-between transition-all active:scale-[0.98] shadow-sm hover:shadow group min-h-[155px] relative overflow-hidden cursor-pointer"
          >
            <span className="absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-[#0284C7] dark:text-sky-300 border border-sky-300 dark:border-sky-800">
              صحيحة • رقية
            </span>
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-[#0284C7] dark:text-sky-300 flex items-center justify-center self-end group-hover:scale-110 transition-transform">
              <BookCheck className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#0284C7] dark:group-hover:text-sky-300 transition-colors flex items-center justify-end gap-1">
                <span>الأدعية والرقية</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1 line-clamp-2">
                الرقية الشرعية، تفريج الكروب، جوامع الدعاء، وصحيح السنة.
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#0284C7] dark:text-sky-300 mt-2 justify-end">
              <span>فتح الباب</span>
              <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 4: باب مشكاة النور */}
          <button
            onClick={() => {
              onNavigate('mishkat');
              playChime('click');
            }}
            className="p-4 rounded-2xl bg-gradient-to-b from-white to-sky-50/40 dark:from-[#0A192F] dark:to-[#0C2448] border border-sky-200 dark:border-sky-900 hover:border-sky-400 text-right flex flex-col justify-between transition-all active:scale-[0.98] shadow-sm hover:shadow group min-h-[155px] relative overflow-hidden cursor-pointer"
          >
            <span className="absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-[#0284C7] dark:text-sky-300 border border-sky-300 dark:border-sky-800">
              للشباب
            </span>
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-[#0284C7] dark:text-sky-300 flex items-center justify-center self-end group-hover:scale-110 transition-transform">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#0284C7] dark:group-hover:text-sky-300 transition-colors flex items-center justify-end gap-1">
                <span>مشكاة النور</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1 line-clamp-2">
                مقتطفات ودروس سيرة المصطفى ﷺ ملهمة لواقع الشباب.
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#0284C7] dark:text-sky-300 mt-2 justify-end">
              <span>فتح الباب</span>
              <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 5: ثمار المشايخ */}
          <button
            onClick={() => onNavigate('thimar')}
            className="p-4 rounded-2xl bg-white dark:bg-[#0A192F] border border-sky-100 dark:border-sky-950 hover:border-[#0284C7] text-right flex flex-col justify-between transition-all active:scale-[0.98] shadow-sm hover:shadow group min-h-[155px] relative overflow-hidden cursor-pointer"
          >
            <span className="absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              درر وحكم
            </span>
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-[#0284C7] dark:text-sky-300 flex items-center justify-center self-end group-hover:scale-110 transition-transform">
              <Quote className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#0284C7] dark:group-hover:text-sky-300 transition-colors">
                ثمار المشايخ
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1 line-clamp-2">
                درر العلماء والمواعظ المباركة لكبار أئمة السلف والصالحين.
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#0284C7] dark:text-sky-300 mt-2 justify-end">
              <span>افتح القسم</span>
              <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 6: شجرة العبادات */}
          <button
            onClick={() => onNavigate('tracker')}
            className="p-4 rounded-2xl bg-white dark:bg-[#0A192F] border border-sky-100 dark:border-sky-950 hover:border-[#0284C7] text-right flex flex-col justify-between transition-all active:scale-[0.98] shadow-sm hover:shadow group min-h-[145px] cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-[#0284C7] dark:text-sky-300 flex items-center justify-center self-end group-hover:scale-110 transition-transform">
              <TreePine className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#0284C7] dark:group-hover:text-sky-300 transition-colors">
                شجرة العبادات
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1 line-clamp-2">
                تابع صلواتك ووردك وأذكارك يوماً بيوم.
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#0284C7] dark:text-sky-300 mt-2 justify-end">
              <span>افتح القسم</span>
              <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 7: بوصلة القبلة المشرفة */}
          <button
            onClick={() => {
              onNavigate('qibla');
              playChime('click');
            }}
            className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50/50 dark:from-[#0c2448] dark:to-[#08182D] border border-sky-300/80 dark:border-sky-800/60 hover:border-[#0284C7] text-right flex flex-col justify-between transition-all active:scale-[0.98] shadow-sm hover:shadow group min-h-[145px] col-span-2 relative overflow-hidden cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-[#0284C7] dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                مستشعر الجيروسكوب 🧭
              </span>
              <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-[#0284C7] dark:text-sky-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#0284C7] dark:group-hover:text-sky-300 transition-colors flex items-center justify-end gap-1.5">
                <span>بوصلة القبلة المشرفة</span>
                <span className="text-base">🕋</span>
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                تحديد اتجاه الكعبة المشرفة بمستشعر الهاتف وحساب الدرجة الجغرافية والمسافة بدقة.
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#0284C7] dark:text-sky-300 mt-2 justify-end">
              <span>توجيه البوصلة</span>
              <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* Quick Launch: وردك القرآني */}
      <div
        onClick={() => onOpenMushafPage(lastReadPage || 1)}
        className="p-4 rounded-2xl bg-sky-50/70 dark:bg-[#0c2448]/60 border border-sky-200 dark:border-sky-800 flex items-center justify-between cursor-pointer hover:border-sky-400 transition-all active:scale-[0.99] shadow-sm"
      >
        <ChevronLeft className="w-5 h-5 text-sky-600 dark:text-sky-300" />
        <div className="text-right flex-1 pr-3">
          <span className="text-[11px] font-bold text-[#0284C7] dark:text-sky-300">وردك القرآني المستمر</span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            استأنف القراءة من صفحة {toArabicNumerals(lastReadPage || 1)}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            تُحفظ العلامات وتفضيلات القراءة تلقائياً على جهازك.
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-sky-100 dark:bg-sky-950 text-[#0284C7] dark:text-sky-300 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
      </div>

      {/* Latest Bookmark Quick Resume */}
      {latestBookmark && (
        <div
          onClick={() => {
            const page = latestBookmark.pageNumber || (latestBookmark.type !== 'ayah' ? Number(latestBookmark.targetId) : 1);
            onOpenMushafPage(page);
            playChime('click');
          }}
          className="p-3.5 rounded-2xl bg-sky-50/50 dark:bg-[#0A192F] border border-sky-200/80 dark:border-sky-800/60 flex items-center justify-between cursor-pointer hover:border-sky-400 transition-all active:scale-[0.99] shadow-xs"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0284C7] dark:text-sky-300">
            <span>متابعة</span>
            <ChevronLeft className="w-4 h-4" />
          </div>
          <div className="text-right flex-1 pr-2.5">
            <div className="flex items-center justify-end gap-1.5 text-[11px] font-bold text-[#0284C7] dark:text-sky-300">
              <span>آخر فاصلة مرجعية</span>
              <BookmarkCheck className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
              {latestBookmark.title}
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              صفحة {toArabicNumerals(latestBookmark.pageNumber || Number(latestBookmark.targetId) || 1)}
            </p>
          </div>
        </div>
      )}

      {/* Quick Electronic Sebha Bar */}
      <div 
        onClick={onOpenSebha}
        className="p-4 rounded-2xl bg-gradient-to-r from-[#0c2448] via-[#10335e] to-[#0284C7] text-white flex items-center justify-between cursor-pointer shadow hover:shadow-md transition-all active:scale-[0.99]"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs bg-white/20 text-sky-100 border border-white/20 px-2.5 py-1 rounded-full font-bold">
            افتح المسبحة
          </span>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5 font-bold text-sm">
            <span>المسبحة الإلكترونية الذكية</span>
            <Flame className="w-4 h-4 text-sky-300" />
          </div>
          <p className="text-[11px] text-sky-100 mt-0.5">عداد تسبيح واستغفار مع اهتزاز ونغمات هادئة</p>
        </div>
      </div>

      {/* Daily Verse Inspiration Card */}
      <div className="p-4 rounded-2xl bg-sky-50 dark:bg-[#0A192F] border border-sky-100 dark:border-sky-950 text-center space-y-1.5 relative overflow-hidden">
        <div className="flex items-center justify-center gap-1.5 text-[#0284C7] dark:text-sky-300 opacity-90 mb-1">
          <Sparkles className="w-4 h-4 text-sky-500" />
          <span className="text-xs font-bold">آية وتدبر</span>
        </div>

        <p className="text-base sm:text-lg font-bold font-amiri text-slate-900 dark:text-sky-100">
          «أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ»
        </p>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
          سورة الرعد: آية ٢٨
        </span>
      </div>

      {/* GitHub & Google AI Studio Bridge Modal */}
      <GitHubBridgeModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
      />

      {/* Universal Export Modal */}
      <UniversalExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title="ملخص اليوم الإيماني المبارك"
        subtitle="تقرير مختصر عن تقدم الأذكار والطاعات وتلاوة القرآن"
        textToCopy={dailySummaryText}
        fileName="jannat-al-rahman-daily-summary.txt"
        jsonData={trackerData}
      />
    </div>
  );
};

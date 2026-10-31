import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Quote, 
  TreePine, 
  Search, 
  Settings, 
  ChevronLeft, 
  Compass,
  BookCheck,
  Lightbulb,
  Flame,
  BookmarkCheck,
  Download
} from 'lucide-react';
import { AppTab, DayTrackerData, Bookmark } from '../types';
import { toArabicNumerals } from '../data/quranData';
import { playChime, triggerHaptic } from '../utils/audio';
import { loadBookmarks, loadBookmarksAsync, onStorageChange } from '../utils/storage';
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

// Custom crisp SVG icons for the main door cards matching the exact screenshot design
const RosaryBeadsIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="9.5" rx="6.5" ry="5.5" strokeDasharray="2.5 3" strokeWidth="2.2" />
    <circle cx="12" cy="15.5" r="1.3" fill="currentColor" />
    <path d="M12 16.8v3.7" strokeWidth="2" />
    <path d="M10 20.5l2 2 2-2" strokeWidth="2" />
  </svg>
);

const KaabaIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 4H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4h-6v2h6v8H5V6h14v2z" opacity="0.9" />
    <path d="M4 6.5l8-3.5 8 3.5v2L12 5 4 8.5z" />
    <rect x="7" y="10" width="10" height="2" fill="currentColor" opacity="0.7" />
  </svg>
);

const SupplicationHandsIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 0 0-4 0v5" />
    <path d="M14 10V4a2 2 0 0 0-4 0v6" />
    <path d="M10 10.5V6a2 2 0 0 0-4 0v6" />
    <path d="M6 13.5A6.5 6.5 0 0 0 12.5 20h.5a6.5 6.5 0 0 0 6.5-6.5V11" />
  </svg>
);

const UnifiedPrayerDomeIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v2" />
    <path d="M12 5a7 7 0 0 0-7 7v7h14v-7a7 7 0 0 0-7-7z" />
    <path d="M9 19v-4a3 3 0 0 1 6 0v4" />
    <circle cx="12" cy="10" r="1.5" fill="currentColor" />
  </svg>
);

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
    <div className="pb-24 pt-2 px-3 sm:px-4 max-w-lg mx-auto space-y-3.5 animate-fadeIn" dir="rtl">
      {/* Universal Action Bar: Zoom and Export */}
      <DoorActionBar
        doorTitle="الرئيسية • جنّة الرحمن"
        fontScale={fontScale}
        onChangeFontScale={onChangeFontScale}
        onOpenExport={() => setIsExportOpen(true)}
        swipeHint="اختر أي باب للانطلاق في رحلتك ⇆"
      />

      {/* App Top Utility Bar: Search, Settings & App Identity */}
      <div className="flex items-center justify-between bg-[#0b1b33]/90 backdrop-blur-md p-3 rounded-2xl border border-sky-500/30 shadow-md">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              playChime('click');
              onNavigate('search');
            }}
            aria-label="البحث في التطبيق"
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center transition-all active:scale-95 text-sky-200 hover:text-white cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              playChime('click');
              onNavigate('settings');
            }}
            aria-label="فتح الإعدادات"
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center transition-all active:scale-95 text-sky-200 hover:text-white cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              playChime('click');
              setIsGitHubModalOpen(true);
            }}
            title="جسر GitHub والنشر العام"
            aria-label="جسر GitHub والنشر العام"
            className="w-8 h-8 rounded-xl bg-sky-400/20 hover:bg-sky-400/30 border border-sky-300/30 flex items-center justify-center transition-all active:scale-95 text-sky-200 hover:text-white cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <h1 className="text-sm font-bold text-white tracking-tight">جنّة الرحمن</h1>
            <p className="text-[10px] text-sky-200 font-medium">زاد المسلم ورفيق القلوب</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center overflow-hidden">
            <Sparkles className="w-4 h-4 text-sky-300" />
          </div>
        </div>
      </div>

      {/* Hero Islamic Mihrab Arch Header (المحراب الشريف) */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-[#09172a] to-[#0f2847] border-2 border-sky-400/40 shadow-xl arabesque-watermark">
        <div className="p-3 pb-2">
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-inner border border-amber-400/40">
            <img 
              src="/src/assets/images/hero_masjid_arch_moon_1793474399589.jpg"
              alt="مسجد مضيء وهلال رمضان تحت القوس الإسلامي"
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09172a] via-transparent to-transparent opacity-60 pointer-events-none" />
          </div>
        </div>

        <div className="px-4 pb-3 pt-1 text-center">
          <p className="text-xs sm:text-sm font-semibold font-amiri text-sky-100 drop-shadow">
            «أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ»
          </p>
        </div>
      </div>

      {/* Primary Main Door Cards Grid ONLY (الأبواب الرئيسية فقط بهذا الشكل بدون أي حشو) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-3.5 pt-1">
        {/* Card 1: القرآن الكريم */}
        <button
          onClick={() => {
            playChime('click');
            triggerHaptic('selection');
            onOpenMushafPage(lastReadPage || 1);
          }}
          className="p-5 rounded-3xl bg-[#dce6f5] hover:bg-[#cee0f7] dark:bg-[#132742] dark:hover:bg-[#193254] border border-[#b8cee8] dark:border-sky-500/30 text-center flex flex-col items-center justify-center shadow-md hover:shadow-lg active:scale-95 transition-all group cursor-pointer relative overflow-hidden"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#0f3d63]/10 dark:bg-sky-400/15 flex items-center justify-center text-[#0f3d63] dark:text-sky-200 group-hover:scale-110 transition-transform mb-2">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[#0f3d63] dark:text-sky-100 group-hover:text-sky-700 dark:group-hover:text-white transition-colors">
            القرآن الكريم
          </h3>
          <span className="text-[10px] text-[#0f3d63]/70 dark:text-sky-300/80 mt-0.5 font-medium">
            صفحة {toArabicNumerals(lastReadPage || 1)}
          </span>
        </button>

        {/* Card 2: الأذكار */}
        <button
          onClick={() => {
            playChime('click');
            triggerHaptic('selection');
            onNavigate('athkar');
          }}
          className="p-5 rounded-3xl bg-[#dce6f5] hover:bg-[#cee0f7] dark:bg-[#132742] dark:hover:bg-[#193254] border border-[#b8cee8] dark:border-sky-500/30 text-center flex flex-col items-center justify-center shadow-md hover:shadow-lg active:scale-95 transition-all group cursor-pointer relative overflow-hidden"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#0f3d63]/10 dark:bg-sky-400/15 flex items-center justify-center text-[#0f3d63] dark:text-sky-200 group-hover:scale-110 transition-transform mb-2">
            <RosaryBeadsIcon className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[#0f3d63] dark:text-sky-100 group-hover:text-sky-700 dark:group-hover:text-white transition-colors">
            الأذكار
          </h3>
          <span className="text-[10px] text-[#0f3d63]/70 dark:text-sky-300/80 mt-0.5 font-medium">
            حصن المسلم وغراس الجنة
          </span>
        </button>

        {/* Card 3: المسبحة الإلكترونية (انضمام المسبحة بنفس الشكل والتصميم) */}
        <button
          onClick={() => {
            playChime('click');
            triggerHaptic('selection');
            onOpenSebha();
          }}
          className="p-5 rounded-3xl bg-[#dce6f5] hover:bg-[#cee0f7] dark:bg-[#132742] dark:hover:bg-[#193254] border border-[#b8cee8] dark:border-sky-500/30 text-center flex flex-col items-center justify-center shadow-md hover:shadow-lg active:scale-95 transition-all group cursor-pointer relative overflow-hidden"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#0f3d63]/10 dark:bg-sky-400/15 flex items-center justify-center text-[#0f3d63] dark:text-sky-200 group-hover:scale-110 transition-transform mb-2">
            <Flame className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[#0f3d63] dark:text-sky-100 group-hover:text-sky-700 dark:group-hover:text-white transition-colors">
            المسبحة الإلكترونية
          </h3>
          <span className="text-[10px] text-[#0f3d63]/70 dark:text-sky-300/80 mt-0.5 font-medium">
            عداد التسبيح والاستغفار
          </span>
        </button>

        {/* Card 4: الصلاة والقبلة والمواقيت (دمج أوقات الصلاة والقبلة في باب واحد) */}
        <button
          onClick={() => {
            playChime('click');
            triggerHaptic('selection');
            onNavigate('tracker');
          }}
          className="p-5 rounded-3xl bg-[#dce6f5] hover:bg-[#cee0f7] dark:bg-[#132742] dark:hover:bg-[#193254] border border-[#b8cee8] dark:border-sky-500/30 text-center flex flex-col items-center justify-center shadow-md hover:shadow-lg active:scale-95 transition-all group cursor-pointer relative overflow-hidden"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#0f3d63]/10 dark:bg-sky-400/15 flex items-center justify-center text-[#0f3d63] dark:text-sky-200 group-hover:scale-110 transition-transform mb-2">
            <UnifiedPrayerDomeIcon className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[#0f3d63] dark:text-sky-100 group-hover:text-sky-700 dark:group-hover:text-white transition-colors">
            الصلاة والقبلة والمواقيت
          </h3>
          <span className="text-[10px] text-[#0f3d63]/70 dark:text-sky-300/80 mt-0.5 font-medium">
            أوقات الصلاة والقبلة
          </span>
        </button>

        {/* Card 5: الأدعية المأثورة */}
        <button
          onClick={() => {
            playChime('click');
            triggerHaptic('selection');
            onNavigate('duas');
          }}
          className="p-5 rounded-3xl bg-[#dce6f5] hover:bg-[#cee0f7] dark:bg-[#132742] dark:hover:bg-[#193254] border border-[#b8cee8] dark:border-sky-500/30 text-center flex flex-col items-center justify-center shadow-md hover:shadow-lg active:scale-95 transition-all group cursor-pointer relative overflow-hidden"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#0f3d63]/10 dark:bg-sky-400/15 flex items-center justify-center text-[#0f3d63] dark:text-sky-200 group-hover:scale-110 transition-transform mb-2">
            <SupplicationHandsIcon className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[#0f3d63] dark:text-sky-100 group-hover:text-sky-700 dark:group-hover:text-white transition-colors">
            الأدعية المأثورة
          </h3>
          <span className="text-[10px] text-[#0f3d63]/70 dark:text-sky-300/80 mt-0.5 font-medium">
            الرقية الشرعية والسنّة
          </span>
        </button>

        {/* Card 6: مشكاة الأنوار */}
        <button
          onClick={() => {
            playChime('click');
            triggerHaptic('selection');
            onNavigate('mishkat');
          }}
          className="p-5 rounded-3xl bg-[#dce6f5] hover:bg-[#cee0f7] dark:bg-[#132742] dark:hover:bg-[#193254] border border-[#b8cee8] dark:border-sky-500/30 text-center flex flex-col items-center justify-center shadow-md hover:shadow-lg active:scale-95 transition-all group cursor-pointer relative overflow-hidden"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#0f3d63]/10 dark:bg-sky-400/15 flex items-center justify-center text-[#0f3d63] dark:text-sky-200 group-hover:scale-110 transition-transform mb-2">
            <Lightbulb className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[#0f3d63] dark:text-sky-100 group-hover:text-sky-700 dark:group-hover:text-white transition-colors">
            مشكاة الأنوار
          </h3>
          <span className="text-[10px] text-[#0f3d63]/70 dark:text-sky-300/80 mt-0.5 font-medium">
            قبسات السيرة والشباب
          </span>
        </button>

        {/* Card 7: ثمار المشايخ */}
        <button
          onClick={() => {
            playChime('click');
            triggerHaptic('selection');
            onNavigate('thimar');
          }}
          className="p-5 rounded-3xl bg-[#dce6f5] hover:bg-[#cee0f7] dark:bg-[#132742] dark:hover:bg-[#193254] border border-[#b8cee8] dark:border-sky-500/30 text-center flex flex-col items-center justify-center shadow-md hover:shadow-lg active:scale-95 transition-all group cursor-pointer relative overflow-hidden"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#0f3d63]/10 dark:bg-sky-400/15 flex items-center justify-center text-[#0f3d63] dark:text-sky-200 group-hover:scale-110 transition-transform mb-2">
            <Quote className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[#0f3d63] dark:text-sky-100 group-hover:text-sky-700 dark:group-hover:text-white transition-colors">
            ثمار المشايخ
          </h3>
          <span className="text-[10px] text-[#0f3d63]/70 dark:text-sky-300/80 mt-0.5 font-medium">
            درر كبار العلماء والأئمة
          </span>
        </button>

      </div>

      {/* GitHub Bridge Modal */}
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

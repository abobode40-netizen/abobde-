import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Search, 
  Settings, 
  Download
} from 'lucide-react';
import { AppTab, DayTrackerData, Bookmark } from '../types';
import { toArabicNumerals } from '../data/quranData';
import { playChime, triggerHaptic } from '../utils/audio';
import { loadBookmarks, loadBookmarksAsync, onStorageChange } from '../utils/storage';
import { GitHubBridgeModal } from './GitHubBridgeModal';
import { HijriDateBanner } from './HijriDateBanner';
import { UniversalExportModal } from './UniversalExportModal';
import heroMasjidImg from '../assets/images/hero_masjid_arch_moon_1793474399589.jpg';

interface HomeViewProps {
  onNavigate: (tab: AppTab) => void;
  onOpenMushafPage: (page: number) => void;
  onOpenSebha: () => void;
  trackerData: DayTrackerData;
  lastReadPage: number;
  fontScale?: number;
  onChangeFontScale?: (scale: number) => void;
}

// 1. Holy Quran Open Book Icon (المصحف الشريف)
const QuranBookIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4.5C2 3.67 2.67 3 3.5 3H10c1.5 0 2 1 2 2v14.5c0-.8-1-1.5-2.5-1.5H3.5A1.5 1.5 0 0 0 2 19.5v-15z" />
    <path d="M22 4.5c0-.83-.67-1.5-1.5-1.5H14c-1.5 0-2 1-2 2v14.5c0-.8 1-1.5 2.5-1.5h6.5a1.5 1.5 0 0 1 1.5 1.5v-15z" />
    <path d="M6 7h3" strokeWidth="1.6" />
    <path d="M6 10h3" strokeWidth="1.6" />
    <path d="M6 13h3" strokeWidth="1.6" />
    <path d="M15 7h3" strokeWidth="1.6" />
    <path d="M15 10h3" strokeWidth="1.6" />
    <path d="M15 13h3" strokeWidth="1.6" />
  </svg>
);

// 2. Rosary Beads Icon (غراس الأذكار وحصن المسلم)
const AthkarRosaryIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="10" rx="7" ry="6" strokeDasharray="2.2 2.8" strokeWidth="2.4" />
    <circle cx="12" cy="16.5" r="1.5" fill="currentColor" />
    <path d="M12 18v3.5" strokeWidth="2.2" />
    <path d="M10 22h4" strokeWidth="2" />
    <circle cx="10" cy="19.5" r="0.6" fill="currentColor" />
    <circle cx="14" cy="19.5" r="0.6" fill="currentColor" />
  </svg>
);

// 3. Electronic Sebha Counter Icon (المسبحة الإلكترونية)
const ElectronicSebhaIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="3" width="14" height="18" rx="6" />
    <rect x="8" y="6" width="8" height="4.5" rx="1.5" fill="currentColor" fillOpacity="0.2" strokeWidth="1.5" />
    <circle cx="12" cy="14.5" r="2.8" fill="currentColor" fillOpacity="0.3" strokeWidth="1.8" />
    <circle cx="15.5" cy="12" r="1" strokeWidth="1.5" />
    <path d="M10 8.2h4" strokeWidth="1.4" />
  </svg>
);

// 4. Mosque & Prayer Times Icon (الصلاة والقبلة والمواقيت)
const PrayerMosqueIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3c-1.5 2-4.5 4-4.5 7.5v8.5h9v-8.5C16.5 7 13.5 5 12 3z" />
    <path d="M10.5 19v-4a1.5 1.5 0 0 1 3 0v4" />
    <path d="M4 11v8" />
    <path d="M20 11v8" />
    <path d="M3 19h18" strokeWidth="2" />
    <circle cx="12" cy="7.5" r="1.2" fill="currentColor" />
    <path d="M12 2v2" strokeWidth="2" />
  </svg>
);

// 5. Supplication Hands Icon (الأدعية المأثورة)
const DuaHandsIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 10V5.5a1.8 1.8 0 0 0-3.6 0V11" />
    <path d="M14.4 9V4a1.8 1.8 0 0 0-3.6 0v7" />
    <path d="M10.8 9.5V4.5a1.8 1.8 0 0 0-3.6 0v6.5" />
    <path d="M7.2 12V8a1.8 1.8 0 0 0-3.6 0v4.5c0 5 4 8.5 8.4 8.5s8.4-3.5 8.4-8.5v-2" />
    <path d="M12 1.5v2" strokeWidth="1.5" strokeDasharray="1 1" />
  </svg>
);

// 6. Prophetic Lantern Icon (مشكاة الأنوار - السيرة النبوية)
const MishkatLampIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v3" strokeWidth="2" />
    <path d="M8 5h8l1.5 5H6.5L8 5z" />
    <path d="M6.5 10c0 4.5 2.5 8 5.5 8s5.5-3.5 5.5-8" />
    <circle cx="12" cy="13" r="1.5" fill="currentColor" />
    <path d="M9.5 18l-1 4h7l-1-4" />
    <path d="M12 11.5v3" strokeWidth="1.5" />
  </svg>
);

// 7. Scholar Quill & Wisdom Scroll Icon (ثمار المشايخ)
const ThimarScrollIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6.5C4 4.5 5.5 3 7.5 3h10A2.5 2.5 0 0 1 20 5.5V17c0 2-1.5 3.5-3.5 3.5H7.5A3.5 3.5 0 0 1 4 17V6.5z" />
    <path d="M4 17a3.5 3.5 0 0 0 3.5 3.5H19" />
    <path d="M8 7h8" strokeWidth="1.6" />
    <path d="M8 11h8" strokeWidth="1.6" />
    <path d="M8 15h5" strokeWidth="1.6" />
  </svg>
);

// 8. Tafseer Ibn Kathir - Sheikh Mustafa Al-Adawi Icon (مختصر تفسير ابن كثير)
const TafseerAdawiBookIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
    <path d="M6 6h9" strokeWidth="1.6" />
    <path d="M6 10h9" strokeWidth="1.6" />
    <path d="M6 14h6" strokeWidth="1.6" />
    <polygon points="16,13 17,16 20,16 18,18 19,21 16,19 13,21 14,18 12,16 15,16" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1" />
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
  const [imageError, setImageError] = useState(false);

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

  const treePct = trackerData.treeGrowthPercentage || 0;
  const completedHabitsCount = Object.values(trackerData.habits).filter(Boolean).length;
  const totalHabits = 10;

  const dailySummaryText = `بسم الله الرحمن الرحيم
ملخص اليوم الإيماني - تطبيق جنّة الرحمن:
• نسبة إتمام شجرة العبادات: ${toArabicNumerals(treePct)}%
• أعمال البر المنجزة: ${toArabicNumerals(completedHabitsCount)} من ${toArabicNumerals(totalHabits)}
• ورد القرآن: صفحة ${toArabicNumerals(lastReadPage || 1)}
«أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ»`;

  // Resolved hero image source with fallbacks
  const heroImageSrc = imageError ? '/hero_masjid_arch_moon.jpg' : (heroMasjidImg || '/hero_masjid_arch_moon.jpg');

  return (
    <div className="pb-24 pt-2 px-3 sm:px-4 max-w-lg mx-auto space-y-3.5 animate-fadeIn" dir="rtl">
      {/* Beautiful Islamic Hijri Date Banner */}
      <HijriDateBanner />

      {/* App Top Utility Bar: Search, Settings & Identity */}
      <div className="flex items-center justify-between bg-white/90 dark:bg-[#06291e]/90 backdrop-blur-md p-3 rounded-2xl border border-amber-500/40 shadow-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              playChime('click');
              onNavigate('search');
            }}
            aria-label="البحث في التطبيق"
            className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-white/10 hover:bg-amber-100 dark:hover:bg-white/20 border border-amber-200/80 dark:border-white/15 flex items-center justify-center transition-all active:scale-95 text-[#042e22] dark:text-emerald-200 hover:text-emerald-900 dark:hover:text-white cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              playChime('click');
              onNavigate('settings');
            }}
            aria-label="فتح الإعدادات"
            className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-white/10 hover:bg-amber-100 dark:hover:bg-white/20 border border-amber-200/80 dark:border-white/15 flex items-center justify-center transition-all active:scale-95 text-[#042e22] dark:text-emerald-200 hover:text-emerald-900 dark:hover:text-white cursor-pointer"
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
            className="w-8 h-8 rounded-xl bg-amber-100/80 dark:bg-emerald-900/40 hover:bg-amber-200 dark:hover:bg-emerald-800/50 border border-amber-300/80 dark:border-emerald-500/30 flex items-center justify-center transition-all active:scale-95 text-[#042e22] dark:text-emerald-200 hover:text-emerald-900 dark:hover:text-white cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <h1 className="text-base font-black text-[#042e22] dark:text-emerald-100 tracking-tight">جنّة الرحمن</h1>
            <p className="text-[11px] text-[#0b4534] dark:text-emerald-300 font-bold">زاد المسلم ورفيق القلوب</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-emerald-500/20 border border-amber-300/80 dark:border-emerald-400/30 flex items-center justify-center overflow-hidden">
            <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-300" />
          </div>
        </div>
      </div>

      {/* Hero Islamic Mihrab Arch Header (المحراب الشريف والأيقونة الفنية للواجهة) */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-[#07172c] via-[#0b213f] to-[#0f2c52] border-2 border-amber-400/40 shadow-2xl">
        <div className="p-2 sm:p-2.5 pb-2">
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden shadow-inner border border-amber-400/50 bg-[#061224]">
            {/* Mosque, Minarets, Moon & Arch Graphic */}
            <img 
              src={heroImageSrc}
              alt="المحراب والمسجد الشريف وهلال السماء المبارك"
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              onError={() => setImageError(true)}
              loading="eager"
            />
            {/* Soft Ambient Depth Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#07172c]/80 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        <div className="px-4 pb-3 pt-0.5 text-center">
          <p className="text-xs sm:text-sm font-semibold font-amiri text-amber-200 drop-shadow">
            «أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ»
          </p>
        </div>
      </div>

      {/* Primary Main Door Cards Grid (شبكة الأبواب الرئيسية السبعة المطابقة للصورة بالرسومات المحسنة) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-3.5 pt-1">
        {/* Card 1: القرآن الكريم */}
        <button
          onClick={() => {
            playChime('click');
            triggerHaptic('selection');
            onOpenMushafPage(lastReadPage || 1);
          }}
          className="p-5 rounded-3xl bg-gradient-to-b from-white via-[#fdfbf7] to-[#f5efe1] dark:from-[#093327] dark:via-[#06291e] dark:to-[#041d15] border-2 border-amber-500/40 dark:border-amber-400/30 text-center flex flex-col items-center justify-center shadow-xs hover:shadow-md hover:border-amber-500 active:scale-95 transition-all group cursor-pointer relative overflow-hidden"
        >
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-800/15 to-emerald-900/25 dark:from-emerald-400/20 dark:to-emerald-500/10 flex items-center justify-center text-[#064e3b] dark:text-emerald-200 group-hover:scale-110 transition-transform mb-2 shadow-xs">
            <QuranBookIcon className="w-7 h-7" />
          </div>
          <h3 className="font-black text-base text-[#042e22] dark:text-emerald-100 group-hover:text-[#065f46] dark:group-hover:text-white transition-colors">
            القرآن الكريم
          </h3>
          <span className="text-[10px] text-[#0b4534] dark:text-emerald-300 font-bold mt-0.5">
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
          className="p-5 rounded-3xl bg-gradient-to-b from-white via-[#fdfbf7] to-[#f5efe1] dark:from-[#093327] dark:via-[#06291e] dark:to-[#041d15] border-2 border-amber-500/40 dark:border-amber-400/30 text-center flex flex-col items-center justify-center shadow-xs hover:shadow-md hover:border-amber-500 active:scale-95 transition-all group cursor-pointer relative overflow-hidden"
        >
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-800/15 to-emerald-900/25 dark:from-emerald-400/20 dark:to-emerald-500/10 flex items-center justify-center text-[#064e3b] dark:text-emerald-200 group-hover:scale-110 transition-transform mb-2 shadow-xs">
            <AthkarRosaryIcon className="w-7 h-7" />
          </div>
          <h3 className="font-black text-base text-[#042e22] dark:text-emerald-100 group-hover:text-[#065f46] dark:group-hover:text-white transition-colors">
            الأذكار
          </h3>
          <span className="text-[10px] text-[#0b4534] dark:text-emerald-300 font-bold mt-0.5">
            حصن المسلم وغراس الجنة
          </span>
        </button>

        {/* Card 3: المسبحة الإلكترونية */}
        <button
          onClick={() => {
            playChime('click');
            triggerHaptic('selection');
            onOpenSebha();
          }}
          className="p-5 rounded-3xl bg-gradient-to-b from-white via-[#fdfbf7] to-[#f5efe1] dark:from-[#093327] dark:via-[#06291e] dark:to-[#041d15] border-2 border-amber-500/40 dark:border-amber-400/30 text-center flex flex-col items-center justify-center shadow-xs hover:shadow-md hover:border-amber-500 active:scale-95 transition-all group cursor-pointer relative overflow-hidden"
        >
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-800/15 to-emerald-900/25 dark:from-emerald-400/20 dark:to-emerald-500/10 flex items-center justify-center text-[#064e3b] dark:text-emerald-200 group-hover:scale-110 transition-transform mb-2 shadow-xs">
            <ElectronicSebhaIcon className="w-7 h-7" />
          </div>
          <h3 className="font-black text-base text-[#042e22] dark:text-emerald-100 group-hover:text-[#065f46] dark:group-hover:text-white transition-colors">
            المسبحة الإلكترونية
          </h3>
          <span className="text-[10px] text-[#0b4534] dark:text-emerald-300 font-bold mt-0.5">
            عداد التسبيح والاستغفار
          </span>
        </button>

        {/* Card 4: الصلاة والقبلة والمواقيت (باب جامع لكل متعلقات الصلاة) */}
        <button
          onClick={() => {
            playChime('click');
            triggerHaptic('selection');
            onNavigate('tracker');
          }}
          className="p-5 rounded-3xl bg-gradient-to-b from-white via-[#fdfbf7] to-[#f5efe1] dark:from-[#093327] dark:via-[#06291e] dark:to-[#041d15] border-2 border-amber-500/40 dark:border-amber-400/30 text-center flex flex-col items-center justify-center shadow-xs hover:shadow-md hover:border-amber-500 active:scale-95 transition-all group cursor-pointer relative overflow-hidden"
        >
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-800/15 to-emerald-900/25 dark:from-emerald-400/20 dark:to-emerald-500/10 flex items-center justify-center text-[#064e3b] dark:text-emerald-200 group-hover:scale-110 transition-transform mb-2 shadow-xs">
            <PrayerMosqueIcon className="w-7 h-7" />
          </div>
          <h3 className="font-black text-base text-[#042e22] dark:text-emerald-100 group-hover:text-[#065f46] dark:group-hover:text-white transition-colors">
            الصلاة والقبلة والمواقيت
          </h3>
          <span className="text-[10px] text-[#0b4534] dark:text-emerald-300 font-bold mt-0.5">
            أوقات الصلاة، القبلة، والشجرة
          </span>
        </button>

        {/* Card 5: الأدعية المأثورة */}
        <button
          onClick={() => {
            playChime('click');
            triggerHaptic('selection');
            onNavigate('duas');
          }}
          className="p-5 rounded-3xl bg-gradient-to-b from-white via-[#fdfbf7] to-[#f5efe1] dark:from-[#093327] dark:via-[#06291e] dark:to-[#041d15] border-2 border-amber-500/40 dark:border-amber-400/30 text-center flex flex-col items-center justify-center shadow-xs hover:shadow-md hover:border-amber-500 active:scale-95 transition-all group cursor-pointer relative overflow-hidden"
        >
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-800/15 to-emerald-900/25 dark:from-emerald-400/20 dark:to-emerald-500/10 flex items-center justify-center text-[#064e3b] dark:text-emerald-200 group-hover:scale-110 transition-transform mb-2 shadow-xs">
            <DuaHandsIcon className="w-7 h-7" />
          </div>
          <h3 className="font-black text-base text-[#042e22] dark:text-emerald-100 group-hover:text-[#065f46] dark:group-hover:text-white transition-colors">
            الأدعية المأثورة
          </h3>
          <span className="text-[10px] text-[#0b4534] dark:text-emerald-300 font-bold mt-0.5">
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
          className="p-5 rounded-3xl bg-gradient-to-b from-white via-[#fdfbf7] to-[#f5efe1] dark:from-[#093327] dark:via-[#06291e] dark:to-[#041d15] border-2 border-amber-500/40 dark:border-amber-400/30 text-center flex flex-col items-center justify-center shadow-xs hover:shadow-md hover:border-amber-500 active:scale-95 transition-all group cursor-pointer relative overflow-hidden"
        >
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-800/15 to-emerald-900/25 dark:from-emerald-400/20 dark:to-emerald-500/10 flex items-center justify-center text-[#064e3b] dark:text-emerald-200 group-hover:scale-110 transition-transform mb-2 shadow-xs">
            <MishkatLampIcon className="w-7 h-7" />
          </div>
          <h3 className="font-black text-base text-[#042e22] dark:text-emerald-100 group-hover:text-[#065f46] dark:group-hover:text-white transition-colors">
            مشكاة الأنوار
          </h3>
          <span className="text-[10px] text-[#0b4534] dark:text-emerald-300 font-bold mt-0.5">
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
          className="p-5 rounded-3xl bg-gradient-to-b from-white via-[#fdfbf7] to-[#f5efe1] dark:from-[#093327] dark:via-[#06291e] dark:to-[#041d15] border-2 border-amber-500/40 dark:border-amber-400/30 text-center flex flex-col items-center justify-center shadow-xs hover:shadow-md hover:border-amber-500 active:scale-95 transition-all group cursor-pointer relative overflow-hidden"
        >
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-800/15 to-emerald-900/25 dark:from-emerald-400/20 dark:to-emerald-500/10 flex items-center justify-center text-[#064e3b] dark:text-emerald-200 group-hover:scale-110 transition-transform mb-2 shadow-xs">
            <ThimarScrollIcon className="w-7 h-7" />
          </div>
          <h3 className="font-black text-base text-[#042e22] dark:text-emerald-100 group-hover:text-[#065f46] dark:group-hover:text-white transition-colors">
            ثمار المشايخ
          </h3>
          <span className="text-[10px] text-[#0b4534] dark:text-emerald-300 font-bold mt-0.5">
            درر كبار العلماء والأئمة
          </span>
        </button>

        {/* Card 8: مختصر تفسير ابن كثير - الشيخ مصطفى العدوي */}
        <button
          onClick={() => {
            playChime('click');
            triggerHaptic('selection');
            onNavigate('tafseer_adawi');
          }}
          className="p-5 rounded-3xl bg-gradient-to-b from-white via-[#fdfbf7] to-[#f5efe1] dark:from-[#093327] dark:via-[#06291e] dark:to-[#041d15] border-2 border-amber-500/60 dark:border-amber-400/40 text-center flex flex-col items-center justify-center shadow-xs hover:shadow-md hover:border-amber-500 active:scale-95 transition-all group cursor-pointer relative overflow-hidden"
        >
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 dark:from-amber-400/20 dark:to-amber-500/10 flex items-center justify-center text-amber-700 dark:text-amber-300 group-hover:scale-110 transition-transform mb-2 shadow-xs">
            <TafseerAdawiBookIcon className="w-7 h-7" />
          </div>
          <div className="flex items-center gap-1 justify-center">
            <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold">جديد</span>
            <h3 className="font-black text-base text-[#042e22] dark:text-emerald-100 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
              مختصر ابن كثير
            </h3>
          </div>
          <span className="text-[10px] text-[#0b4534] dark:text-emerald-300 font-bold mt-0.5">
            للشيخ مصطفى العدوي
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

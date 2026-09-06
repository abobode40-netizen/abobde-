import React, { useState, useEffect } from 'react';
import { 
  TreePine, 
  CheckCircle2, 
  Circle, 
  Users, 
  User, 
  Clock, 
  Plus, 
  Minus, 
  RotateCcw, 
  Play, 
  Pause, 
  Sparkles, 
  Volume2, 
  Flame, 
  Heart,
  ChevronLeft,
  Calendar,
  Share2
} from 'lucide-react';
import { DayTrackerData, PrayerStatus, OneMinuteDeed } from '../types';
import { DAILY_HABITS_LIST, ONE_MINUTE_DEEDS, WORK_MODE_THOUGHTS } from '../data/prayersData';
import { toArabicNumerals } from '../data/quranData';
import { playChime, triggerHaptic } from '../utils/audio';
import { CelebrationModal, CelebrationType } from './CelebrationModal';
import { TreeShareModal } from './TreeShareModal';
import { fireCelebrationConfetti } from '../utils/confetti';
import { calculateTreePercentage } from '../utils/storage';

interface TrackerViewProps {
  trackerData: DayTrackerData;
  onUpdateTracker: (updated: DayTrackerData) => void;
  onOpenSebha: () => void;
}

export const TrackerView: React.FC<TrackerViewProps> = ({
  trackerData,
  onUpdateTracker,
  onOpenSebha
}) => {
  // One-Minute Ward state
  const [selectedDeedIndex, setSelectedDeedIndex] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [minuteCount, setMinuteCount] = useState(0);

  // Work Mode Thoughts state
  const [workModeActive, setWorkModeActive] = useState(false);
  const [thoughtIndex, setThoughtIndex] = useState(0);
  const [showThoughtModal, setShowThoughtModal] = useState(false);

  // Share Modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Celebration state
  const [celebrationState, setCelebrationState] = useState<{
    isOpen: boolean;
    type: CelebrationType;
  }>({
    isOpen: false,
    type: 'tree_full'
  });

  const checkAndTriggerCelebration = (prevData: DayTrackerData, updated: DayTrackerData) => {
    const prevPct = calculateTreePercentage(prevData);
    const newPct = calculateTreePercentage(updated);

    if (prevPct < 100 && newPct >= 100) {
      setCelebrationState({ isOpen: true, type: 'tree_full' });
      fireCelebrationConfetti('tree_full');
    } else if (prevPct < 50 && newPct >= 50 && newPct < 100) {
      setCelebrationState({ isOpen: true, type: 'tree_half' });
      fireCelebrationConfetti('milestone');
    } else if (
      prevData.quranPagesRead < prevData.quranTargetPages &&
      updated.quranPagesRead >= updated.quranTargetPages &&
      updated.quranPagesRead > 0
    ) {
      setCelebrationState({ isOpen: true, type: 'quran_goal' });
      fireCelebrationConfetti('milestone');
    }
  };

  const activeDeed: OneMinuteDeed = ONE_MINUTE_DEEDS[selectedDeedIndex] || ONE_MINUTE_DEEDS[0];

  // 1-minute countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerRunning) {
      setTimerRunning(false);
      playChime('milestone');
      triggerHaptic(80);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  // Work mode periodic reminder simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (workModeActive) {
      interval = setInterval(() => {
        setThoughtIndex((prev) => (prev + 1) % WORK_MODE_THOUGHTS.length);
        setShowThoughtModal(true);
        playChime('bell');
      }, 90000); // Trigger peaceful thought every 90 seconds in active preview
    }
    return () => clearInterval(interval);
  }, [workModeActive]);

  // Prayer state toggle: missed -> alone -> congregation -> missed
  const togglePrayer = (prayerKey: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha') => {
    const current = trackerData.prayers[prayerKey] || 'missed';
    let next: PrayerStatus = 'alone';
    if (current === 'missed') next = 'alone';
    else if (current === 'alone') next = 'congregation';
    else next = 'missed';

    const updated = {
      ...trackerData,
      prayers: {
        ...trackerData.prayers,
        [prayerKey]: next
      }
    };
    onUpdateTracker(updated);
    checkAndTriggerCelebration(trackerData, updated);
    playChime(next === 'congregation' ? 'milestone' : 'click');
    triggerHaptic(30);
  };

  // Toggle habit
  const toggleHabit = (habitId: string) => {
    const current = !!trackerData.habits[habitId];
    const updated = {
      ...trackerData,
      habits: {
        ...trackerData.habits,
        [habitId]: !current
      }
    };
    onUpdateTracker(updated);
    checkAndTriggerCelebration(trackerData, updated);
    playChime(!current ? 'success' : 'click');
    triggerHaptic(30);
  };

  // Adjust Quran Ward Pages
  const updateQuranPages = (delta: number) => {
    const next = Math.max(0, trackerData.quranPagesRead + delta);
    const updated = {
      ...trackerData,
      quranPagesRead: next,
      habits: {
        ...trackerData.habits,
        quran_ward: next >= trackerData.quranTargetPages
      }
    };
    onUpdateTracker(updated);
    checkAndTriggerCelebration(trackerData, updated);
    playChime('click');
  };

  const setQuranTarget = (target: number) => {
    const updated = {
      ...trackerData,
      quranTargetPages: target
    };
    onUpdateTracker(updated);
    playChime('click');
  };

  // One minute deed counter tap
  const handleMinuteTap = () => {
    if (!timerRunning && timeLeft === 60) {
      setTimerRunning(true);
    }
    setMinuteCount((prev) => prev + 1);
    playChime('click');
    triggerHaptic(20);
  };

  const resetMinuteTimer = () => {
    setTimerRunning(false);
    setTimeLeft(60);
    setMinuteCount(0);
  };

  const treePct = trackerData.treeGrowthPercentage || 0;
  const completedHabitsCount = Object.values(trackerData.habits).filter(Boolean).length;

  const prayerNames: Record<string, string> = {
    fajr: 'الفجر',
    dhuhr: 'الظهر',
    asr: 'العصر',
    maghrib: 'المغرب',
    isha: 'العشاء'
  };

  return (
    <div className="pb-24 pt-2 px-3 sm:px-4 max-w-lg mx-auto space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => {
            setIsShareModalOpen(true);
            playChime('click');
          }}
          className="px-3.5 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300/60 dark:border-emerald-800 text-[#0F6B50] dark:text-[#2DD4BF] hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
          title="مشاركة صورة تقدم شجرة العبادات"
        >
          <Share2 className="w-4 h-4 text-emerald-700 dark:text-[#2DD4BF]" />
          <span>مشاركة الشجرة</span>
        </button>

        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end text-[#164C3E] dark:text-[#2DD4BF] font-bold text-base">
            <span>شجرة العبادات</span>
            <TreePine className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-xs text-[#6F786E] dark:text-[#8E9B93]">
            خطوات صغيرة تثبت في يومك وتكبر مع الوقت
          </p>
        </div>
      </div>

      {/* Interactive Worship Tree Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0F6B50] to-[#178064] text-white shadow-md islamic-border relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-300">
            {toArabicNumerals(completedHabitsCount)} من {toArabicNumerals(10)}
          </span>
          <div className="text-right">
            <h3 className="text-lg font-bold font-amiri">أغصان اليوم</h3>
          </div>
        </div>

        {/* Tree Growth Progress Bar */}
        <div className="mt-3 w-full h-2.5 bg-emerald-950/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-l from-amber-300 to-amber-400 rounded-full transition-all duration-700"
            style={{ width: `${treePct}%` }}
          />
        </div>
        <p className="text-[11px] text-emerald-100 mt-2 text-right">
          كل عمل صالح غصن يورق في شجرتك المباركة.
        </p>

        {/* 10 Habits Quick Chips */}
        <div className="mt-4 flex flex-wrap gap-1.5 justify-end">
          {DAILY_HABITS_LIST.map((h) => {
            const isDone = !!trackerData.habits[h.id];
            return (
              <button
                key={h.id}
                onClick={() => toggleHabit(h.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 active:scale-95 ${
                  isDone
                    ? 'bg-amber-300 text-emerald-950 shadow-sm'
                    : 'bg-white/15 text-white/90 border border-white/20 hover:bg-white/25'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-900" /> : <Circle className="w-3.5 h-3.5 opacity-60" />}
                <span>{h.title}</span>
              </button>
            );
          })}
        </div>

        {/* Share Button Banner inside Tree Card */}
        <div className="mt-4 pt-3.5 border-t border-white/15 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => {
              setIsShareModalOpen(true);
              playChime('click');
            }}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-md cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-emerald-950" />
            <span>مشاركة الصورة عبر التواصل</span>
          </button>
          <span className="text-[11px] text-amber-200/90 font-bold">
            🌱 انشر الخير وشجّع أهلك وأصحابك
          </span>
        </div>
      </div>

      {/* 5 Prayers Tracker with 3 States */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1A2621] border border-[#E5DDCF] dark:border-[#2A3C34] shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
          <div className="text-right">
            <h4 className="font-bold text-sm text-[#19302A] dark:text-white">متابعة الصلوات الخمس</h4>
            <p className="text-[11px] text-gray-500">
              اضغط لتبديل الحالة: لم تُؤدَّ ← منفرداً ← جماعة
            </p>
          </div>
          <span className="text-xs font-bold text-[#0F6B50] dark:text-[#2DD4BF] bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg">
            اليوم
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 text-center">
          {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map((pkey) => {
            const status = trackerData.prayers[pkey];
            let badgeColor = 'bg-[#FAF7F0] dark:bg-[#14201B] border-[#D7DFD5] text-[#19302A] dark:text-gray-300';
            let label = 'لم تُؤدَّ';
            let icon = <Circle className="w-3 h-3 opacity-40" />;

            if (status === 'alone') {
              badgeColor = 'bg-amber-100 dark:bg-amber-950/70 border-amber-300 text-amber-900 dark:text-amber-200';
              label = 'منفرداً';
              icon = <User className="w-3 h-3" />;
            } else if (status === 'congregation') {
              badgeColor = 'bg-emerald-100 dark:bg-emerald-950/70 border-emerald-400 text-emerald-900 dark:text-emerald-200';
              label = 'جماعة';
              icon = <Users className="w-3 h-3" />;
            }

            return (
              <button
                key={pkey}
                onClick={() => togglePrayer(pkey)}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all active:scale-95 shadow-xs ${badgeColor}`}
              >
                <span className="font-bold text-xs">{prayerNames[pkey]}</span>
                <span className="text-[10px] mt-1 flex items-center gap-0.5 font-medium">
                  {icon}
                  <span>{label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quran & Athkar Daily Goals Section */}
      <div className="grid grid-cols-2 gap-3">
        {/* Quran Ward Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1A2621] border border-[#E5DDCF] dark:border-[#2A3C34] text-right shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-xs text-[#0F6B50] dark:text-[#2DD4BF]">ورد القراءة اليومي</h4>
            <div className="text-2xl font-bold font-amiri text-[#19302A] dark:text-white mt-1">
              {toArabicNumerals(trackerData.quranPagesRead)}{' '}
              <span className="text-xs font-normal text-gray-500">صفحة</span>
            </div>
          </div>

          <div className="space-y-2 mt-3">
            <div className="flex items-center justify-between gap-1">
              <button
                onClick={() => updateQuranPages(-1)}
                className="w-8 h-8 rounded-lg bg-[#FAF7F0] dark:bg-[#14201B] border flex items-center justify-center text-gray-600 hover:text-black dark:text-gray-300"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => updateQuranPages(1)}
                className="flex-1 py-1.5 rounded-lg bg-[#0F6B50] text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>صفحة</span>
              </button>
            </div>

            {/* Target pills */}
            <div className="flex justify-between text-[10px] font-bold text-gray-500 pt-1">
              {[1, 2, 4, 10].map((t) => (
                <button
                  key={t}
                  onClick={() => setQuranTarget(t)}
                  className={`px-1.5 py-0.5 rounded ${
                    trackerData.quranTargetPages === t
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold'
                      : 'hover:text-black'
                  }`}
                >
                  {toArabicNumerals(t)}ص
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Athkar Live Progress Card */}
        <div 
          onClick={onOpenSebha}
          className="p-4 rounded-2xl bg-white dark:bg-[#1A2621] border border-[#E5DDCF] dark:border-[#2A3C34] text-right shadow-sm flex flex-col justify-between cursor-pointer hover:border-[#0F6B50] transition-all group"
        >
          <div>
            <div className="flex items-center justify-between">
              <Flame className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-xs text-[#0F6B50] dark:text-[#2DD4BF]">المسبحة والذكر</h4>
            </div>
            <div className="text-xl font-bold font-amiri text-[#19302A] dark:text-white mt-1">
              غراس الأذكار
            </div>
          </div>

          <div className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/50 text-center">
            <span className="text-xs font-bold text-[#B45309] dark:text-amber-300 block">
              افتح المسبحة الذكية
            </span>
            <span className="text-[10px] text-gray-500">تسبيح واستغفار بنقرة واحدة</span>
          </div>
        </div>
      </div>

      {/* One-Minute Remembrance Ward (ورد الدقيقة الواحدة) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#1A2621] border border-[#E5DDCF] dark:border-[#2A3C34] shadow-sm space-y-3 text-right">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setSelectedDeedIndex((prev) => (prev + 1) % ONE_MINUTE_DEEDS.length)}
            className="text-xs font-bold text-[#0F6B50] dark:text-[#2DD4BF] hover:underline"
          >
            ورد آخر
          </button>
          <div className="flex items-center gap-1.5 font-bold text-sm text-[#19302A] dark:text-white">
            <span>ورد الدقيقة الواحدة</span>
            <Clock className="w-4 h-4 text-[#B45309]" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#FFF9EB] dark:bg-[#232015] border border-[#E8DAB7] dark:border-[#4B3E1F] text-center space-y-1">
          <h4 className="font-amiri text-lg font-bold text-[#234335] dark:text-amber-100">
            {activeDeed.title}
          </h4>
          <p className="text-[11px] text-[#758176] dark:text-[#A0A59B]">
            {activeDeed.rewardFadl}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          {/* Reset / Timer Status */}
          <div className="flex items-center gap-2">
            <button
              onClick={resetMinuteTimer}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 hover:text-black dark:text-gray-300"
              title="إعادة ضبط الدقيقة"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="text-center font-mono font-bold text-sm text-[#0F6B50] dark:text-[#2DD4BF] bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 rounded-xl">
              00:{String(timeLeft).padStart(2, '0')}
            </div>
          </div>

          {/* Interactive Tap Button */}
          <button
            onClick={handleMinuteTap}
            className="flex-1 py-3 rounded-xl bg-[#0F6B50] hover:bg-[#138061] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
          >
            <span>{timerRunning ? 'اضغط للذكر' : 'ابدأ الدقيقة'}</span>
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
              {toArabicNumerals(minuteCount)}
            </span>
          </button>
        </div>
      </div>

      {/* Work Mode Toggle (وضع العمل والخواطر الهادئة) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1A2621] border border-[#E5DDCF] dark:border-[#2A3C34] shadow-sm flex items-center justify-between text-right">
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={workModeActive}
              onChange={(e) => {
                setWorkModeActive(e.target.checked);
                playChime('click');
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F6B50]" />
          </label>
        </div>

        <div>
          <h4 className="font-bold text-sm text-[#19302A] dark:text-white">وضع العمل والخواطر الهادئة</h4>
          <p className="text-[11px] text-gray-500">
            تنبيهات هادئة دورية بخواطر إيمانية تعينك على ذكر الله أثناء الانشغال
          </p>
        </div>
      </div>

      {/* Work Mode Thought Modal */}
      {showThoughtModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#16241E] rounded-3xl p-6 max-w-sm w-full border border-amber-300/40 shadow-2xl space-y-4 text-center">
            <Sparkles className="w-8 h-8 text-amber-500 mx-auto" />
            <h3 className="text-sm font-bold text-[#0F6B50] dark:text-[#2DD4BF]">خاطرة إيمانية هادئة</h3>
            <p className="font-amiri text-lg leading-relaxed text-[#19302A] dark:text-amber-100">
              «{WORK_MODE_THOUGHTS[thoughtIndex]}»
            </p>
            <button
              onClick={() => setShowThoughtModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#0F6B50] text-white text-xs font-bold"
            >
              جزاك الله خيراً (متابعة)
            </button>
          </div>
        </div>
      )}

      {/* Milestone / Tree Completion Celebration Modal */}
      <CelebrationModal
        isOpen={celebrationState.isOpen}
        onClose={() => setCelebrationState((prev) => ({ ...prev, isOpen: false }))}
        type={celebrationState.type}
        onShare={() => {
          setCelebrationState((prev) => ({ ...prev, isOpen: false }));
          setIsShareModalOpen(true);
        }}
      />

      {/* Worship Tree Share Modal */}
      <TreeShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        trackerData={trackerData}
      />
    </div>
  );
};

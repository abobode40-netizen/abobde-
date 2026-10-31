import React, { useState, useEffect } from 'react';
import { Bell, MapPin, Sparkles, X, Volume2 } from 'lucide-react';
import { 
  loadSavedLocation, 
  loadSavedPrayerMethod, 
  loadSavedPrayerOffsets, 
  calculateNextPrayerCountdown, 
  PrayerTimeItem,
  toEasternArabicDigits
} from '../utils/prayerTimes';
import { toArabicNumerals } from '../data/quranData';
import { playAdhanChime, triggerHaptic } from '../utils/audio';

export const GlobalPrayerAlertModal: React.FC = () => {
  const [activeAlert, setActiveAlert] = useState<{
    prayer: PrayerTimeItem;
    cityName: string;
  } | null>(null);

  useEffect(() => {
    const checkPrayerTimes = () => {
      try {
        const location = loadSavedLocation();
        const method = loadSavedPrayerMethod();
        const offsets = loadSavedPrayerOffsets();
        const now = new Date();
        const countdown = calculateNextPrayerCountdown(location, now, method, offsets);

        const currentHH = String(now.getHours()).padStart(2, '0');
        const currentMM = String(now.getMinutes()).padStart(2, '0');
        const currentTimeStr = `${currentHH}:${currentMM}`;

        // Check if any primary prayer (excluding sunrise) matches current minute
        countdown.allPrayers.forEach((p) => {
          if (p.id === 'sunrise') return;
          if (p.time === currentTimeStr) {
            const notifiedKey = `jannat_adhan_alert_${p.id}_${now.toDateString()}_${currentTimeStr}`;
            const alreadyNotified = localStorage.getItem(notifiedKey);
            if (!alreadyNotified) {
              localStorage.setItem(notifiedKey, 'true');
              setActiveAlert({
                prayer: p,
                cityName: location.cityName
              });
              // Play melodic Adhan phrase: "الله أكبر الله أكبر"
              playAdhanChime();
              triggerHaptic([50, 100, 50, 100, 100]);

              // Native browser notification if permitted
              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                try {
                  new Notification(`حان الآن موعد صلاة ${p.name}`, {
                    body: `الله أكبر الله أكبر • حان وقت صلاة ${p.name} حسب توقيت ${location.cityName}`,
                    icon: '/favicon.ico'
                  });
                } catch {
                  // Fallback to in-app modal
                }
              }
            }
          }
        });
      } catch {
        // Silently handle errors
      }
    };

    // Check every 10 seconds
    const interval = setInterval(checkPrayerTimes, 10000);
    // Initial check
    checkPrayerTimes();

    return () => clearInterval(interval);
  }, []);

  if (!activeAlert) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#061120]/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
      dir="rtl"
    >
      <div className="w-full max-w-sm bg-gradient-to-br from-[#0c2448] via-[#0f2e5a] to-[#081a33] text-white rounded-3xl p-6 shadow-2xl border-2 border-sky-400 text-center space-y-4 animate-scaleUp arabesque-watermark relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-sky-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Pulsing Bell & Mosque Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-300 text-[#091b34] flex items-center justify-center shadow-xl ring-4 ring-amber-400/30 animate-pulse">
          <Bell className="w-10 h-10 fill-current" />
        </div>

        {/* Adhan Phrase Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-xs font-bold mb-1">
            <Volume2 className="w-3.5 h-3.5" />
            <span>نغمة الأذان المبارك</span>
          </div>

          <h2 className="font-amiri text-2xl font-black text-amber-300 tracking-wide">
            الله أكبر .. الله أكبر
          </h2>

          <h3 className="font-bold text-lg text-white">
            حان الآن موعد صلاة {activeAlert.prayer.name}
          </h3>

          <p className="text-xs text-sky-200">
            وفق التوقيت المحلي لمدينة {activeAlert.cityName} المباركة
          </p>
        </div>

        {/* Time Card */}
        <div className="p-3.5 rounded-2xl bg-[#09182b]/90 border border-sky-500/30 text-right">
          <div className="flex items-center justify-between text-xs text-sky-200">
            <span className="font-medium">وقت النداء للصلاة</span>
            <span className="font-black text-amber-300 text-base font-mono">
              {toArabicNumerals(activeAlert.prayer.time)}
            </span>
          </div>
          <p className="text-[11px] text-sky-300/80 mt-1.5 text-center font-amiri text-sm">
            «حَيَّ عَلَى الصَّلَاةِ .. حَيَّ عَلَى الْفَلَاحِ»
          </p>
        </div>

        {/* Close and Accept Button */}
        <button
          onClick={() => {
            setActiveAlert(null);
            triggerHaptic(15);
          }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-[#091b34] font-black text-sm shadow-lg transition-all active:scale-95 cursor-pointer"
        >
          تقبل الله طاعتكم 🤲 (إغلاق التنبيه)
        </button>
      </div>
    </div>
  );
};

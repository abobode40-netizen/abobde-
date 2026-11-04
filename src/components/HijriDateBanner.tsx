import React, { useState, useEffect } from 'react';
import { Moon, Sparkles, Check, Copy } from 'lucide-react';
import { playChime, triggerHaptic } from '../utils/audio';

export interface HijriDateInfo {
  weekday: string;
  day: string;
  month: string;
  year: string;
  fullHijri: string;
  gregorianDay: string;
  gregorianMonth: string;
  gregorianYear: string;
  fullGregorian: string;
}

export function getDetailedHijriDate(date: Date = new Date()): HijriDateInfo {
  try {
    // 1. Hijri Umm Al-Qura formatter
    const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const hijriParts = hijriFormatter.formatToParts(date);

    let weekday = '';
    let day = '';
    let month = '';
    let year = '';

    for (const part of hijriParts) {
      if (part.type === 'weekday') weekday = part.value;
      if (part.type === 'day') day = part.value;
      if (part.type === 'month') month = part.value;
      if (part.type === 'year') year = part.value;
    }

    // 2. Gregorian formatter
    const gregFormatter = new Intl.DateTimeFormat('ar-EG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const gregParts = gregFormatter.formatToParts(date);
    let gDay = '';
    let gMonth = '';
    let gYear = '';

    for (const part of gregParts) {
      if (part.type === 'day') gDay = part.value;
      if (part.type === 'month') gMonth = part.value;
      if (part.type === 'year') gYear = part.value;
    }

    const fullHijri = `${day} ${month} ${year} هـ`;
    const fullGregorian = `${gDay} ${gMonth} ${gYear} م`;

    return {
      weekday: weekday || 'اليوم',
      day,
      month,
      year: `${year} هـ`,
      fullHijri,
      gregorianDay: gDay,
      gregorianMonth: gMonth,
      gregorianYear: gYear,
      fullGregorian
    };
  } catch {
    return {
      weekday: 'اليوم المبارك',
      day: '',
      month: '',
      year: '١٤٤٨ هـ',
      fullHijri: 'التاريخ الهجري المبارك',
      gregorianDay: '',
      gregorianMonth: '',
      gregorianYear: '',
      fullGregorian: 'الموافق للتقويم الشمسي'
    };
  }
}

export const HijriDateBanner: React.FC = () => {
  const [dateInfo, setDateInfo] = useState<HijriDateInfo>(() => getDetailedHijriDate());
  const [copied, setCopied] = useState(false);

  // Update date regularly at midnight
  useEffect(() => {
    const update = () => setDateInfo(getDetailedHijriDate());
    const interval = setInterval(update, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const handleCopyDate = () => {
    playChime('click');
    triggerHaptic('light');
    const fullText = `يوم ${dateInfo.weekday} • ${dateInfo.fullHijri} (الموافق ${dateInfo.fullGregorian}) - تطبيق جنّة الرحمن`;
    navigator.clipboard.writeText(fullText).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div 
      onClick={handleCopyDate}
      title="اضغط لنسخ التاريخ الهجري المبارك"
      className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#071a33] via-[#0c284e] to-[#071a33] border border-amber-400/40 p-3 sm:p-3.5 text-white shadow-lg cursor-pointer hover:border-amber-300 transition-all group select-none"
      dir="rtl"
    >
      {/* Subtle Islamic Arabesque Lighting Accent */}
      <div className="absolute -left-10 -top-10 w-28 h-28 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative flex items-center justify-between gap-3">
        {/* Right Section: Crescent Icon with Golden Aura */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-400/25 via-amber-500/15 to-transparent border border-amber-300/40 text-amber-300 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
            <Moon className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-300/30 text-amber-300 stroke-[1.8] transform -rotate-12" />
            <Sparkles className="w-3 h-3 text-amber-200 absolute -top-1 -right-1 animate-pulse" />
          </div>

          {/* Center Details */}
          <div className="text-right space-y-0.5">
            {/* Weekday & Umm Al-Qura Pill */}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-amber-300 font-amiri tracking-wide">
                {dateInfo.weekday}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-400/15 border border-amber-400/30 text-amber-200 font-medium">
                تقويم أم القرى
              </span>
            </div>

            {/* Prominent Hijri Date */}
            <h3 className="text-sm sm:text-base font-bold font-amiri text-white tracking-wide drop-shadow-sm flex items-center gap-1.5">
              <span>{dateInfo.fullHijri}</span>
            </h3>

            {/* Gregorian Date subtitle */}
            <p className="text-[10.5px] sm:text-[11px] text-sky-200/80 font-medium">
              الموافق {dateInfo.fullGregorian}
            </p>
          </div>
        </div>

        {/* Left Section: Copy Indicator */}
        <div className="shrink-0 flex items-center pl-1">
          <div className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1.5 ${
            copied
              ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300'
              : 'bg-white/5 group-hover:bg-white/10 border-white/10 text-sky-300/70 group-hover:text-amber-200'
          }`}>
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-bold">تم النسخ</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[10px]">نسخ</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

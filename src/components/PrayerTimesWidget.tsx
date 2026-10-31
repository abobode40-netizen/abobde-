import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  Navigation, 
  RefreshCw, 
  Sun, 
  Moon, 
  Sunrise, 
  Sunset, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Bell, 
  Calendar, 
  ArrowRight,
  Compass,
  X,
  Check,
  Sliders,
  Pin,
  CheckCheck,
  Download
} from 'lucide-react';
import { UniversalExportModal } from './UniversalExportModal';
import { generatePrayerTimesExport, ExportPayload } from '../utils/universalExport';
import { 
  calculateNextPrayerCountdown, 
  getPrayerTimesList, 
  loadSavedLocation, 
  saveLocation, 
  loadSavedPrayerMethod,
  savePrayerMethod,
  loadSavedPrayerOffsets,
  pinCairoEgyptianSurvey,
  getCurrentCairoTime,
  requestDeviceLocation, 
  POPULAR_CITIES, 
  CAIRO_LOCATION,
  PRAYER_CALC_METHODS,
  PrayerCalcMethod,
  PrayerMinuteOffsets,
  DEFAULT_PRAYER_OFFSETS,
  PRAYER_SETTINGS_CHANGE_EVENT,
  UserLocation, 
  NextPrayerInfo, 
  PrayerTimeItem,
  toEasternArabicDigits 
} from '../utils/prayerTimes';
import { toArabicNumerals } from '../data/quranData';
import { playChime, triggerHaptic, playAdhanChime } from '../utils/audio';

interface PrayerTimesWidgetProps {
  onNavigateToTracker?: () => void;
  onNavigateToQibla?: () => void;
}

export const PrayerTimesWidget: React.FC<PrayerTimesWidgetProps> = ({
  onNavigateToTracker,
  onNavigateToQibla
}) => {
  const [location, setLocation] = useState<UserLocation>(() => loadSavedLocation());
  const [method, setMethod] = useState<PrayerCalcMethod>(() => loadSavedPrayerMethod());
  const [offsets, setOffsets] = useState<PrayerMinuteOffsets>(() => loadSavedPrayerOffsets());
  const [prayerInfo, setPrayerInfo] = useState<NextPrayerInfo>(() => 
    calculateNextPrayerCountdown(loadSavedLocation(), new Date(), loadSavedPrayerMethod(), loadSavedPrayerOffsets())
  );
  const [cairoTime, setCairoTime] = useState<string>(() => getCurrentCairoTime());
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [modalTab, setModalTab] = useState<'methods' | 'locations'>('methods');
  const [showAllPrayers, setShowAllPrayers] = useState(true);
  const [searchCityQuery, setSearchCityQuery] = useState('');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isPlayingAdhanPreview, setIsPlayingAdhanPreview] = useState(false);
  const [pinnedNotification, setPinnedNotification] = useState<string | null>(null);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('jannat_prayer_notifications') === 'true';
    }
    return false;
  });
  const [activePrayerPopup, setActivePrayerPopup] = useState<PrayerTimeItem | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportPayload, setExportPayload] = useState<ExportPayload | null>(null);

  const handleExportPrayerTimes = () => {
    playChime('click');
    triggerHaptic('light');
    const timesMap: Record<string, string> = {};
    prayerInfo.allPrayers.forEach((p) => {
      timesMap[p.id] = `${p.time} (${p.name})`;
    });
    const dateStr = new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const payload = generatePrayerTimesExport(location.cityName, dateStr, timesMap);
    setExportPayload(payload);
    setIsExportOpen(true);
  };

  const handleToggleNotifications = async () => {
    triggerHaptic(20);
    playChime('click');
    if (!isNotificationsEnabled) {
      let isSystemGranted = false;
      try {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            isSystemGranted = true;
            try {
              new Notification('جَنَّة الرَّحْمَٰن', {
                body: `تم تفعيل إشعارات مواقيت الصلاة لمدينة ${location.cityName}`,
                icon: '/favicon.ico'
              });
            } catch {
              // Browser may restrict Notification constructor in iframes
            }
          }
        }
      } catch {
        // Notification permission request restricted or denied in this context
      }

      setIsNotificationsEnabled(true);
      try {
        localStorage.setItem('jannat_prayer_notifications', 'true');
      } catch {
        // Ignore storage errors
      }

      if (isSystemGranted) {
        setPinnedNotification('تم تفعيل إشعارات مواقيت الصلاة استناداً لموقعك الجغرافي بنجاح 🔔');
      } else {
        setPinnedNotification('تم تفعيل التنبيهات المنبثقة والصوتية داخل التطبيق بنجاح 🔔');
      }
      setTimeout(() => setPinnedNotification(null), 4000);
    } else {
      setIsNotificationsEnabled(false);
      try {
        localStorage.setItem('jannat_prayer_notifications', 'false');
      } catch {
        // Ignore storage errors
      }
      setPinnedNotification('تم إيقاف إشعارات مواقيت الصلاة');
      setTimeout(() => setPinnedNotification(null), 3000);
    }
  };

  // Check prayer time alerts every 15 seconds
  useEffect(() => {
    if (!isNotificationsEnabled) return;
    const checkPrayerAlert = () => {
      const now = new Date();
      const currentHH = String(now.getHours()).padStart(2, '0');
      const currentMM = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${currentHH}:${currentMM}`;

      prayerInfo.allPrayers.forEach((p) => {
        if (p.time === timeStr && p.id !== 'sunrise') {
          const lastNotifiedKey = `jannat_notified_${p.id}_${now.toDateString()}`;
          let alreadyNotified = false;
          try {
            alreadyNotified = !!localStorage.getItem(lastNotifiedKey);
          } catch {
            alreadyNotified = false;
          }

          if (!alreadyNotified) {
            try {
              localStorage.setItem(lastNotifiedKey, 'true');
            } catch {
              // Ignore
            }
            setActivePrayerPopup(p);
            playAdhanChime();
            triggerHaptic(40);
            try {
              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                new Notification(`حان الآن موعد صلاة ${p.name}`, {
                  body: `حان وقت صلاة ${p.name} حسب توقيت ${location.cityName} (${location.isGps ? 'موقع GPS مباشر' : 'الموقع المحدد'})`,
                  icon: '/favicon.ico'
                });
              }
            } catch {
              // Handled via in-app alert modal
            }
          }
        }
      });
    };

    const interval = setInterval(checkPrayerAlert, 15000);
    return () => clearInterval(interval);
  }, [isNotificationsEnabled, prayerInfo, location]);

  // Update countdown & Cairo live time every second
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      setPrayerInfo(calculateNextPrayerCountdown(location, now, method, offsets));
      setCairoTime(getCurrentCairoTime());
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [location, method, offsets]);

  // Listen to prayer settings changes from SettingsView or elsewhere
  useEffect(() => {
    const handleSettingsChanged = () => {
      const loc = loadSavedLocation();
      const m = loadSavedPrayerMethod();
      const offs = loadSavedPrayerOffsets();
      setLocation(loc);
      setMethod(m);
      setOffsets(offs);
      setPrayerInfo(calculateNextPrayerCountdown(loc, new Date(), m, offs));
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(PRAYER_SETTINGS_CHANGE_EVENT, handleSettingsChanged);
      return () => window.removeEventListener(PRAYER_SETTINGS_CHANGE_EVENT, handleSettingsChanged);
    }
  }, []);

  // Attempt auto-geolocation on initial load only if GPS flag was already selected
  useEffect(() => {
    const saved = loadSavedLocation();
    if (saved && saved.isGps) {
      if (typeof navigator !== 'undefined' && navigator.permissions) {
        navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
          if (result.state === 'granted') {
            handleRequestGps(false);
          }
        }).catch(() => {});
      }
    }
  }, []);

  const handlePinCairoEgyptianSurvey = () => {
    triggerHaptic(30);
    playChime('bell');
    const res = pinCairoEgyptianSurvey();
    setLocation(res.location);
    setMethod(res.method);
    setOffsets(DEFAULT_PRAYER_OFFSETS);
    setPrayerInfo(calculateNextPrayerCountdown(res.location, new Date(), res.method, DEFAULT_PRAYER_OFFSETS));
    setPinnedNotification('تم تثبيت أوقات الصلاة بطريقة هيئة المساحة المصرية وتوقيت القاهرة بنجاح 🇪🇬');
    setTimeout(() => {
      setPinnedNotification(null);
    }, 4500);
  };

  const handleSelectMethod = (newMethod: PrayerCalcMethod) => {
    triggerHaptic(20);
    playChime('click');
    setMethod(newMethod);
    savePrayerMethod(newMethod);
    setPrayerInfo(calculateNextPrayerCountdown(location, new Date(), newMethod, offsets));
  };

  const handleRequestGps = async (withHaptic = true) => {
    if (withHaptic) {
      triggerHaptic(20);
      playChime('click');
    }
    setIsRefreshingLocation(true);
    setLocationError(null);
    try {
      const loc = await requestDeviceLocation();
      setLocation(loc);
      saveLocation(loc);
      setPrayerInfo(calculateNextPrayerCountdown(loc, new Date(), method, offsets));
      if (withHaptic) playChime('success');
      setShowLocationPicker(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'تعذر الوصول للموقع الجغرافي';
      if (errorMsg.includes('denied') || errorMsg.includes('Permission')) {
        setLocationError('يرجى السماح بالوصول للموقع من إعدادات المتصفح لحساب المواقيت بدقة.');
      } else {
        setLocationError('تعذر تحديد موقع GPS حالياً، يمكنك اختيار مدينتك من القائمة.');
      }
    } finally {
      setIsRefreshingLocation(false);
    }
  };

  const handleSelectCity = (city: UserLocation) => {
    playChime('click');
    triggerHaptic(15);
    const updated = { ...city, isGps: false, timestamp: Date.now() };
    setLocation(updated);
    saveLocation(updated);
    setPrayerInfo(calculateNextPrayerCountdown(updated, new Date(), method, offsets));
    setShowLocationPicker(false);
  };

  const handlePlayAdhanNotification = () => {
    playAdhanChime();
    triggerHaptic(30);
    setIsPlayingAdhanPreview(true);
    setTimeout(() => {
      setIsPlayingAdhanPreview(false);
    }, 4000);
  };

  const getPrayerIcon = (id: string, isNext: boolean) => {
    const cls = `w-4 h-4 ${isNext ? 'text-amber-300' : 'text-sky-300 dark:text-sky-200'}`;
    switch (id) {
      case 'fajr':
        return <Moon className={cls} />;
      case 'sunrise':
        return <Sunrise className={cls} />;
      case 'dhuhr':
        return <Sun className={cls} />;
      case 'asr':
        return <Sun className={cls} />;
      case 'maghrib':
        return <Sunset className={cls} />;
      case 'isha':
      default:
        return <Moon className={cls} />;
    }
  };

  const filteredCities = POPULAR_CITIES.filter(
    (c) =>
      c.cityName.includes(searchCityQuery) ||
      (c.countryName && c.countryName.includes(searchCityQuery))
  );

  const isCairoActive = location.cityName === 'القاهرة' && method === 'egypt';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c2448] via-[#0f2e5a] to-[#081a33] border border-sky-500/40 text-white p-5 shadow-xl islamic-border transition-all">
      {/* Decorative Background Elements */}
      <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-amber-400/10 border-8 border-amber-300/10 pointer-events-none blur-[1px]" />
      <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-sky-400/10 pointer-events-none" />

      {/* Top Notification Banner if pinned */}
      {pinnedNotification && (
        <div className="mb-3 p-2.5 rounded-2xl bg-amber-400 text-[#091b34] text-xs font-bold flex items-center justify-between shadow-md animate-slideDown">
          <div className="flex items-center gap-1.5">
            <CheckCheck className="w-4 h-4 text-[#091b34] shrink-0" />
            <span>{pinnedNotification}</span>
          </div>
          <button 
            onClick={() => setPinnedNotification(null)}
            className="p-1 hover:bg-amber-500/20 rounded-full"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header: Title, Location & Method Pill */}
      <div className="flex flex-wrap items-center justify-between gap-2 relative z-10">
        {/* Location & Method Trigger Button */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => {
              setModalTab('locations');
              setShowLocationPicker(true);
            }}
            className="flex items-center gap-1.5 bg-black/25 hover:bg-black/35 border border-sky-400/30 px-3 py-1.5 rounded-full text-xs font-semibold text-sky-100 hover:text-white transition-all active:scale-95 shadow-sm"
            title="تغيير المدينة أو الموقع الجغرافي"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="max-w-[120px] truncate">{location.cityName}</span>
            {location.isGps && (
              <span className="text-[10px] bg-sky-500/30 text-sky-200 px-1 rounded">GPS</span>
            )}
            <ChevronDown className="w-3 h-3 text-amber-200/80" />
          </button>

          <button
            onClick={() => {
              setModalTab('methods');
              setShowLocationPicker(true);
            }}
            className="flex items-center gap-1.5 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 px-2.5 py-1.5 rounded-full text-xs font-medium text-sky-200 hover:text-white transition-all active:scale-95 shadow-sm"
            title="تغيير طريقة الحساب الفلكي لمواقيت الصلاة"
          >
            <Sliders className="w-3 h-3 text-amber-300 shrink-0" />
            <span className="max-w-[140px] truncate">{prayerInfo.methodName}</span>
          </button>
        </div>

        {/* Header Right: Clock & Title */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-sm font-bold tracking-tight">مواقيت الصلاة</span>
              <Clock className="w-4 h-4 text-amber-300" />
            </div>
            <div className="flex items-center justify-end gap-1 text-[11px] text-sky-200/90 font-medium">
              <span>{location.cityName}</span>
              <span>•</span>
              <span className="text-amber-200">{method === 'egypt' ? 'المساحة المصرية' : prayerInfo.methodName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Egyptian Survey & Cairo Pin Bar */}
      <div className="mt-3 flex items-center justify-between bg-black/20 backdrop-blur-sm border border-sky-500/20 rounded-2xl px-3 py-2 text-xs relative z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePinCairoEgyptianSurvey}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 ${
              isCairoActive
                ? 'bg-amber-400 text-[#091b34] shadow-sm ring-1 ring-amber-300'
                : 'bg-white/10 hover:bg-white/20 text-sky-100 hover:text-white border border-white/15'
            }`}
            title="تثبيت القاهرة بهيئة المساحة المصرية مباشرة"
          >
            <Pin className={`w-3 h-3 ${isCairoActive ? 'text-[#091b34] fill-[#091b34]' : 'text-amber-300'}`} />
            <span>{isCairoActive ? 'مثبت: القاهرة (المساحة المصرية)' : 'تثبيت القاهرة (هيئة المساحة المصرية) 🇪🇬'}</span>
          </button>
        </div>

        {/* Cairo Live Time Indicator */}
        <div className="flex items-center gap-1.5 text-[11px] text-sky-200 font-mono">
          <span className="text-[10px] text-sky-300 font-sans">توقيت القاهرة:</span>
          <span className="font-bold text-amber-300 bg-black/30 px-1.5 py-0.5 rounded border border-white/10">
            {toArabicNumerals(cairoTime)}
          </span>
        </div>
      </div>

      {/* Main Countdown Spotlight Card */}
      <div className="mt-3.5 bg-white/10 dark:bg-black/25 backdrop-blur-sm border border-sky-500/25 rounded-2xl p-4 relative z-10">
        <div className="flex items-start justify-between">
          {/* Adhan Chime / Audio Alert Button */}
          <button
            onClick={handlePlayAdhanNotification}
            className={`p-2.5 rounded-xl border transition-all active:scale-95 flex items-center justify-center ${
              isPlayingAdhanPreview
                ? 'bg-amber-400 text-[#081a33] border-amber-300 shadow-md animate-bounce'
                : 'bg-white/10 hover:bg-white/20 border-white/15 text-sky-100 hover:text-white'
            }`}
            title="نغمة تنبيه الصلاة"
            aria-label="نغمة تنبيه الصلاة"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Next Prayer Title & Time */}
          <div className="text-right flex-1 pr-3">
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-xs text-amber-200 font-semibold bg-amber-400/20 border border-amber-300/30 px-2 py-0.5 rounded-full">
                الصلاة القادمة
              </span>
              <h3 className="text-lg font-bold font-amiri text-white">
                {prayerInfo.nextPrayer.name}
              </h3>
            </div>
            
            <p className="text-xs text-sky-100/90 mt-1 font-medium">
              عند الساعة{' '}
              <span className="font-bold text-amber-300 text-sm">
                {prayerInfo.nextPrayer.formattedTime}
              </span>
            </p>
          </div>
        </div>

        {/* Live Countdown Numbers Display */}
        <div className="mt-3 flex items-center justify-between pt-3 border-t border-sky-500/20">
          <div className="text-right">
            <span className="text-[11px] text-sky-200 block font-medium">الوقت المتبقي للأذان</span>
            <span className="text-xs font-semibold text-amber-200">
              {prayerInfo.remainingHumanArabic}
            </span>
          </div>

          <div className="font-mono text-xl font-black tracking-wider text-white bg-black/30 border border-sky-400/40 px-3.5 py-1 rounded-xl shadow-inner flex items-center gap-1">
            <span className="text-amber-300">
              {toArabicNumerals(prayerInfo.remainingFormatted)}
            </span>
          </div>
        </div>

        {/* Time Progress Bar */}
        <div className="mt-3 space-y-1">
          <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-amber-400 to-sky-300 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${prayerInfo.progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-sky-200/80">
            <span>{prayerInfo.nextPrayer.name}</span>
            <span>{prayerInfo.currentPrayer.name}</span>
          </div>
        </div>
      </div>

      {/* Prayers List Strip (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha) */}
      <div className="mt-4 relative z-10">
        <div className="flex items-center justify-between mb-2 px-1">
          <button
            onClick={() => setShowAllPrayers(!showAllPrayers)}
            className="text-[11px] text-sky-200 hover:text-white flex items-center gap-1 font-medium"
          >
            <span>{showAllPrayers ? 'إخفاء الجدول' : 'عرض جدول اليوم'}</span>
            {showAllPrayers ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-100">
            <span>صلوات اليوم</span>
            <span className="text-[10px] font-normal text-sky-200">
              ({location.cityName} • {method === 'egypt' ? 'المساحة المصرية' : prayerInfo.methodName})
            </span>
          </div>
        </div>

        {showAllPrayers && (
          <div className="grid grid-cols-6 gap-1.5 text-center">
            {prayerInfo.allPrayers.map((p) => {
              const isNext = p.isNext;
              const isPassed = p.isPassed;
              return (
                <div
                  key={p.id}
                  className={`p-1.5 rounded-xl border flex flex-col items-center justify-between transition-all ${
                    isNext
                      ? 'bg-amber-400 text-[#091b34] border-amber-300 font-bold shadow-md ring-2 ring-amber-300/40 scale-105'
                      : isPassed
                      ? 'bg-white/5 border-white/10 text-sky-200/60'
                      : 'bg-white/10 border-sky-500/20 text-white'
                  }`}
                >
                  <span className="text-[11px] font-bold block mb-0.5 truncate w-full">
                    {p.name}
                  </span>
                  <div className="my-0.5">
                    {getPrayerIcon(p.id, isNext)}
                  </div>
                  <span className={`text-[10px] leading-tight ${isNext ? 'font-black text-[#091b34]' : 'font-medium text-sky-100'}`}>
                    {toArabicNumerals(p.time)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Actions Bar with Export, Notifications, Qibla, and GPS */}
      <div className="mt-3.5 pt-3 border-t border-sky-500/20 flex items-center justify-between relative z-10 flex-wrap gap-2">
        {onNavigateToTracker ? (
          <button
            onClick={onNavigateToTracker}
            className="text-xs text-amber-200 hover:text-white flex items-center gap-1 font-semibold group transition-all"
          >
            <span>شجرة العبادات</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {/* Universal Export Button for Prayer Times */}
          <button
            onClick={handleExportPrayerTimes}
            className="text-xs text-white hover:text-sky-200 flex items-center gap-1 bg-sky-600/60 hover:bg-sky-600/80 border border-sky-400/50 px-2.5 py-1 rounded-lg transition-all active:scale-95 shadow-sm font-bold"
            title="تصدير ومشاركة مواقيت الصلاة"
          >
            <Download className="w-3 h-3 text-sky-300" />
            <span>تصدير</span>
          </button>

          <button
            onClick={handleToggleNotifications}
            className={`text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all active:scale-95 font-bold border ${
              isNotificationsEnabled
                ? 'bg-amber-400 text-[#091b34] border-amber-300 shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
            }`}
            title={isNotificationsEnabled ? 'الإشعارات مفعلة' : 'تفعيل إشعارات مواقيت الصلاة'}
          >
            <Bell className={`w-3.5 h-3.5 ${isNotificationsEnabled ? 'fill-current animate-bounce' : ''}`} />
            <span>{isNotificationsEnabled ? 'التنبيهات مفعلة 🔔' : 'تفعيل التنبيهات'}</span>
          </button>

          {onNavigateToQibla && (
            <button
              onClick={onNavigateToQibla}
              className="text-xs text-amber-200 hover:text-white flex items-center gap-1.5 bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/30 px-2.5 py-1 rounded-lg transition-all active:scale-95 font-bold"
              title="تحديد اتجاه القبلة عبر البوصلة"
            >
              <span>بوصلة القبلة 🕋</span>
              <Compass className="w-3.5 h-3.5 text-amber-300" />
            </button>
          )}

          <button
            onClick={() => handleRequestGps(true)}
            disabled={isRefreshingLocation}
            className="text-xs text-sky-200 hover:text-white flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-all active:scale-95 disabled:opacity-50"
            title="تحديث الإحداثيات الجغرافية عبر GPS"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshingLocation ? 'animate-spin text-amber-300' : ''}`} />
            <span>GPS</span>
          </button>
        </div>
      </div>

      {/* Location & Calculation Method Modal */}
      {showLocationPicker && (
        <div className="fixed inset-0 z-50 bg-[#061120]/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div 
            className="w-full max-w-md bg-[#0c213f] text-sky-100 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-sky-500/40 max-h-[85vh] flex flex-col animate-slideUp arabesque-watermark"
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-sky-800/40">
              <button
                onClick={() => setShowLocationPicker(false)}
                className="w-8 h-8 rounded-full bg-sky-950/80 hover:bg-sky-900 border border-sky-800 flex items-center justify-center transition-all text-sky-300"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-right">
                <h3 className="font-bold text-base text-white flex items-center justify-end gap-1.5">
                  <span>إعدادات مواقيت الصلاة</span>
                  <Sliders className="w-4 h-4 text-sky-400" />
                </h3>
                <p className="text-xs text-sky-300/70">طرق الحساب الفلكي والمدينة الجغرافية</p>
              </div>
            </div>

            {/* Modal Tabs Switcher */}
            <div className="mt-3 flex p-1 bg-[#09182b] rounded-2xl border border-sky-800/40">
              <button
                onClick={() => setModalTab('methods')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  modalTab === 'methods'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-sky-300/80 hover:text-white'
                }`}
              >
                طريقة الحساب الفلكي
              </button>
              <button
                onClick={() => setModalTab('locations')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  modalTab === 'locations'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-sky-300/80 hover:text-white'
                }`}
              >
                المدينة والموقع الجغرافي
              </button>
            </div>

            {/* Tab 1: Calculation Methods */}
            {modalTab === 'methods' && (
              <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1">
                {/* Instant Egyptian Survey Pin Quick Button */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/40 to-sky-950/40 border border-sky-700/50 text-right">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        handlePinCairoEgyptianSurvey();
                        setShowLocationPicker(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
                    >
                      تثبيت الآن 🇪🇬
                    </button>
                    <div className="text-right">
                      <span className="text-xs font-bold text-sky-300 block">
                        تثبيت هيئة المساحة المصرية بالقاهرة
                      </span>
                      <span className="text-[11px] text-sky-300/70">
                        تعيين القاهرة وحسابات الهيئة المصرية فوراً
                      </span>
                    </div>
                  </div>
                </div>

                <label className="block text-xs font-bold text-sky-300 text-right mt-3 mb-1">
                  اختر طريقة الحساب الفلكي المعتمدة:
                </label>

                {PRAYER_CALC_METHODS.map((m) => {
                  const isSelected = method === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleSelectMethod(m.id)}
                      className={`w-full p-3 rounded-2xl text-right transition-all border ${
                        isSelected
                          ? 'bg-[#102d54] text-white border-sky-400 shadow-md ring-1 ring-sky-400/40'
                          : 'bg-[#091a30] hover:bg-[#0e2748] border-sky-900/60 text-sky-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        {isSelected ? (
                          <span className="p-1 rounded-full bg-sky-500 text-white">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-sky-300">
                            {m.country}
                          </span>
                        )}

                        <div className="text-right flex-1 pr-2">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-900/60 text-sky-300 border border-sky-700/40">
                              {m.badge}
                            </span>
                            <span className="font-bold text-sm text-white">
                              {m.name}
                            </span>
                          </div>
                          <p className="text-xs text-sky-300/80 mt-1 leading-relaxed">
                            {m.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {/* Egyptian Jurisprudence and Astronomical Standard Explanation */}
                {method === 'egypt' && (
                  <div className="p-3.5 rounded-2xl bg-sky-950/60 border border-sky-800/60 text-right space-y-2 mt-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-sky-800/40">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono">
                        معايير مصر الرسمية 🇪🇬
                      </span>
                      <div className="flex items-center gap-1.5 font-bold text-sky-200 text-xs">
                        <span>التفصيل الفقهي والفلكي المعتمد بمصر</span>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-sky-100 leading-relaxed">
                      <div className="flex items-start gap-1.5">
                        <span className="text-amber-300 font-bold shrink-0">• صلاة الفجر:</span>
                        <span>تُحسب عند درجة انخفاض للشمس تبلغ <strong>١٩.٥°</strong> تحت الأفق وفق التقديرات الفلكية الرسمية.</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="text-amber-300 font-bold shrink-0">• صلاة العصر (المذهب الشافعي):</span>
                        <span>يبدأ عندما يصير ظل كل شيء مثله، وهو مذهب الجمهور المعتمد بمصر.</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="text-amber-300 font-bold shrink-0">• صلاة العشاء (المذهب الحنفي):</span>
                        <span>يُحسب عند غياب الشفق بانخفاض الشمس <strong>١٧.٥°</strong> تحت الأفق.</span>
                      </div>
                      <div className="pt-1 border-t border-sky-900/50 flex items-center justify-end text-[10px] text-sky-400/80">
                        <span>بالتنسيق بين الهيئة المصرية العامة للمساحة ودار الإفتاء المصرية.</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Location and Cities */}
            {modalTab === 'locations' && (
              <div className="mt-3 flex-1 overflow-y-auto space-y-3 pr-1">
                {/* GPS Auto Button */}
                <div>
                  <button
                    onClick={() => handleRequestGps(true)}
                    disabled={isRefreshingLocation}
                    className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
                  >
                    <Navigation className={`w-4 h-4 ${isRefreshingLocation ? 'animate-spin' : ''}`} />
                    <span>
                      {isRefreshingLocation ? 'جارٍ تحديد الموقع عبر الأقمار الصناعية...' : 'استخدام موقعي الحالي عبر GPS تلقائياً'}
                    </span>
                  </button>

                  {locationError && (
                    <div className="mt-2 p-2 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs text-right">
                      {locationError}
                    </div>
                  )}
                </div>

                {/* Quick Cairo Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSelectCity(CAIRO_LOCATION)}
                    className="w-full py-2 px-3 rounded-xl bg-sky-950/80 hover:bg-sky-900 border border-sky-700/50 text-sky-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-amber-300" />
                    <span>اختيار القاهرة (مصر 🇪🇬)</span>
                  </button>
                </div>

                {/* City Search Field */}
                <div>
                  <input
                    type="text"
                    value={searchCityQuery}
                    onChange={(e) => setSearchCityQuery(e.target.value)}
                    placeholder="ابحث عن مدينة (القاهرة، الإسكندرية، مكة، الرياض...)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#091a30] border border-sky-800 text-sm text-right text-white placeholder-sky-400/50 focus:outline-none focus:border-sky-400"
                  />
                </div>

                {/* Cities List */}
                <div className="space-y-1.5 max-h-52 overflow-y-auto">
                  {filteredCities.map((city) => {
                    const isSelected = !location.isGps && location.cityName === city.cityName;
                    return (
                      <button
                        key={`${city.cityName}-${city.countryName}`}
                        onClick={() => handleSelectCity(city)}
                        className={`w-full p-2.5 rounded-xl text-right flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-900/60 text-white border border-sky-400 font-bold'
                            : 'bg-[#091a30] hover:bg-[#0e2748] border border-sky-900/50 text-sky-200'
                        }`}
                      >
                        {isSelected ? (
                          <Check className="w-4 h-4 text-sky-400" />
                        ) : (
                          <span className="text-[11px] text-sky-400/70">
                            {toArabicNumerals(city.latitude.toFixed(1))}°, {toArabicNumerals(city.longitude.toFixed(1))}°
                          </span>
                        )}

                        <div className="text-right">
                          <span className="text-sm font-semibold block">{city.cityName}</span>
                          <span className="text-[11px] text-sky-300/70">{city.countryName}</span>
                        </div>
                      </button>
                    );
                  })}

                  {filteredCities.length === 0 && (
                    <div className="text-center py-6 text-xs text-sky-300/60">
                      لم يتم العثور على مدينة مطابقة. يمكنك تفعيل زر GPS بالأعلى للحصول على إحداثيات موقعك مباشرة.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="mt-4 pt-3 border-t border-sky-800/40">
              <button
                onClick={() => setShowLocationPicker(false)}
                className="w-full py-2.5 rounded-xl bg-sky-950 hover:bg-sky-900 border border-sky-700/40 font-semibold text-xs transition-all text-sky-200 cursor-pointer"
              >
                إغلاق وحفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Prayer Time Popup Notification Modal */}
      {activePrayerPopup && (
        <div className="fixed inset-0 z-50 bg-[#061120]/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn" dir="rtl">
          <div className="w-full max-w-sm bg-gradient-to-br from-[#0c2448] via-[#0f2e5a] to-[#081a33] text-white rounded-3xl p-6 shadow-2xl border-2 border-sky-400 text-center space-y-4 animate-scaleUp arabesque-watermark">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-400 text-[#091b34] flex items-center justify-center shadow-lg animate-bounce">
              <Bell className="w-8 h-8 fill-current" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-900/60 text-sky-200 border border-sky-600/50">
                مواقيت الصلاة • {location.cityName} ({location.isGps ? 'تحديد GPS دقيق 📍' : 'الموقع المحدد'})
              </span>
              <h3 className="font-amiri text-2xl font-bold text-amber-300">
                حان الآن موعد صلاة {activePrayerPopup.name}
              </h3>
              <p className="text-xs text-sky-200">
                وفقاً للتوقيت المحلي والإحداثيات الجغرافية لمدينتكم المباركة
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#09182b] border border-sky-700/40 text-right">
              <div className="flex items-center justify-between text-xs text-sky-200">
                <span>وقت الأذان</span>
                <span className="font-bold text-amber-300 text-sm">{toArabicNumerals(activePrayerPopup.time)}</span>
              </div>
              <p className="text-[11px] text-sky-300/80 mt-1">
                "الصلاة كانت على المؤمنين كتاباً موقوتاً"
              </p>
            </div>

            <button
              onClick={() => {
                setActivePrayerPopup(null);
                playChime('click');
                triggerHaptic(15);
              }}
              className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-[#091b34] font-bold text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              تقبل الله طاعتكم 🤲 (إغلاق التنبيه)
            </button>
          </div>
        </div>
      )}

      {/* Universal Export Modal */}
      <UniversalExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        payload={exportPayload}
      />
    </div>
  );
};


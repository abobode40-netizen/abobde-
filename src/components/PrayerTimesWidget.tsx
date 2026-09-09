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
  CheckCheck
} from 'lucide-react';
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
import { playChime, triggerHaptic } from '../utils/audio';

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
    playChime('bell');
    triggerHaptic(30);
    setIsPlayingAdhanPreview(true);
    setTimeout(() => {
      setIsPlayingAdhanPreview(false);
    }, 1200);
  };

  const getPrayerIcon = (id: string, isNext: boolean) => {
    const cls = `w-4 h-4 ${isNext ? 'text-amber-300' : 'text-emerald-700 dark:text-emerald-300'}`;
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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#103D32] via-[#0D5F47] to-[#083E2F] text-white p-5 shadow-xl islamic-border transition-all">
      {/* Decorative Background Elements */}
      <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-amber-400/10 border-8 border-amber-300/10 pointer-events-none blur-[1px]" />
      <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-emerald-300/10 pointer-events-none" />

      {/* Top Notification Banner if pinned */}
      {pinnedNotification && (
        <div className="mb-3 p-2.5 rounded-2xl bg-amber-400 text-[#0F4234] text-xs font-bold flex items-center justify-between shadow-md animate-slideDown">
          <div className="flex items-center gap-1.5">
            <CheckCheck className="w-4 h-4 text-[#0F4234] shrink-0" />
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
            className="flex items-center gap-1.5 bg-black/25 hover:bg-black/35 border border-white/20 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-100 hover:text-white transition-all active:scale-95 shadow-sm"
            title="تغيير المدينة أو الموقع الجغرافي"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="max-w-[120px] truncate">{location.cityName}</span>
            {location.isGps && (
              <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-1 rounded">GPS</span>
            )}
            <ChevronDown className="w-3 h-3 text-amber-200/80" />
          </button>

          <button
            onClick={() => {
              setModalTab('methods');
              setShowLocationPicker(true);
            }}
            className="flex items-center gap-1.5 bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/30 px-2.5 py-1.5 rounded-full text-xs font-medium text-amber-200 hover:text-white transition-all active:scale-95 shadow-sm"
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
            <div className="flex items-center justify-end gap-1 text-[11px] text-emerald-200/90 font-medium">
              <span>{location.cityName}</span>
              <span>•</span>
              <span className="text-amber-200">{method === 'egypt' ? 'المساحة المصرية' : prayerInfo.methodName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Egyptian Survey & Cairo Pin Bar */}
      <div className="mt-3 flex items-center justify-between bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl px-3 py-2 text-xs relative z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePinCairoEgyptianSurvey}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 ${
              isCairoActive
                ? 'bg-amber-400 text-[#0F4234] shadow-sm ring-1 ring-amber-300'
                : 'bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white border border-white/15'
            }`}
            title="تثبيت القاهرة بهيئة المساحة المصرية مباشرة"
          >
            <Pin className={`w-3 h-3 ${isCairoActive ? 'text-[#0F4234] fill-[#0F4234]' : 'text-amber-300'}`} />
            <span>{isCairoActive ? 'مثبت: القاهرة (المساحة المصرية)' : 'تثبيت القاهرة (هيئة المساحة المصرية) 🇪🇬'}</span>
          </button>
        </div>

        {/* Cairo Live Time Indicator */}
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-200 font-mono">
          <span className="text-[10px] text-emerald-300 font-sans">توقيت القاهرة:</span>
          <span className="font-bold text-amber-300 bg-black/30 px-1.5 py-0.5 rounded border border-white/10">
            {toArabicNumerals(cairoTime)}
          </span>
        </div>
      </div>

      {/* Main Countdown Spotlight Card */}
      <div className="mt-3.5 bg-white/10 dark:bg-black/25 backdrop-blur-sm border border-white/15 rounded-2xl p-4 relative z-10">
        <div className="flex items-start justify-between">
          {/* Adhan Chime / Audio Alert Button */}
          <button
            onClick={handlePlayAdhanNotification}
            className={`p-2.5 rounded-xl border transition-all active:scale-95 flex items-center justify-center ${
              isPlayingAdhanPreview
                ? 'bg-amber-400 text-[#123E33] border-amber-300 shadow-md animate-bounce'
                : 'bg-white/10 hover:bg-white/20 border-white/15 text-emerald-100 hover:text-white'
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
            
            <p className="text-xs text-emerald-100/90 mt-1 font-medium">
              عند الساعة{' '}
              <span className="font-bold text-amber-300 text-sm">
                {prayerInfo.nextPrayer.formattedTime}
              </span>
            </p>
          </div>
        </div>

        {/* Live Countdown Numbers Display */}
        <div className="mt-3 flex items-center justify-between pt-3 border-t border-white/10">
          <div className="text-right">
            <span className="text-[11px] text-emerald-200 block font-medium">الوقت المتبقي للأذان</span>
            <span className="text-xs font-semibold text-amber-200">
              {prayerInfo.remainingHumanArabic}
            </span>
          </div>

          <div className="font-mono text-xl font-black tracking-wider text-white bg-black/30 border border-amber-400/30 px-3.5 py-1 rounded-xl shadow-inner flex items-center gap-1">
            <span className="text-amber-300">
              {toArabicNumerals(prayerInfo.remainingFormatted)}
            </span>
          </div>
        </div>

        {/* Time Progress Bar */}
        <div className="mt-3 space-y-1">
          <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-amber-400 to-emerald-300 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${prayerInfo.progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-emerald-200/80">
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
            className="text-[11px] text-emerald-200 hover:text-white flex items-center gap-1 font-medium"
          >
            <span>{showAllPrayers ? 'إخفاء الجدول' : 'عرض جدول اليوم'}</span>
            {showAllPrayers ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-100">
            <span>صلوات اليوم</span>
            <span className="text-[10px] font-normal text-emerald-200">
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
                      ? 'bg-amber-400 text-[#0E4234] border-amber-300 font-bold shadow-md ring-2 ring-amber-300/40 scale-105'
                      : isPassed
                      ? 'bg-white/5 border-white/10 text-emerald-200/60'
                      : 'bg-white/10 border-white/15 text-white'
                  }`}
                >
                  <span className="text-[11px] font-bold block mb-0.5 truncate w-full">
                    {p.name}
                  </span>
                  <div className="my-0.5">
                    {getPrayerIcon(p.id, isNext)}
                  </div>
                  <span className={`text-[10px] leading-tight ${isNext ? 'font-black text-[#0E4234]' : 'font-medium text-emerald-100'}`}>
                    {toArabicNumerals(p.time)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Link to Tracker Screen & Qibla Compass */}
      <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between relative z-10 flex-wrap gap-2">
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

        <div className="flex items-center gap-2">
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
            className="text-xs text-emerald-200 hover:text-white flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-all active:scale-95 disabled:opacity-50"
            title="تحديث الإحداثيات الجغرافية عبر GPS"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshingLocation ? 'animate-spin text-amber-300' : ''}`} />
            <span>GPS</span>
          </button>
        </div>
      </div>

      {/* Location & Calculation Method Modal */}
      {showLocationPicker && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div 
            className="w-full max-w-md bg-[#FAF7F0] dark:bg-[#15231E] text-[#19302A] dark:text-[#E6F0EC] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-[#E5DDCF] dark:border-[#2A3C34] max-h-[85vh] flex flex-col animate-slideUp"
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DDCF] dark:border-[#2A3C34]">
              <button
                onClick={() => setShowLocationPicker(false)}
                className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4 text-[#6F786E] dark:text-[#8E9B93]" />
              </button>

              <div className="text-right">
                <h3 className="font-bold text-base text-[#0F6B50] dark:text-[#2DD4BF] flex items-center justify-end gap-1.5">
                  <span>إعدادات مواقيت الصلاة</span>
                  <Sliders className="w-4 h-4" />
                </h3>
                <p className="text-xs text-[#6F786E] dark:text-[#8E9B93]">طرق الحساب الفلكي والمدينة الجغرافية</p>
              </div>
            </div>

            {/* Modal Tabs Switcher */}
            <div className="mt-3 flex p-1 bg-black/5 dark:bg-white/5 rounded-2xl border border-[#E5DDCF] dark:border-[#2A3C34]">
              <button
                onClick={() => setModalTab('methods')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  modalTab === 'methods'
                    ? 'bg-[#0F6B50] text-white shadow-sm'
                    : 'text-[#6F786E] dark:text-[#8E9B93] hover:text-[#19302A] dark:hover:text-white'
                }`}
              >
                طريقة الحساب الفلكي
              </button>
              <button
                onClick={() => setModalTab('locations')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  modalTab === 'locations'
                    ? 'bg-[#0F6B50] text-white shadow-sm'
                    : 'text-[#6F786E] dark:text-[#8E9B93] hover:text-[#19302A] dark:hover:text-white'
                }`}
              >
                المدينة والموقع الجغرافي
              </button>
            </div>

            {/* Tab 1: Calculation Methods */}
            {modalTab === 'methods' && (
              <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1">
                {/* Instant Egyptian Survey Pin Quick Button */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-100 to-emerald-50 dark:from-amber-950/30 dark:to-emerald-950/30 border border-amber-300 dark:border-amber-700/50 text-right">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        handlePinCairoEgyptianSurvey();
                        setShowLocationPicker(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#0F6B50] hover:bg-[#168064] text-white text-xs font-bold shadow-sm transition-all active:scale-95"
                    >
                      تثبيت الآن 🇪🇬
                    </button>
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#0F6B50] dark:text-[#2DD4BF] block">
                        تثبيت هيئة المساحة المصرية بالقاهرة
                      </span>
                      <span className="text-[11px] text-[#6F786E] dark:text-[#8E9B93]">
                        تعيين القاهرة وحسابات الهيئة المصرية فوراً
                      </span>
                    </div>
                  </div>
                </div>

                <label className="block text-xs font-bold text-[#6F786E] dark:text-[#8E9B93] text-right mt-3 mb-1">
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
                          ? 'bg-[#EBF5F1] dark:bg-[#1B362E] text-[#0F6B50] dark:text-[#2DD4BF] border-[#0F6B50] shadow-sm ring-1 ring-[#0F6B50]/30'
                          : 'bg-white dark:bg-[#1A2621] hover:bg-emerald-50/40 dark:hover:bg-[#20312B] border-[#E5DDCF] dark:border-[#2A3C34]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        {isSelected ? (
                          <span className="p-1 rounded-full bg-[#0F6B50] text-white">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="text-[10px] bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full text-[#6F786E] dark:text-[#8E9B93]">
                            {m.country}
                          </span>
                        )}

                        <div className="text-right flex-1 pr-2">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-700 dark:text-amber-300">
                              {m.badge}
                            </span>
                            <span className="font-bold text-sm text-[#19302A] dark:text-white">
                              {m.name}
                            </span>
                          </div>
                          <p className="text-xs text-[#6F786E] dark:text-[#8E9B93] mt-1 leading-relaxed">
                            {m.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {/* Egyptian Jurisprudence and Astronomical Standard Explanation */}
                {method === 'egypt' && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/25 border border-amber-300/80 dark:border-amber-800/40 text-right space-y-2 mt-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-amber-200/60 dark:border-amber-800/30">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-mono">
                        معايير مصر الرسمية 🇪🇬
                      </span>
                      <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200 text-xs">
                        <span>التفصيل الفقهي والفلكي المعتمد بمصر</span>
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-[#19302A] dark:text-gray-200 leading-relaxed">
                      <div className="flex items-start gap-1.5">
                        <span className="text-amber-700 dark:text-amber-400 font-bold shrink-0">• صلاة الفجر:</span>
                        <span>تُحسب عند درجة انخفاض للشمس تبلغ <strong>١٩.٥°</strong> تحت الأفق وفق التقديرات الفلكية المعتمدة رسمياً.</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="text-amber-700 dark:text-amber-400 font-bold shrink-0">• صلاة العصر (المذهب الشافعي):</span>
                        <span>يبدأ عندما يصير ظل كل شيء مثله (بالإضافة إلى ظل الزوال)، وهو مذهب الجمهور المعتمد في مصر.</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="text-amber-700 dark:text-amber-400 font-bold shrink-0">• صلاة العشاء (المذهب الحنفي):</span>
                        <span>يُحسب عند غياب الشفق بانخفاض الشمس <strong>١٧.٥°</strong> تحت الأفق.</span>
                      </div>
                      <div className="pt-1 border-t border-amber-200/50 dark:border-amber-800/30 flex items-center justify-end text-[10px] text-gray-500 dark:text-gray-400">
                        <span>بالتنسيق بين الهيئة المصرية العامة للمساحة ودار الإفتاء المصرية ووزارة الأوقاف.</span>
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
                    className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#0F6B50] to-[#168064] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60"
                  >
                    <Navigation className={`w-4 h-4 ${isRefreshingLocation ? 'animate-spin' : ''}`} />
                    <span>
                      {isRefreshingLocation ? 'جارٍ تحديد الموقع عبر الأقمار الصناعية...' : 'استخدام موقعي الحالي عبر GPS تلقائياً'}
                    </span>
                  </button>

                  {locationError && (
                    <div className="mt-2 p-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 text-xs text-right">
                      {locationError}
                    </div>
                  )}
                </div>

                {/* Quick Cairo Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSelectCity(CAIRO_LOCATION)}
                    className="w-full py-2 px-3 rounded-xl bg-[#EBF5F1] dark:bg-[#1B362E] hover:bg-emerald-100 dark:hover:bg-[#23473D] border border-[#0F6B50]/30 text-[#0F6B50] dark:text-[#2DD4BF] text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <MapPin className="w-3.5 h-3.5" />
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E2D27] border border-[#D5E5DE] dark:border-[#2C4138] text-sm text-right focus:outline-none focus:border-[#0F6B50] dark:focus:border-[#2DD4BF]"
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
                        className={`w-full p-2.5 rounded-xl text-right flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-[#EBF5F1] dark:bg-[#1B362E] text-[#0F6B50] dark:text-[#2DD4BF] border border-[#0F6B50]/30 font-bold'
                            : 'bg-white dark:bg-[#1A2621] hover:bg-emerald-50/50 dark:hover:bg-[#20312B] border border-[#E5DDCF]/70 dark:border-[#2A3C34] text-[#19302A] dark:text-white'
                        }`}
                      >
                        {isSelected ? (
                          <Check className="w-4 h-4 text-[#0F6B50] dark:text-[#2DD4BF]" />
                        ) : (
                          <span className="text-[11px] text-[#8C9890]">
                            {toArabicNumerals(city.latitude.toFixed(1))}°, {toArabicNumerals(city.longitude.toFixed(1))}°
                          </span>
                        )}

                        <div className="text-right">
                          <span className="text-sm font-semibold block">{city.cityName}</span>
                          <span className="text-[11px] text-[#7A887E] dark:text-[#8E9B93]">{city.countryName}</span>
                        </div>
                      </button>
                    );
                  })}

                  {filteredCities.length === 0 && (
                    <div className="text-center py-6 text-xs text-[#8C9890]">
                      لم يتم العثور على مدينة مطابقة. يمكنك تفعيل زر GPS بالأعلى للحصول على إحداثيات موقعك مباشرة.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="mt-4 pt-3 border-t border-[#E5DDCF] dark:border-[#2A3C34]">
              <button
                onClick={() => setShowLocationPicker(false)}
                className="w-full py-2.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 font-semibold text-xs transition-all"
              >
                إغلاق وحفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


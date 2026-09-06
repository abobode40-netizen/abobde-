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
  Volume2, 
  VolumeX, 
  Calendar, 
  ArrowRight,
  Compass,
  X,
  Check
} from 'lucide-react';
import { 
  calculateNextPrayerCountdown, 
  getPrayerTimesList, 
  loadSavedLocation, 
  saveLocation, 
  requestDeviceLocation, 
  POPULAR_CITIES, 
  UserLocation, 
  NextPrayerInfo, 
  PrayerTimeItem,
  toEasternArabicDigits 
} from '../utils/prayerTimes';
import { toArabicNumerals } from '../data/quranData';
import { playChime, triggerHaptic } from '../utils/audio';
import { speakArabicText, stopSpeech } from '../utils/speech';

interface PrayerTimesWidgetProps {
  onNavigateToTracker?: () => void;
}

export const PrayerTimesWidget: React.FC<PrayerTimesWidgetProps> = ({
  onNavigateToTracker
}) => {
  const [location, setLocation] = useState<UserLocation>(loadSavedLocation());
  const [prayerInfo, setPrayerInfo] = useState<NextPrayerInfo>(() => 
    calculateNextPrayerCountdown(loadSavedLocation())
  );
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showAllPrayers, setShowAllPrayers] = useState(true);
  const [searchCityQuery, setSearchCityQuery] = useState('');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isPlayingAdhanPreview, setIsPlayingAdhanPreview] = useState(false);

  // Update countdown every second
  useEffect(() => {
    const updateCountdown = () => {
      setPrayerInfo(calculateNextPrayerCountdown(location));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [location]);

  // Attempt auto-geolocation on initial load if not set
  useEffect(() => {
    const saved = loadSavedLocation();
    if (!saved || !saved.isGps) {
      // Check if geolocation permission is already granted
      if (typeof navigator !== 'undefined' && navigator.permissions) {
        navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
          if (result.state === 'granted') {
            handleRequestGps(false);
          }
        }).catch(() => {
          // Permissions API not supported for geolocation query in some contexts
        });
      }
    }
  }, []);

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
      setPrayerInfo(calculateNextPrayerCountdown(loc));
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
    setPrayerInfo(calculateNextPrayerCountdown(updated));
    setShowLocationPicker(false);
  };

  const handlePlayAdhanNotification = () => {
    if (isPlayingAdhanPreview) {
      stopSpeech();
      setIsPlayingAdhanPreview(false);
      playChime('click');
    } else {
      setIsPlayingAdhanPreview(true);
      playChime('bell');
      triggerHaptic(30);
      speakArabicText(`حان الآن وقت ${prayerInfo.nextPrayer.name}. الله أكبر، الله أكبر. لا إله إلا الله.`, {
        rate: 0.85,
        onEnd: () => setIsPlayingAdhanPreview(false),
        onError: () => setIsPlayingAdhanPreview(false)
      });
    }
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

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#123E33] via-[#0F6B50] to-[#0A4837] text-white p-5 shadow-lg islamic-border transition-all">
      {/* Decorative Background Elements */}
      <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-amber-400/10 border-8 border-amber-300/10 pointer-events-none blur-[1px]" />
      <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-emerald-300/10 pointer-events-none" />

      {/* Top Header: Title & Location Pill */}
      <div className="flex items-center justify-between relative z-10">
        <button
          onClick={() => setShowLocationPicker(true)}
          className="flex items-center gap-1.5 bg-black/25 hover:bg-black/35 border border-white/20 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-100 hover:text-white transition-all active:scale-95 shadow-sm"
          title="تغيير أو تحديث الموقع الجغرافي"
        >
          <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span className="max-w-[130px] truncate">{location.cityName}</span>
          {location.isGps && (
            <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-1 rounded">GPS</span>
          )}
          <ChevronDown className="w-3 h-3 text-amber-200/80" />
        </button>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-sm font-bold tracking-tight">مواقيت الصلاة</span>
              <Clock className="w-4 h-4 text-amber-300" />
            </div>
            <span className="text-[11px] text-emerald-200/90 font-medium">حسب موقعك الجغرافي</span>
          </div>
        </div>
      </div>

      {/* Main Countdown Spotlight Card */}
      <div className="mt-4 bg-white/10 dark:bg-black/25 backdrop-blur-sm border border-white/15 rounded-2xl p-4 relative z-10">
        <div className="flex items-start justify-between">
          {/* Adhan Chime / Audio Alert Button */}
          <button
            onClick={handlePlayAdhanNotification}
            className={`p-2.5 rounded-xl border transition-all active:scale-95 flex items-center justify-center ${
              isPlayingAdhanPreview
                ? 'bg-amber-400 text-[#123E33] border-amber-300 shadow-md animate-pulse'
                : 'bg-white/10 hover:bg-white/20 border-white/15 text-emerald-100 hover:text-white'
            }`}
            title="استماع لتنبيه الأذان"
            aria-label="تنبيه الأذان"
          >
            {isPlayingAdhanPreview ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
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
          <span className="text-xs font-bold text-emerald-100">صلوات اليوم</span>
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

      {/* Bottom Link to Tracker Screen */}
      {onNavigateToTracker && (
        <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between relative z-10">
          <button
            onClick={onNavigateToTracker}
            className="text-xs text-amber-200 hover:text-white flex items-center gap-1 font-semibold group transition-all"
          >
            <span>متابعة أداء الصلوات في شجرة العبادات</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => handleRequestGps(true)}
            disabled={isRefreshingLocation}
            className="text-xs text-emerald-200 hover:text-white flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-all active:scale-95 disabled:opacity-50"
            title="تحديث الإحداثيات الجغرافية فوراً"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshingLocation ? 'animate-spin text-amber-300' : ''}`} />
            <span>تحديث GPS</span>
          </button>
        </div>
      )}

      {/* Location Picker & GPS Modal */}
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
                  <span>تحديد الموقع الجغرافي</span>
                  <MapPin className="w-4 h-4" />
                </h3>
                <p className="text-xs text-[#6F786E] dark:text-[#8E9B93]">لحساب دقيق لمواقيت الصلوات الخمس</p>
              </div>
            </div>

            {/* GPS Auto Button */}
            <div className="mt-4">
              <button
                onClick={() => handleRequestGps(true)}
                disabled={isRefreshingLocation}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#0F6B50] to-[#168064] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60"
              >
                <Navigation className={`w-4 h-4 ${isRefreshingLocation ? 'animate-spin' : ''}`} />
                <span>
                  {isRefreshingLocation ? 'جارٍ تحديد الموقع عبر الأقمار الصناعية...' : 'استخدام موقعي الحالي عبر GPS تلقائياً'}
                </span>
              </button>

              {locationError && (
                <div className="mt-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 text-xs text-right">
                  {locationError}
                </div>
              )}
            </div>

            {/* City Search Field */}
            <div className="mt-4">
              <label className="block text-xs font-bold text-[#6F786E] dark:text-[#8E9B93] text-right mb-1.5">
                أو اختر مدينتك من القائمة السريعة:
              </label>
              <input
                type="text"
                value={searchCityQuery}
                onChange={(e) => setSearchCityQuery(e.target.value)}
                placeholder="ابحث عن مدينة (مثل: الرياض، القاهرة، دبي...)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E2D27] border border-[#D5E5DE] dark:border-[#2C4138] text-sm text-right focus:outline-none focus:border-[#0F6B50] dark:focus:border-[#2DD4BF]"
              />
            </div>

            {/* Cities List */}
            <div className="mt-3 flex-1 overflow-y-auto max-h-60 space-y-1.5 pr-1">
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

            {/* Close Button */}
            <div className="mt-4 pt-3 border-t border-[#E5DDCF] dark:border-[#2A3C34]">
              <button
                onClick={() => setShowLocationPicker(false)}
                className="w-full py-2.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 font-semibold text-xs transition-all"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

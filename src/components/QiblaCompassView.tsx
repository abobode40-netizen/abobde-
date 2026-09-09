import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Compass, 
  MapPin, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  RotateCw, 
  HelpCircle, 
  ChevronLeft, 
  ArrowRight,
  Info,
  Sliders,
  Locate,
  Search,
  X,
  ShieldCheck
} from 'lucide-react';
import { 
  UserLocation, 
  POPULAR_CITIES, 
  loadSavedLocation, 
  saveLocation, 
  requestDeviceLocation 
} from '../utils/prayerTimes';
import { 
  calculateQiblaBearing, 
  calculateDistanceToKaaba, 
  getBearingCardinalArabic, 
  calculateAngleDifference,
  requestOrientationPermission,
  KAABA_COORDS
} from '../utils/qibla';
import { toArabicNumerals } from '../data/quranData';
import { triggerHaptic, playChime } from '../utils/audio';

interface QiblaCompassViewProps {
  onBackToHome: () => void;
}

export const QiblaCompassView: React.FC<QiblaCompassViewProps> = ({ onBackToHome }) => {
  const [location, setLocation] = useState<UserLocation>(() => loadSavedLocation());
  const [heading, setHeading] = useState<number>(0);
  const [manualHeading, setManualHeading] = useState<number | null>(null);
  const [isSensorActive, setIsSensorActive] = useState<boolean>(false);
  const [sensorPermissionNeeded, setSensorPermissionNeeded] = useState<boolean>(false);
  const [sensorError, setSensorError] = useState<string | null>(null);
  const [isRefreshingGps, setIsRefreshingGps] = useState<boolean>(false);
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [searchCityQuery, setSearchCityQuery] = useState<string>('');
  const [showEtiquetteModal, setShowEtiquetteModal] = useState<boolean>(false);
  const [showCalibrationHelp, setShowCalibrationHelp] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAlignedState, setIsAlignedState] = useState<boolean>(false);

  const lastHapticTime = useRef<number>(0);
  const prevHeadingRef = useRef<number>(0);
  const compassDialRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Compute Qibla angle and distance
  const qiblaBearing = calculateQiblaBearing(location.latitude, location.longitude);
  const distanceToKaaba = calculateDistanceToKaaba(location.latitude, location.longitude);
  const cardinalText = getBearingCardinalArabic(qiblaBearing);

  // Current effective heading (sensor or manual)
  const currentEffectiveHeading = manualHeading !== null ? manualHeading : heading;
  const angleDiff = calculateAngleDifference(currentEffectiveHeading, qiblaBearing);
  const isAligned = Math.abs(angleDiff) <= 3.5;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handle alignment haptics & audio cues
  useEffect(() => {
    if (isAligned && !isAlignedState) {
      setIsAlignedState(true);
      const now = Date.now();
      if (now - lastHapticTime.current > 2000) {
        lastHapticTime.current = now;
        triggerHaptic('medium');
        playChime('bell');
      }
    } else if (!isAligned && isAlignedState) {
      setIsAlignedState(false);
    }
  }, [isAligned, isAlignedState]);

  // Orientation event listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check iOS permission requirements
    if (
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
        .requestPermission === 'function'
    ) {
      setSensorPermissionNeeded(true);
    }

    const handleOrientation = (e: DeviceOrientationEvent) => {
      let rawHeading: number | null = null;

      // iOS Safari webkitCompassHeading (relative to magnetic/true north)
      const webkitHeading = (e as unknown as { webkitCompassHeading?: number }).webkitCompassHeading;
      if (typeof webkitHeading === 'number' && !isNaN(webkitHeading)) {
        rawHeading = webkitHeading;
      } else if (e.alpha !== null && typeof e.alpha === 'number') {
        // Android / Chrome: alpha is rotation around z-axis
        if ((e as unknown as { absolute?: boolean }).absolute) {
          rawHeading = (360 - e.alpha) % 360;
        } else {
          rawHeading = (360 - e.alpha) % 360;
        }
      }

      if (rawHeading !== null) {
        setIsSensorActive(true);
        setSensorError(null);
        setSensorPermissionNeeded(false);

        // Circular smooth angle interpolation
        let diff = rawHeading - prevHeadingRef.current;
        while (diff < -180) diff += 360;
        while (diff > 180) diff -= 360;
        const smoothed = (prevHeadingRef.current + diff * 0.35 + 360) % 360;
        prevHeadingRef.current = smoothed;
        setHeading(Math.round(smoothed * 10) / 10);
      }
    };

    const win = window as unknown as Window & {
      ondeviceorientationabsolute?: unknown;
      ondeviceorientation?: unknown;
    };

    // Try absolute first on modern Android/Chrome, then standard deviceorientation
    if ('ondeviceorientationabsolute' in win) {
      window.addEventListener('deviceorientationabsolute' as unknown as keyof WindowEventMap, handleOrientation as EventListener, true);
    } else if ('ondeviceorientation' in win) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    } else {
      setSensorError('المتصفح أو الجهاز الحالي لا يوفر مستشعر الجيروسكوب، يمكنك تدوير البوصلة يدوياً.');
    }

    return () => {
      if ('ondeviceorientationabsolute' in win) {
        window.removeEventListener('deviceorientationabsolute' as unknown as keyof WindowEventMap, handleOrientation as EventListener, true);
      }
      if ('ondeviceorientation' in win) {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, []);

  const handleRequestPermission = async () => {
    triggerHaptic('medium');
    playChime('click');
    const granted = await requestOrientationPermission();
    if (granted) {
      setSensorPermissionNeeded(false);
      setSensorError(null);
      showToast('تم تفعيل مستشعر البوصلة والجيروسكوب بنجاح 🧭');
    } else {
      setSensorError('تم رفض إذن مستشعر الحركة. يمكنك استخدام التدوير اليدوي.');
      showToast('لم يتم منح إذن المستشعر، يمكنك استخدام البوصلة التفاعلية يدوياً');
    }
  };

  const handleRefreshGps = async () => {
    triggerHaptic('medium');
    playChime('click');
    setIsRefreshingGps(true);
    try {
      const newLoc = await requestDeviceLocation();
      setLocation(newLoc);
      showToast(`تم تحديد موقعك بدقة: ${newLoc.cityName} 📍`);
    } catch {
      showToast('تعذر جلب موقع GPS. يرجى التأكد من تشغيل الموقع الجغرافي');
    } finally {
      setIsRefreshingGps(false);
    }
  };

  const handleSelectCity = (city: UserLocation) => {
    triggerHaptic('selection');
    playChime('click');
    setLocation(city);
    saveLocation(city);
    setShowLocationModal(false);
    showToast(`تم تغيير الموقع إلى: ${city.cityName}`);
  };

  // Interactive Drag & Rotate Support
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!compassDialRef.current) return;
    const rect = compassDialRef.current.getBoundingClientRect();
    dragCenterRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragCenterRef.current.x;
    const dy = e.clientY - dragCenterRef.current.y;
    // Calculate angle from 12 o'clock (top) clockwise
    let rad = Math.atan2(dy, dx) + Math.PI / 2;
    let deg = (rad * 180) / Math.PI;
    deg = (deg + 360) % 360;
    setManualHeading(Math.round(deg));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    }
  };

  const handleResetToSensor = () => {
    triggerHaptic('light');
    playChime('click');
    setManualHeading(null);
    showToast('تمت العودة للمستشعر التلقائي');
  };

  const handleStepManualAngle = (delta: number) => {
    triggerHaptic('light');
    playChime('click');
    const base = manualHeading !== null ? manualHeading : heading;
    const next = (base + delta + 360) % 360;
    setManualHeading(Math.round(next));
  };

  // Filter preset cities
  const filteredCities = POPULAR_CITIES.filter(
    (c) =>
      c.cityName.includes(searchCityQuery) ||
      (c.countryName && c.countryName.includes(searchCityQuery))
  );

  return (
    <div className="space-y-4 pb-28 pt-2 px-3.5 max-w-lg mx-auto select-none font-cairo">
      {/* Toast message notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900/95 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-white/20 backdrop-blur-md animate-fadeIn flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-[#0E4D3C] via-[#12644F] to-[#0D4435] text-white shadow-lg relative overflow-hidden">
        {/* Subtle background Islamic decorative pattern */}
        <div className="absolute -left-10 -bottom-10 w-44 h-44 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-amber-400/10 blur-xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <button
            onClick={() => {
              triggerHaptic('light');
              playChime('click');
              onBackToHome();
            }}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95"
            title="العودة للرئيسية"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>الرئيسية</span>
          </button>

          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-base font-extrabold tracking-wide">بوصلة القبلة المشرفة</span>
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300">
                <Compass className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[11px] text-emerald-100/90 mt-0.5 font-medium">
              تحديد دقيق لاتجاه الكعبة المشرفة بمستشعر الجيروسكوب
            </p>
          </div>
        </div>

        {/* Location selector strip */}
        <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-xs relative z-10">
          <button
            onClick={handleRefreshGps}
            disabled={isRefreshingGps}
            className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all flex items-center gap-1.5 active:scale-95 text-[11px] font-bold"
            title="تحديث الموقع عبر GPS"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingGps ? 'animate-spin text-amber-300' : ''}`} />
            <span>{isRefreshingGps ? 'جاري التحديد...' : 'موقعي GPS'}</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('selection');
              playChime('click');
              setShowLocationModal(true);
            }}
            className="flex items-center gap-1.5 text-emerald-100 hover:text-white font-bold transition-colors"
          >
            <span className="underline decoration-emerald-400/50 underline-offset-4">
              {location.cityName} {location.countryName ? `(${location.countryName})` : ''}
            </span>
            <MapPin className="w-3.5 h-3.5 text-amber-300" />
          </button>
        </div>
      </div>

      {/* iOS / Permission Banner if needed */}
      {sensorPermissionNeeded && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3 animate-fadeIn">
          <div className="text-right">
            <p className="text-xs font-bold">مطلوب إذن مستشعر البوصلة (iOS)</p>
            <p className="text-[11px] opacity-80">اضغط لتفعيل مستشعر الحركة لتوجيه البوصلة بدقة</p>
          </div>
          <button
            onClick={handleRequestPermission}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow transition-all active:scale-95 shrink-0"
          >
            تفعيل المستشعر 🧭
          </button>
        </div>
      )}

      {/* Manual mode indicator banner */}
      {manualHeading !== null && (
        <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[#0F6B50] dark:text-[#2DD4BF] flex items-center justify-between gap-2 text-xs">
          <button
            onClick={handleResetToSensor}
            className="px-2.5 py-1 rounded-xl bg-[#0F6B50] text-white text-[11px] font-bold hover:bg-[#0c5741] transition-all"
          >
            العودة للمستشعر التلقائي
          </button>
          <span className="font-semibold text-[11px]">أنت في وضع التدوير اليدوي للبوصلة</span>
        </div>
      )}

      {/* Main Interactive Compass Dial Card */}
      <div 
        className={`p-6 rounded-3xl border transition-all duration-500 relative flex flex-col items-center justify-center min-h-[380px] shadow-sm overflow-hidden ${
          isAligned
            ? 'bg-gradient-to-b from-emerald-500/20 via-[#0F6B50]/15 to-emerald-900/20 border-emerald-500/60 shadow-emerald-500/20 shadow-xl dark:border-emerald-400/70'
            : 'bg-white dark:bg-[#16231E] border-[#E5DDCF] dark:border-[#283C33]'
        }`}
      >
        {/* Alignment Glow Aura */}
        {isAligned && (
          <div className="absolute inset-0 bg-radial from-emerald-400/20 via-transparent to-transparent pointer-events-none animate-pulse" />
        )}

        {/* Alignment Status Banner */}
        <div className="w-full text-center mb-4 relative z-10">
          {isAligned ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-lg animate-bounce">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>أنت تتجه نحو الكعبة المشرفة الآن 🕋 ✨</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs">
              {angleDiff > 0 ? (
                <>
                  <span>أدر الجهاز يميناً بمقدار {toArabicNumerals(Math.abs(Math.round(angleDiff)))}°</span>
                  <RotateCw className="w-3.5 h-3.5 text-amber-500" />
                </>
              ) : (
                <>
                  <span>أدر الجهاز يساراً بمقدار {toArabicNumerals(Math.abs(Math.round(angleDiff)))}°</span>
                  <RotateCw className="w-3.5 h-3.5 text-amber-500 -scale-x-100" />
                </>
              )}
            </div>
          )}
        </div>

        {/* The Compass Stage */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          {/* Outer Ring with Static Top Alignment Marker */}
          <div className="absolute top-0 z-30 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-amber-500 shadow-md" />
            <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 mt-0.5">مقدمة الهاتف</span>
          </div>

          {/* Rotating Compass Dial Container */}
          <div
            ref={compassDialRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="w-full h-full rounded-full relative cursor-grab active:cursor-grabbing touch-none transition-transform duration-100 ease-out"
            style={{
              transform: `rotate(${-currentEffectiveHeading}deg)`,
              transformOrigin: 'center center'
            }}
          >
            {/* Outer Dial Circle with Degree Rings */}
            <div className="absolute inset-0 rounded-full border-4 border-[#0F6B50]/30 dark:border-emerald-500/30 bg-gradient-to-b from-gray-50/90 to-emerald-50/30 dark:from-[#1A2A24] dark:to-[#121E1A] shadow-inner flex items-center justify-center">
              {/* Dial Tick marks (every 30 degrees) */}
              {[...Array(12)].map((_, i) => {
                const deg = i * 30;
                const isCardinal = deg % 90 === 0;
                return (
                  <div
                    key={deg}
                    className="absolute inset-0 flex justify-center items-start pointer-events-none"
                    style={{ transform: `rotate(${deg}deg)` }}
                  >
                    <div
                      className={`w-0.5 rounded-full ${
                        isCardinal
                          ? 'h-3.5 bg-[#0F6B50] dark:bg-emerald-400 font-bold'
                          : 'h-2 bg-gray-400/60 dark:bg-gray-600'
                      }`}
                    />
                  </div>
                );
              })}

              {/* Cardinal Labels on Dial (N, E, S, W) */}
              <div className="absolute top-4 font-black text-rose-600 text-xs sm:text-sm">ش (N)</div>
              <div className="absolute right-4 font-bold text-gray-700 dark:text-gray-300 text-xs">ق (E)</div>
              <div className="absolute bottom-4 font-bold text-gray-700 dark:text-gray-300 text-xs">ج (S)</div>
              <div className="absolute left-4 font-bold text-gray-700 dark:text-gray-300 text-xs">غ (W)</div>

              {/* Kaaba Direction Pin & Indicator on Dial */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-start pointer-events-none z-20"
                style={{
                  transform: `rotate(${qiblaBearing}deg)`,
                  transformOrigin: 'center center'
                }}
              >
                {/* Kaaba Icon at Dial Perimeter */}
                <div className="mt-1 flex flex-col items-center animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-amber-400/50 font-bold text-base">
                    🕋
                  </div>
                  <div className="w-1 h-14 bg-gradient-to-b from-amber-400 via-amber-400/80 to-transparent rounded-full shadow" />
                </div>
              </div>

              {/* Compass Needle (North / South) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="relative w-4 h-40 flex flex-col items-center justify-between">
                  {/* North Needle (Red) */}
                  <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[65px] border-b-rose-600 drop-shadow-md" />
                  {/* Center Pivot Pin */}
                  <div className="w-6 h-6 rounded-full bg-[#133028] border-2 border-amber-400 shadow-md z-30 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  {/* South Needle (Silver/Gray) */}
                  <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[65px] border-t-gray-400 dark:border-t-gray-600 drop-shadow-md" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Angle Display & Manual Adjustment Controls */}
        <div className="mt-5 text-center space-y-2 relative z-10 w-full max-w-xs">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => handleStepManualAngle(-5)}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold transition-all active:scale-95"
              title="تدوير البوصلة 5 درجات يساراً"
            >
              -٥°
            </button>

            <div className="text-center px-3 py-1 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 min-w-[120px]">
              <div className="text-xl font-black text-[#0F6B50] dark:text-[#2DD4BF] font-mono">
                {toArabicNumerals(Math.round(currentEffectiveHeading))}°
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">
                {getBearingCardinalArabic(currentEffectiveHeading)}
              </div>
            </div>

            <button
              onClick={() => handleStepManualAngle(5)}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold transition-all active:scale-95"
              title="تدوير البوصلة 5 درجات يميناً"
            >
              +٥°
            </button>
          </div>

          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            {isSensorActive
              ? 'المستشعر يعمل تلقائياً مع حركة الهاتف (أو اسحب القرص للتدوير)'
              : 'يمكنك لمس وتدوير القرص يدوياً لتوجيه البوصلة بدقة'}
          </p>
        </div>
      </div>

      {/* Metrics & Calculations Card */}
      <div className="grid grid-cols-2 gap-3">
        {/* Metric 1: Qibla Bearing Angle */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#16231E] border border-[#E5DDCF] dark:border-[#283C33] text-right space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-semibold">
            <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>زاوية القبلة الدقيقة</span>
          </div>
          <p className="text-xl font-black text-[#143128] dark:text-white font-mono">
            {toArabicNumerals(qiblaBearing)}°
          </p>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold block">
            {cardinalText}
          </span>
        </div>

        {/* Metric 2: Distance to Kaaba */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#16231E] border border-[#E5DDCF] dark:border-[#283C33] text-right space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-semibold">
            <span className="text-base">🕋</span>
            <span>المسافة إلى الكعبة</span>
          </div>
          <p className="text-xl font-black text-[#143128] dark:text-white font-mono">
            {toArabicNumerals(distanceToKaaba.toLocaleString('ar-EG'))}
          </p>
          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-bold block">
            كيلومتر (خط مستقيم)
          </span>
        </div>
      </div>

      {/* Action Buttons: Etiquettes & Calibration Tips */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => {
            triggerHaptic('light');
            playChime('click');
            setShowCalibrationHelp(true);
          }}
          className="p-3 rounded-2xl bg-white dark:bg-[#16231E] border border-[#E5DDCF] dark:border-[#283C33] hover:border-amber-400 text-right flex items-center justify-between transition-all active:scale-98 shadow-sm group"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center">
            <RotateCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          </div>
          <div className="text-right">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">معايرة الهاتف</h4>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">حركة رقم 8 لدقة المغناطيس</p>
          </div>
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            playChime('click');
            setShowEtiquetteModal(true);
          }}
          className="p-3 rounded-2xl bg-white dark:bg-[#16231E] border border-[#E5DDCF] dark:border-[#283C33] hover:border-emerald-500 text-right flex items-center justify-between transition-all active:scale-98 shadow-sm group"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#0F6B50] dark:text-[#2DD4BF] flex items-center justify-center">
            <Info className="w-4 h-4" />
          </div>
          <div className="text-right">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">سنن استقبال القبلة</h4>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">في الصلاة والدعاء والذكر</p>
          </div>
        </button>
      </div>

      {/* Calibration Guidance Modal */}
      {showCalibrationHelp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-[#15231D] rounded-3xl p-5 border border-[#E5DDCF] dark:border-[#2A3C34] shadow-2xl space-y-4 animate-scaleUp text-right">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <button
                onClick={() => setShowCalibrationHelp(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-sm font-bold text-[#143128] dark:text-white flex items-center gap-1.5">
                <span>إرشادات معايرة بوصلة الهاتف</span>
                <RotateCw className="w-4 h-4 text-amber-500" />
              </h3>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-center">
                <div className="text-3xl mb-1">♾️</div>
                <p className="font-bold text-amber-900 dark:text-amber-200 text-xs">
                  حرك الهاتف في الهواء على شكل الرقم (8) بالإنجليزي
                </p>
              </div>

              <ul className="space-y-2 text-right list-disc list-inside">
                <li>
                  <span className="font-bold text-gray-800 dark:text-gray-100">الابتعاد عن المعادن:</span> تأكد من الابتعاد عن الأجهزة الإلكترونية الكبيرة، البطاريات، والأغطية المغناطيسية للهاتف.
                </li>
                <li>
                  <span className="font-bold text-gray-800 dark:text-gray-100">الوضع الأفقي:</span> احرص على إمساك الهاتف بشكل مستوٍ وأفقي موازي لسطح الأرض للحصول على أدق قراءة.
                </li>
                <li>
                  <span className="font-bold text-gray-800 dark:text-gray-100">تحديث GPS:</span> اضغط على زر "موقعي GPS" عند السفر أو الانتقال لمدينة جديدة لحساب الزاوية الجغرافية الدقيقة.
                </li>
              </ul>
            </div>

            <button
              onClick={() => setShowCalibrationHelp(false)}
              className="w-full py-2.5 rounded-2xl bg-[#0F6B50] hover:bg-[#0c5741] text-white font-bold text-xs shadow transition-all active:scale-95"
            >
              فهمت ذلك، شكراً
            </button>
          </div>
        </div>
      )}

      {/* Sunnah & Etiquette Modal */}
      {showEtiquetteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-[#15231D] rounded-3xl p-5 border border-[#E5DDCF] dark:border-[#2A3C34] shadow-2xl space-y-4 animate-scaleUp text-right max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <button
                onClick={() => setShowEtiquetteModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-sm font-bold text-[#143128] dark:text-white flex items-center gap-1.5">
                <span>سنن وآداب استقبال القبلة</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </h3>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-center">
                <p className="font-amiri text-sm font-bold text-[#0F6B50] dark:text-[#2DD4BF]">
                  «فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ ۚ وَحَيْثُ مَا كُنتُمْ فَوَلُّوا وُجُوهَكُمْ شَطْرَهُ»
                </p>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 block mt-1">سورة البقرة: ١٤٤</span>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-gray-900 dark:text-white">مواضع يستحب فيها استقبال القبلة:</h4>
                <ul className="space-y-1.5 list-disc list-inside text-[11px]">
                  <li><strong className="text-gray-800 dark:text-gray-100">الصلاة المفروضة والنافلة:</strong> استقبال عين الكعبة للقريب، واستقبال جهتها للبعيد شرط لصحة الصلاة.</li>
                  <li><strong className="text-gray-800 dark:text-gray-100">الدعاء والتضرع:</strong> كان النبي ﷺ يستقبل القبلة إذا اجتهد في الدعاء كما في يوم عرفة والاستسقاء.</li>
                  <li><strong className="text-gray-800 dark:text-gray-100">قراءة القرآن والأذكار:</strong> يستحب للقارئ والذاكر أن يجلس مستقبلاً القبلة بخشوع ووقار.</li>
                  <li><strong className="text-gray-800 dark:text-gray-100">الأذان والإقامة:</strong> من سنن المؤذن استقبال القبلة عند النداء للصلاة.</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowEtiquetteModal(false)}
              className="w-full py-2.5 rounded-2xl bg-[#0F6B50] hover:bg-[#0c5741] text-white font-bold text-xs shadow transition-all active:scale-95"
            >
              جزاكم الله خيراً
            </button>
          </div>
        </div>
      )}

      {/* Location Picker Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#15231D] rounded-t-3xl sm:rounded-3xl p-5 border border-[#E5DDCF] dark:border-[#2A3C34] shadow-2xl space-y-4 max-h-[80vh] flex flex-col text-right animate-slideUp">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <button
                onClick={() => setShowLocationModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-sm font-bold text-[#143128] dark:text-white flex items-center gap-1.5">
                <span>تحديد موقعك الجغرافي</span>
                <MapPin className="w-4 h-4 text-[#0F6B50] dark:text-[#2DD4BF]" />
              </h3>
            </div>

            {/* GPS 1-Click Button */}
            <button
              onClick={() => {
                handleRefreshGps();
                setShowLocationModal(false);
              }}
              className="w-full py-2.5 px-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-[#0F6B50] dark:text-[#2DD4BF] font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all active:scale-98"
            >
              <Locate className="w-4 h-4 text-emerald-600" />
              <span>تحديد موقعي التلقائي عبر الـ GPS</span>
            </button>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchCityQuery}
                onChange={(e) => setSearchCityQuery(e.target.value)}
                placeholder="ابحث عن مدينتك أو دولتك..."
                className="w-full pl-3 pr-9 py-2 rounded-2xl bg-gray-50 dark:bg-[#1B2C24] border border-gray-200 dark:border-[#2A3C34] text-xs focus:outline-none focus:ring-2 focus:ring-[#0F6B50] text-gray-900 dark:text-white placeholder-gray-400 text-right"
              />
            </div>

            {/* Cities List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-60">
              {filteredCities.map((city, idx) => {
                const isCurrent =
                  Math.abs(city.latitude - location.latitude) < 0.05 &&
                  Math.abs(city.longitude - location.longitude) < 0.05;
                const cityQibla = calculateQiblaBearing(city.latitude, city.longitude);

                return (
                  <button
                    key={`${city.cityName}-${idx}`}
                    onClick={() => handleSelectCity(city)}
                    className={`w-full p-2.5 rounded-2xl border text-right flex items-center justify-between transition-all text-xs active:scale-98 ${
                      isCurrent
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-[#0F6B50] dark:border-[#2DD4BF] text-[#0F6B50] dark:text-[#2DD4BF] font-bold'
                        : 'bg-white dark:bg-[#16231E] border-gray-100 dark:border-[#253930] hover:border-gray-300 dark:hover:border-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                      <span>{toArabicNumerals(cityQibla)}°</span>
                      <Compass className="w-3 h-3 text-amber-500" />
                    </div>

                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-bold text-xs">{city.cityName}</p>
                        {city.countryName && (
                          <span className="text-[10px] text-gray-400 dark:text-gray-500">
                            {city.countryName}
                          </span>
                        )}
                      </div>
                      {isCurrent && <CheckCircle2 className="w-4 h-4 text-[#0F6B50] dark:text-[#2DD4BF]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

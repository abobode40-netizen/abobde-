/**
 * Jannat Al-Rahman - Prayer Times & Geolocation Engine
 * Accurate astronomical calculations with Umm Al-Qura / MWL standards,
 * live geolocation detection, reverse geocoding, and offline caching.
 */

export interface PrayerTimeItem {
  id: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'midnight' | 'lastThird';
  name: string;
  englishName: string;
  time: string; // e.g. "04:32"
  formattedTime: string; // e.g. "04:32 ص"
  dateObj: Date;
  isPassed: boolean;
  isNext: boolean;
  isCurrent: boolean;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  cityName: string;
  countryName?: string;
  timezone?: string; // e.g. 'Africa/Cairo'
  isGps: boolean;
  timestamp?: number;
}

export type PrayerCalcMethod = 'egypt' | 'makkah' | 'mwl' | 'isna';

export interface PrayerMethodOption {
  id: PrayerCalcMethod;
  name: string;
  shortName: string;
  country: string;
  description: string;
  fajrAngle: number;
  ishaAngle: number | string;
  asrMadhhab?: string;
  ishaMadhhab?: string;
  badge: string;
}

export const PRAYER_CALC_METHODS: PrayerMethodOption[] = [
  {
    id: 'egypt',
    name: 'الهيئة المصرية العامة للمساحة (المعتمد في مصر)',
    shortName: 'المساحة المصرية (القاهرة)',
    country: 'جمهورية مصر العربية 🇪🇬',
    description: 'الفجر ١٩.٥° | العصر: المذهب الشافعي (ظل الشيء مثله + الزوال) | العشاء: المذهب الحنفي (١٧.٥° غياب الشفق) - بالتعاون مع دار الإفتاء المصرية ووزارة الأوقاف',
    fajrAngle: 19.5,
    ishaAngle: 17.5,
    asrMadhhab: 'المذهب الشافعي (ظل كل شيء مثله + ظل الزوال)',
    ishaMadhhab: 'المذهب الحنفي (انخفاض ١٧.٥° عند غياب الشفق)',
    badge: 'المعتمد في مصر 🇪🇬'
  },
  {
    id: 'makkah',
    name: 'تقويم أم القرى (مكة المكرمة)',
    shortName: 'أم القرى (مكة المكرمة)',
    country: 'السعودية',
    description: 'الفجر ١٨.٥°، العشاء ٩٠ دقيقة بعد المغرب - المعتمد رسمياً في المملكة العربية السعودية',
    fajrAngle: 18.5,
    ishaAngle: '٩٠ دقيقة بعد المغرب',
    asrMadhhab: 'المذهب الشافعي/الحنبلي',
    badge: 'المملكة العربية السعودية'
  },
  {
    id: 'mwl',
    name: 'رابطة العالم الإسلامي (MWL)',
    shortName: 'رابطة العالم الإسلامي',
    country: 'دولي',
    description: 'الفجر ١٨.٠°، العشاء ١٧.٠° - معتمد في أوروبا والشرق الأقصى وأجزاء واسعة من العالم',
    fajrAngle: 18.0,
    ishaAngle: 17.0,
    asrMadhhab: 'المذهب الشافعي (الجمهور)',
    badge: 'معتمد عالمياً'
  },
  {
    id: 'isna',
    name: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)',
    shortName: 'أمريكا الشمالية (ISNA)',
    country: 'أمريكا الشمالية',
    description: 'الفجر ١٥.٠°، العشاء ١٥.٠° - المعتمد في الولايات المتحدة وكندا',
    fajrAngle: 15.0,
    ishaAngle: 15.0,
    asrMadhhab: 'المذهب الشافعي (الجمهور)',
    badge: 'أمريكا وكندا'
  }
];

export interface NextPrayerInfo {
  nextPrayer: PrayerTimeItem;
  currentPrayer: PrayerTimeItem;
  remainingMs: number;
  remainingHours: number;
  remainingMinutes: number;
  remainingSeconds: number;
  remainingFormatted: string; // e.g. "01:45:30"
  remainingHumanArabic: string; // e.g. "ساعة و ٤٥ دقيقة"
  progressPercent: number; // 0 to 100% of duration between current and next prayer
  allPrayers: PrayerTimeItem[];
  location: UserLocation;
  method: PrayerCalcMethod;
  methodName: string;
}

// Popular Islamic & Arab World Cities as instant presets
export const CAIRO_LOCATION: UserLocation = {
  cityName: 'القاهرة',
  countryName: 'مصر',
  latitude: 30.0444,
  longitude: 31.2357,
  timezone: 'Africa/Cairo',
  isGps: false
};

export const POPULAR_CITIES: UserLocation[] = [
  // مدن جمهورية مصر العربية
  CAIRO_LOCATION,
  { cityName: 'الإسكندرية', countryName: 'مصر', latitude: 31.2001, longitude: 29.9187, timezone: 'Africa/Cairo', isGps: false },
  { cityName: 'الجيزة', countryName: 'مصر', latitude: 30.0131, longitude: 31.2089, timezone: 'Africa/Cairo', isGps: false },
  { cityName: 'المنصورة', countryName: 'مصر', latitude: 31.0409, longitude: 31.3785, timezone: 'Africa/Cairo', isGps: false },
  { cityName: 'طنطا', countryName: 'مصر', latitude: 30.7865, longitude: 31.0004, timezone: 'Africa/Cairo', isGps: false },
  { cityName: 'بورسعيد', countryName: 'مصر', latitude: 31.2653, longitude: 32.3019, timezone: 'Africa/Cairo', isGps: false },
  { cityName: 'السويس', countryName: 'مصر', latitude: 29.9668, longitude: 32.5498, timezone: 'Africa/Cairo', isGps: false },
  { cityName: 'الإسماعيلية', countryName: 'مصر', latitude: 30.5965, longitude: 32.2715, timezone: 'Africa/Cairo', isGps: false },
  { cityName: 'أسوان', countryName: 'مصر', latitude: 24.0889, longitude: 32.8998, timezone: 'Africa/Cairo', isGps: false },
  { cityName: 'الأقصر', countryName: 'مصر', latitude: 25.6872, longitude: 32.6396, timezone: 'Africa/Cairo', isGps: false },

  // الحرمان الشريفان والمملكة العربية السعودية
  { cityName: 'مكة المكرمة', countryName: 'السعودية', latitude: 21.4225, longitude: 39.8262, timezone: 'Asia/Riyadh', isGps: false },
  { cityName: 'المدينة المنورة', countryName: 'السعودية', latitude: 24.4672, longitude: 39.6111, timezone: 'Asia/Riyadh', isGps: false },
  { cityName: 'الرياض', countryName: 'السعودية', latitude: 24.7136, longitude: 46.6753, timezone: 'Asia/Riyadh', isGps: false },
  { cityName: 'جدة', countryName: 'السعودية', latitude: 21.5433, longitude: 39.1728, timezone: 'Asia/Riyadh', isGps: false },

  // القدس الشريف وعواصم العالم العربي والإسلامي
  { cityName: 'القدس الشريف', countryName: 'فلسطين', latitude: 31.7683, longitude: 35.2137, timezone: 'Asia/Jerusalem', isGps: false },
  { cityName: 'دبي', countryName: 'الإمارات', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai', isGps: false },
  { cityName: 'أبوظبي', countryName: 'الإمارات', latitude: 24.4539, longitude: 54.3773, timezone: 'Asia/Dubai', isGps: false },
  { cityName: 'الكويت', countryName: 'الكويت', latitude: 29.3759, longitude: 47.9774, timezone: 'Asia/Kuwait', isGps: false },
  { cityName: 'الدوحة', countryName: 'قطر', latitude: 25.2854, longitude: 51.5310, timezone: 'Asia/Qatar', isGps: false },
  { cityName: 'المنامة', countryName: 'البحرين', latitude: 26.2285, longitude: 50.5860, timezone: 'Asia/Bahrain', isGps: false },
  { cityName: 'مسقط', countryName: 'عُمان', latitude: 23.5880, longitude: 58.3829, timezone: 'Asia/Muscat', isGps: false },
  { cityName: 'عمّان', countryName: 'الأردن', latitude: 31.9454, longitude: 35.9284, timezone: 'Asia/Amman', isGps: false },
  { cityName: 'بغداد', countryName: 'العراق', latitude: 33.3152, longitude: 44.3661, timezone: 'Asia/Baghdad', isGps: false },
  { cityName: 'دمشق', countryName: 'سوريا', latitude: 33.5138, longitude: 36.2765, timezone: 'Asia/Damascus', isGps: false },
  { cityName: 'بيروت', countryName: 'لبنان', latitude: 33.8938, longitude: 35.5018, timezone: 'Asia/Beirut', isGps: false },
  { cityName: 'الجزائر', countryName: 'الجزائر', latitude: 36.7538, longitude: 3.0588, timezone: 'Africa/Algiers', isGps: false },
  { cityName: 'الرباط', countryName: 'المغرب', latitude: 34.0209, longitude: -6.8416, timezone: 'Africa/Casablanca', isGps: false },
  { cityName: 'تونس', countryName: 'تونس', latitude: 36.8065, longitude: 10.1815, timezone: 'Africa/Tunis', isGps: false },
  { cityName: 'طرابلس', countryName: 'ليبيا', latitude: 32.8872, longitude: 13.1913, timezone: 'Africa/Tripoli', isGps: false },
  { cityName: 'الخرطوم', countryName: 'السودان', latitude: 15.5007, longitude: 32.5599, timezone: 'Africa/Khartoum', isGps: false },
  { cityName: 'إسطنبول', countryName: 'تركيا', latitude: 41.0082, longitude: 28.9784, timezone: 'Europe/Istanbul', isGps: false },
  { cityName: 'لندن', countryName: 'المملكة المتحدة', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London', isGps: false },
  { cityName: 'نيويورك', countryName: 'الولايات المتحدة', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York', isGps: false },
  { cityName: 'كوالالمبور', countryName: 'ماليزيا', latitude: 3.1390, longitude: 101.6869, timezone: 'Asia/Kuala_Lumpur', isGps: false },
  { cityName: 'جاكرتا', countryName: 'إندونيسيا', latitude: -6.2088, longitude: 106.8456, timezone: 'Asia/Jakarta', isGps: false }
];

export const DEFAULT_LOCATION: UserLocation = CAIRO_LOCATION; // القاهرة - مصر كإعداد افتراضي مثبت

const LOCATION_STORAGE_KEY = 'jannat_user_location_v1';
const PRAYER_CALC_METHOD_KEY = 'jannat_prayer_calc_method_v1';
const PRAYER_OFFSETS_KEY = 'jannat_prayer_minute_offsets_v1';
export const PRAYER_SETTINGS_CHANGE_EVENT = 'jannat_prayer_settings_updated';

export interface PrayerMinuteOffsets {
  fajr: number;
  sunrise: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

export const DEFAULT_PRAYER_OFFSETS: PrayerMinuteOffsets = {
  fajr: 0,
  sunrise: 0,
  dhuhr: 0,
  asr: 0,
  maghrib: 0,
  isha: 0
};

export function notifyPrayerSettingsChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PRAYER_SETTINGS_CHANGE_EVENT));
  }
}

// Math Helpers for Astronomical Solar Position
const degToRad = (d: number) => (d * Math.PI) / 180.0;
const radToDeg = (r: number) => (r * 180.0) / Math.PI;

function normalizeAngle(a: number): number {
  a = a - 360.0 * Math.floor(a / 360.0);
  return a < 0 ? a + 360.0 : a;
}

function normalizeHours(b: number): number {
  b = b - 24.0 * Math.floor(b / 24.0);
  return b < 0 ? b + 24.0 : b;
}

/**
 * Astronomical calculation of solar coordinates and prayer times
 */
export function calculateSolarPrayerTimes(
  date: Date,
  latitude: number,
  longitude: number,
  method: PrayerCalcMethod = 'egypt',
  targetTimezone?: string
): {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  midnight: Date;
  lastThird: Date;
} {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Julian Date calculation
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
  const d = jd - 2451545.0;

  // Mean solar coordinates
  const meanAnomaly = degToRad(normalizeAngle(357.529 + 0.98560028 * d));
  const meanLongitude = normalizeAngle(280.459 + 0.98564736 * d);
  const eclipticLongitude = degToRad(
    normalizeAngle(
      meanLongitude +
        1.915 * Math.sin(meanAnomaly) +
        0.02 * Math.sin(2 * meanAnomaly)
    )
  );

  const obliquity = degToRad(23.439 - 0.00000036 * d);
  const sinDeclination = Math.sin(obliquity) * Math.sin(eclipticLongitude);
  const declination = Math.asin(sinDeclination);

  // Right Ascension & Equation of Time
  const rightAscension = normalizeAngle(
    radToDeg(Math.atan2(Math.cos(obliquity) * Math.sin(eclipticLongitude), Math.cos(eclipticLongitude)))
  ) / 15.0;

  const eqTime = meanLongitude / 15.0 - rightAscension;

  // Local Timezone Offset in hours
  let timezoneOffset = -date.getTimezoneOffset() / 60.0;
  if (targetTimezone) {
    try {
      const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
      const tzDate = new Date(date.toLocaleString('en-US', { timeZone: targetTimezone }));
      const diffHours = (tzDate.getTime() - utcDate.getTime()) / 3600000;
      if (!isNaN(diffHours)) {
        timezoneOffset = diffHours;
      }
    } catch {
      // Fallback to local offset
    }
  }

  // Solar Noon (Dhuhr)
  // Egyptian General Authority of Survey calculates Dhuhr at astronomical transit (solar noon)
  const solarNoonHours = 12 + timezoneOffset - longitude / 15.0 - eqTime;
  const dhuhrHours = solarNoonHours + (method === 'egypt' ? 0.0 : 1.0 / 60.0);

  // Sun hour angle helper
  const computeHourAngle = (altitudeAngleDeg: number) => {
    const latRad = degToRad(latitude);
    const altRad = degToRad(altitudeAngleDeg);
    const cosHA =
      (Math.sin(altRad) - Math.sin(latRad) * Math.sin(declination)) /
      (Math.cos(latRad) * Math.cos(declination));

    if (cosHA > 1) return 0; // Sun never reaches angle
    if (cosHA < -1) return 180; // Sun always below
    return radToDeg(Math.acos(cosHA));
  };

  // Angles by calculation method
  // Default: Egyptian General Authority of Survey (الهيئة المصرية العامة للمساحة)
  // - الفجر: ١٩.٥° درجة انخفاض للشمس تحت الأفق (المعايير المعتمدة رسمياً في مصر)
  // - العشاء: المذهب الحنفي ١٧.٥° درجة انخفاض للشمس تحت الأفق (غياب الشفق)
  let fajrAngle = -19.5;
  let ishaAngle = -17.5;
  let ishaIntervalMin: number | null = null;

  if (method === 'egypt') {
    // الهيئة المصرية العامة للمساحة بالتعاون مع دار الإفتاء المصرية ووزارة الأوقاف
    fajrAngle = -19.5; // الفجر: انخفاض 19.5° تحت الأفق
    ishaAngle = -17.5; // العشاء: المذهب الحنفي - انخفاض 17.5° تحت الأفق عند غياب الشفق
  } else if (method === 'makkah') {
    // تقويم أم القرى (مكة المكرمة)
    fajrAngle = -18.5;
    ishaIntervalMin = 90; // 90 mins after Maghrib
  } else if (method === 'isna') {
    // الجمعية الإسلامية لأمريكا الشمالية
    fajrAngle = -15.0;
    ishaAngle = -15.0;
  } else {
    // MWL (رابطة العالم الإسلامي)
    fajrAngle = -18.0;
    ishaAngle = -17.0;
  }

  // Sunrise and Sunset (approx -0.8333° for atmospheric refraction and solar disc)
  const sunRiseSetAngle = -0.8333;
  const haRiseSet = computeHourAngle(sunRiseSetAngle) / 15.0;
  const sunriseHours = solarNoonHours - haRiseSet;
  const maghribHours = solarNoonHours + haRiseSet;

  // Fajr: 19.5° for Egypt
  const haFajr = computeHourAngle(fajrAngle) / 15.0;
  const fajrHours = solarNoonHours - haFajr;

  // Asr: Shafi'i madhhab (المذهب الشافعي المعتمد في مصر):
  // يبدأ وقت صلاة العصر عندما يصير ظل كل شيء مثله بالإضافة إلى ظل الزوال (Shadow Factor = 1)
  const latRad = degToRad(latitude);
  const asrAltitudeRad = Math.atan(1 / (1 + Math.tan(Math.abs(latRad - declination))));
  const haAsr = computeHourAngle(radToDeg(asrAltitudeRad)) / 15.0;
  const asrHours = solarNoonHours + haAsr;

  // Isha: Hanafi madhhab (المذهب الحنفي: ١٧.٥° غياب الشفق المعتمد في مصر)
  let ishaHours: number;
  if (ishaIntervalMin !== null) {
    ishaHours = maghribHours + ishaIntervalMin / 60.0;
  } else {
    const haIsha = computeHourAngle(ishaAngle) / 15.0;
    ishaHours = solarNoonHours + haIsha;
  }

  // Helper to convert float hours to Date object on given day
  const hoursToDate = (hours: number): Date => {
    const norm = normalizeHours(hours);
    const h = Math.floor(norm);
    const m = Math.floor((norm - h) * 60);
    const s = Math.floor(((norm - h) * 60 - m) * 60);
    const dObj = new Date(date);
    dObj.setHours(h, m, s, 0);
    return dObj;
  };

  const fajrDate = hoursToDate(fajrHours);
  const sunriseDate = hoursToDate(sunriseHours);
  const dhuhrDate = hoursToDate(dhuhrHours);
  const asrDate = hoursToDate(asrHours);
  const maghribDate = hoursToDate(maghribHours);
  const ishaDate = hoursToDate(ishaHours);

  // Calculate midnight & last third of the night (between Maghrib and next Fajr)
  const nextFajrTime = fajrDate.getTime() + (fajrDate.getTime() < maghribDate.getTime() ? 24 * 3600 * 1000 : 0);
  const nightDuration = nextFajrTime - maghribDate.getTime();
  const midnightDate = new Date(maghribDate.getTime() + nightDuration / 2);
  const lastThirdDate = new Date(maghribDate.getTime() + (nightDuration * 2) / 3);

  return {
    fajr: fajrDate,
    sunrise: sunriseDate,
    dhuhr: dhuhrDate,
    asr: asrDate,
    maghrib: maghribDate,
    isha: ishaDate,
    midnight: midnightDate,
    lastThird: lastThirdDate
  };
}

/**
 * Format Date object to Arabic 12-hour format e.g. "04:32 ص"
 */
export function formatPrayerTimeArabic(d: Date): string {
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const isPM = hours >= 12;
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const hStr = String(hours).padStart(2, '0');
  const mStr = String(minutes).padStart(2, '0');
  const period = isPM ? 'م' : 'ص';
  return `${hStr}:${mStr} ${period}`;
}

export function formatPrayerTime24h(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Convert number to Eastern Arabic numerals (١، ٢، ٣...)
 */
export function toEasternArabicDigits(str: string | number): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(str).replace(/[0-9]/g, (w) => arabicDigits[+w]);
}

/**
 * Storage Helpers for Calculation Method
 */
export function loadSavedPrayerMethod(): PrayerCalcMethod {
  try {
    const raw = localStorage.getItem(PRAYER_CALC_METHOD_KEY);
    if (raw && (raw === 'egypt' || raw === 'makkah' || raw === 'mwl' || raw === 'isna')) {
      return raw as PrayerCalcMethod;
    }
  } catch {
    // Fallback
  }
  return 'egypt'; // الهيئة العامة المصرية للمساحة كإعداد افتراضي مثبت
}

export function savePrayerMethod(method: PrayerCalcMethod): void {
  try {
    localStorage.setItem(PRAYER_CALC_METHOD_KEY, method);
    notifyPrayerSettingsChanged();
  } catch {
    // Fallback
  }
}

/**
 * Storage Helpers for Minute Offsets (Fine-tuning)
 */
export function loadSavedPrayerOffsets(): PrayerMinuteOffsets {
  try {
    const raw = localStorage.getItem(PRAYER_OFFSETS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        fajr: Number(parsed.fajr) || 0,
        sunrise: Number(parsed.sunrise) || 0,
        dhuhr: Number(parsed.dhuhr) || 0,
        asr: Number(parsed.asr) || 0,
        maghrib: Number(parsed.maghrib) || 0,
        isha: Number(parsed.isha) || 0
      };
    }
  } catch {
    // Fallback
  }
  return { ...DEFAULT_PRAYER_OFFSETS };
}

export function savePrayerOffsets(offsets: PrayerMinuteOffsets): void {
  try {
    localStorage.setItem(PRAYER_OFFSETS_KEY, JSON.stringify(offsets));
    notifyPrayerSettingsChanged();
  } catch {
    // Fallback
  }
}

/**
 * Pin Cairo and Egyptian General Authority of Survey as default preset
 */
export function pinCairoEgyptianSurvey(): { location: UserLocation; method: PrayerCalcMethod } {
  saveLocation(CAIRO_LOCATION);
  savePrayerMethod('egypt');
  savePrayerOffsets(DEFAULT_PRAYER_OFFSETS);
  return {
    location: CAIRO_LOCATION,
    method: 'egypt'
  };
}

/**
 * Get current time in Cairo, Egypt formatted for clock display
 */
export function getCurrentCairoTime(): string {
  try {
    const d = new Date();
    return d.toLocaleTimeString('ar-EG', {
      timeZone: 'Africa/Cairo',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch {
    return formatPrayerTimeArabic(new Date());
  }
}

/**
 * Get all prayer times list with current, next, and passed status flags
 */
export function getPrayerTimesList(
  location: UserLocation,
  now: Date = new Date(),
  method: PrayerCalcMethod = loadSavedPrayerMethod(),
  offsets: PrayerMinuteOffsets = loadSavedPrayerOffsets()
): PrayerTimeItem[] {
  const times = calculateSolarPrayerTimes(
    now,
    location.latitude,
    location.longitude,
    method,
    location.timezone
  );
  const nowMs = now.getTime();

  const rawList: { id: PrayerTimeItem['id']; name: string; englishName: string; date: Date }[] = [
    { id: 'fajr', name: 'الفجر', englishName: 'Fajr', date: new Date(times.fajr.getTime() + (offsets.fajr || 0) * 60000) },
    { id: 'sunrise', name: 'الشروق', englishName: 'Sunrise', date: new Date(times.sunrise.getTime() + (offsets.sunrise || 0) * 60000) },
    { id: 'dhuhr', name: 'الظهر', englishName: 'Dhuhr', date: new Date(times.dhuhr.getTime() + (offsets.dhuhr || 0) * 60000) },
    { id: 'asr', name: 'العصر', englishName: 'Asr', date: new Date(times.asr.getTime() + (offsets.asr || 0) * 60000) },
    { id: 'maghrib', name: 'المغرب', englishName: 'Maghrib', date: new Date(times.maghrib.getTime() + (offsets.maghrib || 0) * 60000) },
    { id: 'isha', name: 'العشاء', englishName: 'Isha', date: new Date(times.isha.getTime() + (offsets.isha || 0) * 60000) }
  ];

  // Find next prayer index
  let nextIdx = rawList.findIndex((p) => p.date.getTime() > nowMs);
  if (nextIdx === -1) {
    // If all today's prayers passed, next prayer is Tomorrow's Fajr
    nextIdx = 0;
  }

  // Current prayer is the one immediately preceding next prayer
  const currentIdx = (nextIdx - 1 + rawList.length) % rawList.length;

  return rawList.map((item, idx) => {
    const isPassed = nowMs > item.date.getTime();
    const isNext = idx === nextIdx;
    const isCurrent = idx === currentIdx;

    return {
      id: item.id,
      name: item.name,
      englishName: item.englishName,
      time: formatPrayerTime24h(item.date),
      formattedTime: formatPrayerTimeArabic(item.date),
      dateObj: item.date,
      isPassed,
      isNext,
      isCurrent
    };
  });
}

/**
 * Calculate detailed countdown and info for the next prayer
 */
export function calculateNextPrayerCountdown(
  location: UserLocation,
  now: Date = new Date(),
  method: PrayerCalcMethod = loadSavedPrayerMethod(),
  offsets: PrayerMinuteOffsets = loadSavedPrayerOffsets()
): NextPrayerInfo {
  const allPrayers = getPrayerTimesList(location, now, method, offsets);
  const nowMs = now.getTime();

  // Find next upcoming prayer
  let nextPrayer = allPrayers.find((p) => p.dateObj.getTime() > nowMs);
  let currentPrayer = allPrayers.find((p) => p.isCurrent) || allPrayers[0];

  let nextPrayerDate: Date;
  if (nextPrayer) {
    nextPrayerDate = nextPrayer.dateObj;
  } else {
    // Tomorrow Fajr calculation
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimes = calculateSolarPrayerTimes(
      tomorrow,
      location.latitude,
      location.longitude,
      method,
      location.timezone
    );
    const tomorrowFajr = new Date(tomorrowTimes.fajr.getTime() + (offsets.fajr || 0) * 60000);
    nextPrayerDate = tomorrowFajr;
    nextPrayer = {
      id: 'fajr',
      name: 'الفجر (غداً)',
      englishName: 'Fajr Tomorrow',
      time: formatPrayerTime24h(tomorrowFajr),
      formattedTime: formatPrayerTimeArabic(tomorrowFajr),
      dateObj: tomorrowFajr,
      isPassed: false,
      isNext: true,
      isCurrent: false
    };
  }

  const remainingMs = Math.max(0, nextPrayerDate.getTime() - nowMs);
  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hStr = String(hours).padStart(2, '0');
  const mStr = String(minutes).padStart(2, '0');
  const sStr = String(seconds).padStart(2, '0');
  const remainingFormatted = `${hStr}:${mStr}:${sStr}`;

  // Human Arabic text representation
  let remainingHumanArabic = '';
  if (hours > 0 && minutes > 0) {
    remainingHumanArabic = `${hours === 1 ? 'ساعة' : hours === 2 ? 'ساعتان' : `${toEasternArabicDigits(hours)} ساعات`} و ${toEasternArabicDigits(minutes)} دقيقة`;
  } else if (hours > 0) {
    remainingHumanArabic = `${hours === 1 ? 'ساعة واحدة' : hours === 2 ? 'ساعتان' : `${toEasternArabicDigits(hours)} ساعات`}`;
  } else if (minutes > 0) {
    remainingHumanArabic = `${minutes === 1 ? 'دقيقة واحدة' : minutes === 2 ? 'دقيقتان' : `${toEasternArabicDigits(minutes)} دقيقة`}`;
  } else {
    remainingHumanArabic = `${toEasternArabicDigits(seconds)} ثانية`;
  }

  // Progress percentage calculation
  let progressPercent = 0;
  let intervalStartMs = currentPrayer.dateObj.getTime();
  if (intervalStartMs > nowMs) {
    intervalStartMs -= 24 * 3600 * 1000;
  }
  const totalInterval = nextPrayerDate.getTime() - intervalStartMs;
  if (totalInterval > 0) {
    const elapsed = nowMs - intervalStartMs;
    progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalInterval) * 100)));
  }

  const methodObj = PRAYER_CALC_METHODS.find((m) => m.id === method) || PRAYER_CALC_METHODS[0];

  return {
    nextPrayer,
    currentPrayer,
    remainingMs,
    remainingHours: hours,
    remainingMinutes: minutes,
    remainingSeconds: seconds,
    remainingFormatted,
    remainingHumanArabic,
    progressPercent,
    allPrayers,
    location,
    method,
    methodName: methodObj.shortName
  };
}

/**
 * Storage Helpers
 */
export function loadSavedLocation(): UserLocation {
  try {
    const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Fallback
  }
  return DEFAULT_LOCATION;
}

export function saveLocation(loc: UserLocation): void {
  try {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(loc));
    notifyPrayerSettingsChanged();
  } catch {
    // Fallback
  }
}

/**
 * Reverse Geocode coordinates to city name using lightweight free API or closest preset
 */
export async function reverseGeocodeCity(lat: number, lng: number): Promise<string> {
  try {
    // Try BigDataCloud free client geocoding API
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ar`
    );
    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || data.principalSubdivision || data.countryName;
      if (city) return city;
    }
  } catch {
    // Fallback to nearest city search
  }

  // Find closest city in preset list by Euclidean distance
  let closest = DEFAULT_LOCATION;
  let minDistance = Infinity;
  for (const preset of POPULAR_CITIES) {
    const dLat = preset.latitude - lat;
    const dLng = preset.longitude - lng;
    const dist = dLat * dLat + dLng * dLng;
    if (dist < minDistance) {
      minDistance = dist;
      closest = preset;
    }
  }

  if (minDistance < 1.0) {
    return closest.cityName;
  }

  return `الموقع الحالي (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`;
}

/**
 * Request user's device geolocation via browser API
 */
export function requestDeviceLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let cityName = 'موقعي الحالي';
        try {
          cityName = await reverseGeocodeCity(latitude, longitude);
        } catch {
          cityName = 'موقعي الجغرافي';
        }

        const userLoc: UserLocation = {
          latitude,
          longitude,
          cityName,
          isGps: true,
          timestamp: Date.now()
        };
        saveLocation(userLoc);
        resolve(userLoc);
      },
      (err) => {
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}

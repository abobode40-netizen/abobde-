export type AppTab = 'home' | 'quran' | 'athkar' | 'duas' | 'mishkat' | 'tracker' | 'thimar' | 'search' | 'settings' | 'qibla';

export type ReciterId = 
  | 'alafasy' 
  | 'hussary' 
  | 'minshawi' 
  | 'muaiqly' 
  | 'ajmi' 
  | 'ghamadi' 
  | 'abdulbasit'
  | 'sudais'
  | 'shuraym'
  | 'dussary'
  | 'qatam'
  | 'shatri'
  | 'huthifi'
  | 'abkar'
  | 'abbad';

export interface ReciterInfo {
  id: ReciterId;
  name: string;
  subname: string;
  category?: 'مرتل' | 'مجود' | 'أئمة الحرمين' | 'تلاوات خاشعة';
  serverUrl: string;
  hasAyahAudio: boolean;
}

export interface DownloadedSurahRecord {
  id: string; // `${reciterId}_${surahNumber}`
  surahNumber: number;
  surahName: string;
  reciterId: ReciterId;
  reciterName: string;
  audioUrl: string;
  downloadedAt: number;
  sizeEstimate?: string;
  isCached: boolean;
}

export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: 'Meccan' | 'Medinan';
  numberOfAyahs: number;
  startPage: number;
  juz: number;
}

export interface AyahData {
  numberInSurah: number;
  numberInQuran: number;
  text: string;
  juz: number;
  page: number;
  hizbQuarter: number;
  surahNumber: number;
  audioUrl?: string;
  tafseer?: string;
}

export interface RelatedQuranVerse {
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  verseText: string;
  explanation: string;
  audioUrl: string;
}

export interface ThikrItem {
  id: string;
  text: string;
  count: number;
  repeatCount: number; // total needed
  currentCount: number; // user progress
  fadl?: string;
  source?: string;
  audioHint?: string;
  relatedVerse?: RelatedQuranVerse;
}

export interface AthkarCategory {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  color: string;
  items: ThikrItem[];
}

export interface ThimarahItem {
  id: string;
  quote: string;
  author: string;
  category: string;
  source?: string;
  reflectionPrompt?: string;
  era?: 'التابعين والأئمة المتقدمين' | 'أئمة الإسلام المحققين' | 'مشايخ العصر وأعلام السنة';
  relatedVerse?: RelatedQuranVerse;
}

export interface AudioLessonItem {
  id: string;
  title: string;
  scholar: string;
  category: string;
  duration: string;
  durationSeconds: number;
  summary: string;
  fullTranscript: string;
  keyTakeaway: string;
  tags: string[];
  practicalSteps?: string[];
  quote?: string;
  audioUrl?: string;
  relatedVerse?: RelatedQuranVerse;
}

export type PrayerStatus = 'missed' | 'alone' | 'congregation';

export interface DailyHabit {
  id: string;
  title: string;
  category: 'prayer' | 'athkar' | 'quran' | 'sunnah' | 'charity';
  completed: boolean;
}

export interface DayTrackerData {
  date: string; // YYYY-MM-DD
  prayers: {
    fajr: PrayerStatus;
    dhuhr: PrayerStatus;
    asr: PrayerStatus;
    maghrib: PrayerStatus;
    isha: PrayerStatus;
  };
  habits: Record<string, boolean>;
  quranPagesRead: number;
  quranTargetPages: number;
  athkarCompletedCount: number;
  athkarTargetCount: number;
  treeGrowthPercentage: number; // 0 to 100
}

export interface OneMinuteDeed {
  id: string;
  title: string;
  targetCount: number;
  categoryName: string;
  rewardFadl: string;
}

export interface Bookmark {
  id: string;
  type: 'surah' | 'page' | 'ayah' | 'thikr' | 'thimarah' | 'dua' | 'mishkat';
  title: string;
  subtitle: string;
  targetId: string | number;
  createdAt: number;
  pageNumber?: number;
}

export type DuaCategoryType = 'khatm' | 'quran' | 'sunnah' | 'ruqyah' | 'magic_jinn' | 'kuroob' | 'hidayah' | 'jawami';

export interface DuaItem {
  id: string;
  category: DuaCategoryType;
  title: string;
  arabicText: string;
  source: string; // Source & Authentication (تخريج وتحقيق)
  grade?: string; // صحيح / حسن / آية كريمة
  benefit?: string; // فضل الدعاء والمناسبة
  surahInfo?: {
    surahName: string;
    surahNumber: number;
    ayahNumber: number;
  };
  narrator?: string; // راوي الحديث
  repeatCount?: number;
}

export interface MishkatLesson {
  id: string;
  title: string;
  category: 'youth_leadership' | 'courage_faith' | 'manners_ethics' | 'family_parents' | 'crises_resilience' | 'knowledge_excellence';
  categoryTitle: string;
  summary: string;
  storyText: string; // القصة والموقف النبوي الشريف
  authenticitySource: string; // التخريج والتحقيق العلمي الدقيق (صحيح البخاري، مسلم، إلخ)
  authenticityGrade: string; // صحيح متفق عليه / صحيح / حسن
  practicalTakeaway: string; // القبس العملي للشباب في واقعنا
  propheticGuidance: string; // الحديث أو الوصية المقترنة
  actionTip: string; // خطوة عملية لليوم
}


export type QuranThemeId = 
  | 'royal_gold'       // مصحف المدينة الملكي (الذهبي الكلاسيكي)
  | 'emerald_rawdah'   // الروضة الشريفة (الزمردي النبوي)
  | 'heritage_sepia'   // المخطوطة التراثية (ورق البردي الأثري)
  | 'night_tahajjud'   // ليل التهجد (الكحلي الملكي المذهب)
  | 'pure_dark'        // العتمة الفاحمة (Dark OLED المريح)
  | 'andalusian_cyan'  // الفيروز الأندلسي والصفاء
  | 'damascus_velvet'; // المخمل الدمشقي الأرجواني

export interface QuranThemeConfig {
  id: QuranThemeId;
  name: string;
  subname: string;
  description: string;
  badge: string;
  previewColors: {
    bg: string;
    border: string;
    accent: string;
    text: string;
  };
  containerBgClass: string;
  containerBorderClass: string;
  cornerBorderColor: string;
  cornerShape: 'classic_square' | 'arabesque_floral' | 'antique_bracket' | 'celestial_star' | 'minimal_sleek' | 'andalusian_star' | 'damascus_arch';
  ribbonClass: string;
  headerTextColor: string;
  headerSubtextColor: string;
  surahBannerClass: string;
  surahTitleColor: string;
  bismillahColor: string;
  ayahTextColor: string;
  ayahMarkerColor: string;
  activeAyahClass: string;
  pageNumberColor: string;
  isDarkTheme: boolean;
}

export interface AppSettings {
  isDarkMode: boolean;
  enableEyeComfortMode?: boolean; // Warm sepia / eye comfort tone
  selectedReciter: ReciterId;
  quranTheme?: QuranThemeId;
  quranFontSize: number; // 18 to 36
  enableAutoScroll: boolean;
  enableAudioChimes: boolean;
  dailyMorningReminder: boolean;
  dailyEveningReminder: boolean;
  workModeIntervalMinutes: number;
  enableWorkModeThoughts: boolean;
}


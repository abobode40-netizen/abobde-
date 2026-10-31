import { QuranThemeConfig, QuranThemeId } from '../types';

export const QURAN_THEMES: QuranThemeConfig[] = [
  {
    id: 'royal_gold',
    name: 'مصحف المدينة الملكي',
    subname: 'الذهبي الكلاسيكي الأصيل',
    description: 'خلفية بلون العاج الأصيل مع إطارات وزخارف ذهبية ملكية مستوحاة من مصحف مجمع الملك فهد الشريف بالمدينة المنورة.',
    badge: 'الأكثر اختياراً 🕌',
    previewColors: {
      bg: '#FFFDF7',
      border: '#D4AF37',
      accent: '#C19E2B',
      text: '#111827'
    },
    containerBgClass: 'bg-[#FFFDF7] dark:bg-[#15211B]',
    containerBorderClass: 'border-[#D4AF37]/50 dark:border-[#D4AF37]/40 shadow-md ring-1 ring-[#D4AF37]/20',
    cornerBorderColor: '#C19E2B',
    cornerShape: 'classic_square',
    ribbonClass: 'border-[#E8DFC8] dark:border-[#2A3C34]',
    headerTextColor: 'text-[#0284C7] dark:text-[#38BDF8]',
    headerSubtextColor: 'text-[#8A743F] dark:text-amber-300',
    surahBannerClass: 'bg-gradient-to-r from-amber-100/80 via-amber-200/90 to-amber-100/80 dark:from-amber-950/40 dark:via-amber-900/60 dark:to-amber-950/40 border-[#D4AF37]/60',
    surahTitleColor: 'text-[#19302A] dark:text-amber-100',
    bismillahColor: 'text-[#0284C7] dark:text-[#38BDF8]',
    ayahTextColor: 'text-[#111827] dark:text-[#F3F4F6]',
    ayahMarkerColor: 'text-[#C19E2B] dark:text-amber-400',
    activeAyahClass: 'bg-amber-300/85 dark:bg-amber-800/85 text-[#073628] dark:text-amber-100 ring-2 ring-amber-400 dark:ring-amber-500 shadow-sm px-1.5 py-0.5',
    pageNumberColor: 'text-[#8A743F] dark:text-amber-300',
    isDarkTheme: false
  },
  {
    id: 'azure_sky',
    name: 'السماء الزرقاء الصافية',
    subname: 'الأزرق الفاتح والصفاء السماوي',
    description: 'تصميم سماوي نقي بألوان زرقة السماء الصافية واللازورد الخافت مع الذهبي، مريح جداً للنظر ومُشرح للصدر والقلب.',
    badge: 'الأزرق الفاتح 🩵',
    previewColors: {
      bg: '#F0F9FF',
      border: '#0284C7',
      accent: '#38BDF8',
      text: '#0C4A6E'
    },
    containerBgClass: 'bg-[#F0F9FF] dark:bg-[#081C30]',
    containerBorderClass: 'border-[#0284C7]/60 dark:border-[#38BDF8]/50 shadow-md ring-1 ring-[#0284C7]/30',
    cornerBorderColor: '#0284C7',
    cornerShape: 'arabesque_floral',
    ribbonClass: 'border-[#BAE6FD] dark:border-[#1E3A5F]',
    headerTextColor: 'text-[#0369A1] dark:text-[#38BDF8]',
    headerSubtextColor: 'text-[#0284C7] dark:text-sky-300',
    surahBannerClass: 'bg-gradient-to-r from-sky-100/80 via-sky-200/90 to-sky-100/80 dark:from-sky-950/60 dark:via-sky-900/80 dark:to-sky-950/60 border-[#0284C7]/50',
    surahTitleColor: 'text-[#0C4A6E] dark:text-sky-100',
    bismillahColor: 'text-[#0284C7] dark:text-[#38BDF8]',
    ayahTextColor: 'text-[#0C4A6E] dark:text-[#F0F9FF]',
    ayahMarkerColor: 'text-[#0284C7] dark:text-[#38BDF8]',
    activeAyahClass: 'bg-sky-200/90 dark:bg-sky-800/90 text-[#0C4A6E] dark:text-sky-50 ring-2 ring-sky-400 dark:ring-sky-400 shadow-sm px-1.5 py-0.5',
    pageNumberColor: 'text-[#0284C7] dark:text-sky-300',
    isDarkTheme: false
  },
  {
    id: 'emerald_rawdah',
    name: 'السماء الصافية (الأزرق الفاتح)',
    subname: 'الأزرق الفاتح والصفاء السماوي',
    description: 'تصميم سماوي نقي بألوان زرقة السماء الصافية واللازورد الخافت، مريح جداً للنظر ومُشرح للصدر والقلب.',
    badge: 'الأزرق الفاتح 🩵',
    previewColors: {
      bg: '#F0F9FF',
      border: '#0284C7',
      accent: '#38BDF8',
      text: '#0C4A6E'
    },
    containerBgClass: 'bg-[#F0F9FF] dark:bg-[#081C30]',
    containerBorderClass: 'border-[#0284C7]/60 dark:border-[#38BDF8]/50 shadow-md ring-1 ring-[#0284C7]/30',
    cornerBorderColor: '#0284C7',
    cornerShape: 'arabesque_floral',
    ribbonClass: 'border-[#BAE6FD] dark:border-[#1E3A5F]',
    headerTextColor: 'text-[#0369A1] dark:text-[#38BDF8]',
    headerSubtextColor: 'text-[#0284C7] dark:text-sky-300',
    surahBannerClass: 'bg-gradient-to-r from-sky-100/80 via-sky-200/90 to-sky-100/80 dark:from-sky-950/60 dark:via-sky-900/80 dark:to-sky-950/60 border-[#0284C7]/50',
    surahTitleColor: 'text-[#0C4A6E] dark:text-sky-100',
    bismillahColor: 'text-[#0284C7] dark:text-[#38BDF8]',
    ayahTextColor: 'text-[#0C4A6E] dark:text-[#F0F9FF]',
    ayahMarkerColor: 'text-[#0284C7] dark:text-[#38BDF8]',
    activeAyahClass: 'bg-sky-200/90 dark:bg-sky-800/90 text-[#0C4A6E] dark:text-sky-50 ring-2 ring-sky-400 dark:ring-sky-400 shadow-sm px-1.5 py-0.5',
    pageNumberColor: 'text-[#0284C7] dark:text-sky-300',
    isDarkTheme: false
  },
  {
    id: 'heritage_sepia',
    name: 'المخطوطة التراثية',
    subname: 'ورق البردي الأثري والمصاحف العتيقة',
    description: 'ملمس ولون الورق الأثري القديم الدافئ والمائل للبيج البرونزي، مريح جداً للبصر في القراءات الطويلة تحت الضوء النهاري.',
    badge: 'تراثي مريح للعين 📜',
    previewColors: {
      bg: '#F5EBDC',
      border: '#A88355',
      accent: '#78552B',
      text: '#2C1E14'
    },
    containerBgClass: 'bg-[#F5EBDC] dark:bg-[#1E1812]',
    containerBorderClass: 'border-[#A88355]/60 dark:border-[#C49E6C]/50 shadow-md ring-1 ring-[#8C6239]/25',
    cornerBorderColor: '#8C6239',
    cornerShape: 'antique_bracket',
    ribbonClass: 'border-[#DEC8A7] dark:border-[#382C1F]',
    headerTextColor: 'text-[#613D1A] dark:text-[#E0B885]',
    headerSubtextColor: 'text-[#87582B] dark:text-[#CFA470]',
    surahBannerClass: 'bg-gradient-to-r from-[#EDE0CA] via-[#E2CEB0] to-[#EDE0CA] dark:from-[#2B2117] dark:via-[#3E2F20] dark:to-[#2B2117] border-[#A88355]/60',
    surahTitleColor: 'text-[#3E250F] dark:text-[#F3E7D3]',
    bismillahColor: 'text-[#6B421C] dark:text-[#DEB27B]',
    ayahTextColor: 'text-[#2C1E14] dark:text-[#F5EDE1]',
    ayahMarkerColor: 'text-[#87582B] dark:text-[#D8AC76]',
    activeAyahClass: 'bg-[#DEC8A7] dark:bg-[#523B25] text-[#24170D] dark:text-[#FFF7EC] ring-2 ring-[#B89262] shadow-sm px-1.5 py-0.5',
    pageNumberColor: 'text-[#7B5127] dark:text-[#C79C68]',
    isDarkTheme: false
  },
  {
    id: 'night_tahajjud',
    name: 'ليل التهجد والقيام',
    subname: 'الكحلي الملكي الفاخر مع الذهب',
    description: 'خلفية كحلية عميقة راقية كأعماق سماء الليل، مع إطارات وخطوط ذهبية براقة لقراءة هادئة خاشعة في الثلث الأخير من الليل.',
    badge: 'لقيام الليل 🌌',
    previewColors: {
      bg: '#0A1226',
      border: '#F3C969',
      accent: '#FFD166',
      text: '#F8FAFC'
    },
    containerBgClass: 'bg-[#0A1226]',
    containerBorderClass: 'border-[#F3C969]/50 shadow-xl shadow-blue-950/50 ring-1 ring-[#F3C969]/30',
    cornerBorderColor: '#F3C969',
    cornerShape: 'celestial_star',
    ribbonClass: 'border-[#1E2E52]',
    headerTextColor: 'text-[#F3C969]',
    headerSubtextColor: 'text-[#93C5FD]',
    surahBannerClass: 'bg-gradient-to-r from-[#0F1C38] via-[#16274D] to-[#0F1C38] border-[#F3C969]/60',
    surahTitleColor: 'text-[#FDE68A]',
    bismillahColor: 'text-[#F3C969]',
    ayahTextColor: 'text-[#F8FAFC]',
    ayahMarkerColor: 'text-[#F3C969]',
    activeAyahClass: 'bg-[#1E3A8A]/90 text-[#FEF08A] ring-2 ring-[#F59E0B] shadow-md px-1.5 py-0.5',
    pageNumberColor: 'text-[#F3C969]',
    isDarkTheme: true
  },
  {
    id: 'pure_dark',
    name: 'العتمة الفاحمة (Dark OLED)',
    subname: 'الأسود المطلق لراحة العين والبطارية',
    description: 'تصميم عاتم نقي بدون أي توهج مزعج، مصمم خصيصاً لشاشات الهواتف الحديثة لتوفير البطارية وحماية العينين في الظلام التام.',
    badge: 'توفير البطارية 🖤',
    previewColors: {
      bg: '#000000',
      border: '#4B5563',
      accent: '#9CA3AF',
      text: '#F3F4F6'
    },
    containerBgClass: 'bg-[#050505]',
    containerBorderClass: 'border-neutral-700/60 shadow-xl ring-1 ring-neutral-800',
    cornerBorderColor: '#9CA3AF',
    cornerShape: 'minimal_sleek',
    ribbonClass: 'border-neutral-800',
    headerTextColor: 'text-neutral-300',
    headerSubtextColor: 'text-neutral-400',
    surahBannerClass: 'bg-gradient-to-r from-[#111111] via-[#1A1A1A] to-[#111111] border-neutral-700',
    surahTitleColor: 'text-white',
    bismillahColor: 'text-neutral-300',
    ayahTextColor: 'text-[#F3F4F6]',
    ayahMarkerColor: 'text-amber-400',
    activeAyahClass: 'bg-neutral-800 text-amber-200 ring-2 ring-neutral-600 shadow-sm px-1.5 py-0.5',
    pageNumberColor: 'text-neutral-400',
    isDarkTheme: true
  },
  {
    id: 'andalusian_cyan',
    name: 'الفيروز الأندلسي والصفاء',
    subname: 'الزرقة السماوية والأندلسية الخالصة',
    description: 'زخارف هندسية أندلسية بلون الفيروز الصافي واللازورد الخافت، تمنح الصفحة بهاءً وانشراحاً مشرقاً يجمع بين الأصالة والحداثة.',
    badge: 'طراز أندلسي 🩵',
    previewColors: {
      bg: '#F0F9FF',
      border: '#0284C7',
      accent: '#06B6D4',
      text: '#082F49'
    },
    containerBgClass: 'bg-[#F0F9FF] dark:bg-[#07192C]',
    containerBorderClass: 'border-[#0284C7]/60 dark:border-[#38BDF8]/50 shadow-md ring-1 ring-[#0284C7]/25',
    cornerBorderColor: '#0284C7',
    cornerShape: 'andalusian_star',
    ribbonClass: 'border-[#BAE6FD] dark:border-[#1E3A5F]',
    headerTextColor: 'text-[#0284C7] dark:text-[#38BDF8]',
    headerSubtextColor: 'text-[#0369A1] dark:text-sky-300',
    surahBannerClass: 'bg-gradient-to-r from-sky-100/80 via-sky-200/90 to-sky-100/80 dark:from-sky-950/60 dark:via-sky-900/70 dark:to-sky-950/60 border-[#0284C7]/50',
    surahTitleColor: 'text-[#082F49] dark:text-sky-100',
    bismillahColor: 'text-[#0284C7] dark:text-[#38BDF8]',
    ayahTextColor: 'text-[#082F49] dark:text-[#F0F9FF]',
    ayahMarkerColor: 'text-[#0284C7] dark:text-[#38BDF8]',
    activeAyahClass: 'bg-sky-200/90 dark:bg-sky-800/90 text-[#082F49] dark:text-sky-50 ring-2 ring-sky-400 shadow-sm px-1.5 py-0.5',
    pageNumberColor: 'text-[#0284C7] dark:text-sky-300',
    isDarkTheme: false
  },
  {
    id: 'damascus_velvet',
    name: 'المخمل الدمشقي الفاخر',
    subname: 'الأرجواني الملكي مع رقائق الذهب',
    description: 'مزيج فاخر من تدرجات البرقوق والأرجواني الدمشقي التراثي المطعم بالزخرفة الذهبية، يضفي هيبة وفخامة ملكية متفردة.',
    badge: 'أرجواني ملكي 💜',
    previewColors: {
      bg: '#FAF6F9',
      border: '#86198F',
      accent: '#C026D3',
      text: '#2E0832'
    },
    containerBgClass: 'bg-[#FAF6F9] dark:bg-[#1C0F1E]',
    containerBorderClass: 'border-[#86198F]/55 dark:border-[#C026D3]/50 shadow-md ring-1 ring-[#86198F]/25',
    cornerBorderColor: '#9333EA',
    cornerShape: 'damascus_arch',
    ribbonClass: 'border-[#E9D5E8] dark:border-[#381B3C]',
    headerTextColor: 'text-[#701A75] dark:text-[#E879F9]',
    headerSubtextColor: 'text-[#86198F] dark:text-fuchsia-300',
    surahBannerClass: 'bg-gradient-to-r from-fuchsia-100/80 via-fuchsia-200/90 to-fuchsia-100/80 dark:from-fuchsia-950/60 dark:via-fuchsia-900/70 dark:to-fuchsia-950/60 border-[#86198F]/50',
    surahTitleColor: 'text-[#2E0832] dark:text-fuchsia-100',
    bismillahColor: 'text-[#701A75] dark:text-[#E879F9]',
    ayahTextColor: 'text-[#2E0832] dark:text-[#FDF4FF]',
    ayahMarkerColor: 'text-[#9333EA] dark:text-[#E879F9]',
    activeAyahClass: 'bg-fuchsia-200/90 dark:bg-fuchsia-800/90 text-[#2E0832] dark:text-fuchsia-50 ring-2 ring-fuchsia-400 shadow-sm px-1.5 py-0.5',
    pageNumberColor: 'text-[#701A75] dark:text-fuchsia-300',
    isDarkTheme: false
  }
];

export const STORAGE_KEY_QURAN_THEME = 'jannat_quran_theme_id_v1';

export function getQuranTheme(id?: QuranThemeId): QuranThemeConfig {
  if (!id) return QURAN_THEMES[0];
  const found = QURAN_THEMES.find((t) => t.id === id);
  return found || QURAN_THEMES[0];
}

export function loadSavedQuranTheme(): QuranThemeId {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_QURAN_THEME);
    if (saved && QURAN_THEMES.some((t) => t.id === saved)) {
      return saved as QuranThemeId;
    }
  } catch {}
  return 'royal_gold';
}

export function saveSavedQuranTheme(themeId: QuranThemeId): void {
  try {
    localStorage.setItem(STORAGE_KEY_QURAN_THEME, themeId);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('jannat_quran_theme_changed', { detail: { themeId } })
      );
    }
  } catch {}
}

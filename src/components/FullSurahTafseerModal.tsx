import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  Search, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  BookMarked,
  FileText,
  Filter,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { toArabicNumerals } from '../data/quranData';
import { playChime, triggerHaptic } from '../utils/audio';
import { cleanQuranText } from '../utils/quranText';

export interface TrustedSource {
  id: string;
  name: string;
  author: string;
  description: string;
  icon: string;
  badge: string;
  color: string;
  getUrl: (surahNumber: number, ayahNumber?: number) => string;
}

export const TRUSTED_TAFSEER_SOURCES: TrustedSource[] = [
  {
    id: 'muyassar',
    name: 'التفسير الميسر',
    author: 'مجمع الملك فهد لطباعة المصحف الشريف',
    description: 'التفسير المعتمد رسمياً والموثوق صادر عن نخبة من علماء القرآن في المدينة المنورة.',
    icon: '🏛️',
    badge: 'معتمد رسمياً',
    color: '#0F6B50',
    getUrl: (sNum, aNum = 1) => `https://quran.ksu.edu.sa/tafseer/muyassar/sura${sNum}-aya${aNum}.html`
  },
  {
    id: 'ibn_kathir',
    name: 'تفسير القرآن العظيم',
    author: 'الإمام الحافظ ابن كثير',
    description: 'أشهر تفاسير القرآن بالمأثور والأحاديث والآيات وأصحها تحرياً للمعنى.',
    icon: '📖',
    badge: 'تفسير بالحديث والآثار',
    color: '#D97706',
    getUrl: (sNum, aNum = 1) => `https://tafseer.app/ibn-kathir/${sNum}/${aNum}`
  },
  {
    id: 'saadi',
    name: 'تيسير الكريم الرحمن (تفسير السعدي)',
    author: 'الشيخ عبد الرحمن السعدي',
    description: 'تفسير بليغ وميسر يركز على مقاصد الآيات والأحكام والتربية الإيمانية.',
    icon: '📜',
    badge: 'ميسر ومربي',
    color: '#2563EB',
    getUrl: (sNum, aNum = 1) => `https://tafseer.app/saadi/${sNum}/${aNum}`
  },
  {
    id: 'mukhtasar',
    name: 'المختصر في تفسير القرآن',
    author: 'مركز تفسير للدراسات القرآنية',
    description: 'كتاب محرر صادر عن مركز تفسير يوضح معاني الآيات ومقاصد كل سورة بأسلوب ميسر.',
    icon: '💎',
    badge: 'مركز تفسير',
    color: '#059669',
    getUrl: (sNum, aNum = 1) => `https://tafseer.app/almukhtasar/${sNum}/${aNum}`
  },
  {
    id: 'tabari',
    name: 'جامع البيان (تفسير الطبري)',
    author: 'إمام المفسرين ابن جرير الطبري',
    description: 'المرجع الأول وأم تفاسير القرآن الكريمة الجامعة للغة والآثار والأسانيد.',
    icon: '📚',
    badge: 'إمام التفاسير',
    color: '#7C3AED',
    getUrl: (sNum, aNum = 1) => `https://tafseer.app/tabari/${sNum}/${aNum}`
  },
  {
    id: 'quran_com',
    name: 'بوابة Quran.com القرآنية',
    author: 'المكتبة القرآنية العالمية المعتمدة',
    description: 'قراءة وتصفح السورة كاملة مع اختيار المفسر والقارئ معاً بصورة تفاعلية.',
    icon: '🌐',
    badge: 'منصة عالمية',
    color: '#0D9488',
    getUrl: (sNum) => `https://quran.com/ar/${sNum}/tafsirs/ar-tafsir-muyassar`
  }
];

export function HighlightedText({ text, highlight, className = '' }: { text: string; highlight: string; className?: string }) {
  if (!highlight || !highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  const query = highlight.trim();
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-amber-300 dark:bg-amber-500/90 text-amber-950 dark:text-amber-100 font-bold px-1.5 py-0.5 rounded-md mx-0.5 shadow-xs transition-all"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

interface SurahAyahTafseer {
  number: number;
  text: string;
  tafseer: string;
  wordMeanings?: { word: string; meaning: string }[];
}

interface FullSurahTafseerModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahNumber: number;
  surahName: string;
  totalAyahsCount?: number;
  initialAyahs?: SurahAyahTafseer[];
  onSelectAyahForDetails?: (surahNumber: number, surahName: string, ayahNumber: number, ayahText: string, defaultTafseer?: string) => void;
}

export const FullSurahTafseerModal: React.FC<FullSurahTafseerModalProps> = ({
  isOpen,
  onClose,
  surahNumber,
  surahName,
  totalAyahsCount = 7,
  initialAyahs,
  onSelectAyahForDetails
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('muyassar');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number>(18);
  const [selectedAyahNumber, setSelectedAyahNumber] = useState<number | 'all'>('all');
  const [surahAyahs, setSurahAyahs] = useState<SurahAyahTafseer[]>(initialAyahs || []);
  const [loading, setLoading] = useState<boolean>(false);
  const [showSourcesPicker, setShowSourcesPicker] = useState<boolean>(false);

  // Fetch full surah ayahs & tafseer from API if not pre-seeded or if surah changes
  useEffect(() => {
    if (!isOpen) return;

    if (initialAyahs && initialAyahs.length > 0 && surahAyahs.length > 0 && surahAyahs[0]?.number === initialAyahs[0]?.number) {
      return;
    }

    setLoading(true);
    Promise.all([
      fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`).then(res => res.json()).catch(() => null),
      fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.muyassar`).then(res => res.json()).catch(() => null)
    ]).then(([uthmaniData, tafseerData]) => {
      if (uthmaniData?.data?.ayahs) {
        const tafseerMap: Record<number, string> = {};
        if (tafseerData?.data?.ayahs) {
          tafseerData.data.ayahs.forEach((a: any) => {
            tafseerMap[a.numberInSurah] = a.text;
          });
        }

        const mapped: SurahAyahTafseer[] = uthmaniData.data.ayahs.map((a: any) => {
          let cleanText = a.text;
          // Strip bismillah if needed for ayah 1
          if (a.numberInSurah === 1 && surahNumber !== 1 && surahNumber !== 9) {
            cleanText = cleanText.replace(/^(بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ|بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ)\s*/, '');
          }

          return {
            number: a.numberInSurah,
            text: cleanText,
            tafseer: tafseerMap[a.numberInSurah] || `تفسير الآية ${toArabicNumerals(a.numberInSurah)} من سورة ${surahName}`,
          };
        });

        setSurahAyahs(mapped);
      } else if (initialAyahs && initialAyahs.length > 0) {
        setSurahAyahs(initialAyahs);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [isOpen, surahNumber, surahName]);

  if (!isOpen) return null;

  const currentSourceObj = TRUSTED_TAFSEER_SOURCES.find(s => s.id === selectedSource) || TRUSTED_TAFSEER_SOURCES[0];

  // Filter ayahs by searchQuery and selectedAyahNumber
  const filteredAyahs = surahAyahs.filter((a) => {
    const matchesAyah = selectedAyahNumber === 'all' || a.number === selectedAyahNumber;
    const query = searchQuery.trim();
    if (!query) return matchesAyah;
    const matchesText = a.text.includes(query);
    const matchesTafseer = a.tafseer.includes(query);
    const matchesWord = a.wordMeanings?.some(wm => wm.word.includes(query) || wm.meaning.includes(query));
    return matchesAyah && (matchesText || matchesTafseer || matchesWord);
  });

  // Calculate occurrences of search term across the entire Surah Tafseer
  const countOccurrencesInTafseer = (query: string) => {
    if (!query.trim()) return 0;
    let count = 0;
    const q = query.trim().toLowerCase();
    surahAyahs.forEach(a => {
      const text = (a.tafseer + ' ' + a.text).toLowerCase();
      let pos = text.indexOf(q);
      while (pos !== -1) {
        count++;
        pos = text.indexOf(q, pos + q.length);
      }
    });
    return count;
  };

  const matchesCount = countOccurrencesInTafseer(searchQuery);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    playChime('click');
    triggerHaptic(20);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const quickKeywords = ['الرحمة', 'التوحيد', 'الصلاة', 'الإيمان', 'الجنة', 'الاستغفار', 'الصبر'];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center p-2.5 sm:p-4 pt-3 sm:pt-6 animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-[#14221D] w-full max-w-3xl rounded-3xl border-2 border-[#0F6B50]/50 dark:border-[#2DD4BF]/40 shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[91vh] my-0">
        
        {/* Modal Top Header Ribbon */}
        <div className="p-4 sm:p-5 border-b border-[#EAE3D2] dark:border-[#22362D] bg-[#FAF8F2] dark:bg-[#101B17] flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-[#1C2C25] flex items-center justify-center text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white hover:scale-105 active:scale-95 transition-all shadow-xs"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#0F6B50] dark:text-[#2DD4BF] border border-emerald-300/40">
                سورة رقم {toArabicNumerals(surahNumber)}
              </span>
              <h3 className="font-bold text-lg sm:text-xl text-[#19302A] dark:text-white font-amiri">
                تفسير سورة {surahName} كاملة
              </h3>
            </div>
            <span className="text-[11px] text-[#78887F] dark:text-[#8D9F95] block mt-0.5 font-medium">
              تصفح التفسير الشامل لجميع آيات السورة ({toArabicNumerals(surahAyahs.length || totalAyahsCount)} آية)
            </span>
          </div>
        </div>

        {/* Trusted Source Selector Banner */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-emerald-900 via-[#0F6B50] to-teal-800 text-white border-b border-[#0F6B50]/30 shrink-0 space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentSourceObj.icon}</span>
              <div className="text-right">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm sm:text-base">{currentSourceObj.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">
                    {currentSourceObj.badge}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100/90">{currentSourceObj.author}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowSourcesPicker(!showSourcesPicker);
                  playChime('click');
                }}
                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20"
              >
                <Layers className="w-3.5 h-3.5 text-amber-300" />
                <span>تغيير المصدر ({TRUSTED_TAFSEER_SOURCES.length} مصادر)</span>
                {showSourcesPicker ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <a
                href={currentSourceObj.getUrl(surahNumber, selectedAyahNumber === 'all' ? 1 : selectedAyahNumber)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playChime('click')}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                title="الانتقال للموقع الرسمي الموثوق"
              >
                <span>فتح بالموقع الرسمي</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Expanded Trusted Sources Selector Grid */}
          {showSourcesPicker && (
            <div className="pt-2 border-t border-white/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 animate-fadeIn">
              {TRUSTED_TAFSEER_SOURCES.map((src) => (
                <div
                  key={src.id}
                  onClick={() => {
                    setSelectedSource(src.id);
                    setShowSourcesPicker(false);
                    playChime('click');
                  }}
                  className={`p-2.5 rounded-xl cursor-pointer transition-all border text-right ${
                    selectedSource === src.id
                      ? 'bg-white text-[#0F6B50] border-amber-300 font-bold shadow-md'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-300 text-amber-950">
                      {src.badge}
                    </span>
                    <span className="text-xs font-bold flex items-center gap-1">
                      <span>{src.name}</span>
                      <span>{src.icon}</span>
                    </span>
                  </div>
                  <p className={`text-[10px] mt-1 line-clamp-1 ${selectedSource === src.id ? 'text-gray-700' : 'text-emerald-100'}`}>
                    {src.author}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Toolbar: Keyword Search Inside Current Tafsir & Quick Controls */}
        <div className="p-3.5 sm:p-4 bg-[#FDFBF7] dark:bg-[#13201B] border-b border-[#EAE3D2] dark:border-[#22362D] space-y-3 shrink-0">
          
          {/* Real-time Keyword Search Bar */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="ابحث عن كلمة أو موضوع محدد داخل تفسير السورة (مثال: الرحمة، التوحيد، الجنة)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-[#101A16] border-2 border-[#E5DDCF] dark:border-[#263D33] focus:border-[#0F6B50] dark:focus:border-[#2DD4BF] rounded-2xl py-2 pr-10 pl-9 text-xs sm:text-sm text-right text-[#19302A] dark:text-white outline-none shadow-xs font-medium"
                />
                <Search className="w-4 h-4 text-emerald-600 dark:text-[#2DD4BF] absolute right-3.5 top-3" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3 top-2.5 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-400"
                    title="مسح البحث"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Ayah Number Selector Dropdown */}
              <select
                value={selectedAyahNumber}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedAyahNumber(val === 'all' ? 'all' : Number(val));
                }}
                className="bg-white dark:bg-[#101A16] border-2 border-[#E5DDCF] dark:border-[#263D33] rounded-2xl py-2 px-3 text-xs text-right text-[#19302A] dark:text-white font-bold outline-none cursor-pointer shrink-0 shadow-xs"
              >
                <option value="all">كل الآيات ({surahAyahs.length})</option>
                {surahAyahs.map((a) => (
                  <option key={a.number} value={a.number}>
                    آية {toArabicNumerals(a.number)}
                  </option>
                ))}
              </select>

              {/* Font Zoom Controller */}
              <div className="flex items-center gap-1 bg-white dark:bg-[#101A16] p-1 rounded-2xl border-2 border-[#E5DDCF] dark:border-[#263D33] shrink-0">
                <button
                  onClick={() => setFontSize(Math.min(36, fontSize + 2))}
                  className="px-2 py-1 rounded-xl bg-[#F4F8F5] dark:bg-[#1C2C25] font-bold text-xs hover:text-[#0F6B50] shadow-xs"
                  title="تكبير الخط"
                >
                  أ+
                </button>
                <button
                  onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                  className="px-2 py-1 rounded-xl bg-[#F4F8F5] dark:bg-[#1C2C25] font-bold text-xs hover:text-[#0F6B50] shadow-xs"
                  title="تصغير الخط"
                >
                  أ-
                </button>
              </div>
            </div>

            {/* Keyword match indicator & quick tag chips */}
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">كلمات سريعة:</span>
                {quickKeywords.map((kw) => (
                  <button
                    key={kw}
                    onClick={() => {
                      setSearchQuery(kw);
                      playChime('click');
                    }}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all border ${
                      searchQuery === kw
                        ? 'bg-[#0F6B50] text-white border-[#0F6B50]'
                        : 'bg-white dark:bg-[#16251F] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-[#0F6B50]'
                    }`}
                  >
                    {kw}
                  </button>
                ))}
              </div>

              {searchQuery && (
                <span className="font-bold text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300/40">
                  {matchesCount > 0 ? `تكررت كلمة "${searchQuery}" (${toArabicNumerals(matchesCount)}) مرة` : 'لا توجد نتائج لمصطلح البحث'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Ayahs & Tafseer Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 text-right space-y-4 pb-8">
          {loading ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#0F6B50] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-gray-500">جاري تحميل التفسير الكامل لجميع آيات سورة {surahName}...</p>
            </div>
          ) : filteredAyahs.length === 0 ? (
            <div className="p-8 text-center bg-[#FAF8F2] dark:bg-[#101A16] rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 text-xs">
              لم يتم العثور على أية نتائج تطابق بحثك عن &quot;{searchQuery}&quot; في تفسير سورة {surahName}
            </div>
          ) : (
            filteredAyahs.map((item) => {
              const copyKey = `surah_full:${surahNumber}:${item.number}`;
              const isCopied = copiedKey === copyKey;

              return (
                <div
                  key={item.number}
                  id={`full-tafseer-ayah-${item.number}`}
                  className="p-4 sm:p-5 rounded-3xl bg-[#FAF8F2] dark:bg-[#162720] border-2 border-[#E7DFC8] dark:border-[#273B32] shadow-xs space-y-3.5 transition-all hover:border-[#0F6B50]"
                >
                  {/* Card Header Ribbon */}
                  <div className="flex items-center justify-between border-b border-[#EBE3D3] dark:border-[#24392F] pb-2.5 flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopy(`﴿ ${item.text} ﴾\nالتفسير الميسر: ${item.tafseer}`, copyKey)}
                        className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#101A16] text-gray-700 dark:text-gray-300 hover:text-[#0F6B50] text-xs font-bold flex items-center gap-1 transition-all border border-gray-200 dark:border-gray-800"
                        title="نسخ الآية والتفسير"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'تم النسخ' : 'نسخ'}</span>
                      </button>

                      {onSelectAyahForDetails && (
                        <button
                          onClick={() => {
                            onSelectAyahForDetails(surahNumber, surahName, item.number, item.text, item.tafseer);
                            playChime('click');
                          }}
                          className="px-2.5 py-1 rounded-xl bg-[#0F6B50] hover:bg-[#138061] text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-all"
                          title="تفاصيل الآية، أسباب النزول، وتصحيح التلاوة بالذكاء الاصطناعي"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>تفسير ابن كثير وتلاوة AI</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#0F6B50] dark:text-[#2DD4BF] border border-emerald-300/40">
                        الآية {toArabicNumerals(item.number)}
                      </span>
                      <span className="font-bold text-xs text-[#7A877B] dark:text-gray-300">
                        سورة {surahName}
                      </span>
                    </div>
                  </div>

                  {/* Ayah Quranic Text Display with Search Highlight */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-[#D4AF37]/40 text-center relative overflow-hidden">
                    <p 
                      className="font-quran leading-[2.4] text-black dark:text-white font-bold px-2 break-words"
                      style={{ fontSize: `${fontSize + 4}px` }}
                    >
                      ﴿ <HighlightedText text={cleanQuranText(item.text)} highlight={searchQuery} /> ﴾
                    </p>
                  </div>

                  {/* Tafseer Content with Live Keyword Highlight */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#0F6B50] dark:text-[#2DD4BF]">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" />
                        <span>تفسير الآية ({currentSourceObj.name}):</span>
                      </span>
                    </div>

                    <div 
                      className="p-4 rounded-2xl bg-white dark:bg-[#121E19] border border-[#E5DDCF] dark:border-[#22362D] leading-relaxed text-[#273B32] dark:text-gray-100 shadow-xs break-words"
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      <p className="whitespace-pre-line leading-loose">
                        <HighlightedText text={item.tafseer} highlight={searchQuery} />
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Ribbon */}
        <div className="p-3.5 bg-[#FAF8F2] dark:bg-[#101B17] border-t border-[#EAE3D2] dark:border-[#22362D] flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#0F6B50] hover:bg-[#138061] text-white font-bold transition-all text-xs"
          >
            إغلاق
          </button>
          <span>تفسير سورة {surahName} كاملة من المراجع الإسلامية المعتمدة</span>
        </div>
      </div>
    </div>
  );
};

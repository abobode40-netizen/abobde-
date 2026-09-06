import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  Layers, 
  Copy, 
  Check, 
  Sparkles, 
  Volume2, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Search,
  Maximize2,
  Minimize2,
  CheckCircle2,
  FileText,
  ExternalLink,
  BookMarked,
  Loader2
} from 'lucide-react';
import { toArabicNumerals } from '../data/quranData';
import { playChime, triggerHaptic } from '../utils/audio';
import { cleanQuranText } from '../utils/quranText';
import { FullSurahTafseerModal, HighlightedText, TRUSTED_TAFSEER_SOURCES } from './FullSurahTafseerModal';
import { TAFSEER_SOURCES, TafseerSourceId, fetchAyahTafseer } from '../utils/tafseerService';

interface AyahData {
  number: number;
  text: string;
  tafseer: string;
  wordMeanings: { word: string; meaning: string }[];
}

interface SurahGroup {
  number: number;
  name: string;
  bismillah?: string;
  ayahs: AyahData[];
}

interface PageTafseerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageNumber: number;
  surahName: string;
  juzNumber: number;
  pageAyahs: SurahGroup[];
  onSelectAyahForDetails: (surahNumber: number, surahName: string, ayahNumber: number, ayahText: string, defaultTafseer?: string) => void;
}

type TabType = 'meanings' | 'tafseer' | 'combined';

export const PageTafseerModal: React.FC<PageTafseerModalProps> = ({
  isOpen,
  onClose,
  pageNumber,
  surahName,
  juzNumber,
  pageAyahs,
  onSelectAyahForDetails,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('combined');
  const [selectedTafseerSource, setSelectedTafseerSource] = useState<TafseerSourceId>('ibn_kathir');
  const [customTafseerMap, setCustomTafseerMap] = useState<Record<string, string>>({});
  const [loadingTafseerMap, setLoadingTafseerMap] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(18);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedAyahFilter, setSelectedAyahFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFullSurahModal, setShowFullSurahModal] = useState<boolean>(false);
  const [targetSurahInfo, setTargetSurahInfo] = useState<{ number: number; name: string }>({
    number: pageAyahs[0]?.number || 1,
    name: pageAyahs[0]?.name || surahName
  });

  // Flatten all ayahs of this page
  const allPageAyahs: { surahName: string; surahNumber: number; ayah: AyahData }[] = [];
  pageAyahs.forEach((surah) => {
    surah.ayahs.forEach((ayah) => {
      allPageAyahs.push({
        surahName: surah.name,
        surahNumber: surah.number,
        ayah,
      });
    });
  });

  // Fetch Tafseers when source changes or modal opens
  useEffect(() => {
    let isMounted = true;
    if (isOpen && selectedTafseerSource !== 'muyassar') {
      setLoadingTafseerMap(true);
      const promises = allPageAyahs.map(item => 
        fetchAyahTafseer(selectedTafseerSource, item.surahNumber, item.ayah.number, item.ayah.tafseer)
          .then(text => ({ key: `${item.surahNumber}:${item.ayah.number}`, text }))
      );

      Promise.all(promises).then(results => {
        if (isMounted) {
          const map: Record<string, string> = {};
          results.forEach(r => {
            map[r.key] = r.text;
          });
          setCustomTafseerMap(map);
          setLoadingTafseerMap(false);
        }
      }).catch(() => {
        if (isMounted) setLoadingTafseerMap(false);
      });
    } else {
      setLoadingTafseerMap(false);
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedTafseerSource, pageNumber]);

  if (!isOpen) return null;

  // Calculate total words with meanings
  const totalMeaningsCount = allPageAyahs.reduce((sum, item) => sum + (item.ayah.wordMeanings?.length || 0), 0);

  // Filter ayahs by selection and search query
  const filteredAyahs = allPageAyahs.filter((item) => {
    const matchesAyah = selectedAyahFilter === 'all' || item.ayah.number === selectedAyahFilter;
    const query = searchQuery.trim();
    if (!query) return matchesAyah;
    const matchesText = item.ayah.text.includes(query);
    const matchesTafseer = item.ayah.tafseer.includes(query);
    const matchesWords = item.ayah.wordMeanings?.some(
      (wm) => wm.word.includes(query) || wm.meaning.includes(query)
    );
    return matchesAyah && (matchesText || matchesTafseer || matchesWords);
  });

  // Calculate occurrences of search term across page's Tafseer & Ayahs
  const calculateMatchesCount = (query: string) => {
    if (!query.trim()) return 0;
    let count = 0;
    const q = query.trim().toLowerCase();
    allPageAyahs.forEach(item => {
      const text = (item.ayah.tafseer + ' ' + item.ayah.text).toLowerCase();
      let pos = text.indexOf(q);
      while (pos !== -1) {
        count++;
        pos = text.indexOf(q, pos + q.length);
      }
    });
    return count;
  };

  const matchesCount = calculateMatchesCount(searchQuery);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    playChime('click');
    triggerHaptic(20);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const primarySurahNum = pageAyahs[0]?.number || 1;
  const primarySurahName = pageAyahs[0]?.name || surahName;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-start justify-center p-2.5 sm:p-4 pt-3 sm:pt-6 animate-fadeIn overflow-y-auto">
        <div className="bg-white dark:bg-[#14221D] w-full max-w-2xl rounded-3xl border-2 border-[#0F6B50]/40 dark:border-[#2DD4BF]/40 shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh] my-0">
          
          {/* Top Header Ribbon */}
          <div className="p-4 sm:p-5 border-b border-[#EAE3D2] dark:border-[#22362D] bg-[#FAF8F2] dark:bg-[#101B17] flex items-center justify-between shrink-0">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-[#1C2C25] flex items-center justify-center text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white hover:scale-105 active:scale-95 transition-all shadow-xs"
              aria-label="إغلاق النافذة"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#0F6B50] dark:text-[#2DD4BF] border border-emerald-300/40">
                  صفحة {toArabicNumerals(pageNumber)} • الجزء {toArabicNumerals(juzNumber)}
                </span>
                <h3 className="font-bold text-base sm:text-lg text-[#19302A] dark:text-white font-amiri">
                  معاني الكلمات والتفسير الميسر
                </h3>
              </div>
              <span className="text-[11px] text-[#78887F] dark:text-[#8D9F95] block mt-0.5 font-medium">
                سورة {surahName} ({toArabicNumerals(allPageAyahs.length)} آيات • {toArabicNumerals(totalMeaningsCount)} كلمة مشروحة)
              </span>
            </div>
          </div>

          {/* Interactive Banner: Navigate Directly to Full Surah Tafsir */}
          <div className="p-3 bg-gradient-to-r from-[#0F6B50] via-teal-700 to-[#125A44] text-white flex items-center justify-between flex-wrap gap-2 shrink-0 border-b border-[#0F6B50]/30 shadow-xs">
            <div className="flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-amber-300 shrink-0" />
              <div className="text-right">
                <span className="font-bold text-xs sm:text-sm block">الانتقال لتفسير سورة {primarySurahName} كاملة</span>
                <span className="text-[10px] text-emerald-100/90">تصفح التفسير الشامل والمصادر الموثوقة للسورة كاملة</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setTargetSurahInfo({ number: primarySurahNum, name: primarySurahName });
                  setShowFullSurahModal(true);
                  playChime('click');
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>تفسير السورة كاملة</span>
              </button>

              <a
                href={TRUSTED_TAFSEER_SOURCES[0].getUrl(primarySurahNum)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playChime('click')}
                className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1 border border-white/20 transition-all"
                title="فتح بموقع مجمع الملك فهد"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Action & Filter Toolbar */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-b from-[#FDFBF7] to-white dark:from-[#13201B] dark:to-[#16251F] border-b border-[#EAE3D2] dark:border-[#22362D] space-y-3 shrink-0">
            
            {/* Top Row: Font controls & Tab Switcher */}
            <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
              {/* Tab switchers */}
              <div className="flex items-center bg-[#F2EDE2] dark:bg-[#101A16] p-1 rounded-2xl border border-[#E5DDCF] dark:border-[#263D33] text-xs font-bold w-full sm:w-auto">
                <button
                  onClick={() => {
                    setActiveTab('combined');
                    playChime('click');
                  }}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'combined'
                      ? 'bg-[#0F6B50] text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-300 hover:text-[#0F6B50]'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>الكل (شامل)</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('meanings');
                    playChime('click');
                  }}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'meanings'
                      ? 'bg-[#0F6B50] text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-300 hover:text-[#0F6B50]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>المفردات ({toArabicNumerals(totalMeaningsCount)})</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('tafseer');
                    playChime('click');
                  }}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'tafseer'
                      ? 'bg-[#0F6B50] text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-300 hover:text-[#0F6B50]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>التفسير والبيان</span>
                </button>
              </div>

              {/* Font Zoom Controller */}
              <div className="flex items-center gap-1.5 bg-[#F4F8F5] dark:bg-[#1C2C25] p-1.5 rounded-2xl border border-[#E5DDCF] dark:border-[#263D33] shrink-0">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 px-1">حجم الخط:</span>
                <button
                  onClick={() => setFontSize(Math.min(36, fontSize + 2))}
                  className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#13201B] font-bold text-xs hover:text-[#0F6B50] dark:hover:text-[#2DD4BF] flex items-center justify-center shadow-xs border border-gray-200 dark:border-gray-800"
                  title="تكبير الخط"
                >
                  أ+
                </button>
                <span className="text-xs font-bold text-[#0F6B50] dark:text-[#2DD4BF] min-w-[20px] text-center">
                  {toArabicNumerals(fontSize)}
                </span>
                <button
                  onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                  className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#13201B] font-bold text-xs hover:text-[#0F6B50] dark:hover:text-[#2DD4BF] flex items-center justify-center shadow-xs border border-gray-200 dark:border-gray-800"
                  title="تصغير الخط"
                >
                  أ-
                </button>
              </div>
            </div>

            {/* Tafseer Source Picker (Ibn Kathir, Al-Muyassar, Saadi, Mukhtasar) */}
            <div className="p-2.5 rounded-2xl bg-[#FAF8F2] dark:bg-[#101A16] border border-[#E5DDCF] dark:border-[#263D33] flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-[#19302A] dark:text-emerald-300">كتاب التفسير:</span>
              </div>
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 max-w-full">
                {TAFSEER_SOURCES.map(source => (
                  <button
                    key={source.id}
                    onClick={() => {
                      setSelectedTafseerSource(source.id);
                      playChime('click');
                      triggerHaptic(20);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                      selectedTafseerSource === source.id
                        ? 'bg-[#0F6B50] text-white border-[#0F6B50] shadow-xs'
                        : 'bg-white dark:bg-[#15231D] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-emerald-500'
                    }`}
                  >
                    {source.shortName}
                  </button>
                ))}
              </div>
            </div>

            {/* Search & Ayah Quick Filter Bar with Real-time Keyword Highlight */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="ابحث عن كلمة معينة داخل التفسير الحالي (مثال: الرحمة، الصلاة)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#FAF8F2] dark:bg-[#101A16] border-2 border-[#E5DDCF] dark:border-[#263D33] focus:border-[#0F6B50] rounded-xl py-2 pr-9 pl-8 text-xs text-right text-[#19302A] dark:text-white outline-none font-medium"
                  />
                  <Search className="w-4 h-4 text-emerald-600 dark:text-[#2DD4BF] absolute right-3 top-2.5" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute left-2.5 top-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-400"
                      title="مسح البحث"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Quick Ayah Selector */}
                <select
                  value={selectedAyahFilter}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedAyahFilter(val === 'all' ? 'all' : Number(val));
                  }}
                  className="bg-[#FAF8F2] dark:bg-[#101A16] border-2 border-[#E5DDCF] dark:border-[#263D33] rounded-xl py-2 px-2.5 text-xs text-right text-[#19302A] dark:text-white font-bold outline-none cursor-pointer"
                >
                  <option value="all">جميع الآيات ({allPageAyahs.length})</option>
                  {allPageAyahs.map((item) => (
                    <option key={item.ayah.number} value={item.ayah.number}>
                      الآية {toArabicNumerals(item.ayah.number)}
                    </option>
                  ))}
                </select>
              </div>

              {searchQuery && (
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="font-bold text-[#0F6B50] dark:text-[#2DD4BF]">
                    {matchesCount > 0
                      ? `تم العثور على (${toArabicNumerals(matchesCount)}) تكرار لكلمة "${searchQuery}" داخل النص والتفسير`
                      : `لا توجد نتائج تطابق "${searchQuery}"`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Scrollable Ayahs & Meanings Content */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 text-right space-y-4 pb-8">
            {filteredAyahs.length === 0 ? (
              <div className="p-8 text-center bg-[#FAF8F2] dark:bg-[#101A16] rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 text-xs">
                لم يتم العثور على نتائج مطابقة لبحثك عن &quot;{searchQuery}&quot; في هذه الصفحة
              </div>
            ) : (
              filteredAyahs.map((item) => {
                const { ayah, surahName: sName, surahNumber: sNum } = item;
                const copyKey = `full:${sName}:${ayah.number}`;
                const isCopied = copiedKey === copyKey;

                return (
                  <div
                    key={ayah.number}
                    id={`modal-ayah-${ayah.number}`}
                    className="p-4 sm:p-5 rounded-3xl bg-[#FAF8F2] dark:bg-[#162720] border-2 border-[#E7DFC8] dark:border-[#273B32] shadow-xs space-y-3.5 transition-all hover:border-[#0F6B50]/60"
                  >
                    {/* Card Top Ribbon */}
                    <div className="flex items-center justify-between border-b border-[#EBE3D3] dark:border-[#24392F] pb-2.5 flex-wrap gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopy(`﴿ ${ayah.text} ﴾\nالتفسير الميسر: ${ayah.tafseer}`, copyKey)}
                          className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#101A16] text-gray-700 dark:text-gray-300 hover:text-[#0F6B50] text-xs font-bold flex items-center gap-1 transition-all border border-gray-200 dark:border-gray-800"
                          title="نسخ الآية والتفسير"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? 'تم النسخ' : 'نسخ'}</span>
                        </button>

                        <button
                          onClick={() => {
                            onSelectAyahForDetails(sNum, sName, ayah.number, ayah.text, ayah.tafseer);
                            playChime('click');
                          }}
                          className="px-2.5 py-1 rounded-xl bg-[#0F6B50] hover:bg-[#138061] text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-all"
                          title="فتح تفسير ابن كثير وأسباب النزول وتصحيح التلاوة بالذكاء الاصطناعي"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>تفسير وبيان الآية</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#0F6B50] dark:text-[#2DD4BF] border border-emerald-300/40">
                          الآية {toArabicNumerals(ayah.number)}
                        </span>
                        <span className="font-bold text-xs text-[#7A877B] dark:text-gray-300">
                          سورة {sName}
                        </span>
                      </div>
                    </div>

                    {/* Ayah Quranic Text with Highlight */}
                    <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-[#D4AF37]/40 text-center relative overflow-hidden">
                      <p 
                        className="font-quran leading-[2.4] text-black dark:text-white font-bold px-2 break-words"
                        style={{ fontSize: `${fontSize + 4}px` }}
                      >
                        ﴿ <HighlightedText text={cleanQuranText(ayah.text)} highlight={searchQuery} /> ﴾
                      </p>
                    </div>

                    {/* Section 1: Word Meanings (if tab is combined or meanings) */}
                    {(activeTab === 'combined' || activeTab === 'meanings') && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-xs font-bold text-[#B45309] dark:text-amber-300">
                          <span className="flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-amber-500" />
                            <span>معاني الكلمات وغريب الألفاظ ({toArabicNumerals(ayah.wordMeanings?.length || 0)} كلمات):</span>
                          </span>
                        </div>

                        {ayah.wordMeanings && ayah.wordMeanings.length > 0 ? (
                          <div className="space-y-2">
                            {ayah.wordMeanings.map((wm, wIdx) => (
                              <div 
                                key={wIdx}
                                className="p-3.5 rounded-2xl bg-white dark:bg-[#121E19] border border-[#E5DDCF] dark:border-[#22362D] space-y-1.5 shadow-xs"
                              >
                                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-1.5">
                                  <span className="text-[11px] font-bold text-[#8A743F] dark:text-amber-400">
                                    مفردة #{toArabicNumerals(wIdx + 1)}
                                  </span>
                                  <span 
                                    className="font-quran font-bold text-[#0F6B50] dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 px-3 py-1 rounded-xl border border-amber-300/40"
                                    style={{ fontSize: `${fontSize + 2}px` }}
                                  >
                                    <HighlightedText text={wm.word} highlight={searchQuery} />
                                  </span>
                                </div>
                                <div 
                                  className="text-right text-[#3B4E45] dark:text-gray-100 leading-relaxed font-medium pt-1 break-words"
                                  style={{ fontSize: `${fontSize}px` }}
                                >
                                  <HighlightedText text={wm.meaning} highlight={searchQuery} />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111C18] text-xs text-gray-500 text-center border border-gray-200 dark:border-gray-800">
                            ألفاظ الآية واضحة ومبينة في سياق التفسير الميسر أدناه
                          </div>
                        )}
                      </div>
                    )}

                    {/* Section 2: Tafseer (Ibn Kathir, Al-Muyassar, Saadi, Mukhtasar) */}
                    {(activeTab === 'combined' || activeTab === 'tafseer') && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-xs font-bold text-[#0F6B50] dark:text-[#2DD4BF]">
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <span>{TAFSEER_SOURCES.find(s => s.id === selectedTafseerSource)?.name || 'التفسير وبيان المعنى'}:</span>
                          </span>
                          <span className="text-[10px] text-gray-500 font-normal">
                            {TAFSEER_SOURCES.find(s => s.id === selectedTafseerSource)?.author}
                          </span>
                        </div>

                        <div 
                          className="p-4 rounded-2xl bg-white dark:bg-[#121E19] border border-[#E5DDCF] dark:border-[#22362D] leading-relaxed text-[#273B32] dark:text-gray-100 shadow-xs break-words"
                          style={{ fontSize: `${fontSize}px` }}
                        >
                          {loadingTafseerMap && !customTafseerMap[`${sNum}:${ayah.number}`] && selectedTafseerSource !== 'muyassar' ? (
                            <div className="py-4 text-center text-gray-400 flex items-center justify-center gap-2 text-xs">
                              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                              <span>جارٍ تحميل تفسير {TAFSEER_SOURCES.find(s => s.id === selectedTafseerSource)?.shortName}...</span>
                            </div>
                          ) : (
                            <p className="whitespace-pre-line leading-loose">
                              <HighlightedText 
                                text={selectedTafseerSource === 'muyassar' ? ayah.tafseer : (customTafseerMap[`${sNum}:${ayah.number}`] || ayah.tafseer)} 
                                highlight={searchQuery} 
                              />
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Ribbon */}
          <div className="p-3 sm:p-4 bg-[#FAF8F2] dark:bg-[#101B17] border-t border-[#EAE3D2] dark:border-[#22362D] flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#0F6B50] hover:bg-[#138061] text-white font-bold transition-all text-xs"
            >
              العودة إلى المصحف
            </button>
            <span>تفسير ومعاني صفحة {toArabicNumerals(pageNumber)} من المصحف الشريف</span>
          </div>
        </div>
      </div>

      {/* Full Surah Tafseer Sub-Modal */}
      {showFullSurahModal && (
        <FullSurahTafseerModal
          isOpen={showFullSurahModal}
          onClose={() => setShowFullSurahModal(false)}
          surahNumber={targetSurahInfo.number}
          surahName={targetSurahInfo.name}
          onSelectAyahForDetails={onSelectAyahForDetails}
        />
      )}
    </>
  );
};

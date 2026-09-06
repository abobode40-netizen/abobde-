import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  Lightbulb, 
  FileText, 
  Layers, 
  Compass, 
  CheckCircle2, 
  Copy, 
  Check, 
  Search, 
  ExternalLink, 
  BookMarked,
  Loader2
} from 'lucide-react';
import { 
  getAyahFullInsights, 
  AyahFullInsight 
} from '../data/ayahInsightsData';
import { toArabicNumerals } from '../data/quranData';
import { ReciterId } from '../types';
import { playChime, triggerHaptic } from '../utils/audio';
import { cleanQuranText } from '../utils/quranText';
import { FullSurahTafseerModal, HighlightedText, TRUSTED_TAFSEER_SOURCES } from './FullSurahTafseerModal';
import { TAFSEER_SOURCES, TafseerSourceId, fetchAyahTafseer } from '../utils/tafseerService';

interface AyahDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  ayahText: string;
  defaultTafseer?: string;
  isAyahBookmarked?: boolean;
  onToggleAyahBookmark?: () => void;
}

type ModalTab = 'ibn_kathir' | 'word_meanings' | 'asbab_nuzul' | 'tadabbur';

export const AyahDetailsModal: React.FC<AyahDetailsModalProps> = ({
  isOpen,
  onClose,
  surahNumber,
  surahName,
  ayahNumber,
  ayahText,
  defaultTafseer,
  isAyahBookmarked,
  onToggleAyahBookmark
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('ibn_kathir');
  const [copied, setCopied] = useState(false);
  const [modalFontSize, setModalFontSize] = useState<number>(18);
  const [tafseerSearchQuery, setTafseerSearchQuery] = useState('');
  const [showFullSurahModal, setShowFullSurahModal] = useState(false);

  // Tafseer Source Selection (Ibn Kathir, Muyassar, Sa'di, Mukhtasar)
  const [selectedTafseerSource, setSelectedTafseerSource] = useState<TafseerSourceId>('ibn_kathir');
  const [currentTafseerContent, setCurrentTafseerContent] = useState<string>('');
  const [isLoadingTafseer, setIsLoadingTafseer] = useState<boolean>(false);

  // Audio for Ayah playback
  const [selectedAyahReciter, setSelectedAyahReciter] = useState<ReciterId>('alafasy');
  const [ayahPlaybackSpeed, setAyahPlaybackSpeed] = useState<number>(1);
  const [isRepeatAyah, setIsRepeatAyah] = useState<boolean>(false);
  const [isPlayingAyah, setIsPlayingAyah] = useState(false);
  const ayahAudioRef = useRef<HTMLAudioElement | null>(null);

  const insights: AyahFullInsight = getAyahFullInsights(
    surahNumber,
    surahName,
    ayahNumber,
    ayahText,
    selectedAyahReciter,
    defaultTafseer
  );

  // Fetch or update Tafseer content whenever source or ayah changes
  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      setIsLoadingTafseer(true);
      fetchAyahTafseer(
        selectedTafseerSource,
        surahNumber,
        ayahNumber,
        selectedTafseerSource === 'ibn_kathir' ? insights.ibnKathirTafseer : defaultTafseer
      )
        .then((text) => {
          if (isMounted) {
            setCurrentTafseerContent(text || insights.ibnKathirTafseer);
            setIsLoadingTafseer(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setCurrentTafseerContent(insights.ibnKathirTafseer);
            setIsLoadingTafseer(false);
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedTafseerSource, surahNumber, ayahNumber]);

  // Reset states when ayah changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('ibn_kathir');
      setIsPlayingAyah(false);
    }
    return () => {
      if (ayahAudioRef.current) {
        ayahAudioRef.current.pause();
      }
    };
  }, [isOpen, surahNumber, ayahNumber]);

  const handleCopyAyah = () => {
    navigator.clipboard.writeText(`﴿ ${cleanQuranText(ayahText)} ﴾ [سورة ${surahName}: ${ayahNumber}]`);
    setCopied(true);
    playChime('click');
    setTimeout(() => setCopied(false), 2000);
  };

  // Ayah Audio Toggle
  const togglePlayAyah = () => {
    if (!ayahAudioRef.current) return;
    if (isPlayingAyah) {
      ayahAudioRef.current.pause();
      setIsPlayingAyah(false);
    } else {
      ayahAudioRef.current.playbackRate = ayahPlaybackSpeed;
      ayahAudioRef.current.currentTime = 0;
      ayahAudioRef.current.play()
        .then(() => setIsPlayingAyah(true))
        .catch(() => setIsPlayingAyah(false));
    }
  };

  const handleSpeedToggle = () => {
    const speeds = [0.75, 1, 1.25];
    const nextIdx = (speeds.indexOf(ayahPlaybackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setAyahPlaybackSpeed(nextSpeed);
    if (ayahAudioRef.current) {
      ayahAudioRef.current.playbackRate = nextSpeed;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start justify-center p-2.5 sm:p-4 pt-3 sm:pt-6 animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-[#14221D] w-full max-w-xl rounded-3xl border border-[#E5DDCF] dark:border-[#263D33] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] my-0">
        
        {/* Header Ribbon */}
        <div className="p-4 sm:p-5 border-b border-[#EAE3D2] dark:border-[#22362D] bg-[#FAF8F2] dark:bg-[#111C18] flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-[#1C2C25] flex items-center justify-center text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white hover:scale-105 active:scale-95 transition-all"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#0F6B50] dark:text-[#2DD4BF]">
                الآية {toArabicNumerals(ayahNumber)}
              </span>
              <h3 className="font-bold text-base text-[#19302A] dark:text-white font-amiri">
                سورة {surahName}
              </h3>
            </div>
            <span className="text-[11px] text-[#78887F] dark:text-[#8D9F95] block mt-0.5">
              بيان وتفسير ابن كثير، معاني الكلمات، وأسباب النزول والتدبر
            </span>
          </div>
        </div>

        {/* 4 Distinct Navigation Tabs (Pinned at top below header) */}
        <div className="flex border-b border-[#EAE3D2] dark:border-[#22362D] bg-[#F7F4EC] dark:bg-[#111C18] overflow-x-auto no-scrollbar px-2 pt-2 shrink-0">
          {/* Tab 1: Ibn Kathir */}
          <button
            onClick={() => {
              setActiveTab('ibn_kathir');
              playChime('click');
            }}
            className={`px-3 py-2.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'ibn_kathir'
                ? 'border-[#0F6B50] text-[#0F6B50] dark:border-[#2DD4BF] dark:text-[#2DD4BF] bg-white dark:bg-[#14221D] rounded-t-xl'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>تفسير ابن كثير والبيان</span>
          </button>

          {/* Tab 2: Word Meanings */}
          <button
            onClick={() => {
              setActiveTab('word_meanings');
              playChime('click');
            }}
            className={`px-3 py-2.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'word_meanings'
                ? 'border-[#0F6B50] text-[#0F6B50] dark:border-[#2DD4BF] dark:text-[#2DD4BF] bg-white dark:bg-[#14221D] rounded-t-xl'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>معاني الكلمات ({insights.wordMeanings.length})</span>
          </button>

          {/* Tab 3: Asbab al-Nuzul */}
          <button
            onClick={() => {
              setActiveTab('asbab_nuzul');
              playChime('click');
            }}
            className={`px-3 py-2.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'asbab_nuzul'
                ? 'border-[#0F6B50] text-[#0F6B50] dark:border-[#2DD4BF] dark:text-[#2DD4BF] bg-white dark:bg-[#14221D] rounded-t-xl'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>أسباب النزول</span>
          </button>

          {/* Tab 4: Tadabbur */}
          <button
            onClick={() => {
              setActiveTab('tadabbur');
              playChime('click');
            }}
            className={`px-3 py-2.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'tadabbur'
                ? 'border-[#0F6B50] text-[#0F6B50] dark:border-[#2DD4BF] dark:text-[#2DD4BF] bg-white dark:bg-[#14221D] rounded-t-xl'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>وقفات وتدبر</span>
          </button>
        </div>

        {/* Scrollable Unified Modal Body (Ayah Card + Tab Content scrollable together up & down) */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5 text-right space-y-4 pb-8">
          
          {/* Ayah Card Display with Font Resizer */}
          <div className="p-4 sm:p-5 bg-gradient-to-b from-[#FDFBF7] to-white dark:from-[#13201B] dark:to-[#16251F] border-2 border-[#EAE3D2] dark:border-[#22362D] rounded-3xl shadow-xs space-y-3">
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-[#D4AF37]/40 text-center relative max-h-64 overflow-y-auto">
              <div className="absolute top-1 right-2 text-amber-500/20 text-4xl select-none font-serif">❝</div>
              <p 
                className="font-quran leading-[2.4] text-black dark:text-white font-bold px-2 break-words"
                style={{ fontSize: `${modalFontSize + 4}px` }}
              >
                ﴿ {cleanQuranText(ayahText)} ﴾
              </p>
              <div className="absolute bottom-1 left-2 text-amber-500/20 text-4xl select-none font-serif">❞</div>
            </div>

            {/* Sheikh Audio Controls & Reciter Selector */}
            <div className="p-2.5 rounded-2xl bg-[#F8FAF9] dark:bg-[#15231D] border border-emerald-500/20 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Listen to Ayah Audio */}
                  <button
                    onClick={togglePlayAyah}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 ${
                      isPlayingAyah
                        ? 'bg-amber-500 text-white ring-2 ring-amber-400/50 animate-pulse'
                        : 'bg-[#0F6B50] hover:bg-[#138061] text-white'
                    }`}
                  >
                    {isPlayingAyah ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isPlayingAyah ? 'إيقاف التلاوة' : 'استمع لتلاوة الشيخ'}</span>
                  </button>

                  {/* Playback Speed */}
                  <button
                    onClick={handleSpeedToggle}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#1B2D26] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold hover:border-emerald-500 transition-all"
                    title="سرعة التلاوة"
                  >
                    {ayahPlaybackSpeed}x
                  </button>

                  {/* Repeat Ayah */}
                  <button
                    onClick={() => {
                      setIsRepeatAyah(!isRepeatAyah);
                      playChime('click');
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                      isRepeatAyah
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-500'
                        : 'bg-white dark:bg-[#1B2D26] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                    }`}
                    title="تكرار الآية للحفظ والتدبر"
                  >
                    <RotateCcw className={`w-3 h-3 ${isRepeatAyah ? 'animate-spin' : ''}`} />
                    <span>{isRepeatAyah ? 'تكرار مستمر' : 'تكرار'}</span>
                  </button>

                  <audio
                    ref={ayahAudioRef}
                    src={insights.audioUrl}
                    onEnded={() => {
                      if (isRepeatAyah && ayahAudioRef.current) {
                        ayahAudioRef.current.currentTime = 0;
                        ayahAudioRef.current.play().catch(() => setIsPlayingAyah(false));
                      } else {
                        setIsPlayingAyah(false);
                      }
                    }}
                    onError={() => setIsPlayingAyah(false)}
                  />

                  {/* Copy Ayah */}
                  <button
                    onClick={handleCopyAyah}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#1B2D26] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-[#0F6B50] dark:hover:text-[#2DD4BF] text-xs font-bold flex items-center gap-1 transition-all"
                    title="نسخ الآية الكريمة"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                </div>

                {/* In-Modal Font Resizer */}
                <div className="flex items-center gap-1 bg-white dark:bg-[#1B2D26] p-1 rounded-xl border border-gray-200 dark:border-gray-700">
                  <span className="text-[10px] text-gray-500 font-bold px-1">الخط:</span>
                  <button
                    onClick={() => setModalFontSize(Math.min(34, modalFontSize + 2))}
                    className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-[#13201B] font-bold text-xs hover:text-[#0F6B50] flex items-center justify-center"
                    title="تكبير الخط"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setModalFontSize(Math.max(14, modalFontSize - 2))}
                    className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-[#13201B] font-bold text-xs hover:text-[#0F6B50] flex items-center justify-center"
                    title="تصغير الخط"
                  >
                    -
                  </button>
                </div>
              </div>

              {/* Reciter Selector Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none text-[11px]">
                <span className="text-[10px] text-gray-500 font-bold shrink-0">القارئ:</span>
                {[
                  { id: 'alafasy' as ReciterId, name: 'مشاري العفاسي' },
                  { id: 'hussary' as ReciterId, name: 'الحصري (المعلم)' },
                  { id: 'minshawi' as ReciterId, name: 'المنشاوي (مرتل)' },
                  { id: 'abdulbasit' as ReciterId, name: 'عبد الباسط' },
                  { id: 'ghamadi' as ReciterId, name: 'سعد الغامدي' },
                  { id: 'muaiqly' as ReciterId, name: 'ماهر المعيقلي' }
                ].map((rec) => (
                  <button
                    key={rec.id}
                    onClick={() => {
                      setSelectedAyahReciter(rec.id);
                      setIsPlayingAyah(false);
                      playChime('click');
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
                      selectedAyahReciter === rec.id
                        ? 'bg-[#0F6B50] text-white shadow-xs'
                        : 'bg-white dark:bg-[#1A2C25] text-gray-600 dark:text-gray-400 hover:text-emerald-600 border border-gray-200/70 dark:border-gray-700/70'
                    }`}
                  >
                    {rec.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* TAB 1: IBN KATHIR TAFSEER & SUMMARY */}
          {activeTab === 'ibn_kathir' && (
            <div className="space-y-3.5 animate-fadeIn">
              {/* Full Surah Tafsir Interactive Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0F6B50] via-[#128061] to-teal-800 text-white space-y-2.5 shadow-md border border-[#0F6B50]/30">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <BookMarked className="w-5 h-5 text-amber-300 shrink-0" />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm">تفسير سورة {surahName} كاملة</h4>
                      <p className="text-[10px] text-emerald-100/90">تصفح التفسير المباشر والمصادر الموثوقة لجميع آيات السورة</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setShowFullSurahModal(true);
                        playChime('click');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>الانتقال لتفسير السورة كاملة</span>
                    </button>

                    <a
                      href={TRUSTED_TAFSEER_SOURCES[0].getUrl(surahNumber, ayahNumber)}
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

                {/* Quick Trusted Sources Links */}
                <div className="pt-2 border-t border-white/20 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                  <span className="text-[10px] font-bold text-amber-200 shrink-0">المصادر الموثوقة:</span>
                  {TRUSTED_TAFSEER_SOURCES.map((src) => (
                    <a
                      key={src.id}
                      href={src.getUrl(surahNumber, ayahNumber)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => playChime('click')}
                      className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold shrink-0 transition-all flex items-center gap-1 border border-white/15"
                    >
                      <span>{src.icon}</span>
                      <span>{src.name}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* In-Tafsir Keyword Search Box */}
              <div className="p-3 rounded-2xl bg-[#FAF7F0] dark:bg-[#162720] border border-[#E5DDCF] dark:border-[#263D33] space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="البحث عن كلمة معينة داخل التفسير الحالي (مثال: الرحمة، التوحيد)..."
                      value={tafseerSearchQuery}
                      onChange={(e) => setTafseerSearchQuery(e.target.value)}
                      className="w-full bg-white dark:bg-[#101A16] border border-[#E5DDCF] dark:border-[#263D33] focus:border-[#0F6B50] rounded-xl py-1.5 pr-8 pl-7 text-xs text-right text-[#19302A] dark:text-white outline-none font-medium"
                    />
                    <Search className="w-3.5 h-3.5 text-emerald-600 dark:text-[#2DD4BF] absolute right-2.5 top-2.5" />
                    {tafseerSearchQuery && (
                      <button
                        onClick={() => setTafseerSearchQuery('')}
                        className="absolute left-2 top-2 p-0.5 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Keyword Suggestion Tags */}
                <div className="flex items-center justify-between text-[11px] gap-1 flex-wrap">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] text-gray-500 font-bold">كلمات شائعة:</span>
                    {['الرحمة', 'التوحيد', 'الصلاة', 'الجنة', 'الاستغفار'].map((kw) => (
                      <button
                        key={kw}
                        onClick={() => {
                          setTafseerSearchQuery(kw);
                          playChime('click');
                        }}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                          tafseerSearchQuery === kw
                            ? 'bg-[#0F6B50] text-white border-[#0F6B50]'
                            : 'bg-white dark:bg-[#101A16] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800'
                        }`}
                      >
                        {kw}
                      </button>
                    ))}
                  </div>

                  {tafseerSearchQuery && (
                    <span className="font-bold text-[10px] text-[#0F6B50] dark:text-[#2DD4BF]">
                      {insights.ibnKathirTafseer.includes(tafseerSearchQuery)
                        ? `وردت كلمة "${tafseerSearchQuery}" في التفسير`
                        : 'لم تظهر الكلمة في نص التفسير'}
                    </span>
                  )}
                </div>
              </div>

              {/* Tafseer Source Picker (Ibn Kathir, Al-Muyassar, Saadi, Mukhtasar) */}
              <div className="p-3 rounded-2xl bg-[#F4EFE6] dark:bg-[#121E19] border border-[#E0D5C1] dark:border-[#22362C] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#19302A] dark:text-emerald-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>اختر كتاب التفسير:</span>
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">
                    {TAFSEER_SOURCES.find(s => s.id === selectedTafseerSource)?.author}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {TAFSEER_SOURCES.map((source) => {
                    const isSelected = selectedTafseerSource === source.id;
                    return (
                      <button
                        key={source.id}
                        onClick={() => {
                          setSelectedTafseerSource(source.id);
                          playChime('click');
                          triggerHaptic(20);
                        }}
                        className={`px-2.5 py-2 rounded-xl text-xs font-bold text-center transition-all flex flex-col items-center justify-center gap-0.5 border shadow-xs active:scale-95 ${
                          isSelected
                            ? 'bg-[#0F6B50] text-white border-[#0F6B50] ring-2 ring-[#0F6B50]/30 shadow-md'
                            : 'bg-white dark:bg-[#1A2A23] text-[#2C4A3E] dark:text-gray-300 border-[#E2DAC9] dark:border-[#2C4137] hover:border-[#0F6B50]'
                        }`}
                      >
                        <span className="leading-tight">{source.shortName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-[#8A743F] dark:text-amber-300 border border-amber-300/40 flex items-center gap-1.5">
                  <span>{TAFSEER_SOURCES.find(s => s.id === selectedTafseerSource)?.name}</span>
                </span>
                {isLoadingTafseer && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>جارٍ تحميل التفسير...</span>
                  </span>
                )}
              </div>

              {/* Main Tafseer Text Box */}
              <div 
                className="p-4 rounded-2xl bg-[#FBF9F4] dark:bg-[#162720] border border-[#EBE3D3] dark:border-[#283F34] leading-relaxed text-[#273B32] dark:text-gray-100 shadow-sm relative min-h-[120px]"
                style={{ fontSize: `${modalFontSize}px` }}
              >
                {isLoadingTafseer && !currentTafseerContent ? (
                  <div className="py-8 text-center space-y-2 text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0F6B50]" />
                    <p className="text-xs font-medium">جارٍ استحضار نص التفسير الموثوق...</p>
                  </div>
                ) : (
                  <p className="whitespace-pre-line leading-loose break-words">
                    <HighlightedText text={currentTafseerContent || insights.ibnKathirTafseer} highlight={tafseerSearchQuery} />
                  </p>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-start gap-2.5 text-xs text-[#0F6B50] dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <p className="leading-relaxed">
                  {TAFSEER_SOURCES.find(s => s.id === selectedTafseerSource)?.description || 'تفسير معتمد وموثوق لبيان معاني كلام الله عز وجل.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: WORD MEANINGS & VOCABULARY */}
          {activeTab === 'word_meanings' && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F6B50] dark:text-[#2DD4BF]">
                  بيان مفردات الآية وغريب الألفاظ ({insights.wordMeanings.length} كلمات)
                </span>
                <span className="text-[11px] text-gray-500">قاموس مفردات القرآن</span>
              </div>

              <div className="space-y-2.5">
                {insights.wordMeanings.map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-2xl bg-[#FAF7F0] dark:bg-[#162720] border border-[#E5DDCF] dark:border-[#263D33] space-y-2 hover:border-[#0F6B50] transition-colors"
                  >
                    <div className="flex items-center justify-between border-b border-[#EBE3D3] dark:border-[#253930] pb-2">
                      <span className="text-[11px] font-bold text-[#8A743F] dark:text-amber-300">
                        مفردة #{toArabicNumerals(idx + 1)}
                      </span>
                      <span 
                        className="font-quran font-bold text-[#0F6B50] dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-lg border border-amber-200/50"
                        style={{ fontSize: `${modalFontSize + 2}px` }}
                      >
                        {item.word}
                      </span>
                    </div>
                    <div 
                      className="text-right text-[#4A5D54] dark:text-gray-100 leading-relaxed font-medium pt-1"
                      style={{ fontSize: `${modalFontSize}px` }}
                    >
                      {item.meaning}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ASBAB AL-NUZUL */}
          {activeTab === 'asbab_nuzul' && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8A743F] dark:text-amber-300">
                  سبب النزول وسياق الوحي المبارك
                </span>
                <span className="text-[11px] text-gray-500">تاريخ الوحي والسيرة</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FBF9F4] dark:bg-[#162720] border border-[#EBE3D3] dark:border-[#283F34] leading-relaxed text-sm text-[#273B32] dark:text-gray-100 space-y-3 shadow-sm">
                <p className="leading-loose whitespace-pre-line">
                  {insights.asbabNuzul}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>معرفة سبب النزول يعين على الفهم السديد للمقصد الشرعي من الآية.</span>
              </div>
            </div>
          )}

          {/* TAB 4: TADABBUR & CONTEMPLATION */}
          {activeTab === 'tadabbur' && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F6B50] dark:text-[#2DD4BF]">
                  وقفات تدبرية وثمار العمل بالآية
                </span>
                <span className="text-[11px] text-gray-500">هدايات القرآن</span>
              </div>

              <div className="space-y-2.5">
                {insights.tadabburPoints.map((point, idx) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-2xl bg-[#FAF7F0] dark:bg-[#162720] border border-[#E5DDCF] dark:border-[#263D33] flex items-start gap-3"
                  >
                    <div className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {toArabicNumerals(idx + 1)}
                    </div>
                    <p className="text-xs sm:text-sm text-[#273B32] dark:text-gray-100 leading-relaxed font-medium">
                      {point}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800/30 space-y-1.5 text-xs text-[#0F6B50] dark:text-emerald-300">
                <span className="font-bold flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>سؤال اليوم للتدبر الشخصي:</span>
                </span>
                <p className="text-[#3F5B4E] dark:text-gray-200 leading-relaxed">
                  كيف تنعكس هذه الآية على قراراتي ومشاعري وسلوكي مع من حولي في هذا اليوم المبارك؟
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-3.5 bg-[#FAF8F2] dark:bg-[#111C18] border-t border-[#EAE3D2] dark:border-[#22362D] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-[#1C2C25] dark:hover:bg-[#253A31] text-gray-800 dark:text-gray-200 font-bold text-xs transition-all"
          >
            إغلاق
          </button>
        </div>

      </div>

      {/* Full Surah Tafseer Sub-Modal */}
      {showFullSurahModal && (
        <FullSurahTafseerModal
          isOpen={showFullSurahModal}
          onClose={() => setShowFullSurahModal(false)}
          surahNumber={surahNumber}
          surahName={surahName}
        />
      )}
    </div>
  );
};

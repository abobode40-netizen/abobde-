import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Search, 
  Headphones, 
  Download, 
  Check, 
  Play, 
  Pause, 
  Trash2, 
  HardDrive, 
  Sparkles, 
  FolderDown, 
  ExternalLink,
  Volume2,
  CheckCircle2,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { ReciterId, ReciterInfo, DownloadedSurahRecord, SurahMeta } from '../types';
import { RECITERS_LIST, SURAHS_LIST, getSurahAudioUrl, toArabicNumerals } from '../data/quranData';
import { 
  getDownloadedSurahs, 
  downloadSurahAudio, 
  removeDownloadedSurah, 
  triggerDirectFileDownload,
  isSurahDownloaded 
} from '../utils/offlineAudio';
import { playChime, triggerHaptic } from '../utils/audio';

interface RecitersModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedReciter: ReciterId;
  onSelectReciter: (reciterId: ReciterId) => void;
  currentSurahNumber?: number;
  currentSurahName?: string;
  onPlaySurahOffline?: (reciterId: ReciterId, surahNumber: number) => void;
}

type ModalTab = 'reciters' | 'download_surahs' | 'saved_library';

export const RecitersModal: React.FC<RecitersModalProps> = ({
  isOpen,
  onClose,
  selectedReciter,
  onSelectReciter,
  currentSurahNumber = 1,
  currentSurahName = 'الفاتحة',
  onPlaySurahOffline
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('reciters');
  const [searchReciter, setSearchReciter] = useState('');
  const [searchSurah, setSearchSurah] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [previewReciterId, setPreviewReciterId] = useState<ReciterId | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [downloadTargetReciter, setDownloadTargetReciter] = useState<ReciterId>(selectedReciter);
  const [savedLibraryFilterReciter, setSavedLibraryFilterReciter] = useState<ReciterId | 'all'>('all');
  
  // Download states
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadedList, setDownloadedList] = useState<DownloadedSurahRecord[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDownloadedList(getDownloadedSurahs());
      setDownloadTargetReciter(selectedReciter);
    } else {
      // Pause preview when modal closes
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        setIsPreviewPlaying(false);
        setPreviewReciterId(null);
      }
    }
  }, [isOpen, selectedReciter]);

  if (!isOpen) return null;

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const categories = ['الكل', 'أئمة الحرمين', 'مرتل', 'مجود', 'تلاوات خاشعة'];

  // Filter Reciters
  const filteredReciters = RECITERS_LIST.filter((r) => {
    const matchesCategory = selectedCategory === 'الكل' || r.category === selectedCategory;
    const matchesSearch = !searchReciter.trim() ||
      r.name.includes(searchReciter.trim()) ||
      r.subname.includes(searchReciter.trim());
    return matchesCategory && matchesSearch;
  });

  // Filter Surahs for Download Tab
  const filteredSurahs = SURAHS_LIST.filter((s) => {
    return !searchSurah.trim() ||
      s.name.includes(searchSurah.trim()) ||
      s.number.toString() === searchSurah.trim();
  });

  // Preview Reciter Audio (plays Al-Fatiha short preview)
  const handleTogglePreview = (reciter: ReciterInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewReciterId === reciter.id && isPreviewPlaying) {
      previewAudioRef.current?.pause();
      setIsPreviewPlaying(false);
      setPreviewReciterId(null);
    } else {
      setPreviewReciterId(reciter.id);
      setIsPreviewPlaying(true);
      if (previewAudioRef.current) {
        // Preview Al-Fatiha
        previewAudioRef.current.src = getSurahAudioUrl(reciter.serverUrl, 1);
        previewAudioRef.current.play().catch(() => {
          setIsPreviewPlaying(false);
        });
      }
    }
    triggerHaptic(20);
  };

  // Download Surah Offline
  const handleDownloadSurah = async (surah: SurahMeta, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const targetRec = RECITERS_LIST.find((r) => r.id === downloadTargetReciter) || RECITERS_LIST[0];
    const recId = `${downloadTargetReciter}_${surah.number}`;
    
    setDownloadingId(recId);
    setDownloadProgress(10);
    triggerHaptic(30);

    const res = await downloadSurahAudio(
      downloadTargetReciter,
      surah.number,
      surah.name,
      (p) => setDownloadProgress(p)
    );

    setDownloadingId(null);
    setDownloadProgress(0);

    if (res.success) {
      setDownloadedList(getDownloadedSurahs());
      playChime('success');
      showFeedback(`تم تحميل سورة ${surah.name} بصوت ${targetRec.name} للاستماع بدون نت بنجاح 📥`);
    } else {
      showFeedback(res.error || 'تعذر التحميل، تأكد من الاتصال بالإنترنت');
    }
  };

  // Delete downloaded surah
  const handleDeleteDownloaded = async (item: DownloadedSurahRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeDownloadedSurah(item.reciterId, item.surahNumber);
    setDownloadedList(getDownloadedSurahs());
    playChime('click');
    showFeedback(`تم حذف سورة ${item.surahName} (${item.reciterName}) من ذاكرة الجهاز`);
  };

  const activeReciterObj = RECITERS_LIST.find((r) => r.id === selectedReciter) || RECITERS_LIST[0];
  const targetDownloadReciterObj = RECITERS_LIST.find((r) => r.id === downloadTargetReciter) || RECITERS_LIST[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start justify-center p-2.5 sm:p-4 pt-3 sm:pt-6 animate-fadeIn overflow-y-auto">
      {/* Hidden Preview Audio */}
      <audio
        ref={previewAudioRef}
        onEnded={() => {
          setIsPreviewPlaying(false);
          setPreviewReciterId(null);
        }}
        onError={() => {
          setIsPreviewPlaying(false);
          setPreviewReciterId(null);
        }}
      />

      <div className="bg-[#FAF7F0] dark:bg-[#15231D] w-full max-w-lg rounded-3xl border border-[#E5DDCF] dark:border-[#273D33] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] text-right my-0">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0F6B50] to-[#158064] text-white flex items-center justify-between shadow-sm">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-transform active:scale-95"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-right">
            <span className="text-[10px] text-amber-300 font-bold block">مكتبة التلاوات المرتلة</span>
            <h3 className="text-lg font-bold font-amiri">اختيار القارئ والتحميل للاستماع بدون نت</h3>
          </div>
        </div>

        {/* Feedback Alert if any */}
        {feedbackMessage && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300/40 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
            <button onClick={() => setFeedbackMessage(null)} className="text-emerald-600 hover:text-emerald-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Navigation Tabs inside modal */}
        <div className="p-2 mx-3 mt-3 rounded-2xl bg-[#EBE4D5] dark:bg-[#1A2C24] flex items-center gap-1 border border-[#DED4C3] dark:border-[#263D32]">
          <button
            onClick={() => {
              setActiveTab('reciters');
              playChime('click');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'reciters'
                ? 'bg-[#0F6B50] text-white shadow-xs'
                : 'text-[#566B60] dark:text-gray-400 hover:text-[#0F6B50] dark:hover:text-white'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>قائمة القراء ({RECITERS_LIST.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('download_surahs');
              playChime('click');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'download_surahs'
                ? 'bg-[#0F6B50] text-white shadow-xs'
                : 'text-[#566B60] dark:text-gray-400 hover:text-[#0F6B50] dark:hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>تحميل السور بدون نت</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('saved_library');
              playChime('click');
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all relative ${
              activeTab === 'saved_library'
                ? 'bg-[#0F6B50] text-white shadow-xs'
                : 'text-[#566B60] dark:text-gray-400 hover:text-[#0F6B50] dark:hover:text-white'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>المحمّلة</span>
            {downloadedList.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-[#0F6B50] text-[10px] flex items-center justify-center font-bold">
                {downloadedList.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: RECITERS SELECTION */}
        {activeTab === 'reciters' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Search and Categories */}
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث عن اسم القارئ (مثال: العفاسي، السديس، الحصري)..."
                  value={searchReciter}
                  onChange={(e) => setSearchReciter(e.target.value)}
                  className="w-full py-2.5 pl-4 pr-10 text-xs rounded-2xl bg-white dark:bg-[#1B2B24] border border-[#E5DDCF] dark:border-[#2A4035] text-[#19302A] dark:text-white focus:outline-none focus:border-[#0F6B50]"
                />
                <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      playChime('click');
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-[#0F6B50] text-white'
                        : 'bg-white dark:bg-[#1B2B24] border border-[#E5DDCF] dark:border-[#2A4035] text-[#5A6D62] dark:text-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Reciters List */}
            <div className="space-y-2 pt-1">
              {filteredReciters.map((r) => {
                const isCurrentActive = selectedReciter === r.id;
                const isPreviewing = previewReciterId === r.id && isPreviewPlaying;
                const countDownloadedForReciter = downloadedList.filter((d) => d.reciterId === r.id).length;

                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      onSelectReciter(r.id);
                      playChime('success');
                      triggerHaptic(30);
                      showFeedback(`تم تعيين فضيلة الشيخ ${r.name} كقارئ معتمد للمصحف`);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer active:scale-[0.99] ${
                      isCurrentActive
                        ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-[#0F6B50] dark:border-[#2DD4BF] ring-2 ring-[#0F6B50]/20'
                        : 'bg-white dark:bg-[#1A2A23] border-[#E7DFC5] dark:border-[#283E34] hover:border-[#0F6B50]'
                    }`}
                  >
                    {/* Left Actions: Select / Preview */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleTogglePreview(r, e)}
                        className={`p-2 rounded-xl transition-all ${
                          isPreviewing
                            ? 'bg-amber-400 text-[#0F6B50] animate-pulse'
                            : 'bg-gray-100 dark:bg-[#14201B] text-gray-600 dark:text-gray-300 hover:text-[#0F6B50]'
                        }`}
                        title="استماع لعينة صوتية من التلاوة"
                      >
                        {isPreviewing ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDownloadTargetReciter(r.id);
                            setActiveTab('download_surahs');
                            playChime('click');
                          }}
                          className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/60 hover:bg-amber-100 transition-all flex items-center gap-1"
                          title="تحميل سور هذا الشيخ للاستماع بدون نت"
                        >
                          <Download className="w-3 h-3" />
                          <span>تحميل سوره أوفلاين</span>
                        </button>

                        {isCurrentActive ? (
                          <div className="flex items-center gap-1 text-xs font-bold text-[#0F6B50] dark:text-[#2DD4BF] bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 rounded-xl">
                            <Check className="w-3.5 h-3.5" />
                            <span>القارئ المعتمد</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              onSelectReciter(r.id);
                              playChime('success');
                              triggerHaptic(30);
                            }}
                            className="px-3 py-1 rounded-xl text-xs font-bold bg-[#EBF3EE] dark:bg-[#152720] text-[#0F6B50] dark:text-[#2DD4BF] hover:bg-[#0F6B50] hover:text-white transition-all"
                          >
                            اختيار
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Right Info */}
                    <div className="text-right flex-1 pr-3">
                      <div className="flex items-center gap-2 justify-end">
                        {r.category && (
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200/40">
                            {r.category}
                          </span>
                        )}
                        <h4 className="font-bold text-sm text-[#19302A] dark:text-white">{r.name}</h4>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{r.subname}</p>
                      {countDownloadedForReciter > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{countDownloadedForReciter} سور متوفرة بدون إنترنت</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: DOWNLOAD SURAHS OFFLINE */}
        {activeTab === 'download_surahs' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Reciter Selector Horizontal Scroller */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">اختر الشيخ لتحميل سور خاصة به:</span>
                <span className="font-bold text-[#0F6B50] dark:text-[#2DD4BF]">{targetDownloadReciterObj.name}</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
                {RECITERS_LIST.map((r) => {
                  const isSelectedForDownload = downloadTargetReciter === r.id;
                  const downloadedCount = downloadedList.filter((d) => d.reciterId === r.id).length;
                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        setDownloadTargetReciter(r.id);
                        playChime('click');
                      }}
                      className={`shrink-0 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                        isSelectedForDownload
                          ? 'bg-[#0F6B50] text-white border-[#0F6B50] shadow-sm'
                          : 'bg-white dark:bg-[#1A2621] text-[#2B3E35] dark:text-gray-300 border-[#E5DDCF] dark:border-[#283E34] hover:border-[#0F6B50]'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{r.name.split(' ')[0]} {r.name.split(' ')[1] || ''}</span>
                      {downloadedCount > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          isSelectedForDownload ? 'bg-amber-300 text-emerald-900' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {toArabicNumerals(downloadedCount)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fast Quick Download for Current Surah with Selected Target Sheikh */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0F6B50] to-[#125B44] text-white space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-emerald-200 font-bold">السورة الحالية المفتوحة في المصحف</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  {isSurahDownloaded(downloadTargetReciter, currentSurahNumber) ? (
                    <span className="px-3 py-1.5 rounded-xl bg-white/20 text-xs font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-amber-300" />
                      <span>محمّلة ومتاحة أوفلاين</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleDownloadSurah({
                        number: currentSurahNumber,
                        name: currentSurahName,
                        englishName: '',
                        englishNameTranslation: '',
                        revelationType: 'Meccan',
                        numberOfAyahs: 0,
                        startPage: 1,
                        juz: 1
                      })}
                      disabled={downloadingId === `${downloadTargetReciter}_${currentSurahNumber}`}
                      className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#0F6B50] text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      <span>{downloadingId === `${downloadTargetReciter}_${currentSurahNumber}` ? `${downloadProgress}% جارٍ التحميل...` : 'تحميل السورة الآن'}</span>
                    </button>
                  )}
                </div>

                <div className="text-right">
                  <h4 className="font-bold text-base font-amiri">سورة {currentSurahName}</h4>
                  <span className="text-xs text-emerald-100">بصوت فضيلة الشيخ {targetDownloadReciterObj.name}</span>
                </div>
              </div>

              {downloadingId === `${downloadTargetReciter}_${currentSurahNumber}` && (
                <div className="pt-2 space-y-1">
                  <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-300 transition-all duration-300"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-emerald-200 block text-left font-mono">{downloadProgress}%</span>
                </div>
              )}
            </div>

            {/* Search Surah to Download */}
            <div className="space-y-2 pt-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder={`ابحث عن سورة لتحميلها بصوت ${targetDownloadReciterObj.name}...`}
                  value={searchSurah}
                  onChange={(e) => setSearchSurah(e.target.value)}
                  className="w-full py-2.5 pl-4 pr-10 text-xs rounded-2xl bg-white dark:bg-[#1B2B24] border border-[#E5DDCF] dark:border-[#2A4035] text-[#19302A] dark:text-white focus:outline-none focus:border-[#0F6B50]"
                />
                <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Surahs Download List */}
              <div className="space-y-2">
                {filteredSurahs.map((surah) => {
                  const isDownloaded = isSurahDownloaded(downloadTargetReciter, surah.number);
                  const isCurrentlyDownloading = downloadingId === `${downloadTargetReciter}_${surah.number}`;

                  return (
                    <div
                      key={surah.number}
                      className="p-3 rounded-2xl bg-white dark:bg-[#1A2A23] border border-[#E7DFC5] dark:border-[#283E34] flex items-center justify-between"
                    >
                      {/* Left: Download / Saved Actions */}
                      <div className="flex items-center gap-2">
                        {/* Direct File Save to Device Storage button */}
                        <button
                          onClick={() => triggerDirectFileDownload(downloadTargetReciter, surah.number, surah.name)}
                          className="p-2 rounded-xl bg-gray-100 dark:bg-[#14201B] text-gray-500 hover:text-[#0F6B50] dark:hover:text-emerald-300"
                          title="حفظ ملف MP3 مباشرة في هاتفك/جهازك"
                        >
                          <FolderDown className="w-4 h-4" />
                        </button>

                        {isDownloaded ? (
                          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-300/40">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>محمّلة للاستماع أوفلاين</span>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => handleDownloadSurah(surah, e)}
                            disabled={isCurrentlyDownloading}
                            className="px-3.5 py-1.5 rounded-xl bg-[#0F6B50] hover:bg-[#138061] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs disabled:opacity-50 active:scale-95"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{isCurrentlyDownloading ? `${downloadProgress}%` : 'تحميل'}</span>
                          </button>
                        )}
                      </div>

                      {/* Right: Surah info */}
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className="text-[10px] text-gray-400">
                            {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                          </span>
                          <h4 className="font-bold text-sm text-[#19302A] dark:text-white">سورة {surah.name}</h4>
                        </div>
                        <span className="text-[11px] text-gray-500 font-mono">
                          {toArabicNumerals(surah.numberOfAyahs)} آية • ص {toArabicNumerals(surah.startPage)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: SAVED OFFLINE LIBRARY */}
        {activeTab === 'saved_library' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Header & Sheikh Filter Pills */}
            <div className="space-y-2 pb-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">التلاوات المحفوظة على جهازك للاستماع بدون نت</span>
                <span className="text-xs font-bold text-[#0F6B50] dark:text-[#2DD4BF]">
                  {downloadedList.length} سور محفوظة
                </span>
              </div>

              {/* Sheikh filter pills */}
              {downloadedList.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  <button
                    onClick={() => setSavedLibraryFilterReciter('all')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      savedLibraryFilterReciter === 'all'
                        ? 'bg-[#0F6B50] text-white shadow-xs'
                        : 'bg-white dark:bg-[#1A2621] text-gray-600 dark:text-gray-300 border border-[#E5DDCF] dark:border-[#283E34]'
                    }`}
                  >
                    جميع القراء ({toArabicNumerals(downloadedList.length)})
                  </button>
                  {Array.from(new Set(downloadedList.map((d) => d.reciterId))).map((rId) => {
                    const rec = RECITERS_LIST.find((r) => r.id === rId);
                    const count = downloadedList.filter((d) => d.reciterId === rId).length;
                    return (
                      <button
                        key={rId}
                        onClick={() => setSavedLibraryFilterReciter(rId)}
                        className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                          savedLibraryFilterReciter === rId
                            ? 'bg-[#0F6B50] text-white shadow-xs'
                            : 'bg-white dark:bg-[#1A2621] text-gray-600 dark:text-gray-300 border border-[#E5DDCF] dark:border-[#283E34]'
                        }`}
                      >
                        {rec ? rec.name.split(' ')[0] : rId} ({toArabicNumerals(count)})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {downloadedList.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white dark:bg-[#182721] border border-[#E5DDCF] dark:border-[#273D33] text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 mx-auto flex items-center justify-center">
                  <HardDrive className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-[#19302A] dark:text-white">لا توجد سور محمّلة حتى الآن</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
                  يمكنك التوجه إلى تبويب «تحميل السور بدون نت» لاختيار أي شيخ وتحميل سوره للاستماع بدون إنترنت.
                </p>
                <button
                  onClick={() => setActiveTab('download_surahs')}
                  className="px-5 py-2.5 rounded-xl bg-[#0F6B50] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>تصفح وتحميل السور</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {downloadedList
                  .filter((item) => savedLibraryFilterReciter === 'all' || item.reciterId === savedLibraryFilterReciter)
                  .map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#1A2A23] border border-[#E7DFC5] dark:border-[#283E34] flex items-center justify-between shadow-xs"
                  >
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDeleteDownloaded(item, e)}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                        title="حذف من الجهاز لتوفير المساحة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          onSelectReciter(item.reciterId);
                          if (onPlaySurahOffline) {
                            onPlaySurahOffline(item.reciterId, item.surahNumber);
                          }
                          onClose();
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#0F6B50] hover:bg-[#138061] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>استماع أوفلاين</span>
                      </button>
                    </div>

                    {/* Surah Details */}
                    <div className="text-right">
                      <h4 className="font-bold text-sm text-[#19302A] dark:text-white">سورة {item.surahName}</h4>
                      <p className="text-xs text-[#0F6B50] dark:text-emerald-300 font-semibold">{item.reciterName}</p>
                      <span className="text-[10px] text-gray-400 font-mono">
                        الحجم: {item.sizeEstimate || 'متاح بدون نت'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="p-3 bg-[#EFE9DC] dark:bg-[#13201A] border-t border-[#E5DDCF] dark:border-[#263D32] flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
          <span>القارئ الحالي: <strong className="text-[#0F6B50] dark:text-emerald-300">{activeReciterObj.name}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#0F6B50] text-white font-bold text-xs hover:bg-[#127e5f]"
          >
            تم
          </button>
        </div>
      </div>
    </div>
  );
};

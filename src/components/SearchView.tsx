import React, { useState, useRef, useEffect } from 'react';
import { Search, BookOpen, Sparkles, Quote, ArrowRight, ChevronLeft, Mic, MicOff, AlertCircle } from 'lucide-react';
import { BookCheck, Lightbulb } from 'lucide-react';
import { AppTab } from '../types';
import { SURAHS_LIST, toArabicNumerals } from '../data/quranData';
import { ATHKAR_CATEGORIES } from '../data/athkarData';
import { THIMAR_LIST } from '../data/thimarData';
import { DUAS_LIST } from '../data/duasData';
import { MISHKAT_LESSONS } from '../data/mishkatData';
import { playChime, triggerHaptic } from '../utils/audio';

// SpeechRecognition type definition for browser compatibility
type SpeechRecognitionType = typeof window & {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
};

interface SearchViewProps {
  onBack: () => void;
  onSelectSurah: (page: number) => void;
  onNavigateToTab: (tab: AppTab) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  onBack,
  onSelectSurah,
  onNavigateToTab
}) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isVoiceSupported, setIsVoiceSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognitionClass = 
      (window as unknown as SpeechRecognitionType).SpeechRecognition || 
      (window as unknown as SpeechRecognitionType).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsVoiceSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const handleToggleVoiceSearch = async () => {
    setVoiceError(null);

    // If currently listening, stop
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      playChime('click');
      return;
    }

    const SpeechRecognitionClass = 
      (window as unknown as SpeechRecognitionType).SpeechRecognition || 
      (window as unknown as SpeechRecognitionType).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setVoiceError('ميزة التعرف على الصوت غير مدعومة في هذا المتصفح.');
      return;
    }

    try {
      // 1. Request microphone permission explicitly
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Release stream so speech recognition can bind to mic cleanly
        stream.getTracks().forEach((track) => track.stop());
      }

      // 2. Initialize and start SpeechRecognition
      const recognition = new SpeechRecognitionClass();
      recognition.lang = 'ar-SA'; // ضبط اللغة للعربية
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        playChime('click');
        triggerHaptic(50);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setVoiceError('يرجى السماح بصلاحية الميكروفون من إعدادات الهاتف لاستخدام البحث الصوتي.');
        } else if (event.error === 'no-speech') {
          setVoiceError('لم يتم سماع أي صوت، يرجى المحاولة والتحدث مرة أخرى.');
        } else {
          setVoiceError(`خطأ في التعرف على الصوت (${event.error})`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        playChime('success');
      };

      recognitionRef.current = recognition;
      recognition.start();

    } catch (err: unknown) {
      console.error('Microphone error:', err);
      setIsListening(false);
      setVoiceError('يرجى السماح بصلاحية الميكروفون من إعدادات الهاتف لاستخدام البحث الصوتي.');
    }
  };

  const trimmed = query.trim().toLowerCase();

  // Search Results
  const matchedSurahs = trimmed
    ? SURAHS_LIST.filter(
        (s) =>
          s.name.includes(trimmed) ||
          s.number.toString() === trimmed ||
          s.englishName.toLowerCase().includes(trimmed)
      )
    : [];

  const matchedAthkar = trimmed
    ? ATHKAR_CATEGORIES.flatMap((cat) =>
        cat.items
          .filter((item) => item.text.includes(trimmed) || item.fadl?.includes(trimmed))
          .map((item) => ({ ...item, categoryTitle: cat.title }))
      )
    : [];

  const matchedThimar = trimmed
    ? THIMAR_LIST.filter(
        (t) =>
          t.quote.includes(trimmed) ||
          t.author.includes(trimmed) ||
          t.category.includes(trimmed)
      )
    : [];

  const matchedDuas = trimmed
    ? DUAS_LIST.filter(
        (d) =>
          d.title.includes(trimmed) ||
          d.arabicText.includes(trimmed) ||
          d.source.includes(trimmed) ||
          (d.benefit && d.benefit.includes(trimmed))
      )
    : [];

  const matchedMishkat = trimmed
    ? MISHKAT_LESSONS.filter(
        (m) =>
          m.title.includes(trimmed) ||
          m.summary.includes(trimmed) ||
          m.storyText.includes(trimmed) ||
          m.practicalTakeaway.includes(trimmed)
      )
    : [];

  const hasResults =
    matchedSurahs.length > 0 ||
    matchedAthkar.length > 0 ||
    matchedDuas.length > 0 ||
    matchedMishkat.length > 0 ||
    matchedThimar.length > 0;

  return (
    <div className="pb-24 pt-2 px-3 sm:px-4 max-w-lg mx-auto space-y-4 animate-fadeIn">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-[#E8F3ED] dark:bg-[#162D24] text-[#0F6B50] dark:text-[#2DD4BF] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          title="العودة"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div className="text-right flex-1 pr-2">
          <span className="text-[11px] font-bold text-[#B45309] dark:text-amber-300">البحث الموحد الصوتي والنصي</span>
          <h2 className="text-xl font-bold font-amiri text-[#19302A] dark:text-white">ابحث في جنّة الرحمن</h2>
        </div>
      </div>

      {/* Voice Error Banner */}
      {voiceError && (
        <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/70 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-bold flex items-start gap-2 text-right">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="flex-1">{voiceError}</span>
        </div>
      )}

      {/* Search Input Bar with Voice Button */}
      <div className="relative flex items-center">
        <input
          id="searchInput"
          type="text"
          autoFocus
          placeholder="اكتب أو انطق اسم سورة، أو ذكر..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-white dark:bg-[#1A2621] border-2 border-[#0F6B50]/30 focus:border-[#0F6B50] dark:focus:border-[#2DD4BF] rounded-2xl py-3.5 pr-11 pl-12 text-sm text-right outline-none text-[#19302A] dark:text-white shadow-sm placeholder-[#97A099]"
        />
        <Search className="w-5 h-5 text-[#0F6B50] absolute right-3.5 top-4 pointer-events-none" />

        {/* Voice Search Button */}
        {isVoiceSupported && (
          <button
            id="micBtn"
            type="button"
            onClick={handleToggleVoiceSearch}
            aria-label="البحث الصوتي"
            title={isListening ? 'جارٍ الاستماع... انقر للإيقاف' : 'البحث بالصوت عبر الميكروفون'}
            className={`w-9 h-9 rounded-xl absolute left-2 top-2.5 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                : 'bg-[#0F6B50]/10 hover:bg-[#0F6B50]/20 text-[#0F6B50] dark:text-[#2DD4BF] dark:bg-emerald-950/40'
            }`}
          >
            {isListening ? <Mic className="w-4 h-4 text-white animate-bounce" /> : <Mic className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Listening Banner */}
      {isListening && (
        <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-900/80 text-red-600 dark:text-red-400 text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>🎙️ جارٍ الاستماع لصوتك الآن باللغة العربية... تحدث باسم السورة أو الذكر</span>
        </div>
      )}

      {!trimmed && (
        <div className="p-8 text-center space-y-3 bg-white dark:bg-[#1A2621] rounded-3xl border border-[#E5DDCF] dark:border-[#2A3C34]">
          <Search className="w-10 h-10 text-emerald-600/40 mx-auto" />
          <h3 className="text-sm font-bold text-[#19302A] dark:text-white">ابحث في كنوز التطبيق</h3>
          <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
            يمكنك كتابة أو نطق اسم أي سورة من القرآن الكريم، أو أي دعاء وذكر من حصن المسلم، أو ثمار المشايخ.
          </p>
        </div>
      )}

      {trimmed && !hasResults && (
        <div className="p-8 text-center bg-white dark:bg-[#1A2621] rounded-2xl border border-dashed border-[#E5DDCF] dark:border-[#2A3C34] text-sm text-gray-500">
          لم يتم العثور على نتائج مطابقة لـ «{query}»
        </div>
      )}

      {/* Surahs Results */}
      {matchedSurahs.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 justify-end text-xs font-bold text-[#0F6B50] dark:text-[#2DD4BF]">
            <span>السور القرآنية ({toArabicNumerals(matchedSurahs.length)})</span>
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="space-y-2">
            {matchedSurahs.map((s) => (
              <div
                key={s.number}
                onClick={() => onSelectSurah(s.startPage)}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#1A2621] border border-[#E5DDCF] dark:border-[#2A3C34] hover:border-[#0F6B50] flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
              >
                <ChevronLeft className="w-4 h-4 text-gray-400" />
                <div className="text-right">
                  <h4 className="font-bold text-sm text-[#19302A] dark:text-white">سورة {s.name}</h4>
                  <span className="text-[11px] text-gray-500">
                    صفحة {toArabicNumerals(s.startPage)} • {toArabicNumerals(s.numberOfAyahs)} آية
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Athkar Results */}
      {matchedAthkar.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-1.5 justify-end text-xs font-bold text-[#D97706] dark:text-amber-400">
            <span>الأذكار والأدعية ({toArabicNumerals(matchedAthkar.length)})</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-2">
            {matchedAthkar.map((a) => (
              <div
                key={a.id}
                onClick={() => onNavigateToTab('athkar')}
                className="p-4 rounded-2xl bg-white dark:bg-[#1A2621] border border-[#E5DDCF] dark:border-[#2A3C34] hover:border-[#D97706] text-right cursor-pointer transition-all space-y-1.5"
              >
                <span className="text-[10px] bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-md inline-block">
                  {a.categoryTitle}
                </span>
                <p className="font-amiri text-base leading-relaxed text-[#19302A] dark:text-white line-clamp-3">
                  {a.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Duas Results */}
      {matchedDuas.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-1.5 justify-end text-xs font-bold text-[#0F6B50] dark:text-[#34D399]">
            <span>الأدعية المأثورة ({toArabicNumerals(matchedDuas.length)})</span>
            <BookCheck className="w-4 h-4" />
          </div>
          <div className="space-y-2">
            {matchedDuas.map((d) => (
              <div
                key={d.id}
                onClick={() => onNavigateToTab('duas')}
                className="p-4 rounded-2xl bg-white dark:bg-[#1A2621] border border-[#E5DDCF] dark:border-[#2A3C34] hover:border-[#0F6B50] text-right cursor-pointer transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  {d.grade && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {d.grade}
                    </span>
                  )}
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {d.title}
                  </span>
                </div>
                <p className="font-amiri text-base leading-relaxed text-[#19302A] dark:text-white line-clamp-3">
                  {d.arabicText}
                </p>
                <div className="text-[11px] text-gray-500 flex justify-end">
                  <span>{d.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mishkat Lessons Results */}
      {matchedMishkat.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-1.5 justify-end text-xs font-bold text-amber-700 dark:text-amber-400">
            <span>مشكاة النور - سيرة المصطفى ﷺ للشباب ({toArabicNumerals(matchedMishkat.length)})</span>
            <Lightbulb className="w-4 h-4" />
          </div>
          <div className="space-y-2">
            {matchedMishkat.map((m) => (
              <div
                key={m.id}
                onClick={() => onNavigateToTab('mishkat')}
                className="p-4 rounded-2xl bg-white dark:bg-[#1A2621] border border-[#E5DDCF] dark:border-[#2A3C34] hover:border-amber-500 text-right cursor-pointer transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                    {m.categoryTitle}
                  </span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {m.title}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                  {m.summary}
                </p>
                <p className="text-[11px] text-[#1D4ED8] dark:text-[#60A5FA] bg-blue-50/70 dark:bg-blue-950/40 p-2 rounded-xl">
                  <span className="font-bold">القبس للشباب: </span>
                  {m.practicalTakeaway}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wisdom Results */}
      {matchedThimar.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-1.5 justify-end text-xs font-bold text-purple-700 dark:text-purple-300">
            <span>ثمار المشايخ ({toArabicNumerals(matchedThimar.length)})</span>
            <Quote className="w-4 h-4" />
          </div>
          <div className="space-y-2">
            {matchedThimar.map((t) => (
              <div
                key={t.id}
                onClick={() => onNavigateToTab('thimar')}
                className="p-4 rounded-2xl bg-white dark:bg-[#1A2621] border border-[#E5DDCF] dark:border-[#2A3C34] hover:border-purple-600 text-right cursor-pointer transition-all space-y-1.5"
              >
                <p className="font-amiri text-base font-bold text-[#19302A] dark:text-white">
                  «{t.quote}»
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                  <span>{t.category}</span>
                  <span className="font-bold text-[#7E22CE] dark:text-purple-300">— {t.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


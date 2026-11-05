import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  CheckCircle2,
  Info,
  Layers,
  Award,
  BookCheck,
  Search,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import {
  NOORANIYAH_LESSONS,
  NOORANIYAH_LETTERS,
  MAKHARIJ_CATEGORIES,
  NOORANIYAH_TIPS,
  NooraniyahLesson,
  NooraniyahLetter
} from '../data/nooraniyahData';
import { toArabicNumerals } from '../data/quranData';
import { playChime, triggerHaptic } from '../utils/audio';

// Images generated for this view
import nooraniyahHeroImg from '../assets/images/nooraniyah_hero_banner_1793881400056.jpg';
import makharijImg from '../assets/images/nooraniyah_makharij_icon_1793881413576.jpg';
import readingChildImg from '../assets/images/nooraniyah_reading_child_1793881425222.jpg';
import tajweedRulesImg from '../assets/images/nooraniyah_tajweed_rules_1793881440909.jpg';

interface NooraniyahViewProps {
  onBackToHome: () => void;
  fontScale?: number;
  onChangeFontScale?: (scale: number) => void;
}

type TabSection = 'lessons' | 'letters' | 'makharij' | 'rules';

export const NooraniyahView: React.FC<NooraniyahViewProps> = ({
  onBackToHome,
  fontScale = 100
}) => {
  const [activeSection, setActiveSection] = useState<TabSection>('lessons');
  const [selectedLessonId, setSelectedLessonId] = useState<number>(1);
  const [selectedLetter, setSelectedLetter] = useState<NooraniyahLetter | null>(NOORANIYAH_LETTERS[0]);
  const [selectedMakhrajId, setSelectedMakhrajId] = useState<string>('lisan');
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [searchLetter, setSearchLetter] = useState<string>('');
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});

  // Full Lesson Audio Player state (Sheikh Farouq Al-Raee / Recorded Teacher Voice)
  const [isLessonAudioPlaying, setIsLessonAudioPlaying] = useState<boolean>(false);
  const [lessonAudioProgress, setLessonAudioProgress] = useState<number>(0);
  const [lessonAudioDuration, setLessonAudioDuration] = useState<number>(0);
  const [lessonAudioCurrentTime, setLessonAudioCurrentTime] = useState<number>(0);
  const [audioError, setAudioError] = useState<boolean>(false);

  const lessonAudioRef = useRef<HTMLAudioElement | null>(null);
  const letterAudioRef = useRef<HTMLAudioElement | null>(null);

  const currentLesson = NOORANIYAH_LESSONS.find((l) => l.id === selectedLessonId) || NOORANIYAH_LESSONS[0];
  const activeMakhraj = MAKHARIJ_CATEGORIES.find((m) => m.id === selectedMakhrajId) || MAKHARIJ_CATEGORIES[0];

  // Stop any playing audio on lesson change or unmount
  useEffect(() => {
    if (lessonAudioRef.current) {
      lessonAudioRef.current.pause();
      lessonAudioRef.current.currentTime = 0;
    }
    if (letterAudioRef.current) {
      letterAudioRef.current.pause();
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsLessonAudioPlaying(false);
    setLessonAudioProgress(0);
    setLessonAudioCurrentTime(0);
    setSpeakingText(null);
    setAudioError(false);
  }, [selectedLessonId]);

  useEffect(() => {
    return () => {
      if (lessonAudioRef.current) {
        lessonAudioRef.current.pause();
      }
      if (letterAudioRef.current) {
        letterAudioRef.current.pause();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${toArabicNumerals(mins.toString().padStart(2, '0'))}:${toArabicNumerals(secs.toString().padStart(2, '0'))}`;
  };

  // Toggle Playing the Full Lesson Audio (by Sheikh Farouq Al-Raee)
  const handleToggleLessonAudio = () => {
    triggerHaptic('selection');
    if (!currentLesson.audioUrl) return;

    if (!lessonAudioRef.current) {
      lessonAudioRef.current = new Audio(currentLesson.audioUrl);
      
      lessonAudioRef.current.ontimeupdate = () => {
        if (lessonAudioRef.current && lessonAudioRef.current.duration) {
          const cur = lessonAudioRef.current.currentTime;
          const dur = lessonAudioRef.current.duration;
          setLessonAudioCurrentTime(cur);
          setLessonAudioDuration(dur);
          setLessonAudioProgress((cur / dur) * 100);
        }
      };

      lessonAudioRef.current.onended = () => {
        setIsLessonAudioPlaying(false);
        setLessonAudioProgress(100);
        playChime('success');
      };

      lessonAudioRef.current.onerror = () => {
        setIsLessonAudioPlaying(false);
        setAudioError(true);
      };
    }

    if (isLessonAudioPlaying) {
      lessonAudioRef.current.pause();
      setIsLessonAudioPlaying(false);
    } else {
      if (lessonAudioRef.current.src !== currentLesson.audioUrl) {
        lessonAudioRef.current.src = currentLesson.audioUrl;
        lessonAudioRef.current.load();
      }
      lessonAudioRef.current.play().then(() => {
        setIsLessonAudioPlaying(true);
        setAudioError(false);
      }).catch(() => {
        setAudioError(true);
        setIsLessonAudioPlaying(false);
      });
    }
  };

  const handleSeekLessonAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value);
    setLessonAudioProgress(newProgress);
    if (lessonAudioRef.current && lessonAudioRef.current.duration) {
      lessonAudioRef.current.currentTime = (newProgress / 100) * lessonAudioRef.current.duration;
    }
  };

  // Play Letter Audio (Direct authentic male voice MP3)
  const handlePlayLetterAudio = (letter: NooraniyahLetter) => {
    triggerHaptic('light');
    setSpeakingText(letter.char);

    // Stop previous lesson audio if playing
    if (lessonAudioRef.current && isLessonAudioPlaying) {
      lessonAudioRef.current.pause();
      setIsLessonAudioPlaying(false);
    }

    if (letter.audioUrl) {
      if (!letterAudioRef.current) {
        letterAudioRef.current = new Audio();
      }
      letterAudioRef.current.pause();
      letterAudioRef.current.src = letter.audioUrl;
      letterAudioRef.current.onended = () => {
        setSpeakingText(null);
      };
      letterAudioRef.current.onerror = () => {
        // Fallback to strict male TTS
        fallbackMaleSpeech(letter.name);
      };
      letterAudioRef.current.play().catch(() => {
        fallbackMaleSpeech(letter.name);
      });
    } else {
      fallbackMaleSpeech(letter.name);
    }
  };

  // Strict Male Pronunciation Fallback (Explicitly selecting male voice and low masculine pitch)
  const fallbackMaleSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setSpeakingText(null);
      return;
    }
    window.speechSynthesis.cancel();
    setSpeakingText(text);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    // Lower masculine pitch (0.75 - 0.8) to guarantee a deep male tone and avoid female voices
    utterance.pitch = 0.75;
    utterance.rate = 0.82;

    // Search for explicit male Arabic voice if available in the OS
    const voices = window.speechSynthesis.getVoices();
    const arabicMaleVoice = voices.find(
      (v) =>
        v.lang.startsWith('ar') &&
        (v.name.toLowerCase().includes('male') ||
          v.name.includes('Maged') ||
          v.name.includes('Tarik') ||
          v.name.includes('Naayf') ||
          v.name.includes('Hamza') ||
          v.name.includes('Mehdi'))
    );
    if (arabicMaleVoice) {
      utterance.voice = arabicMaleVoice;
    }

    utterance.onend = () => setSpeakingText(null);
    utterance.onerror = () => setSpeakingText(null);

    window.speechSynthesis.speak(utterance);
  };

  const handleSelectLesson = (id: number) => {
    playChime('click');
    triggerHaptic('selection');
    setSelectedLessonId(id);
    setActiveItemIndex(0);
  };

  const filteredLetters = searchLetter.trim()
    ? NOORANIYAH_LETTERS.filter(
        (l) => l.char.includes(searchLetter.trim()) || l.name.includes(searchLetter.trim()) || l.makhraj.includes(searchLetter.trim())
      )
    : NOORANIYAH_LETTERS;

  return (
    <div className="pb-28 pt-2 px-3 sm:px-4 max-w-lg mx-auto space-y-4 font-cairo animate-fadeIn">
      {/* Top Header with Back to Home Button */}
      <div className="flex items-center justify-between pb-1">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0c1f3b] border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-200 hover:bg-sky-50 dark:hover:bg-sky-900/40 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
        >
          <ArrowRight className="w-4 h-4" />
          <span>الرئيسية</span>
        </button>

        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-400/40 flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-emerald-600" />
              <span>تسجيلات بصوت قارئ ذكر</span>
            </span>
            <h2 className="text-base sm:text-lg font-black font-amiri text-slate-900 dark:text-white">
              القاعدة النورانية المعتمدة
            </h2>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-sky-200/80">
            تلاوة الشيخ فاروق الراعي مع النطق الرجالي الصحيح لكل حرف
          </p>
        </div>
      </div>

      {/* Hero Banner with Rich Islamic Artwork */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-amber-400/40 shadow-xl bg-[#091b33]">
        <div className="aspect-[16/9] w-full relative overflow-hidden">
          <img
            src={nooraniyahHeroImg}
            alt="القاعدة النورانية لتعليم القرآن الكريم"
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#091b33] via-transparent to-black/20" />
          
          <div className="absolute bottom-3 inset-x-3 text-right">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-white shadow-xs">
              صوت الشيخ المقرئ معتمد
            </span>
            <h3 className="text-sm sm:text-base font-black text-amber-100 font-amiri mt-1 drop-shadow-md">
              «خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ»
            </h3>
            <p className="text-[10px] text-amber-200/90 font-medium">
              استمع لتسجيل كل درس بصوت الشيخ المعلم مع الترديد المتقن
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (الدروس، الحروف والمخارج، القواعد المصورة، اللوحات التعليمية) */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-white dark:bg-[#0A192F] rounded-2xl border border-sky-200 dark:border-sky-950 shadow-xs">
        <button
          onClick={() => {
            setActiveSection('lessons');
            playChime('click');
          }}
          className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'lessons'
              ? 'bg-[#0284C7] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-sky-600'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 mx-auto mb-0.5" />
          <span>الدروس</span>
        </button>

        <button
          onClick={() => {
            setActiveSection('letters');
            playChime('click');
          }}
          className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'letters'
              ? 'bg-[#0284C7] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-sky-600'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 mx-auto mb-0.5" />
          <span>الحروف</span>
        </button>

        <button
          onClick={() => {
            setActiveSection('makharij');
            playChime('click');
          }}
          className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'makharij'
              ? 'bg-[#0284C7] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-sky-600'
          }`}
        >
          <Layers className="w-3.5 h-3.5 mx-auto mb-0.5" />
          <span>المخارج</span>
        </button>

        <button
          onClick={() => {
            setActiveSection('rules');
            playChime('click');
          }}
          className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'rules'
              ? 'bg-[#0284C7] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-sky-600'
          }`}
        >
          <Award className="w-3.5 h-3.5 mx-auto mb-0.5" />
          <span>اللوحات</span>
        </button>
      </div>

      {/* SECTION 1: LESSONS (الدروس النورانية المرتبة) */}
      {activeSection === 'lessons' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Horizontal Lesson Selector Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {NOORANIYAH_LESSONS.map((lesson) => {
              const isSelected = lesson.id === selectedLessonId;
              return (
                <button
                  key={lesson.id}
                  onClick={() => handleSelectLesson(lesson.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-sm ring-1 ring-amber-300'
                      : 'bg-white dark:bg-[#0A192F] border border-sky-100 dark:border-sky-950 text-slate-700 dark:text-slate-300 hover:border-amber-400'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white/20 text-center text-[10px] leading-4 font-mono font-bold">
                    {toArabicNumerals(lesson.id)}
                  </span>
                  <span>{lesson.title.split(':')[1]?.trim() || lesson.title}</span>
                </button>
              );
            })}
          </div>

          {/* Current Lesson Hero Overview Card with Professional Sheikh Audio Player */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#0c2448] via-[#10335e] to-[#184882] text-white shadow-md border border-amber-400/40 relative overflow-hidden space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30">
                الدرس {toArabicNumerals(currentLesson.id)} من {toArabicNumerals(NOORANIYAH_LESSONS.length)}
              </span>

              <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-500/30 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                <span>بصوت الشيخ المقرئ</span>
              </span>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black font-amiri text-white text-right">
                {currentLesson.title}
              </h3>
              <p className="text-xs text-sky-100 mt-1 text-right leading-relaxed">
                {currentLesson.description}
              </p>
            </div>

            {/* Sheikh Audio Player Box (التسجيل الصوتي المعتمد بصوت الشيخ المعلم) */}
            <div className="p-3.5 rounded-2xl bg-[#07172c]/90 border border-amber-400/40 space-y-2.5 shadow-inner">
              <div className="flex items-center justify-between">
                {/* Audio Play/Pause Button */}
                <button
                  onClick={handleToggleLessonAudio}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-sm ${
                    isLessonAudioPlaying
                      ? 'bg-amber-500 text-white ring-2 ring-amber-300 animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                  title="تشغيل التلاوة المعتمدة الكاملة للدرس بصوت الشيخ"
                >
                  {isLessonAudioPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>إيقاف الدرس مؤقتاً</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>استمع للدرس كاملاً بصوت الشيخ</span>
                    </>
                  )}
                </button>

                <div className="text-right">
                  <span className="text-xs font-bold text-amber-200 block">
                    قراءة الشيخ فاروق الراعي
                  </span>
                  <span className="text-[10px] text-sky-300 font-mono">
                    {formatTime(lessonAudioCurrentTime)} / {formatTime(lessonAudioDuration || 0)}
                  </span>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="w-full space-y-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={lessonAudioProgress}
                  onChange={handleSeekLessonAudio}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              {audioError && (
                <p className="text-[10px] text-rose-300 text-center font-bold">
                  تعذر تشغيل الملف الصوتي من المصدر، يرجى التحقق من اتصال الإنترنت.
                </p>
              )}
            </div>

            {/* Learning Points Checklist */}
            <div className="mt-2 pt-2 border-t border-white/15 space-y-1.5 text-right">
              <span className="text-[11px] font-bold text-amber-300 block">ضوابط الإتقان والتجويد في هذا الدرس:</span>
              {currentLesson.learningPoints.map((pt, i) => (
                <div key={i} className="flex items-start justify-end gap-1.5 text-xs text-sky-100/90">
                  <span className="leading-relaxed">{pt}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                </div>
              ))}
            </div>
          </div>

          {/* Lesson Interactive Items Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-slate-500 dark:text-slate-400">
                انقر على أي بطاقة لعرض تفاصيل التهجي القرآني
              </span>
              <span className="font-bold text-sky-800 dark:text-sky-300">
                الأمثلة والكلمات: {toArabicNumerals(currentLesson.items.length)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentLesson.items.map((item, idx) => {
                const isSelected = activeItemIndex === idx;

                return (
                  <motion.div
                    key={idx}
                    layout
                    onClick={() => {
                      setActiveItemIndex(idx);
                      playChime('click');
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-right space-y-2 relative overflow-hidden ${
                      isSelected
                        ? 'bg-sky-50/80 dark:bg-[#0c2448] border-sky-400 dark:border-sky-600 shadow-sm'
                        : 'bg-white dark:bg-[#0A192F] border-sky-100 dark:border-sky-950 hover:border-sky-300 shadow-xs'
                    }`}
                  >
                    {/* Top Row: Mini Index & Reference */}
                    <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100 dark:border-slate-800/80">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                        {item.quranicReference || 'مثال نوراني'}
                      </span>

                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center text-[10px] font-bold font-mono">
                        {toArabicNumerals(idx + 1)}
                      </span>
                    </div>

                    {/* Main Arabic Text in Large Calligraphic Style */}
                    <div className="py-2 text-center bg-gradient-to-b from-sky-50/40 to-transparent dark:from-sky-950/20 rounded-xl">
                      <span className="font-amiri text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-wide">
                        {item.text}
                      </span>
                    </div>

                    {/* Pronunciation & Spelling Guide */}
                    <div className="bg-amber-50/60 dark:bg-[#142338] p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">طريقة التهجي النوراني:</span>
                        {item.breakdown && (
                          <span className="text-[10px] text-slate-600 dark:text-slate-300 font-mono">
                            {item.breakdown}
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-slate-800 dark:text-amber-100 text-[11px]">
                        {item.pronunciation}
                      </p>
                    </div>

                    {/* Tajweed Note */}
                    {item.note && (
                      <div className="text-[11px] text-sky-800 dark:text-sky-300 flex items-start justify-end gap-1 pt-0.5">
                        <span className="leading-snug">{item.note}</span>
                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-sky-500" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Interactive Quiz / Testing for the Lesson */}
          {currentLesson.interactiveQuiz && currentLesson.interactiveQuiz.length > 0 && (
            <div className="p-4 rounded-3xl bg-white dark:bg-[#0A192F] border-2 border-emerald-400/40 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-950 pb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                  اختبر إتقانك للدرس
                </span>
                <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>سؤال الفهم السريع</span>
                  <HelpCircle className="w-4 h-4 text-emerald-500" />
                </h4>
              </div>

              {currentLesson.interactiveQuiz.map((quiz, qIdx) => {
                const answerKey = `${currentLesson.id}-${qIdx}`;
                const selectedAns = quizAnswers[answerKey];
                const isAnswered = selectedAns !== undefined;

                return (
                  <div key={qIdx} className="space-y-2 text-right">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {quiz.question}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {quiz.options.map((opt, optIdx) => {
                        const isCorrect = optIdx === quiz.correctIndex;
                        const isThisSelected = selectedAns === optIdx;

                        let btnStyle = 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';
                        if (isAnswered) {
                          if (isCorrect) {
                            btnStyle = 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-400 text-emerald-800 dark:text-emerald-200 font-bold';
                          } else if (isThisSelected) {
                            btnStyle = 'bg-rose-50 dark:bg-rose-950/70 border-rose-400 text-rose-700 dark:text-rose-300';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={isAnswered}
                            onClick={() => {
                              playChime(isCorrect ? 'success' : 'click');
                              triggerHaptic(isCorrect ? 'heavy' : 'light');
                              setQuizAnswers((prev) => ({ ...prev, [answerKey]: optIdx }));
                            }}
                            className={`p-2.5 rounded-xl text-xs text-right border transition-all cursor-pointer ${btnStyle}`}
                          >
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {isAnswered && (
                      <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200 leading-relaxed">
                        <span className="font-bold">التوضيح التجويدي: </span>
                        {quiz.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: LETTERS DIRECTORY (جدول الحروف الهجائية ومخارجها ونطقها بصوت رجالي قرآني) */}
      {activeSection === 'letters' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Male Reciter Audio Notice */}
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/60 text-right flex items-center justify-between">
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">
              تلاوة ونطق مسجل بصوت القارئ الذكر المتقن
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-200">
              <span>نطق الحروف بأصوات القراء الذكور</span>
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          {/* Search Input for Letters */}
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث عن حرف، مخرج، أو صفة..."
              value={searchLetter}
              onChange={(e) => setSearchLetter(e.target.value)}
              className="w-full bg-white dark:bg-[#0A192F] border border-sky-200 dark:border-sky-950 focus:border-[#0284C7] dark:focus:border-sky-400 rounded-2xl py-3 pr-11 pl-4 text-sm text-right outline-none text-slate-800 dark:text-white shadow-xs placeholder-slate-400"
            />
            <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5" />
          </div>

          {/* Quick Letter Chips Grid */}
          <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5 p-2 bg-white dark:bg-[#0A192F] rounded-2xl border border-sky-100 dark:border-sky-950 shadow-xs">
            {filteredLetters.map((letter) => {
              const isSelected = selectedLetter?.char === letter.char;
              const isSpeaking = speakingText === letter.char;

              return (
                <button
                  key={letter.char}
                  onClick={() => {
                    setSelectedLetter(letter);
                    handlePlayLetterAudio(letter);
                    playChime('click');
                  }}
                  className={`p-2 rounded-xl text-center font-amiri text-lg font-black transition-all cursor-pointer relative ${
                    isSpeaking
                      ? 'bg-emerald-600 text-white shadow-md scale-110 ring-2 ring-emerald-300 animate-pulse'
                      : isSelected
                      ? 'bg-amber-500 text-white shadow-xs scale-105 ring-2 ring-amber-300'
                      : 'bg-sky-50/70 dark:bg-[#0d223e] text-slate-800 dark:text-sky-100 hover:bg-amber-100 hover:text-amber-800'
                  }`}
                  title={`استمع لنطق حرف ${letter.name}`}
                >
                  {letter.char}
                </button>
              );
            })}
          </div>

          {/* Selected Letter Full Detailed Card */}
          {selectedLetter && (
            <div className="p-5 rounded-3xl bg-gradient-to-b from-white via-sky-50/30 to-amber-50/20 dark:from-[#0A192F] dark:to-[#08182D] border-2 border-amber-400/50 shadow-md space-y-3.5 text-right">
              {/* Header: Large Calligraphy & Name */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handlePlayLetterAudio(selectedLetter)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95 transition-all"
                  title="استمع لنطق هذا الحرف بصوت رجالي قرآني"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>استمع لنطق ({selectedLetter.name}) 🔊</span>
                </button>

                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="text-lg font-black font-amiri text-slate-900 dark:text-white">
                      حرف {selectedLetter.name} ({selectedLetter.char})
                    </h3>
                    <span className="text-[11px] text-sky-700 dark:text-sky-300 font-medium">
                      صوت قرآني رجالي متقن
                    </span>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border-2 border-amber-400/40 text-amber-700 dark:text-amber-300 flex items-center justify-center font-amiri text-4xl font-black">
                    {selectedLetter.char}
                  </div>
                </div>
              </div>

              {/* Makhraj & Sifah Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-sky-50 dark:bg-[#0f2442] border border-sky-200 dark:border-sky-800 space-y-1">
                  <span className="text-[10px] font-bold text-sky-800 dark:text-sky-300 block">المخرج الدقيق:</span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">
                    {selectedLetter.makhraj}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-[#1a2638] border border-amber-200 dark:border-amber-800 space-y-1">
                  <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 block">الصفات الصوتية والتجويدية:</span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">
                    {selectedLetter.sifah}
                  </p>
                </div>
              </div>

              {/* Tajweed Tip */}
              {selectedLetter.tajweedTip && (
                <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">توجيه تجويدي دقيق:</span>
                    <p className="leading-relaxed mt-0.5">{selectedLetter.tajweedTip}</p>
                  </div>
                </div>
              )}

              {/* Quranic Word Examples */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">أمثلة من آيات الذكر الحكيم:</span>
                <div className="flex flex-wrap gap-2 justify-end">
                  {selectedLetter.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0c1f3b] border border-sky-200 dark:border-sky-800 text-slate-900 dark:text-white font-amiri text-base font-bold shadow-2xs"
                    >
                      <span>{ex}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: MAKHARIJ AL-HURUF (مخارج الحروف المصورة) */}
      {activeSection === 'makharij' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Illustration Card for Articulation Points */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#0A192F] border-2 border-sky-300 dark:border-sky-800 shadow-md space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/15 text-[#0284C7] dark:text-sky-300">
                لوحة تشريحية معتمدة
              </span>
              <h3 className="text-sm sm:text-base font-black font-amiri text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>مخارج الحروف العربية وقراءتها القرآنية</span>
                <Layers className="w-4 h-4 text-[#0284C7]" />
              </h3>
            </div>

            <div className="rounded-2xl overflow-hidden border border-amber-400/40 shadow-inner bg-[#fdfbf7]">
              <img
                src={makharijImg}
                alt="لوحة مخارج الحروف العربية وقراءتها القرآنية"
                className="w-full h-auto object-cover"
                loading="eager"
              />
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 text-center leading-relaxed">
              توضيح مواضع خروج الحروف: الجوف، الحلق، اللسان، الشفتان، والخيشوم مع بيان الأحرف المرتبطة بكل مخرج.
            </p>
          </div>

          {/* Makharij Selector Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {MAKHARIJ_CATEGORIES.map((makhraj) => {
              const isSel = selectedMakhrajId === makhraj.id;
              return (
                <button
                  key={makhraj.id}
                  onClick={() => {
                    setSelectedMakhrajId(makhraj.id);
                    playChime('click');
                  }}
                  className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
                    isSel
                      ? 'bg-sky-50 dark:bg-[#0c2448] border-sky-400 ring-2 ring-sky-300/40 shadow-xs'
                      : 'bg-white dark:bg-[#0A192F] border-sky-100 dark:border-sky-950 hover:border-sky-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {toArabicNumerals(makhraj.letters.length)} أحرف
                    </span>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">
                      {makhraj.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                    {makhraj.description}
                  </p>
                  <div className="flex gap-1 justify-end flex-wrap mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {makhraj.letters.map((c, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300 font-amiri font-bold text-xs"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Makhraj Practical Guide Box */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-500/10 via-sky-500/10 to-teal-500/10 border border-amber-400/40 text-right space-y-1.5">
            <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center justify-end gap-1.5">
              <span>الإرشاد العملي لمخرج: {activeMakhraj.title}</span>
              <Info className="w-4 h-4 text-amber-600" />
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {activeMakhraj.guideText}
            </p>
          </div>
        </div>
      )}

      {/* SECTION 4: EDUCATIONAL BOARDS & GALLERY (اللوحات التعليمية المصورة الشاملة) */}
      {activeSection === 'rules' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Board 1: Tajweed & Harakat Infographic */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#0A192F] border-2 border-amber-400/40 shadow-md space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                لوحة جامعة
              </span>
              <h3 className="text-sm sm:text-base font-black font-amiri text-slate-900 dark:text-white">
                لوحة قواعد التجويد والحركات القرآنية
              </h3>
            </div>

            <div className="rounded-2xl overflow-hidden border border-amber-400/40 shadow-inner bg-[#fdfbf7]">
              <img
                src={tajweedRulesImg}
                alt="لوحة قواعد التجويد والحركات"
                className="w-full h-auto object-cover"
                loading="eager"
              />
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-[#142338] border border-amber-200 dark:border-amber-800 text-right text-xs space-y-1">
              <span className="font-bold text-amber-800 dark:text-amber-300 block">ملخص الضوابط المنهجية:</span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                تجمع هذه اللوحة الحركات الثلاث (فتحة، كسرة، ضمة)، والسكون، والتنوين، وحروف المد الثلاثة، والشدة، مع أمثلة قرآنية محققة تيسر الحفظ والمدارسة.
              </p>
            </div>
          </div>

          {/* Board 2: The Virtues of Quranic Learning Illustration */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#0A192F] border-2 border-sky-300 dark:border-sky-800 shadow-md space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500 text-white shadow-xs">
                أدب التلقي
              </span>
              <h3 className="text-sm sm:text-base font-black font-amiri text-slate-900 dark:text-white">
                تلقي القرآن ومجالسة أهل العلم
              </h3>
            </div>

            <div className="rounded-2xl overflow-hidden border border-sky-400/40 shadow-inner bg-[#fdfbf7]">
              <img
                src={readingChildImg}
                alt="تلقي القرآن ومجالسة أهل العلم"
                className="w-full h-auto object-cover"
                loading="eager"
              />
            </div>

            <div className="p-3 rounded-2xl bg-sky-50/70 dark:bg-[#0c2448] border border-sky-200 dark:border-sky-800 text-right text-xs space-y-1">
              <span className="font-bold text-sky-800 dark:text-sky-300 block">فضل مدارسة القرآن الكريم:</span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                قال رسول الله ﷺ: «مَا اجْتَمَعَ قَوْمٌ فِي بَيْتٍ مِنْ بُيُوتِ اللَّهِ، يَتْلُونَ كِتَابَ اللَّهِ، وَيَتَدَارَسُونَهُ بَيْنَهُمْ، إِلَّا نَزَلَتْ عَلَيْهِمِ السَّكِينَةُ، وَغَشِيَتْهُمُ الرَّحْمَةُ وَحَفَّتْهُمُ الْمَلَائِكَةُ، وَذَكَرَهُمُ اللَّهُ فِيمَنْ عِنْدَهُ».
              </p>
            </div>
          </div>

          {/* Golden Rules and Advice */}
          <div className="space-y-2.5">
            <span className="text-xs font-black text-slate-900 dark:text-white block text-right px-1">
              وصايا ذهبية لمعلم ومتعلم القاعدة النورانية:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {NOORANIYAH_TIPS.map((tip, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#0A192F] border border-sky-100 dark:border-sky-900 text-right space-y-1 shadow-xs"
                >
                  <h4 className="text-xs font-black text-amber-700 dark:text-amber-300">
                    {tip.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {tip.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

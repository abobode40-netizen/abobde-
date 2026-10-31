import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Flame, 
  Download,
  Share2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toArabicNumerals } from '../data/quranData';
import { playChime, triggerHaptic } from '../utils/audio';
import { loadSebhaCount, saveSebhaCount } from '../utils/storage';
import { UniversalExportModal } from './UniversalExportModal';
import { generateSebhaExport, ExportPayload } from '../utils/universalExport';

interface SebhaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SEBHA_PHRASES = [
  'سُبْحَانَ اللَّهِ',
  'الْحَمْدُ لِلَّهِ',
  'لَا إِلَهَ إِلَّا اللَّهُ',
  'اللَّهُ أَكْبَرُ',
  'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
  'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
  'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ',
  'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ'
];

export const SebhaModal: React.FC<SebhaModalProps> = ({ isOpen, onClose }) => {
  const [selectedPhraseIndex, setSelectedPhraseIndex] = useState(0);
  const [currentCount, setCurrentCount] = useState(0);
  const [targetCount, setTargetCount] = useState<number | 'open'>(33);
  const [totalLifetime, setTotalLifetime] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [phraseCounts, setPhraseCounts] = useState<Record<string, number>>({});
  
  // Export modal
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportPayload, setExportPayload] = useState<ExportPayload | null>(null);

  // Swipe gesture detection
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTotalLifetime(loadSebhaCount());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedPhrase = SEBHA_PHRASES[selectedPhraseIndex];

  const handleNextPhrase = () => {
    setSelectedPhraseIndex((prev) => (prev + 1) % SEBHA_PHRASES.length);
    setCurrentCount(0);
    playChime('click');
    triggerHaptic(20);
  };

  const handlePrevPhrase = () => {
    setSelectedPhraseIndex((prev) => (prev - 1 + SEBHA_PHRASES.length) % SEBHA_PHRASES.length);
    setCurrentCount(0);
    playChime('click');
    triggerHaptic(20);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        handleNextPhrase();
      } else {
        handlePrevPhrase();
      }
    }
    touchStartX.current = null;
  };

  const handleTap = () => {
    const nextCount = currentCount + 1;
    const nextTotal = totalLifetime + 1;
    setCurrentCount(nextCount);
    setTotalLifetime(nextTotal);
    saveSebhaCount(nextTotal);

    setPhraseCounts(prev => ({
      ...prev,
      [selectedPhrase]: (prev[selectedPhrase] || 0) + 1
    }));

    triggerHaptic(25);

    if (soundEnabled) {
      if (typeof targetCount === 'number' && nextCount % targetCount === 0) {
        playChime('milestone');
        triggerHaptic(60);
      } else {
        playChime('click');
      }
    }
  };

  const handleReset = () => {
    setCurrentCount(0);
    playChime('click');
    triggerHaptic(15);
  };

  const handleExport = () => {
    const counts = { ...phraseCounts, [selectedPhrase]: (phraseCounts[selectedPhrase] || 0) + currentCount };
    const payload = generateSebhaExport(counts, totalLifetime);
    setExportPayload(payload);
    setIsExportOpen(true);
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-[#061120]/80 backdrop-blur-md flex items-start justify-center p-3 sm:p-4 pt-4 sm:pt-8 animate-fadeIn overflow-y-auto"
        onClick={onClose}
      >
        <div 
          className="bg-gradient-to-b from-[#0c213f] to-[#08172c] border border-sky-500/40 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4 text-center relative overflow-hidden text-sky-100 arabesque-watermark"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Subtle background glow */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-sky-500/10 rounded-full border-[18px] border-sky-400/20 pointer-events-none" />

          {/* Top Header */}
          <div className="flex items-center justify-between pb-2 border-b border-sky-800/50">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-xl bg-sky-950/70 border border-sky-800/60 text-sky-300 hover:text-white transition-all cursor-pointer"
                title={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={handleReset}
                className="p-2 rounded-xl bg-sky-950/70 border border-sky-800/60 text-sky-300 hover:text-white transition-all cursor-pointer"
                title="تصفير العداد الحالي"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handleExport}
                className="p-2 rounded-xl bg-sky-950/70 border border-sky-800/60 text-sky-300 hover:text-white transition-all cursor-pointer"
                title="تصدير ومشاركة التسبيحات"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 font-bold text-sm text-sky-300">
              <span>المسبحة الذكية</span>
              <Flame className="w-4 h-4 text-amber-300" />
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-sky-950/70 border border-sky-800/60 flex items-center justify-center text-sky-300 hover:text-white cursor-pointer"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Phrase Selector with Swipe Arrows */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-sky-300/80 px-1">
              <span className="text-[10px] text-sky-400">اسحب لتغيير الذكر ⇆</span>
              <span>الذكر المختار:</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevPhrase}
                className="w-8 h-9 rounded-xl bg-sky-950/80 border border-sky-800/60 text-sky-300 hover:text-white flex items-center justify-center cursor-pointer"
                title="الذكر السابق"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <select
                value={selectedPhraseIndex}
                onChange={(e) => {
                  setSelectedPhraseIndex(Number(e.target.value));
                  setCurrentCount(0);
                }}
                className="flex-1 bg-[#091a30] border border-sky-700/50 rounded-xl py-2 px-3 text-xs font-bold text-white outline-none text-right cursor-pointer"
              >
                {SEBHA_PHRASES.map((p, idx) => (
                  <option key={idx} value={idx}>
                    {p}
                  </option>
                ))}
              </select>

              <button
                onClick={handleNextPhrase}
                className="w-8 h-9 rounded-xl bg-sky-950/80 border border-sky-800/60 text-sky-300 hover:text-white flex items-center justify-center cursor-pointer"
                title="الذكر التالي"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Target Buttons */}
          <div className="flex items-center justify-center gap-2 pt-0.5">
            {[33, 100, 'open' as const].map((t) => {
              const isSel = targetCount === t;
              return (
                <button
                  key={t}
                  onClick={() => {
                    setTargetCount(t);
                    setCurrentCount(0);
                    playChime('click');
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSel
                      ? 'bg-sky-500 text-white shadow-sm border border-sky-300'
                      : 'bg-sky-950/70 text-sky-300 border border-sky-800/50 hover:bg-sky-900/60'
                  }`}
                >
                  {t === 'open' ? 'مفتوح' : toArabicNumerals(t)}
                </button>
              );
            })}
          </div>

          {/* Digital Counter Display */}
          <div className="p-4 rounded-3xl bg-[#091a30] border-2 border-sky-500/40 shadow-inner my-1">
            <div className="text-4xl sm:text-5xl font-bold font-mono text-sky-300 tracking-wider">
              {toArabicNumerals(currentCount)}
            </div>
            {typeof targetCount === 'number' && (
              <span className="text-[11px] text-sky-300/70 font-medium block mt-1">
                الهدف: {toArabicNumerals(targetCount)}
              </span>
            )}
          </div>

          {/* Big Tap Area */}
          <button
            onClick={handleTap}
            className="w-full py-7 rounded-3xl bg-gradient-to-b from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-lg flex flex-col items-center justify-center gap-1 shadow-xl active:scale-95 transition-all border border-sky-400/50 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <span className="font-amiri text-lg sm:text-xl">{selectedPhrase}</span>
            <span className="text-[11px] text-sky-200 font-normal">اضغط للتسبيح</span>
          </button>

          {/* Total lifetime counter & Export shortcut */}
          <div className="flex items-center justify-between text-[11px] text-sky-300/80 pt-1 border-t border-sky-900/50">
            <button
              onClick={handleExport}
              className="text-sky-300 hover:text-white underline cursor-pointer"
            >
              تصدير السجل
            </button>
            <span>
              إجمالي تسبيحاتك المسجلة: <strong className="text-sky-300 font-mono font-bold">{toArabicNumerals(totalLifetime)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <UniversalExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        payload={exportPayload}
      />
    </>
  );
};

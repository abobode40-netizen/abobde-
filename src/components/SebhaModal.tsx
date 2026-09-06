import React, { useState, useEffect } from 'react';
import { 
  X, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Flame, 
  Check, 
  ChevronDown 
} from 'lucide-react';
import { toArabicNumerals } from '../data/quranData';
import { playChime, triggerHaptic } from '../utils/audio';
import { loadSebhaCount, saveSebhaCount } from '../utils/storage';

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
  const [selectedPhrase, setSelectedPhrase] = useState(SEBHA_PHRASES[0]);
  const [currentCount, setCurrentCount] = useState(0);
  const [targetCount, setTargetCount] = useState<number | 'open'>(33);
  const [totalLifetime, setTotalLifetime] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setTotalLifetime(loadSebhaCount());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTap = () => {
    const nextCount = currentCount + 1;
    const nextTotal = totalLifetime + 1;
    setCurrentCount(nextCount);
    setTotalLifetime(nextTotal);
    saveSebhaCount(nextTotal);

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
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start justify-center p-3 sm:p-4 pt-4 sm:pt-8 animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-[#16241E] rounded-3xl p-6 max-w-sm w-full border border-amber-300/40 shadow-2xl space-y-4 text-center relative overflow-hidden my-0">
        {/* Decorative subtle background circle */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-400/10 rounded-full border-[18px] border-amber-400/20 pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-[#0F6B50]"
              title={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-[#0F6B50]"
              title="تصفير العداد"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 font-bold text-sm text-[#0F6B50] dark:text-[#2DD4BF]">
            <span>المسبحة الذكية</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Phrase Dropdown Picker */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 block text-right">الذكر المختار:</label>
          <select
            value={selectedPhrase}
            onChange={(e) => {
              setSelectedPhrase(e.target.value);
              setCurrentCount(0);
            }}
            className="w-full bg-[#FAF7F0] dark:bg-[#121D18] border border-[#E8DFC8] dark:border-[#2A3C34] rounded-xl py-2 px-3 text-xs font-bold text-[#19302A] dark:text-amber-100 outline-none text-right"
          >
            {SEBHA_PHRASES.map((p, idx) => (
              <option key={idx} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Target Buttons */}
        <div className="flex items-center justify-center gap-2 pt-1">
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
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  isSel
                    ? 'bg-[#0F6B50] text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                }`}
              >
                {t === 'open' ? 'مفتوح' : toArabicNumerals(t)}
              </button>
            );
          })}
        </div>

        {/* Digital Counter Display */}
        <div className="p-4 rounded-3xl bg-[#FAF7F0] dark:bg-[#121D18] border-2 border-[#D4AF37]/50 shadow-inner my-2">
          <div className="text-4xl sm:text-5xl font-bold font-mono text-[#0F6B50] dark:text-[#2DD4BF] tracking-wider">
            {toArabicNumerals(currentCount)}
          </div>
          {typeof targetCount === 'number' && (
            <span className="text-[11px] text-gray-500 font-medium block mt-1">
              الهدف: {toArabicNumerals(targetCount)}
            </span>
          )}
        </div>

        {/* Big Tap Area */}
        <button
          onClick={handleTap}
          className="w-full py-8 rounded-3xl bg-gradient-to-b from-[#0F6B50] to-[#0A4B37] hover:from-[#138061] hover:to-[#0F6B50] text-white font-bold text-lg flex flex-col items-center justify-center gap-1 shadow-lg active:scale-95 transition-all border-2 border-emerald-400/40"
        >
          <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
          <span className="font-amiri text-xl">{selectedPhrase}</span>
          <span className="text-[11px] text-emerald-200 font-normal">اضغط للتسبيح</span>
        </button>

        {/* Total lifetime counter */}
        <div className="text-[11px] text-gray-500 pt-1">
          إجمالي تسبيحاتك المسجلة: <span className="font-bold text-[#0F6B50] dark:text-[#2DD4BF]">{toArabicNumerals(totalLifetime)}</span>
        </div>
      </div>
    </div>
  );
};

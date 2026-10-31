import React from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Share2, 
  MoveHorizontal, 
  Sparkles,
  Download
} from 'lucide-react';
import { playChime, triggerHaptic } from '../utils/audio';

interface DoorActionBarProps {
  doorTitle?: string;
  onExport?: () => void;
  onOpenExport?: () => void;
  fontScale: number;
  onChangeFontScale: (scale: any) => void;
  swipeHint?: string;
  className?: string;
}

export const DoorActionBar: React.FC<DoorActionBarProps> = ({
  doorTitle,
  onExport,
  onOpenExport,
  fontScale,
  onChangeFontScale,
  swipeHint = 'اسحب يميناً ويساراً للتنقل',
  className = ''
}) => {
  const handleExportClick = onExport || onOpenExport;
  const fontScales = [100, 115, 130, 145];

  const handleZoom = (direction: 'up' | 'down') => {
    triggerHaptic('light');
    playChime('click');
    const currentIndex = fontScales.indexOf(fontScale) >= 0 ? fontScales.indexOf(fontScale) : 0;
    if (direction === 'up' && currentIndex < fontScales.length - 1) {
      onChangeFontScale(fontScales[currentIndex + 1]);
    } else if (direction === 'down' && currentIndex > 0) {
      onChangeFontScale(fontScales[currentIndex - 1]);
    }
  };

  const getScaleLabel = (scale: number) => {
    switch (scale) {
      case 100: return '100%';
      case 115: return '115%';
      case 130: return '130%';
      case 145: return '145%';
      default: return `${scale}%`;
    }
  };

  return (
    <div className={`w-full py-1.5 px-2.5 rounded-2xl bg-[#0d223d]/80 border border-sky-600/30 backdrop-blur-md shadow-md flex items-center justify-between gap-2 text-xs select-none ${className}`}>
      {/* Zoom Controls (خاصية التكبير) */}
      <div className="flex items-center gap-1 bg-[#09182b] py-1 px-1.5 rounded-xl border border-sky-800/50">
        <button
          onClick={() => handleZoom('down')}
          disabled={fontScale === 100}
          className="w-6 h-6 rounded-lg bg-sky-950/70 hover:bg-sky-800/70 disabled:opacity-30 disabled:pointer-events-none text-sky-200 flex items-center justify-center transition-all cursor-pointer"
          title="تصغير الخط"
          aria-label="تصغير الخط"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <span className="text-[11px] font-bold text-sky-200 min-w-[34px] text-center font-mono">
          {getScaleLabel(fontScale)}
        </span>

        <button
          onClick={() => handleZoom('up')}
          disabled={fontScale === 145}
          className="w-6 h-6 rounded-lg bg-sky-950/70 hover:bg-sky-800/70 disabled:opacity-30 disabled:pointer-events-none text-sky-200 flex items-center justify-center transition-all cursor-pointer"
          title="تكبير الخط"
          aria-label="تكبير الخط"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Swipe Navigation Indicator (خاصية السحب) */}
      <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-sky-300/80 bg-sky-950/50 px-2 py-1 rounded-xl border border-sky-800/30">
        <MoveHorizontal className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
        <span>{swipeHint}</span>
      </div>

      {/* Export / Share Button (خاصية التصدير) */}
      {handleExportClick && (
        <button
          onClick={() => {
            playChime('click');
            triggerHaptic('light');
            handleExportClick();
          }}
          className="flex items-center gap-1.5 py-1 px-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-[11px] shadow-sm transition-all active:scale-95 cursor-pointer border border-sky-400/40"
          title="تصدير ومشاركة محتوى هذا الباب"
        >
          <Download className="w-3 h-3" />
          <span>تصدير ومشاركة</span>
        </button>
      )}
    </div>
  );
};

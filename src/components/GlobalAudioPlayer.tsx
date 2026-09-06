import React from 'react';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { Play, Pause, SkipForward, SkipBack, X, FastForward, Rewind, Activity } from 'lucide-react';
import { triggerHaptic } from '../utils/audio';

export const GlobalAudioPlayer: React.FC = () => {
  const { currentTrack, isPlaying, currentTime, duration, playbackSpeed, pause, resume, skip, setSpeed, stop, isLoading } = useAudioPlayer();

  if (!currentTrack) return null;

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleToggleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 0.85];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setSpeed(speeds[nextIdx]);
    triggerHaptic(20);
  };

  return (
    <div className="fixed bottom-[88px] left-0 right-0 z-40 px-3 sm:px-4 max-w-lg mx-auto pointer-events-none animate-slideUp">
      <div className="bg-white/95 dark:bg-[#162720]/95 backdrop-blur-xl border border-[#E5DDCF] dark:border-[#283F34] shadow-xl rounded-2xl p-3 sm:p-4 pointer-events-auto flex flex-col gap-2 relative overflow-hidden">
        
        {/* Progress Bar Background */}
        <div 
          className="absolute bottom-0 left-0 h-1 bg-[#0F6B50] dark:bg-emerald-400 transition-all duration-300 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Play/Pause Button */}
            <button 
              onClick={() => isPlaying ? pause() : resume()}
              className="w-10 h-10 shrink-0 rounded-full bg-[#0F6B50] dark:bg-emerald-500 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
            >
              {isLoading ? (
                <Activity className="w-5 h-5 animate-pulse" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Track Info */}
            <div className="flex-1 min-w-0 text-right">
              <h4 className="font-bold text-sm text-[#19302A] dark:text-white truncate">
                {currentTrack.title}
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                {currentTrack.subtitle}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0" dir="ltr">
            <button 
              onClick={() => skip(-10)}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1F332B] text-gray-500 dark:text-gray-300 active:scale-95 transition-all"
              title="تراجع 10 ثوانٍ"
            >
              <Rewind className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button 
              onClick={() => skip(10)}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1F332B] text-gray-500 dark:text-gray-300 active:scale-95 transition-all"
              title="تقديم 10 ثوانٍ"
            >
              <FastForward className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            <button 
              onClick={handleToggleSpeed}
              className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-[#0F6B50] dark:text-emerald-300 font-bold text-[11px] sm:text-xs active:scale-95 transition-all w-10 text-center"
              title="تغيير سرعة الصوت"
            >
              {playbackSpeed}x
            </button>
            
            <button 
              onClick={stop}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-gray-400 hover:text-rose-500 active:scale-95 transition-all ml-1"
              title="إغلاق المشغل"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

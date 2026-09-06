import React from 'react';
import { Home } from 'lucide-react';
import { playChime } from '../utils/audio';

interface HomeButtonFloatingProps {
  currentTab: string;
  onGoHome: () => void;
}

export const HomeButtonFloating: React.FC<HomeButtonFloatingProps> = ({ currentTab, onGoHome }) => {
  // If we are already on home screen, do not show floating return button to keep UI clean
  if (currentTab === 'home') return null;

  return (
    <button
      onClick={() => {
        onGoHome();
        playChime('click');
      }}
      id="global-home-return-btn"
      aria-label="العودة إلى الصفحة الرئيسية"
      title="العودة إلى الصفحة الرئيسية"
      className="fixed top-3.5 left-3.5 z-40 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-[#162520]/95 text-[#0F6B50] dark:text-[#2DD4BF] border border-[#0F6B50]/30 dark:border-[#2DD4BF]/40 shadow-lg backdrop-blur-md flex items-center gap-1.5 text-xs font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer group"
    >
      <Home className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 text-amber-600 dark:text-amber-400" />
      <span className="hidden sm:inline">الرئيسية</span>
    </button>
  );
};

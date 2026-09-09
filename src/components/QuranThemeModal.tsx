import React from 'react';
import { X, Check, Palette, Sparkles, BookOpen, Sun, Moon } from 'lucide-react';
import { QuranThemeId } from '../types';
import { QURAN_THEMES, getQuranTheme } from '../utils/quranThemes';
import { playChime, triggerHaptic } from '../utils/audio';

interface QuranThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedThemeId: QuranThemeId;
  onSelectTheme: (themeId: QuranThemeId) => void;
}

export const QuranThemeModal: React.FC<QuranThemeModalProps> = ({
  isOpen,
  onClose,
  selectedThemeId,
  onSelectTheme
}) => {
  if (!isOpen) return null;

  const handleSelect = (id: QuranThemeId) => {
    onSelectTheme(id);
    playChime('click');
    triggerHaptic(20);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div 
        className="bg-[#FAF8F2] dark:bg-[#121E19] w-full max-w-lg rounded-3xl border border-[#DCD3BE] dark:border-[#283E34] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-white dark:bg-[#162720] border-b border-[#EAE3D2] dark:border-[#23382F] flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              playChime('click');
            }}
            className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-[#1F332A] flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white transition-colors"
            title="إغلاق"
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 text-[#0F6B50] dark:text-[#2DD4BF] font-bold text-xs">
              <span>تجديد المظهر القرآني</span>
              <Palette className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold font-amiri text-[#19302A] dark:text-white mt-0.5">
              سمات وتصميم صفحة المصحف الشريف
            </h3>
          </div>
        </div>

        {/* Informative Guidance Banner */}
        <div className="px-4 py-3 bg-amber-50/70 dark:bg-amber-950/30 border-b border-amber-200/50 dark:border-amber-900/30 flex items-start gap-2.5 text-right">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#5C4D2E] dark:text-amber-200/90 leading-relaxed font-medium">
            جميع السمات تحتفظ بنفس النص المعتمد برسم المدينة المنورة العثماني، مع إمكانية التبديل بين الزخارف والخلفيات وألوان الإطارات حسب وقت قراءتك وراحة عينيك.
          </p>
        </div>

        {/* Scrollable Themes List */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1 no-scrollbar">
          {QURAN_THEMES.map((theme) => {
            const isSelected = selectedThemeId === theme.id;

            return (
              <div
                key={theme.id}
                onClick={() => handleSelect(theme.id)}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer active:scale-[0.99] relative ${
                  isSelected
                    ? 'border-[#0F6B50] dark:border-[#2DD4BF] bg-white dark:bg-[#172A22] shadow-md ring-2 ring-[#0F6B50]/20'
                    : 'border-[#E2D9C7] dark:border-[#253B30] bg-white/70 dark:bg-[#14221C] hover:border-[#0F6B50]/50'
                }`}
              >
                {/* Top Row: Title, Badge, and Selection Radio */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    {isSelected ? (
                      <span className="w-6 h-6 rounded-full bg-[#0F6B50] dark:bg-[#2DD4BF] text-white dark:text-[#063224] flex items-center justify-center text-xs shadow-xs font-bold">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center" />
                    )}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-[#855D10] dark:text-amber-300 border border-amber-300/40">
                      {theme.badge}
                    </span>
                  </div>

                  <div className="text-right">
                    <h4 className="font-bold text-sm text-[#19302A] dark:text-white font-amiri flex items-center justify-end gap-1.5">
                      <span>{theme.name}</span>
                      {theme.isDarkTheme ? (
                        <Moon className="w-3.5 h-3.5 text-blue-400" />
                      ) : (
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                      )}
                    </h4>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium block">
                      {theme.subname}
                    </span>
                  </div>
                </div>

                {/* Theme Description */}
                <p className="text-[11px] text-[#4A5568] dark:text-gray-300 text-right leading-relaxed mb-3">
                  {theme.description}
                </p>

                {/* Live Mini-Page Preview */}
                <div 
                  className={`p-3 rounded-xl border relative overflow-hidden text-right shadow-xs ${theme.containerBgClass} ${theme.containerBorderClass}`}
                  style={{ minHeight: '84px' }}
                >
                  {/* Mini Ribbon Header */}
                  <div className={`flex items-center justify-between pb-1.5 mb-2 border-b text-[9px] font-bold ${theme.ribbonClass}`}>
                    <span className={theme.headerSubtextColor}>الجزء ٣٠</span>
                    <span className={`font-amiri font-bold ${theme.headerTextColor}`}>سورة الإخلاص</span>
                    <span className={theme.headerSubtextColor}>مكية</span>
                  </div>

                  {/* Sample Ayahs Line */}
                  <div className={`font-quran text-center text-xs font-bold leading-loose ${theme.ayahTextColor}`}>
                    <span>قُلْ هُوَ اللَّهُ أَحَدٌ </span>
                    <span className={`inline-block px-1 ${theme.ayahMarkerColor}`}>۝١</span>
                    <span> اللَّهُ الصَّمَدُ </span>
                    <span className={`inline-block px-1 ${theme.ayahMarkerColor}`}>۝٢</span>
                  </div>

                  {/* Tiny Ornamental Dots */}
                  <div 
                    className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full opacity-70"
                    style={{ backgroundColor: theme.previewColors.border }}
                  />
                  <div 
                    className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full opacity-70"
                    style={{ backgroundColor: theme.previewColors.border }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-white dark:bg-[#162720] border-t border-[#EAE3D2] dark:border-[#23382F] flex items-center justify-between">
          <div className="text-right">
            <span className="text-[10px] text-gray-400 block">السمة المختارة حالياً:</span>
            <span className="text-xs font-bold text-[#0F6B50] dark:text-[#2DD4BF]">
              {getQuranTheme(selectedThemeId).name}
            </span>
          </div>

          <button
            onClick={() => {
              onClose();
              playChime('click');
            }}
            className="px-5 py-2.5 rounded-xl bg-[#0F6B50] hover:bg-[#138061] text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>تطبيق والمتابعة</span>
          </button>
        </div>
      </div>
    </div>
  );
};

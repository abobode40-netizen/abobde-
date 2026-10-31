import React, { useState } from 'react';
import { 
  Home, 
  BookOpen, 
  BookCheck, 
  Lightbulb, 
  Sparkles, 
  CheckSquare, 
  Flame, 
  Compass, 
  Quote, 
  TreePine, 
  X,
  ChevronLeft
} from 'lucide-react';
import { AppTab } from '../types';
import { playChime, triggerHaptic } from '../utils/audio';

interface NavbarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenSebha: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onOpenSebha }) => {
  const [isDoorsMenuOpen, setIsDoorsMenuOpen] = useState(false);

  const handleTabClick = (tabId: AppTab) => {
    triggerHaptic('light');
    playChime('click');
    setIsDoorsMenuOpen(false);
    onSelectTab(tabId);
  };

  const handleSelectFromDoors = (tab: AppTab) => {
    triggerHaptic('selection');
    playChime('click');
    setIsDoorsMenuOpen(false);
    onSelectTab(tab);
  };

  return (
    <>
      {/* Doors Bottom Sheet Modal */}
      {isDoorsMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center animate-fadeIn">
          <div 
            className="w-full max-w-md bg-white dark:bg-[#15231D] rounded-t-3xl border-t border-[#E5DDCF] dark:border-[#2A3C34] p-5 shadow-2xl space-y-4 animate-slideUp max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-sky-800/40 pb-3">
              <button
                onClick={() => setIsDoorsMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-sky-950 border border-sky-800 text-sky-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="text-right">
                <h2 className="text-base font-bold text-white flex items-center gap-1.5 justify-end">
                  <span>أبواب جنّة الرحمن</span>
                  <Compass className="w-4 h-4 text-sky-400" />
                </h2>
                <p className="text-[11px] text-sky-300/70">انتقل مباشرة لأي باب من أبواب التطبيق</p>
              </div>
            </div>

            {/* Doors Grid in Sheet */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* مشكاة النور (Highlight) */}
              <button
                onClick={() => handleSelectFromDoors('mishkat')}
                className={`p-3.5 rounded-2xl text-right border transition-all flex flex-col justify-between min-h-[105px] col-span-2 bg-gradient-to-r from-amber-950/40 to-sky-950/40 ${
                  currentTab === 'mishkat'
                    ? 'border-amber-400 ring-2 ring-amber-400/30'
                    : 'border-sky-800/50 hover:border-amber-400'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                    جديد • سيرة الشباب
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-900/60 text-amber-300 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white mt-2">باب مشكاة النور</h4>
                  <p className="text-[10px] text-sky-200/80 line-clamp-1 mt-0.5">
                    مقتطفات ودروس سيرة المصطفى ﷺ محققة لنفع الشباب
                  </p>
                </div>
              </button>

              {/* الأدعية المأثورة */}
              <button
                onClick={() => handleSelectFromDoors('duas')}
                className={`p-3.5 rounded-2xl text-right border transition-all flex flex-col justify-between min-h-[100px] col-span-2 bg-gradient-to-r from-sky-950/50 to-blue-950/50 ${
                  currentTab === 'duas'
                    ? 'border-sky-400 ring-2 ring-sky-400/30'
                    : 'border-sky-800/50 hover:border-sky-400'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-600 text-white">
                    ختم القرآن ومأثور الأدعية
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-sky-900/60 text-sky-300 flex items-center justify-center">
                    <BookCheck className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white mt-2">باب الأدعية المأثورة</h4>
                  <p className="text-[10px] text-sky-200/80 line-clamp-1 mt-0.5">
                    دعاء ختم القرآن، أدعية القرآن الكريم، وصحيح السنة
                  </p>
                </div>
              </button>

              {/* بوصلة القبلة المشرفة */}
              <button
                onClick={() => handleSelectFromDoors('qibla')}
                className={`p-3.5 rounded-2xl text-right border transition-all flex flex-col justify-between min-h-[100px] col-span-2 bg-gradient-to-r from-sky-950/50 to-blue-900/40 ${
                  currentTab === 'qibla'
                    ? 'border-sky-400 ring-2 ring-sky-400/30'
                    : 'border-sky-800/50 hover:border-sky-400'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] text-sky-200 font-bold px-2 py-0.5 rounded-full bg-sky-900 border border-sky-700/50">
                    مستشعر الجيروسكوب • دقة جغرافية
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-sky-900/80 text-sky-300 flex items-center justify-center">
                    <Compass className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-1">
                  <h4 className="text-xs font-bold text-white">بوصلة القبلة المشرفة</h4>
                  <p className="text-[10px] text-sky-200/80 line-clamp-1 mt-0.5">
                    تحديد اتجاه الكعبة المشرفة بدقة مع المسافة والإرشادات
                  </p>
                </div>
              </button>

              {/* غراس الأذكار */}
              <button
                onClick={() => handleSelectFromDoors('athkar')}
                className={`p-3 rounded-2xl text-right border transition-all flex flex-col justify-between min-h-[90px] bg-[#0c1f38] ${
                  currentTab === 'athkar'
                    ? 'border-sky-400 ring-2 ring-sky-400/30'
                    : 'border-sky-800/50 hover:border-sky-500'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-sky-900/60 text-sky-300 flex items-center justify-center self-end">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">غراس الأذكار</h4>
                  <p className="text-[10px] text-sky-300/70 mt-0.5">أذكار الصباح والمساء واليوم</p>
                </div>
              </button>

              {/* شجرة العبادات */}
              <button
                onClick={() => handleSelectFromDoors('tracker')}
                className={`p-3 rounded-2xl text-right border transition-all flex flex-col justify-between min-h-[90px] bg-[#0c1f38] ${
                  currentTab === 'tracker'
                    ? 'border-sky-400 ring-2 ring-sky-400/30'
                    : 'border-sky-800/50 hover:border-sky-500'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-sky-900/60 text-sky-300 flex items-center justify-center self-end">
                  <TreePine className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">شجرة العبادات</h4>
                  <p className="text-[10px] text-sky-300/70 mt-0.5">متابعة الصلاة والورد اليومي</p>
                </div>
              </button>

              {/* ثمار المشايخ والمكتبة الصوتية */}
              <button
                onClick={() => handleSelectFromDoors('thimar')}
                className={`p-3.5 rounded-2xl text-right border transition-all flex flex-col justify-between min-h-[100px] col-span-2 bg-gradient-to-r from-purple-950/40 to-sky-950/40 ${
                  currentTab === 'thimar'
                    ? 'border-purple-400 ring-2 ring-purple-400/30'
                    : 'border-sky-800/50 hover:border-purple-400'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] text-purple-300 font-bold px-2 py-0.5 rounded-full bg-purple-950 border border-purple-800/50">
                    صوتيات 2-5 د • كبار مشايخ أهل السنة
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-purple-950/80 text-purple-300 flex items-center justify-center">
                    <Quote className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-1">
                  <h4 className="text-xs font-bold text-white">المكتبة الصوتية وثمار المشايخ</h4>
                  <p className="text-[10px] text-sky-200/80 line-clamp-1 mt-0.5">
                    مقتطفات دعوية للشباب (2-5 دقائق) لأهل السنة، ودرر العلماء
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Floating Sebha Button (Always easily reachable on bottom left) */}
      <button
        onClick={() => {
          triggerHaptic('medium');
          playChime('click');
          onOpenSebha();
        }}
        title="المسبحة الإلكترونية"
        aria-label="المسبحة الإلكترونية"
        className="fixed bottom-20 left-3 sm:left-4 z-40 bg-gradient-to-tr from-[#C19E2B] to-[#E5C158] text-white p-3 rounded-full shadow-xl border-2 border-white dark:border-[#141F1B] hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
      >
        <Flame className="w-5 h-5 text-white animate-pulse" />
      </button>

      {/* Main Persistent Bottom Navigation Bar - 5 Direct Explicit Tabs in Islamic Blue Theme */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#0a192f]/95 dark:bg-[#071426]/95 backdrop-blur-md border-t border-[#1f426c] shadow-2xl">
        <div className="max-w-md mx-auto px-1.5 h-16 flex items-center justify-between relative">
          {/* Tab 1: الرئيسية */}
          <button
            onClick={() => handleTabClick('home')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 relative ${
              currentTab === 'home'
                ? 'text-sky-300 font-bold'
                : 'text-sky-200/50 hover:text-sky-200'
            }`}
          >
            {currentTab === 'home' && (
              <span className="absolute -top-2 w-7 h-1 bg-sky-400 rounded-full shadow-sm" />
            )}
            <Home className={`w-5 h-5 mb-0.5 ${currentTab === 'home' ? 'scale-110' : ''} transition-transform`} />
            <span className="text-[10px] sm:text-[11px] leading-tight font-medium">الرئيسية</span>
          </button>

          {/* Tab 2: القرآن */}
          <button
            onClick={() => handleTabClick('quran')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 relative ${
              currentTab === 'quran'
                ? 'text-sky-300 font-bold'
                : 'text-sky-200/50 hover:text-sky-300'
            }`}
          >
            {currentTab === 'quran' && (
              <span className="absolute -top-2 w-7 h-1 bg-sky-400 rounded-full shadow-sm" />
            )}
            <BookOpen className={`w-5 h-5 mb-0.5 ${currentTab === 'quran' ? 'scale-110' : ''} transition-transform`} />
            <span className="text-[10px] sm:text-[11px] leading-tight font-medium">القرآن</span>
          </button>

          {/* Tab 3: الأدعية المأثورة */}
          <button
            onClick={() => handleTabClick('duas')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 relative ${
              currentTab === 'duas'
                ? 'text-sky-300 font-bold'
                : 'text-sky-200/50 hover:text-sky-300'
            }`}
          >
            {currentTab === 'duas' && (
              <span className="absolute -top-2 w-7 h-1 bg-sky-400 rounded-full shadow-sm" />
            )}
            <div className="relative">
              <BookCheck className={`w-5 h-5 mb-0.5 ${currentTab === 'duas' ? 'scale-110' : ''} transition-transform`} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-sky-400 rounded-full ring-1 ring-[#0a192f]" />
            </div>
            <span className="text-[10px] sm:text-[11px] leading-tight font-medium">الأدعية</span>
          </button>

          {/* Tab 4: مشكاة النور */}
          <button
            onClick={() => handleTabClick('mishkat')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 relative ${
              currentTab === 'mishkat'
                ? 'text-amber-400 font-bold'
                : 'text-sky-200/50 hover:text-amber-300'
            }`}
          >
            {currentTab === 'mishkat' && (
              <span className="absolute -top-2 w-7 h-1 bg-amber-400 rounded-full shadow-sm" />
            )}
            <div className="relative">
              <Lightbulb className={`w-5 h-5 mb-0.5 ${currentTab === 'mishkat' ? 'scale-110' : ''} transition-transform`} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full ring-1 ring-[#0a192f]" />
            </div>
            <span className="text-[10px] sm:text-[11px] leading-tight font-medium">مشكاة النور</span>
          </button>

          {/* Tab 5: الأذكار والأبواب */}
          <button
            onClick={() => {
              if (['tracker', 'thimar'].includes(currentTab)) {
                setIsDoorsMenuOpen(true);
              } else if (currentTab === 'athkar') {
                setIsDoorsMenuOpen(true);
              } else {
                handleTabClick('athkar');
              }
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 relative ${
              ['athkar', 'tracker', 'thimar'].includes(currentTab)
                ? 'text-purple-300 font-bold'
                : 'text-sky-200/50 hover:text-purple-200'
            }`}
          >
            {['athkar', 'tracker', 'thimar'].includes(currentTab) && (
              <span className="absolute -top-2 w-7 h-1 bg-purple-400 rounded-full shadow-sm" />
            )}
            <Sparkles className={`w-5 h-5 mb-0.5 ${['athkar', 'tracker', 'thimar'].includes(currentTab) ? 'scale-110' : ''} transition-transform`} />
            <span className="text-[10px] sm:text-[11px] leading-tight font-medium">
              {currentTab === 'tracker' ? 'المتابعة' : currentTab === 'thimar' ? 'الثمار' : 'الأذكار'}
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

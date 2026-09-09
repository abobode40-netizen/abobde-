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
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <button
                onClick={() => setIsDoorsMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="text-right">
                <h2 className="text-base font-bold text-[#143128] dark:text-white flex items-center gap-1.5 justify-end">
                  <span>أبواب جنّة الرحمن</span>
                  <Compass className="w-4 h-4 text-[#0F6B50] dark:text-[#2DD4BF]" />
                </h2>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">انتقل مباشرة لأي باب من أبواب التطبيق</p>
              </div>
            </div>

            {/* Doors Grid in Sheet */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* مشكاة النور (Highlight) */}
              <button
                onClick={() => handleSelectFromDoors('mishkat')}
                className={`p-3.5 rounded-2xl text-right border transition-all flex flex-col justify-between min-h-[105px] col-span-2 bg-gradient-to-r from-amber-50 to-emerald-50/50 dark:from-[#241F12] dark:to-[#14261F] ${
                  currentTab === 'mishkat'
                    ? 'border-[#B45309] dark:border-[#F59E0B] ring-2 ring-amber-400/30'
                    : 'border-[#E5DDCF] dark:border-[#2A3C34] hover:border-amber-400'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                    جديد • سيرة الشباب
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white mt-2">باب مشكاة النور</h4>
                  <p className="text-[10px] text-gray-600 dark:text-gray-300 line-clamp-1 mt-0.5">
                    مقتطفات ودروس سيرة المصطفى ﷺ محققة لنفع الشباب
                  </p>
                </div>
              </button>

              {/* الأدعية المأثورة */}
              <button
                onClick={() => handleSelectFromDoors('duas')}
                className={`p-3.5 rounded-2xl text-right border transition-all flex flex-col justify-between min-h-[100px] col-span-2 bg-gradient-to-r from-emerald-50/70 to-teal-50/40 dark:from-[#132A20] dark:to-[#10241E] ${
                  currentTab === 'duas'
                    ? 'border-[#0F6B50] dark:border-[#2DD4BF] ring-2 ring-emerald-400/30'
                    : 'border-[#E5DDCF] dark:border-[#2A3C34] hover:border-emerald-500'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0F6B50] text-white">
                    ختم القرآن ومأثور الأدعية
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-[#0F6B50] dark:text-[#2DD4BF] flex items-center justify-center">
                    <BookCheck className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white mt-2">باب الأدعية المأثورة</h4>
                  <p className="text-[10px] text-gray-600 dark:text-gray-300 line-clamp-1 mt-0.5">
                    دعاء ختم القرآن، أدعية القرآن الكريم، وصحيح السنة
                  </p>
                </div>
              </button>

              {/* بوصلة القبلة المشرفة */}
              <button
                onClick={() => handleSelectFromDoors('qibla')}
                className={`p-3.5 rounded-2xl text-right border transition-all flex flex-col justify-between min-h-[100px] col-span-2 bg-gradient-to-r from-emerald-50 to-teal-50/60 dark:from-[#0E2820] dark:to-[#0D241C] ${
                  currentTab === 'qibla'
                    ? 'border-[#0F6B50] dark:border-[#2DD4BF] ring-2 ring-emerald-400/30'
                    : 'border-[#E5DDCF] dark:border-[#2A3C34] hover:border-emerald-500'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-200 font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950">
                    مستشعر الجيروسكوب • دقة جغرافية
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-[#0F6B50] dark:text-[#2DD4BF] flex items-center justify-center">
                    <Compass className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-1">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">بوصلة القبلة المشرفة</h4>
                  <p className="text-[10px] text-gray-600 dark:text-gray-300 line-clamp-1 mt-0.5">
                    تحديد اتجاه الكعبة المشرفة بدقة مع المسافة والإرشادات
                  </p>
                </div>
              </button>

              {/* غراس الأذكار */}
              <button
                onClick={() => handleSelectFromDoors('athkar')}
                className={`p-3 rounded-2xl text-right border transition-all flex flex-col justify-between min-h-[90px] bg-white dark:bg-[#1A2822] ${
                  currentTab === 'athkar'
                    ? 'border-[#0F6B50] dark:border-[#2DD4BF] ring-2 ring-emerald-400/30'
                    : 'border-[#E5DDCF] dark:border-[#2A3C34]'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center self-end">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">غراس الأذكار</h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">أذكار الصباح والمساء واليوم</p>
                </div>
              </button>

              {/* شجرة العبادات */}
              <button
                onClick={() => handleSelectFromDoors('tracker')}
                className={`p-3 rounded-2xl text-right border transition-all flex flex-col justify-between min-h-[90px] bg-white dark:bg-[#1A2822] ${
                  currentTab === 'tracker'
                    ? 'border-[#0F6B50] dark:border-[#2DD4BF] ring-2 ring-emerald-400/30'
                    : 'border-[#E5DDCF] dark:border-[#2A3C34]'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center self-end">
                  <TreePine className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">شجرة العبادات</h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">متابعة الصلاة والورد اليومي</p>
                </div>
              </button>

              {/* ثمار المشايخ والمكتبة الصوتية */}
              <button
                onClick={() => handleSelectFromDoors('thimar')}
                className={`p-3.5 rounded-2xl text-right border transition-all flex flex-col justify-between min-h-[100px] col-span-2 bg-gradient-to-r from-purple-50/70 to-emerald-50/40 dark:from-[#20142B] dark:to-[#12241C] ${
                  currentTab === 'thimar'
                    ? 'border-[#0F6B50] dark:border-[#2DD4BF] ring-2 ring-emerald-400/30'
                    : 'border-[#E5DDCF] dark:border-[#2A3C34]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] text-purple-700 dark:text-purple-300 font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950">
                    صوتيات 2-5 د • كبار مشايخ أهل السنة
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                    <Quote className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-1">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">المكتبة الصوتية وثمار المشايخ</h4>
                  <p className="text-[10px] text-gray-600 dark:text-gray-300 line-clamp-1 mt-0.5">
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

      {/* Main Persistent Bottom Navigation Bar - 5 Direct Explicit Tabs */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#141F1B]/95 backdrop-blur-md border-t border-[#E5DDCF] dark:border-[#2A3C34] shadow-lg">
        <div className="max-w-md mx-auto px-1.5 h-16 flex items-center justify-between relative">
          {/* Tab 1: الرئيسية */}
          <button
            onClick={() => handleTabClick('home')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 relative ${
              currentTab === 'home'
                ? 'text-[#0F6B50] dark:text-[#2DD4BF] font-bold'
                : 'text-[#7A877B] dark:text-[#8FA59A] hover:text-[#0F6B50]'
            }`}
          >
            {currentTab === 'home' && (
              <span className="absolute -top-2 w-7 h-1 bg-[#0F6B50] dark:bg-[#2DD4BF] rounded-full shadow-sm" />
            )}
            <Home className={`w-5 h-5 mb-0.5 ${currentTab === 'home' ? 'scale-110' : ''} transition-transform`} />
            <span className="text-[10px] sm:text-[11px] leading-tight font-medium">الرئيسية</span>
          </button>

          {/* Tab 2: القرآن */}
          <button
            onClick={() => handleTabClick('quran')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 relative ${
              currentTab === 'quran'
                ? 'text-[#0F6B50] dark:text-[#2DD4BF] font-bold'
                : 'text-[#7A877B] dark:text-[#8FA59A] hover:text-[#0F6B50]'
            }`}
          >
            {currentTab === 'quran' && (
              <span className="absolute -top-2 w-7 h-1 bg-[#0F6B50] dark:bg-[#2DD4BF] rounded-full shadow-sm" />
            )}
            <BookOpen className={`w-5 h-5 mb-0.5 ${currentTab === 'quran' ? 'scale-110' : ''} transition-transform`} />
            <span className="text-[10px] sm:text-[11px] leading-tight font-medium">القرآن</span>
          </button>

          {/* Tab 3: الأدعية المأثورة (ظهور مباشر صريح) */}
          <button
            onClick={() => handleTabClick('duas')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 relative ${
              currentTab === 'duas'
                ? 'text-[#0F6B50] dark:text-[#2DD4BF] font-bold'
                : 'text-[#7A877B] dark:text-[#8FA59A] hover:text-[#0F6B50]'
            }`}
          >
            {currentTab === 'duas' && (
              <span className="absolute -top-2 w-7 h-1 bg-[#0F6B50] dark:bg-[#2DD4BF] rounded-full shadow-sm" />
            )}
            <div className="relative">
              <BookCheck className={`w-5 h-5 mb-0.5 ${currentTab === 'duas' ? 'scale-110' : ''} transition-transform`} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full ring-1 ring-white dark:ring-[#141F1B]" />
            </div>
            <span className="text-[10px] sm:text-[11px] leading-tight font-medium">الأدعية</span>
          </button>

          {/* Tab 4: مشكاة النور (ظهور مباشر صريح) */}
          <button
            onClick={() => handleTabClick('mishkat')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 relative ${
              currentTab === 'mishkat'
                ? 'text-[#B45309] dark:text-[#F59E0B] font-bold'
                : 'text-[#7A877B] dark:text-[#8FA59A] hover:text-amber-600'
            }`}
          >
            {currentTab === 'mishkat' && (
              <span className="absolute -top-2 w-7 h-1 bg-[#B45309] dark:bg-[#F59E0B] rounded-full shadow-sm" />
            )}
            <div className="relative">
              <Lightbulb className={`w-5 h-5 mb-0.5 ${currentTab === 'mishkat' ? 'scale-110' : ''} transition-transform`} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full ring-1 ring-white dark:ring-[#141F1B]" />
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
                ? 'text-[#0F6B50] dark:text-[#2DD4BF] font-bold'
                : 'text-[#7A877B] dark:text-[#8FA59A] hover:text-[#0F6B50]'
            }`}
          >
            {['athkar', 'tracker', 'thimar'].includes(currentTab) && (
              <span className="absolute -top-2 w-7 h-1 bg-[#0F6B50] dark:bg-[#2DD4BF] rounded-full shadow-sm" />
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

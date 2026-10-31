import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, 
  BookOpen, 
  BookCheck, 
  Lightbulb, 
  Sparkles, 
  TreePine, 
  Compass, 
  Quote, 
  Search, 
  Settings, 
  Flame, 
  ChevronDown, 
  ZoomIn, 
  ZoomOut, 
  Type, 
  X,
  Check,
  Sparkle
} from 'lucide-react';
import { AppTab, AppSettings } from '../types';
import { playChime, triggerHaptic } from '../utils/audio';

interface TopNavbarWithDropdownProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenSebha: () => void;
  fontScale: 100 | 115 | 130 | 145;
  onChangeFontScale: (scale: 100 | 115 | 130 | 145) => void;
}

interface DoorItem {
  id: AppTab;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

export const TopNavbarWithDropdown: React.FC<TopNavbarWithDropdownProps> = ({
  currentTab,
  onSelectTab,
  onOpenSebha,
  fontScale,
  onChangeFontScale,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [showScaleToast, setShowScaleToast] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const doors: DoorItem[] = [
    {
      id: 'home',
      title: 'الرئيسية',
      subtitle: 'الورد اليومي، شجرة العبادات، ومواقيت الصلاة',
      icon: Home,
      accentColor: '#38BDF8'
    },
    {
      id: 'quran',
      title: 'المصحف الشريف والقرآن',
      subtitle: 'تلاوات لكبار القراء، تفسير ميسر، وحفظ الآيات',
      badge: 'القرآن كاملاً',
      badgeColor: 'bg-sky-600',
      icon: BookOpen,
      accentColor: '#38BDF8'
    },
    {
      id: 'duas',
      title: 'الأدعية المأثورة ونصح الشباب',
      subtitle: 'أدعية الشباب، ختم القرآن، الرقية، وتفريج الكروب',
      badge: 'مُحدّث • أدعية الشباب',
      badgeColor: 'bg-sky-600',
      icon: BookCheck,
      accentColor: '#0EA5E9'
    },
    {
      id: 'mishkat',
      title: 'مشكاة الأنوار (قبسات السيرة النبوية)',
      subtitle: 'مواقف شريفة لتربية وهمّة الشباب محققة بالأسانيد',
      badge: 'جديد • قبسات السيرة',
      badgeColor: 'bg-amber-600',
      icon: Lightbulb,
      accentColor: '#F59E0B'
    },
    {
      id: 'athkar',
      title: 'غراس الأذكار وحصن المسلم',
      subtitle: 'أذكار الصباح والمساء والصلوات مع عداد ذكي',
      icon: Sparkles,
      accentColor: '#38BDF8'
    },
    {
      id: 'qibla',
      title: 'بوصلة القبلة المشرفة',
      subtitle: 'تحديد دقيق لاتجاه الكعبة بالدرجات والمسافة',
      badge: 'مستشعر دقيق',
      badgeColor: 'bg-sky-700',
      icon: Compass,
      accentColor: '#0284C7'
    },
    {
      id: 'tracker',
      title: 'شجرة العبادات ومحاسبة النفس',
      subtitle: 'متابعة الصلوات الخمس والسنن والورد القرآني',
      icon: TreePine,
      accentColor: '#38BDF8'
    },
    {
      id: 'thimar',
      title: 'المكتبة الصوتية وثمار المشايخ',
      subtitle: 'صوتيات دعوية قصيرة (2-5 د) لكبار علماء أهل السنة',
      badge: 'صوتيات مركزة',
      badgeColor: 'bg-purple-600',
      icon: Quote,
      accentColor: '#8B5CF6'
    },
    {
      id: 'search',
      title: 'البحث الشامل',
      subtitle: 'ابحث في الآيات، الأدعية، وقبسات السيرة',
      icon: Search,
      accentColor: '#64748B'
    },
    {
      id: 'settings',
      title: 'الإعدادات وتخصيص المظهر',
      subtitle: 'الخطوط، القراء، والتنبيهات',
      icon: Settings,
      accentColor: '#475569'
    }
  ];

  const currentDoor = doors.find((d) => d.id === currentTab) || doors[0];

  const filteredDoors = doors.filter((door) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return door.title.toLowerCase().includes(q) || door.subtitle.toLowerCase().includes(q);
  });

  const fontScales: Array<100 | 115 | 130 | 145> = [100, 115, 130, 145];

  const handleStepScale = (direction: 'up' | 'down') => {
    triggerHaptic('light');
    playChime('click');
    const currentIndex = fontScales.indexOf(fontScale);
    let nextIndex = currentIndex;
    if (direction === 'up' && currentIndex < fontScales.length - 1) {
      nextIndex = currentIndex + 1;
    } else if (direction === 'down' && currentIndex > 0) {
      nextIndex = currentIndex - 1;
    }
    if (nextIndex !== currentIndex) {
      onChangeFontScale(fontScales[nextIndex]);
      setShowScaleToast(true);
      setTimeout(() => setShowScaleToast(false), 1600);
    }
  };

  const getScaleLabel = (scale: number) => {
    switch (scale) {
      case 100: return 'عادي';
      case 115: return 'متوسط';
      case 130: return 'كبير';
      case 145: return 'كبير جداً';
      default: return `${scale}%`;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a192f]/90 dark:bg-[#081527]/95 backdrop-blur-md border-b border-[#20436d]/60 shadow-lg select-none">
      <div className="max-w-lg mx-auto px-3 h-14 flex items-center justify-between gap-2 relative">
        {/* Right side: App branding & Doors Dropdown Button */}
        <div className="flex items-center gap-2 relative" ref={dropdownRef}>
          <button
            onClick={() => {
              triggerHaptic('selection');
              playChime('click');
              setIsOpen(!isOpen);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#132c52] to-[#1c3f73] hover:from-[#1b3d70] hover:to-[#244f8f] border border-[#3b6da4]/50 shadow-inner text-white transition-all active:scale-95 group"
            title="انقر لفتح قائمة كل الأبواب"
            aria-label="قائمة أبواب التطبيق"
          >
            <currentDoor.icon className="w-4 h-4 text-amber-300 transition-transform group-hover:scale-110" />
            <div className="text-right flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                {currentDoor.title.split(' ')[0]} {currentDoor.title.split(' ')[1] || ''}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-amber-200 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Doors Dropdown Menu */}
          {isOpen && (
            <div className="absolute top-12 right-0 w-[310px] sm:w-[350px] bg-[#0c1f3b] border border-[#2b588f] rounded-2xl shadow-2xl overflow-hidden animate-fadeIn z-50 p-3 space-y-3 arabesque-watermark">
              {/* Dropdown Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#1f3f68]">
                <div className="text-right">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1 justify-end">
                    <span>أبواب جنّة الرحمن</span>
                    <Sparkle className="w-3.5 h-3.5 text-amber-300" />
                  </h3>
                  <p className="text-[10px] text-sky-200/70">الوصول السريع لكافة أقسام التطبيق</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-sky-200 flex items-center justify-center transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Font scaling control inside dropdown */}
              <div className="bg-[#122b50] p-2.5 rounded-xl border border-[#234b7d] flex items-center justify-between">
                <span className="text-[11px] font-bold text-sky-100 flex items-center gap-1">
                  <Type className="w-3.5 h-3.5 text-amber-300" />
                  <span>حجم الخط في الأبواب:</span>
                </span>
                <div className="flex items-center gap-1.5 bg-[#0a182e] px-1.5 py-1 rounded-lg border border-[#295080]">
                  <button
                    onClick={() => handleStepScale('down')}
                    disabled={fontScale <= 100}
                    className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-sky-200 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all"
                    title="تصغير الخط"
                  >
                    A-
                  </button>
                  <span className="text-[10px] font-bold text-amber-300 px-1 min-w-[42px] text-center">
                    {getScaleLabel(fontScale)}
                  </span>
                  <button
                    onClick={() => handleStepScale('up')}
                    disabled={fontScale >= 145}
                    className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-sky-200 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all"
                    title="تكبير الخط"
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* Quick Search inside Dropdown */}
              <div className="relative">
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="ابحث عن باب..."
                  className="w-full bg-[#081527] border border-[#20436d] rounded-xl px-3 py-1.5 pr-8 text-xs text-white placeholder-sky-300/40 focus:outline-none focus:border-amber-400 text-right"
                />
                <Search className="w-3.5 h-3.5 text-sky-300/50 absolute right-2.5 top-2.5 pointer-events-none" />
                {filterQuery && (
                  <button
                    onClick={() => setFilterQuery('')}
                    className="absolute left-2 top-2 text-sky-300/50 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Doors List */}
              <div className="max-h-[310px] overflow-y-auto space-y-1.5 pr-0.5">
                {filteredDoors.map((door) => {
                  const isActive = currentTab === door.id;
                  const Icon = door.icon;
                  return (
                    <button
                      key={door.id}
                      onClick={() => {
                        triggerHaptic('medium');
                        playChime('click');
                        setIsOpen(false);
                        onSelectTab(door.id);
                      }}
                      className={`w-full text-right p-2.5 rounded-xl transition-all flex items-center justify-between border ${
                        isActive
                          ? 'bg-gradient-to-l from-amber-500/20 to-[#193a67] border-amber-400/60 ring-1 ring-amber-400/40'
                          : 'bg-[#0f2545]/70 hover:bg-[#14325a] border-[#204574]/60 text-sky-100 hover:border-[#336aa6]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {door.badge && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md text-white ${door.badgeColor || 'bg-amber-600'}`}>
                            {door.badge}
                          </span>
                        )}
                        {isActive && <Check className="w-3.5 h-3.5 text-amber-300" />}
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center justify-end gap-1">
                            {door.title}
                          </h4>
                          <p className="text-[10px] text-sky-200/60 line-clamp-1">{door.subtitle}</p>
                        </div>
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/10"
                          style={{ backgroundColor: `${door.accentColor}25`, color: door.accentColor }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Center / Left: Quick Font Scale Buttons & Sebha Action */}
        <div className="flex items-center gap-1.5">
          {/* Global Font Zoom Button Group (A- / A / A+) */}
          <div className="flex items-center bg-[#0d223e] border border-[#2b5587] rounded-xl p-0.5 shadow-sm">
            <button
              onClick={() => handleStepScale('down')}
              disabled={fontScale <= 100}
              title="تصغير خط البيانات"
              aria-label="تصغير خط البيانات"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-sky-200 hover:text-white hover:bg-white/10 active:scale-90 disabled:opacity-30 transition-all cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                // Cycle scale
                const nextIndex = (fontScales.indexOf(fontScale) + 1) % fontScales.length;
                onChangeFontScale(fontScales[nextIndex]);
                setShowScaleToast(true);
                setTimeout(() => setShowScaleToast(false), 1600);
              }}
              title="تغيير مقياس الخط لجميع الأبواب"
              className="px-2 py-0.5 text-[10px] font-extrabold text-amber-300 hover:bg-white/10 rounded-md transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>{fontScale}%</span>
            </button>

            <button
              onClick={() => handleStepScale('up')}
              disabled={fontScale >= 145}
              title="تكبير خط البيانات في كل الأبواب"
              aria-label="تكبير خط البيانات في كل الأبواب"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-sky-200 hover:text-white hover:bg-white/10 active:scale-90 disabled:opacity-30 transition-all cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Sebha Button */}
          <button
            onClick={() => {
              triggerHaptic('medium');
              playChime('click');
              onOpenSebha();
            }}
            title="المسبحة الإلكترونية"
            aria-label="المسبحة الإلكترونية"
            className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all border border-amber-300/40"
          >
            <Flame className="w-4 h-4 text-white animate-pulse" />
          </button>
        </div>
      </div>

      {/* Floating scale feedback toast */}
      {showScaleToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-amber-400 text-[#09182a] text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-amber-200 animate-bounce flex items-center gap-1.5 z-50">
          <Type className="w-3.5 h-3.5" />
          <span>تم ضبط الخط: {getScaleLabel(fontScale)} ({fontScale}%) لكافة الأبواب</span>
        </div>
      )}
    </header>
  );
};

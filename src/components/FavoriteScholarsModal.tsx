import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Check, 
  Search, 
  Sparkles, 
  BookOpen, 
  Headphones, 
  GraduationCap,
  UserCheck
} from 'lucide-react';
import { SCHOLARS_METADATA, ScholarProfile, AUDIO_LESSONS_LIST } from '../data/thimarAudioData';
import { THIMAR_LIST } from '../data/thimarData';
import { playChime, triggerHaptic } from '../utils/audio';

interface FavoriteScholarsModalProps {
  isOpen: boolean;
  onClose: () => void;
  favoriteScholars: string[];
  onToggleFavorite: (scholarName: string) => void;
  onSelectScholarForFilter?: (scholarName: string) => void;
}

export const FavoriteScholarsModal: React.FC<FavoriteScholarsModalProps> = ({
  isOpen,
  onClose,
  favoriteScholars,
  onToggleFavorite,
  onSelectScholarForFilter
}) => {
  const [search, setSearch] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'favorites_only'>('all');

  if (!isOpen) return null;

  const filteredScholars = SCHOLARS_METADATA.filter((s) => {
    const isFav = favoriteScholars.includes(s.name);
    if (activeFilterTab === 'favorites_only' && !isFav) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.shortName.toLowerCase().includes(q) ||
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    );
  });

  const getLessonsCount = (scholarName: string) => {
    return AUDIO_LESSONS_LIST.filter(l => l.scholar === scholarName).length;
  };

  const getQuotesCount = (scholarName: string) => {
    return THIMAR_LIST.filter(q => q.author.includes(scholarName) || scholarName.includes(q.author)).length;
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-[#14231D] rounded-3xl max-w-lg w-full border border-amber-300/40 dark:border-[#2C4238] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-[#FAF7F0] dark:bg-[#162922]">
          <button
            onClick={() => {
              playChime('click');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-gray-200/70 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end text-[#0F6B50] dark:text-[#2DD4BF] font-bold text-base">
              <span>المشايخ والعلماء المفضلون</span>
              <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              اختر مشايخك المفضلين لتصفية الدروس والفوائد بضغطة واحدة
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-3 bg-gray-50/50 dark:bg-[#111F1A]">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن اسم الشيخ أو لقبه..."
              className="w-full py-2 pl-4 pr-9 text-xs rounded-xl bg-white dark:bg-[#192A23] border border-gray-200 dark:border-gray-700 text-[#19302A] dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#0F6B50]"
            />
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Quick Tabs: All vs Fav Only */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex gap-1">
              <button
                onClick={() => {
                  setActiveFilterTab('all');
                  playChime('click');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  activeFilterTab === 'all'
                    ? 'bg-[#0F6B50] text-white shadow-xs'
                    : 'bg-white dark:bg-[#172721] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                }`}
              >
                جميع المشايخ ({SCHOLARS_METADATA.length})
              </button>

              <button
                onClick={() => {
                  setActiveFilterTab('favorites_only');
                  playChime('click');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                  activeFilterTab === 'favorites_only'
                    ? 'bg-[#0F6B50] text-white shadow-xs'
                    : 'bg-white dark:bg-[#172721] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${favoriteScholars.length > 0 ? 'fill-rose-400 text-rose-400' : ''}`} />
                <span>المفضلون فقط ({favoriteScholars.length})</span>
              </button>
            </div>

            <span className="text-[11px] text-gray-500 font-semibold">
              {favoriteScholars.length} محدد
            </span>
          </div>
        </div>

        {/* Scholars List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filteredScholars.length === 0 ? (
            <div className="p-8 text-center space-y-2 text-gray-400">
              <GraduationCap className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600" />
              <p className="text-xs font-bold text-gray-600 dark:text-gray-300">لم يتم العثور على مشايخ مطابقين</p>
              {activeFilterTab === 'favorites_only' && (
                <button
                  onClick={() => setActiveFilterTab('all')}
                  className="text-xs text-emerald-600 font-bold hover:underline"
                >
                  عرض جميع المشايخ لإضافتهم للمفضلة
                </button>
              )}
            </div>
          ) : (
            filteredScholars.map((scholar) => {
              const isFav = favoriteScholars.includes(scholar.name);
              const lessonsCount = getLessonsCount(scholar.name);
              const quotesCount = getQuotesCount(scholar.name);

              return (
                <div
                  key={scholar.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 text-right ${
                    isFav
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/25 border-emerald-300 dark:border-emerald-800/80 shadow-xs'
                      : 'bg-white dark:bg-[#172721] border-gray-200/80 dark:border-gray-800 hover:border-gray-300'
                  }`}
                >
                  {/* Left Action: Heart Toggle Button */}
                  <div className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5">
                    <button
                      onClick={() => {
                        onToggleFavorite(scholar.name);
                        triggerHaptic(30);
                        playChime('click');
                      }}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                        isFav
                          ? 'bg-rose-500 text-white shadow-md hover:bg-rose-600'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                      }`}
                      title={isFav ? 'إزالة من المشايخ المفضلين' : 'إضافة إلى المشايخ المفضلين'}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>

                    {onSelectScholarForFilter && (
                      <button
                        onClick={() => {
                          onSelectScholarForFilter(scholar.name);
                          onClose();
                          playChime('click');
                        }}
                        className="text-[10px] font-bold text-[#0F6B50] dark:text-[#2DD4BF] hover:underline whitespace-nowrap"
                        title="عرض مقاطع هذا الشيخ فقط"
                      >
                        عرض الدروس
                      </button>
                    )}
                  </div>

                  {/* Right: Scholar Info & Avatar */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-end gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-[#19302A] dark:text-white flex items-center gap-1.5 justify-end">
                          {isFav && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 font-bold">
                              مفضل
                            </span>
                          )}
                          <span>{scholar.name}</span>
                        </h4>
                        <p className="text-[11px] text-[#8A6A29] dark:text-amber-300 font-semibold">
                          {scholar.title}
                        </p>
                      </div>

                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${scholar.avatarGradient} text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0`}>
                        {scholar.shortName.slice(0, 2)}
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed pt-0.5">
                      {scholar.description}
                    </p>

                    {/* Stats Badges */}
                    <div className="flex items-center justify-end gap-2 pt-1 text-[10px] text-gray-500 font-medium">
                      {lessonsCount > 0 && (
                        <span className="flex items-center gap-1 bg-emerald-50 dark:bg-[#12221B] px-2 py-0.5 rounded-md text-[#0F6B50] dark:text-emerald-300 border border-emerald-200/50">
                          <Headphones className="w-3 h-3" />
                          <span>{lessonsCount} مقاطع صوتية</span>
                        </span>
                      )}
                      {quotesCount > 0 && (
                        <span className="flex items-center gap-1 bg-amber-50 dark:bg-[#201D13] px-2 py-0.5 rounded-md text-amber-800 dark:text-amber-300 border border-amber-200/50">
                          <BookOpen className="w-3 h-3" />
                          <span>{quotesCount} درر وأقوال</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 dark:bg-[#101C17] border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0F6B50] text-white font-bold hover:bg-[#138061] transition-all cursor-pointer"
          >
            تم وحفظ الاختيارات
          </button>

          <span className="text-gray-500 text-[11px]">
            {favoriteScholars.length > 0 
              ? `تم تحديد ${favoriteScholars.length} من المشايخ المفضلين` 
              : 'اضغط على رمز القلب لتفضيل الشيخ'}
          </span>
        </div>
      </div>
    </div>
  );
};

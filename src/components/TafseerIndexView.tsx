import React, { useState, useMemo } from 'react';
import { 
  Search, 
  BookOpen, 
  Sparkles, 
  ChevronLeft, 
  Hash, 
  ShieldCheck, 
  Lightbulb, 
  BookmarkCheck,
  Compass,
  X,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { AdawiTafseerEntry } from '../data/tafseerAdawiData';
import { SURAHS_LIST, toArabicNumerals } from '../data/quranData';
import { playChime, triggerHaptic } from '../utils/audio';

export interface TafseerIndexViewProps {
  entries: AdawiTafseerEntry[];
  selectedEntryKey?: string | null;
  onSelectEntry: (entry: AdawiTafseerEntry, targetMode?: 'overview' | 'ayahs') => void;
  onClose?: () => void;
  mode?: 'embedded' | 'modal';
}

// Visual tags for notable surahs in Adawi's abridgment
const NOTABLE_TAGS: Record<number, { title: string; color: string }> = {
  1: { title: 'أم الكتاب والسبع المثاني', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  2: { title: 'سنام القرآن وآية الكرسي', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  3: { title: 'تثبيت التوحيد وبراءة عيسى', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
  4: { title: 'حقوق الضعفاء واليتامى والمواريث', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  5: { title: 'إكمال الدين والوفاء بالعقود', color: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
  6: { title: 'أصول التوحيد والبراهين الكونية', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  7: { title: 'تاريخ الصراع وسنن إهلاك الظالمين', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
  8: { title: 'فقه الجهاد وسنن النصر بيوم بدر', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  9: { title: 'الفاضحة والبراءة وتوبة الثلاثة', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  12: { title: 'أحسن القصص وعاقبة الصبر والتقوى', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  18: { title: 'العصمة من الفتن الأربع والدجال', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
  36: { title: 'قلب القرآن والبعث والآثار', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  49: { title: 'ميثاق الأخلاق والآداب والتقوى', color: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
  55: { title: 'عروس القرآن وتعداد الآلاء', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  56: { title: 'أصناف الخلق وأهوال القيامة', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  67: { title: 'المانعة والمنجية من عذاب القبر', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  103: { title: 'أركان النجاة الأربعة واغتنام العمر', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  108: { title: 'حوض الكوثر وإخلاص الصلاة والذبح', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  112: { title: 'ثلث القرآن وتوحيد الصمدية', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  113: { title: 'سورة الفلق والمعوذتان والرقية', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  114: { title: 'الاستعاذة برب الناس من الوسواس', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40' }
};

export const TafseerIndexView: React.FC<TafseerIndexViewProps> = ({
  entries,
  selectedEntryKey,
  onSelectEntry,
  onClose,
  mode = 'embedded'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'juz_amma' | 'meccan' | 'medinan' | 'virtues'>('all');
  const [selectedJuz, setSelectedJuz] = useState<number | 'all'>('all');

  // Filter and search logic across all 114 Surahs
  const filteredEntries = useMemo(() => {
    let result = entries;

    // Filter category
    if (activeFilter === 'juz_amma') {
      result = result.filter(e => e.surahNumber >= 67); // Surahs 67 to 114
    } else if (activeFilter === 'virtues') {
      result = result.filter(e => [1, 2, 3, 18, 36, 49, 55, 56, 67, 103, 108, 112, 113, 114].includes(e.surahNumber));
    } else if (activeFilter === 'meccan') {
      result = result.filter(e => {
        const meta = SURAHS_LIST.find(s => s.number === e.surahNumber);
        return meta?.revelationType === 'Meccan';
      });
    } else if (activeFilter === 'medinan') {
      result = result.filter(e => {
        const meta = SURAHS_LIST.find(s => s.number === e.surahNumber);
        return meta?.revelationType === 'Medinan';
      });
    }

    // Filter by Juz if selected
    if (selectedJuz !== 'all') {
      result = result.filter(e => {
        const meta = SURAHS_LIST.find(s => s.number === e.surahNumber);
        return meta?.juz === selectedJuz;
      });
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(e => 
        e.surahName.toLowerCase().includes(q) ||
        String(e.surahNumber) === q ||
        toArabicNumerals(e.surahNumber) === q ||
        e.ayahRange.toLowerCase().includes(q) ||
        e.tafseerSummary.toLowerCase().includes(q) ||
        e.educationalPauses?.some(p => p.toLowerCase().includes(q)) ||
        e.authenticHadiths?.some(h => h.toLowerCase().includes(q)) ||
        e.keyBenefits?.some(b => b.toLowerCase().includes(q)) ||
        (NOTABLE_TAGS[e.surahNumber]?.title.toLowerCase().includes(q) ?? false)
      );
    }

    return result;
  }, [entries, searchQuery, activeFilter, selectedJuz]);

  const handleSelect = (entry: AdawiTafseerEntry, targetMode: 'overview' | 'ayahs' = 'overview') => {
    playChime('click');
    triggerHaptic('selection');
    onSelectEntry(entry, targetMode);
    if (onClose) onClose();
  };

  return (
    <div className={`w-full text-right ${mode === 'modal' ? 'p-4 sm:p-5' : 'space-y-3'}`} dir="rtl">
      {/* Index Header & Stats */}
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-[#0a2346] via-[#0e315e] to-[#0a2346] border border-amber-400/40 text-white shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/30 text-amber-300 flex items-center justify-center shrink-0">
            <BookmarkCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold font-amiri text-white">
              فهرس سور القرآن الكريم كاملاً (١١٤ سورة)
            </h3>
            <p className="text-[10px] text-sky-200">
              تفسير القرآن العظيم لابن كثير بمختصر الشيخ مصطفى العدوي
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] sm:text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30">
            {toArabicNumerals(filteredEntries.length)} سورة متاحة
          </span>
          {onClose && (
            <button
              onClick={() => {
                playChime('click');
                onClose();
              }}
              title="إغلاق الفهرس"
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-sky-200 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-sky-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث برقم السورة أو اسمها (الفاتحة، البقرة، الكهف، يس، الملك...)"
          className="w-full pl-8 pr-10 py-2.5 rounded-2xl bg-[#091b33] border border-sky-500/30 text-white placeholder-sky-400/50 text-xs focus:outline-none focus:border-amber-400 transition-all text-right shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-sky-400 hover:text-white cursor-pointer"
          >
            مسح
          </button>
        )}
      </div>

      {/* Primary Category Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
        <button
          onClick={() => {
            playChime('click');
            setActiveFilter('all');
            setSelectedJuz('all');
          }}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            activeFilter === 'all' && selectedJuz === 'all'
              ? 'bg-amber-400 text-[#091b34] shadow-sm'
              : 'bg-[#0c2448] text-sky-200 hover:bg-[#11305e] border border-sky-400/30'
          }`}
        >
          كافة سور القرآن (١١٤)
        </button>

        <button
          onClick={() => {
            playChime('click');
            setActiveFilter('virtues');
            setSelectedJuz('all');
          }}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            activeFilter === 'virtues'
              ? 'bg-amber-400 text-[#091b34] shadow-sm'
              : 'bg-[#0c2448] text-sky-200 hover:bg-[#11305e] border border-sky-400/30'
          }`}
        >
          سور الفضائل والأحراز
        </button>

        <button
          onClick={() => {
            playChime('click');
            setActiveFilter('juz_amma');
            setSelectedJuz('all');
          }}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            activeFilter === 'juz_amma'
              ? 'bg-amber-400 text-[#091b34] shadow-sm'
              : 'bg-[#0c2448] text-sky-200 hover:bg-[#11305e] border border-sky-400/30'
          }`}
        >
          جزء عمّ وتبارك (٤٨ سورة)
        </button>

        <button
          onClick={() => {
            playChime('click');
            setActiveFilter('meccan');
            setSelectedJuz('all');
          }}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            activeFilter === 'meccan'
              ? 'bg-amber-400 text-[#091b34] shadow-sm'
              : 'bg-[#0c2448] text-sky-200 hover:bg-[#11305e] border border-sky-400/30'
          }`}
        >
          السور المكية (٨٦)
        </button>

        <button
          onClick={() => {
            playChime('click');
            setActiveFilter('medinan');
            setSelectedJuz('all');
          }}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            activeFilter === 'medinan'
              ? 'bg-amber-400 text-[#091b34] shadow-sm'
              : 'bg-[#0c2448] text-sky-200 hover:bg-[#11305e] border border-sky-400/30'
          }`}
        >
          السور المدنية (٢٨)
        </button>
      </div>

      {/* 30 Juz Carousel Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <span className="text-[10px] text-sky-300 font-bold shrink-0 ml-1">الأجزاء:</span>
        <button
          onClick={() => {
            playChime('click');
            setSelectedJuz('all');
          }}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
            selectedJuz === 'all'
              ? 'bg-sky-500 text-white'
              : 'bg-[#07172b] text-sky-300 hover:bg-[#0c2448] border border-sky-800'
          }`}
        >
          الكل
        </button>
        {Array.from({ length: 30 }, (_, i) => i + 1).map(juzNum => (
          <button
            key={juzNum}
            onClick={() => {
              playChime('click');
              setSelectedJuz(juzNum);
              setActiveFilter('all');
            }}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
              selectedJuz === juzNum
                ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                : 'bg-[#07172b] text-sky-200 hover:bg-[#0c2448] border border-sky-800'
            }`}
          >
            جـ {toArabicNumerals(juzNum)}
          </button>
        ))}
      </div>

      {/* Entries Index List */}
      <div className="space-y-3 max-h-[62vh] overflow-y-auto pr-0.5 custom-scrollbar">
        {filteredEntries.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#09182b] border border-sky-500/20 text-center space-y-1">
            <p className="text-xs font-bold text-sky-200 font-amiri">لا توجد نتائج مطابقة لبحثك في الفهرس</p>
            <p className="text-[11px] text-slate-400">يمكنك البحث بأسماء السور مثل «الملك» أو «العصر» أو «البقرة» أو برقم السورة</p>
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const entryKey = `${entry.surahNumber}_${entry.ayahRange}`;
            const isSelected = selectedEntryKey === entryKey;
            const tag = NOTABLE_TAGS[entry.surahNumber];
            const meta = SURAHS_LIST.find(s => s.number === entry.surahNumber);

            return (
              <div
                key={entryKey}
                className={`w-full text-right p-4 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-950/50 via-sky-950/60 to-blue-950/50 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                    : 'bg-[#0a203c]/90 hover:bg-[#0e2a4d] border-sky-800/60 text-white'
                }`}
              >
                {/* Header row */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-sky-900/80 text-sky-200 border border-sky-700/50 flex items-center gap-1 font-mono">
                      <Hash className="w-3 h-3 text-sky-400" />
                      <span>{toArabicNumerals(entry.surahNumber)}</span>
                    </span>

                    <span className="text-[10px] text-amber-300 font-mono px-2 py-0.5 rounded-lg bg-amber-400/10 border border-amber-300/30">
                      {meta ? `${toArabicNumerals(meta.numberOfAyahs)} آية` : entry.ayahRange}
                    </span>

                    {meta && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-sky-300">
                        {meta.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • الجزء {toArabicNumerals(meta.juz)} • صفحة {toArabicNumerals(meta.startPage)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-white font-amiri">
                      سورة {entry.surahName}
                    </h4>
                    <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                  </div>
                </div>

                {/* Subtitle / Distinctive Theme Tag */}
                {tag && (
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${tag.color}`}>
                      {tag.title}
                    </span>
                  </div>
                )}

                {/* Core subject snippet */}
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed font-amiri">
                  {entry.tafseerSummary}
                </p>

                {/* Direct Action Dual Buttons: Overview vs Ayah-by-Ayah Explorer */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-sky-900/60">
                  <button
                    onClick={() => handleSelect(entry, 'overview')}
                    className="py-1.5 px-2.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-xs"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>المختصر والوقفات</span>
                  </button>

                  <button
                    onClick={() => handleSelect(entry, 'ayahs')}
                    className="py-1.5 px-2.5 rounded-xl bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/40 text-sky-200 hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-xs"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>تفسير الآيات ({toArabicNumerals(meta?.numberOfAyahs || 0)})</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

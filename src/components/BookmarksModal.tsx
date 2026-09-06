import React, { useState } from 'react';
import { Bookmark as BookmarkType } from '../types';
import { toArabicNumerals } from '../data/quranData';
import { 
  X, 
  Bookmark as BookmarkIcon, 
  BookmarkCheck, 
  Trash2, 
  ArrowLeft, 
  Sparkles,
  BookOpen,
  Edit2,
  Check
} from 'lucide-react';
import { playChime } from '../utils/audio';

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: BookmarkType[];
  currentPage: number;
  currentSurahName?: string;
  onSelectPage: (page: number) => void;
  onToggleCurrentPageBookmark: () => void;
  onRemoveBookmark: (id: string) => void;
  onUpdateBookmarkTitle?: (id: string, newTitle: string) => void;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  isOpen,
  onClose,
  bookmarks,
  currentPage,
  currentSurahName,
  onSelectPage,
  onToggleCurrentPageBookmark,
  onRemoveBookmark,
  onUpdateBookmarkTitle
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState<string>('');

  if (!isOpen) return null;

  const isCurrentBookmarked = bookmarks.some(
    (b) => b.type !== 'ayah' && Number(b.targetId) === currentPage
  );

  const startEditing = (e: React.MouseEvent, bm: BookmarkType) => {
    e.stopPropagation();
    setEditingId(bm.id);
    setEditTitleInput(bm.title || `صفحة ${bm.targetId}`);
    playChime('click');
  };

  const cancelEditing = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingId(null);
    setEditTitleInput('');
  };

  const saveEditing = (e: React.MouseEvent | React.FormEvent, bmId: string) => {
    e.stopPropagation();
    if (editTitleInput.trim() && onUpdateBookmarkTitle) {
      onUpdateBookmarkTitle(bmId, editTitleInput.trim());
    }
    setEditingId(null);
    setEditTitleInput('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#15231D] rounded-3xl max-w-md w-full border-2 border-[#0F6B50] dark:border-[#2DD4BF] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-right">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#0F6B50] to-[#138061] text-white flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            title="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5">
              <span className="font-bold text-sm">العلامات المرجعية والفواصل</span>
              <BookmarkCheck className="w-5 h-5 text-amber-300" />
            </div>
            <p className="text-[11px] text-emerald-100 font-medium mt-0.5">
              سجل مواضع القراءة والصفحات المحفوظة
            </p>
          </div>
        </div>

        {/* Current Page Bookmark Quick Toggle Action */}
        <div className="p-4 bg-[#FAF7F0] dark:bg-[#111C17] border-b border-[#E8DFC8] dark:border-[#243A30]">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => {
                onToggleCurrentPageBookmark();
                playChime('click');
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 ${
                isCurrentBookmarked
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border border-amber-300'
                  : 'bg-[#0F6B50] text-white hover:bg-[#138061]'
              }`}
            >
              <BookmarkIcon className={`w-4 h-4 ${isCurrentBookmarked ? 'fill-amber-500 text-amber-600' : ''}`} />
              <span>{isCurrentBookmarked ? 'إزالة فاصلة هذه الصفحة' : 'حفظ فاصلة عند هذه الصفحة'}</span>
            </button>

            <div className="text-right">
              <span className="text-[10px] text-[#8A743F] dark:text-amber-300 font-bold block">موقعك الحالي في المصحف:</span>
              <span className="text-xs font-bold text-[#19302A] dark:text-white">
                صفحة {toArabicNumerals(currentPage)} {currentSurahName ? `(سورة ${currentSurahName})` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Bookmarks List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
          {bookmarks.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950 text-[#0F6B50] dark:text-[#2DD4BF] flex items-center justify-center mx-auto">
                <BookmarkIcon className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-[#19302A] dark:text-white">لا توجد علامات مرجعية محفوظة بعد</h4>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                يمكنك الضغط على رمز الفاصلة (Bookmark) في أعلى الصفحة لحفظ أي موقع والتنقل إليه بسهولة لاحقاً.
              </p>
            </div>
          ) : (
            bookmarks.map((bm) => {
              const pageNum = bm.type === 'ayah' ? (bm.pageNumber || 1) : Number(bm.targetId);
              const isSelected = bm.type !== 'ayah' && pageNum === currentPage;
              const isEditingThis = editingId === bm.id;
              const dateStr = bm.createdAt 
                ? new Date(bm.createdAt).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })
                : '';

              return (
                <div
                  key={bm.id}
                  onClick={() => {
                    if (!isEditingThis && pageNum) {
                      onSelectPage(pageNum);
                      onClose();
                      playChime('click');
                    }
                  }}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/80 border-[#0F6B50] dark:border-[#2DD4BF] shadow-xs'
                      : 'bg-[#FAF8F2] dark:bg-[#182620] border-[#E8DFD0] dark:border-[#283C32] hover:border-[#0F6B50]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveBookmark(bm.id);
                      }}
                      className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                      title="حذف هذه الفاصلة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {!isEditingThis && onUpdateBookmarkTitle && (
                      <button
                        onClick={(e) => startEditing(e, bm)}
                        className="p-2 rounded-xl text-[#0F6B50] dark:text-[#2DD4BF] hover:bg-emerald-100/60 dark:hover:bg-emerald-950/50 transition-colors"
                        title="تعديل مسمى الفاصلة"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (pageNum) {
                          onSelectPage(pageNum);
                          onClose();
                          playChime('click');
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#0F6B50] text-white text-xs font-bold flex items-center gap-1 shadow-xs hover:bg-[#138061]"
                    >
                      <span>انتقال</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right flex-1 pr-3 min-w-0">
                    {isEditingThis ? (
                      <form
                        onSubmit={(e) => saveEditing(e, bm.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 justify-end"
                      >
                        <button
                          type="button"
                          onClick={(e) => cancelEditing(e)}
                          className="p-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 transition-colors"
                          title="إلغاء"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="submit"
                          className="p-1.5 rounded-lg bg-[#0F6B50] text-white hover:bg-[#138061] transition-colors shadow-xs"
                          title="حفظ المسمى"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="text"
                          value={editTitleInput}
                          onChange={(e) => setEditTitleInput(e.target.value)}
                          autoFocus
                          placeholder="اكتب اسم الفاصلة المخصصة..."
                          className="w-full max-w-[200px] text-xs font-bold text-right px-2.5 py-1.5 rounded-xl border-2 border-[#0F6B50] dark:border-[#2DD4BF] bg-white dark:bg-[#101A16] text-[#19302A] dark:text-white outline-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') cancelEditing();
                          }}
                        />
                      </form>
                    ) : (
                      <>
                        <div className="flex items-center justify-end gap-1.5">
                          <h4 className="font-bold text-sm text-[#19302A] dark:text-white font-amiri truncate">
                            {bm.title || `صفحة ${pageNum}`}
                          </h4>
                          <BookmarkIcon className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
                        </div>
                        {bm.subtitle && (
                          <p className="text-[10px] text-[#4A5D54] dark:text-[#8D9F95] mt-1 leading-relaxed line-clamp-1">
                            {bm.subtitle}
                          </p>
                        )}
                        <div className="flex items-center justify-end gap-2 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                          {dateStr && <span>{dateStr}</span>}
                          {dateStr && <span>•</span>}
                          <span className="font-bold text-[#0F6B50] dark:text-[#2DD4BF]">
                            صفحة {toArabicNumerals(pageNum)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-gray-50 dark:bg-[#101A16] border-t border-gray-100 dark:border-gray-800 text-center text-[11px] text-gray-500">
          تُحفظ الفواصل تلقائياً في ذاكرة الجهاز لمتابعة وختم القرآن الكريم
        </div>
      </div>
    </div>
  );
};

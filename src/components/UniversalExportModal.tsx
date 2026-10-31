import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Download, 
  FileText, 
  FileCode, 
  Sparkles,
  Send
} from 'lucide-react';
import { ExportPayload, copyToClipboard, shareContent, downloadFile } from '../utils/universalExport';
import { playChime, triggerHaptic } from '../utils/audio';

interface UniversalExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: ExportPayload | null;
}

export const UniversalExportModal: React.FC<UniversalExportModalProps> = ({
  isOpen,
  onClose,
  payload
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen || !payload) return null;

  const handleCopy = async () => {
    triggerHaptic('light');
    playChime('click');
    const ok = await copyToClipboard(payload.formattedText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    triggerHaptic('selection');
    playChime('click');
    const ok = await shareContent(payload.title, payload.formattedText);
    if (!ok) {
      // Fallback to copy if share canceled or unsupported
      handleCopy();
    }
  };

  const handleDownloadTxt = () => {
    triggerHaptic('medium');
    playChime('click');
    const filename = `${payload.filenamePrefix}_${new Date().toISOString().split('T')[0]}.txt`;
    downloadFile(filename, payload.formattedText, 'text/plain;charset=utf-8');
    setDownloadSuccess('تم تحميل الملف النصي (.txt) بنجاح');
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  const handleDownloadJson = () => {
    triggerHaptic('medium');
    playChime('click');
    const filename = `${payload.filenamePrefix}_${new Date().toISOString().split('T')[0]}.json`;
    const jsonStr = JSON.stringify(payload.jsonData, null, 2);
    downloadFile(filename, jsonStr, 'application/json;charset=utf-8');
    setDownloadSuccess('تم تحميل ملف البيانات (.json) بنجاح');
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#061120]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-b from-[#0c213f] to-[#08172c] border border-sky-500/40 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-sky-100 arabesque-watermark"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header with Light Blue Theme */}
        <div className="p-4 sm:p-5 bg-[#0e274a]/90 border-b border-sky-500/30 flex items-center justify-between">
          <button
            onClick={() => {
              playChime('click');
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-sky-950/70 border border-sky-700/40 text-sky-300 hover:text-white hover:bg-sky-900/60 transition-all flex items-center justify-center cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 text-sky-400 font-bold text-xs">
              <span>{payload.doorName}</span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <h3 className="text-base sm:text-lg font-bold font-amiri text-white mt-0.5">
              تصدير ومشاركة: {payload.title}
            </h3>
          </div>
        </div>

        {/* Success Alert Banner */}
        {downloadSuccess && (
          <div className="mx-4 mt-3 py-2 px-3 bg-sky-500/20 border border-sky-400/50 rounded-xl text-center text-xs font-bold text-sky-200 flex items-center justify-center gap-1.5 animate-fadeIn">
            <Check className="w-4 h-4 text-sky-300" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Content Preview Box */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between text-xs text-sky-300/80 px-1">
            <span>معاينة النص الجاهز للمشاركة:</span>
            <span className="text-[11px] bg-sky-900/60 border border-sky-700/50 px-2 py-0.5 rounded-lg text-sky-300">
              تنسيق إسلامي مخصص
            </span>
          </div>

          <div className="bg-[#071527] border border-sky-900/80 rounded-2xl p-3.5 max-h-56 sm:max-h-64 overflow-y-auto text-right text-xs leading-relaxed text-sky-100 font-amiri whitespace-pre-wrap select-text shadow-inner">
            {payload.formattedText}
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleCopy}
              className={`p-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                copied
                  ? 'bg-sky-500 text-white border-sky-400 scale-[1.02]'
                  : 'bg-sky-600 hover:bg-sky-500 text-white border-sky-400/50 active:scale-95'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>تم النسخ بنجاح!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>نسخ للواتساب</span>
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              className="p-3 rounded-2xl bg-gradient-to-r from-sky-700 to-blue-700 hover:from-sky-600 hover:to-blue-600 text-white border border-sky-400/40 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>مشاركة مباشرة</span>
            </button>
          </div>

          {/* File Download Options */}
          <div className="bg-[#0b1e38] border border-sky-900/70 rounded-2xl p-3 space-y-2">
            <div className="text-[11px] font-bold text-sky-300/90 text-right">
              خيارات التصدير كملف للحفظ والأرشفة:
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownloadTxt}
                className="py-2 px-3 rounded-xl bg-sky-950/80 hover:bg-sky-900/80 border border-sky-800/60 text-sky-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="تحميل كملف نصي عادي"
              >
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                <span>تحميل كملف (.txt)</span>
              </button>

              <button
                onClick={handleDownloadJson}
                className="py-2 px-3 rounded-xl bg-sky-950/80 hover:bg-sky-900/80 border border-sky-800/60 text-sky-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="تحميل كملف بيانات برمجية"
              >
                <FileCode className="w-3.5 h-3.5 text-amber-300" />
                <span>تحميل بيانات (.json)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#0a1e36] border-t border-sky-900/60 flex items-center justify-between text-[11px] text-sky-300/70">
          <span>✨ جنّة الرحمن • زاد المسلم ورفيق القلوب</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-sky-900/40 hover:bg-sky-800/60 text-sky-200 border border-sky-700/40 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

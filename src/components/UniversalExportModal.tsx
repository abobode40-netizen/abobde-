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

export interface UniversalExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload?: ExportPayload | null;
  title?: string;
  subtitle?: string;
  textToCopy?: string;
  fileName?: string;
  jsonData?: any;
  doorName?: string;
}

export const UniversalExportModal: React.FC<UniversalExportModalProps> = ({
  isOpen,
  onClose,
  payload,
  title,
  subtitle,
  textToCopy,
  fileName,
  jsonData,
  doorName
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const effectiveTitle = payload?.title || title || 'التصدير والمشاركة الإيمانية';
  const effectiveDoorName = payload?.doorName || doorName || 'جنّة الرحمن';
  const effectiveFormattedText = payload?.formattedText || textToCopy || '';
  const effectiveJsonData = payload?.jsonData || jsonData || {};
  const effectiveFilenamePrefix = payload?.filenamePrefix || (fileName ? fileName.replace(/\.[^/.]+$/, '') : 'jannat_export');

  const handleCopy = async () => {
    triggerHaptic('light');
    playChime('click');
    const ok = await copyToClipboard(effectiveFormattedText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    triggerHaptic('selection');
    playChime('click');
    const ok = await shareContent(effectiveTitle, effectiveFormattedText);
    if (!ok) {
      handleCopy();
    }
  };

  const handleDownloadTxt = () => {
    triggerHaptic('medium');
    playChime('click');
    const fname = `${effectiveFilenamePrefix}_${new Date().toISOString().split('T')[0]}.txt`;
    downloadFile(fname, effectiveFormattedText, 'text/plain;charset=utf-8');
    setDownloadSuccess('تم تحميل الملف النصي (.txt) بنجاح');
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  const handleDownloadJson = () => {
    triggerHaptic('medium');
    playChime('click');
    const fname = `${effectiveFilenamePrefix}_${new Date().toISOString().split('T')[0]}.json`;
    const jsonStr = JSON.stringify(effectiveJsonData, null, 2);
    downloadFile(fname, jsonStr, 'application/json;charset=utf-8');
    setDownloadSuccess('تم تحميل ملف البيانات (.json) بنجاح');
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#061120]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      onClick={onClose}
      dir="rtl"
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
              <span>{effectiveDoorName}</span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <h3 className="text-base sm:text-lg font-bold font-amiri text-white mt-0.5">
              تصدير ومشاركة: {effectiveTitle}
            </h3>
            {subtitle && (
              <p className="text-xs text-sky-300/80 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Text Preview Box */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {downloadSuccess && (
            <div className="p-3 rounded-2xl bg-sky-500/20 border border-sky-400/50 text-sky-200 text-xs font-bold text-center animate-bounce flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          <div>
            <span className="text-xs font-bold text-sky-300 block mb-1.5 text-right">
              معايرة النص المنسق الجاهز للمشاركة (واتساب / تليجرام):
            </span>
            <div className="p-4 rounded-2xl bg-[#061426]/90 border border-sky-800/60 text-right space-y-2 select-text font-amiri text-sm leading-relaxed max-h-48 overflow-y-auto text-sky-100 shadow-inner">
              <pre className="whitespace-pre-wrap font-amiri text-sm text-sky-100/90 leading-relaxed font-normal">
                {effectiveFormattedText || 'لا يوجد نص للتصدير.'}
              </pre>
            </div>
          </div>

          {/* Direct Quick Actions Grid */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-sky-300 block text-right">
              خيارات التصدير السريعة:
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              {/* WhatsApp / Copy Text */}
              <button
                onClick={handleCopy}
                className="p-3 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-amber-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'تم النسخ بنجاح' : 'نسخ النص المنسق'}</span>
              </button>

              {/* Native Share */}
              <button
                onClick={handleShare}
                className="p-3 rounded-2xl bg-sky-950/80 hover:bg-sky-900/80 border border-sky-500/40 text-sky-200 hover:text-white flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-sky-400" />
                <span>مشاركة مباشرة</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-1">
              {/* Download TXT File */}
              <button
                onClick={handleDownloadTxt}
                className="p-3 rounded-2xl bg-[#091d38] hover:bg-[#0c264a] border border-sky-700/40 text-sky-200 hover:text-white flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-sky-400" />
                <span>تحميل نص (.txt)</span>
              </button>

              {/* Download JSON Data */}
              <button
                onClick={handleDownloadJson}
                className="p-3 rounded-2xl bg-[#091d38] hover:bg-[#0c264a] border border-sky-700/40 text-sky-200 hover:text-white flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <FileCode className="w-4 h-4 text-amber-300" />
                <span>تحميل بيانات (.json)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#061120] border-t border-sky-800/40 text-center text-[11px] text-sky-400/80">
          تطبيق جنّة الرحمن • جميع الحقوق محفوظة ومتاحة لنشر الخير
        </div>
      </div>
    </div>
  );
};

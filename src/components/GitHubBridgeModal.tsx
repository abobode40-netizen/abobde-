import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  Share2, 
  Sparkles, 
  Globe, 
  Info,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { playChime, triggerHaptic } from '../utils/audio';

interface GitHubBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubBridgeModal: React.FC<GitHubBridgeModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const publicLiveUrl = "https://ais-pre-g5khwdthhv7fn76wsmh27c-370477156971.europe-west2.run.app";
  const githubRepoUrl = "https://github.com/abobode40-netizen/bobode40-netizen-mooo";
  const githubPagesUrl = "https://abobode40-netizen.github.io/bobode40-netizen-mooo/";

  const handleCopy = (text: string, type: string) => {
    triggerHaptic('light');
    playChime('click');
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleShare = async (url: string, title: string) => {
    triggerHaptic('selection');
    playChime('click');
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: 'موقع وتطبيق جنّة الرحمن للقرآن الكريم وغراس الأذكار - مفتوح للجميع عام مجاني',
          url,
        });
      } catch {
        handleCopy(url, 'share');
      }
    } else {
      handleCopy(url, 'share');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-white dark:bg-[#14221D] rounded-3xl border border-[#E5DDCF] dark:border-[#2A3C34] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
      >
        {/* Header */}
        <div className="bg-gradient-to-l from-[#0F6B50] to-[#178564] text-white p-5 flex items-center justify-between relative">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-amber-200 text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>جسر النشر العام (Bridge)</span>
            </div>
            <h3 className="text-lg font-bold">رابط الموقع و GitHub و AI Studio</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-right">
          {/* Primary Live App Link */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FAF7F0] to-[#F1ECE1] dark:from-[#182B24] dark:to-[#12201B] border-2 border-[#0F6B50]/30 dark:border-[#2DD4BF]/30 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
                الرابط العام الشامل المباشر
              </span>
              <div className="flex items-center gap-1.5 text-[#0F6B50] dark:text-[#2DD4BF] font-bold text-sm">
                <span>Google AI Studio Live</span>
                <Globe className="w-4 h-4" />
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              هذا الرابط السحابي مفتوح ومتاح للجميع في أي وقت، يعمل بكامل الميزات المتقدمة (تلاوات صوتية، تفاسير، ذكاء اصطناعي، حفظ سحابي):
            </p>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-[#0E1A15] border border-gray-200 dark:border-gray-800 dir-ltr text-left font-mono text-xs text-emerald-800 dark:text-emerald-400 overflow-x-auto">
              <span className="truncate select-all">{publicLiveUrl}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <a
                href={publicLiveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 rounded-xl bg-[#0F6B50] hover:bg-[#138061] text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>فتح الموقع</span>
              </a>

              <button
                onClick={() => handleCopy(publicLiveUrl, 'ai-studio')}
                className="py-2 px-3 rounded-xl bg-white dark:bg-[#1C2C25] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
              >
                {copiedType === 'ai-studio' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ الرابط</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleShare(publicLiveUrl, 'تطبيق جنّة الرحمن')}
                className="py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-amber-100 active:scale-95 transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>مشاركة</span>
              </button>
            </div>
          </div>

          {/* GitHub Repository Link */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#182621] border border-gray-200 dark:border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-500 font-mono">abobode40-netizen/bobode40-netizen-mooo</span>
              <div className="flex items-center gap-1.5 text-gray-800 dark:text-white font-bold text-sm">
                <span>مستودع GitHub</span>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-[#0F1A15] border border-gray-100 dark:border-gray-800 dir-ltr text-left font-mono text-xs text-gray-700 dark:text-gray-300">
              <span className="truncate">{githubRepoUrl}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={githubRepoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 rounded-xl bg-gray-900 dark:bg-gray-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-black active:scale-95 transition-all"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>فتح المستودع</span>
              </a>

              <button
                onClick={() => handleCopy(githubRepoUrl, 'github')}
                className="py-2 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-gray-200 active:scale-95 transition-all cursor-pointer"
              >
                {copiedType === 'github' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ الرابط</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* GitHub Pages Link */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#182621] border border-gray-200 dark:border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-500 font-mono">github.io</span>
              <div className="flex items-center gap-1.5 text-gray-800 dark:text-white font-bold text-sm">
                <span>رابط GitHub Pages</span>
                <Globe className="w-4 h-4 text-emerald-600" />
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-[#0F1A15] border border-gray-100 dark:border-gray-800 dir-ltr text-left font-mono text-xs text-gray-700 dark:text-gray-300">
              <span className="truncate">{githubPagesUrl}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={githubPagesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 rounded-xl bg-[#0F6B50] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#138061] active:scale-95 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>فتح GitHub Pages</span>
              </a>

              <button
                onClick={() => handleCopy(githubPagesUrl, 'gh-pages')}
                className="py-2 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-gray-200 active:scale-95 transition-all cursor-pointer"
              >
                {copiedType === 'gh-pages' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ الرابط</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Instructions for GitHub Repository About Link */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-right space-y-2">
            <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-bold text-xs">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>كيف تجعل الرابط يفتح فوراً للجميع بمجرد الضغط عليه في جيت هاب؟</span>
            </div>
            <ol className="text-[11px] text-amber-900/80 dark:text-amber-200/80 leading-relaxed list-decimal list-inside space-y-1">
              <li>افتح صفحة المستودع على جيت هاب: <strong>abobode40-netizen/bobode40-netizen-mooo</strong></li>
              <li>في يمين الصفحة عند قسم <strong>About</strong> اضغط على أيقونة الترس ⚙️</li>
              <li>في خانة <strong>Website</strong> الصق الرابط العام المباشر</li>
              <li>اضغط <strong>Save changes</strong> — سيظهر الرابط مباشرة بأعلى الصفحة ليفتحه أي زائر بنقرة واحدة!</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-[#101B17] border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>نشر عام مجاني 100% مفتوح المصدر</span>
          </div>

          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white font-bold text-xs hover:bg-gray-300 active:scale-95 transition-all cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

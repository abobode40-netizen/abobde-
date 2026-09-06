import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Check, X, Info, Share2, PlusSquare } from 'lucide-react';
import { playChime, triggerHaptic } from '../utils/audio';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPwaBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return localStorage.getItem('jannat_pwa_banner_dismissed') === 'true';
  });
  const [showHowToModal, setShowHowToModal] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Detect standalone display mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
    }

    // Capture install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      playChime('success');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    playChime('click');
    triggerHaptic(40);

    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      setShowHowToModal(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('jannat_pwa_banner_dismissed', 'true');
    playChime('click');
  };

  // If already installed or dismissed, don't show the persistent top banner
  if (isInstalled || isDismissed) {
    return (
      <>
        {showHowToModal && (
          <HowToInstallModal isIOS={isIOS} onClose={() => setShowHowToModal(false)} />
        )}
      </>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-r from-[#0F6B50] to-[#14532D] text-white px-3 py-2 text-xs shadow-md border-b border-emerald-400/30">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4 text-emerald-200" />
            </div>
            <div className="truncate">
              <span className="font-bold block text-[11.5px] leading-tight">تثبيت التطبيق للفتح بدون إنترنت 📲</span>
              <span className="text-[10px] text-emerald-100 opacity-90 block truncate">
                احصل على أيقونة «جنّة الرحمن» لفتحها في أي وقت بدون نت
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-2.5 py-1.5 rounded-lg bg-white text-[#0F6B50] font-bold text-[11px] flex items-center gap-1 hover:bg-emerald-50 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>تثبيت الآن</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-md text-emerald-200 hover:text-white hover:bg-white/10 transition-all"
              aria-label="إغلاق التنبيه"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {showHowToModal && (
        <HowToInstallModal isIOS={isIOS} onClose={() => setShowHowToModal(false)} />
      )}
    </>
  );
};

export const HowToInstallModal: React.FC<{ isIOS: boolean; onClose: () => void }> = ({ isIOS, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1A2621] rounded-3xl max-w-sm w-full p-5 text-right space-y-4 shadow-2xl border border-[#E5DDCF] dark:border-[#2A3C34] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white"
          >
            ✕
          </button>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-[#19302A] dark:text-white">طريقة التثبيت للفتح بدون نت</h3>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-[#0F6B50] dark:text-[#2DD4BF] flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          لتتمكن من فتح «جنّة الرحمن» دائماً في أي مكان دون الحاجة للإنترنت، يُنصح بتثبيت التطبيق على شاشة هاتفك الرئيسية بخطوتين بسيطتين:
        </p>

        {isIOS ? (
          <div className="space-y-2.5 p-3 rounded-2xl bg-[#FAF7F0] dark:bg-[#14201B] border border-[#E5DDCF] dark:border-[#2A3C34] text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[#0F6B50] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                ١
              </div>
              <div>
                <span className="font-bold block text-gray-800 dark:text-gray-200">اضغط على زر المشاركة:</span>
                <span className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                  أيقونة المربع مع السهم <Share2 className="w-3.5 h-3.5 text-blue-600 inline" /> في أسفل متصفح سفاري (Safari).
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-1 border-t border-gray-200 dark:border-gray-800">
              <div className="w-5 h-5 rounded-full bg-[#0F6B50] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                ٢
              </div>
              <div>
                <span className="font-bold block text-gray-800 dark:text-gray-200">اختر «إضافة إلى الصفحة الرئيسية»:</span>
                <span className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                  انزل لأسفل واضغط <PlusSquare className="w-3.5 h-3.5 text-[#0F6B50] inline" /> (Add to Home Screen).
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 p-3 rounded-2xl bg-[#FAF7F0] dark:bg-[#14201B] border border-[#E5DDCF] dark:border-[#2A3C34] text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[#0F6B50] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                ١
              </div>
              <div>
                <span className="font-bold block text-gray-800 dark:text-gray-200">افتح خيارات المتصفح (⋮):</span>
                <span className="text-[11px] text-gray-500">اضغط على النقاط الثلاث في أعلى أو أسفل الشاشة في كروم أو سامسونج.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-1 border-t border-gray-200 dark:border-gray-800">
              <div className="w-5 h-5 rounded-full bg-[#0F6B50] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                ٢
              </div>
              <div>
                <span className="font-bold block text-gray-800 dark:text-gray-200">اضغط «تثبيت التطبيق» أو «إضافة للشاشة»:</span>
                <span className="text-[11px] text-gray-500">ستظهر أيقونة التطبيق في شاشة جهازك وتفتح مباشرة بدون نت كأي تطبيق عادي!</span>
              </div>
            </div>
          </div>
        )}

        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-2 text-[11px] text-[#0F6B50] dark:text-emerald-300">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            بعد التثبيت، سيفتح التطبيق فوراً حتى لو كان هاتفك في «وضع الطيران» أو بدون أي اتصال بالإنترنت.
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#0F6B50] hover:bg-[#138061] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          فهمت ذلك، شكراً لك
        </button>
      </div>
    </div>
  );
};

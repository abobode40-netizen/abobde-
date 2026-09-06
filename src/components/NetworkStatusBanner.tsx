import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, CheckCircle2, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { playChime, triggerHaptic } from '../utils/audio';

export const NetworkStatusBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [showReconnectedToast, setShowReconnectedToast] = useState<boolean>(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnectedToast(true);
      playChime('success');
      triggerHaptic(50);
      const timer = setTimeout(() => setShowReconnectedToast(false), 4500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnectedToast(false);
      triggerHaptic([50, 50]);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // If back online, show quick success toast
  if (showReconnectedToast) {
    return (
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[92%] transition-all animate-bounce">
        <div className="p-3 rounded-2xl bg-[#0F6B50] text-white shadow-xl flex items-center justify-between border border-emerald-400/40 text-xs font-bold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>تم استعادة الاتصال بالإنترنت بنجاح (أونلاين) 🌐</span>
          </div>
          <button 
            onClick={() => setShowReconnectedToast(false)}
            className="text-emerald-200 hover:text-white px-1.5 py-0.5"
            aria-label="إغلاق التنبيه"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  // If offline, show a persistent subtle indicator banner
  if (!isOnline) {
    return (
      <div className="sticky top-0 z-40 w-full bg-gradient-to-r from-amber-600 to-amber-700 dark:from-amber-800 dark:to-amber-900 text-white shadow-md transition-all text-xs">
        <div className="max-w-lg mx-auto px-3 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 animate-pulse">
              <WifiOff className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <span className="font-bold block text-[12px] leading-tight">أنت تعمل الآن في وضع عدم الاتصال (أوفلاين)</span>
              <span className="text-[10px] text-amber-100 opacity-90">المصحف، الأذكار، السبحة، ومتابعة العبادات تعمل كلياً بدون إنترنت</span>
            </div>
          </div>

          <button
            onClick={() => {
              setIsDetailsOpen(!isDetailsOpen);
              playChime('click');
            }}
            className="p-1 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center gap-0.5 text-[11px] font-bold shrink-0 transition-all active:scale-95"
          >
            <span>{isDetailsOpen ? 'إخفاء' : 'تفاصيل'}</span>
            {isDetailsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Expandable info card */}
        {isDetailsOpen && (
          <div className="px-4 pb-3 pt-1 text-[11px] text-amber-50 border-t border-white/20 space-y-1.5 bg-black/10">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>الميزات المتاحة معك بدون نت:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[10.5px] opacity-95 pr-1">
              <li>قراءة صفحات وتفاسير المصحف الشريف المحفوظة.</li>
              <li>جميع أذكار الصباح والمساء وأذكار اليوم والليلة.</li>
              <li>السبحة الإلكترونية الذكية مع حفظ العدادات تلقائياً.</li>
              <li>شجرة العبادات ومتابعة الصلوات والختمات.</li>
              <li>مواقيت الصلاة المحسوبة فلكياً وفق موقعك المحفوظ.</li>
              <li>الاستماع للتلاوات المحملة مسبقاً بجهازك.</li>
            </ul>
          </div>
        )}
      </div>
    );
  }

  return null;
};

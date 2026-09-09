import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowRight, 
  Moon, 
  Sun, 
  Bell, 
  Volume2, 
  Download, 
  Upload, 
  Check, 
  Info, 
  Sparkles, 
  ShieldCheck, 
  Headphones, 
  BookOpen,
  Mic,
  Share2,
  Type,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Square,
  FileCode,
  FileArchive,
  FileText,
  Copy,
  FolderArchive,
  Code2,
  Terminal,
  Wifi,
  WifiOff,
  CloudDownload,
  Trash,
  PauseCircle,
  HardDrive,
  Clock,
  MapPin,
  Sliders,
  Pin,
  CheckCheck,
  Navigation,
  Search,
  RotateCcw,
  Plus,
  Minus,
  Palette
} from 'lucide-react';
import { AppSettings, ReciterId, QuranThemeId } from '../types';
import { RECITERS_LIST, toArabicNumerals } from '../data/quranData';
import { QURAN_THEMES, saveSavedQuranTheme } from '../utils/quranThemes';
import { exportBackupJSON, importBackupJSON } from '../utils/storage';
import { playChime } from '../utils/audio';
import { generateStandaloneHTML, generateAndDownloadZipArchive, triggerFileDownload } from '../utils/exportHelpers';
import { getCachedPagesCount, downloadAllQuranPages, clearAllOfflinePages } from '../utils/quranOfflineStorage';
import { 
  loadSavedPrayerMethod, 
  savePrayerMethod, 
  loadSavedLocation, 
  saveLocation, 
  loadSavedPrayerOffsets,
  savePrayerOffsets,
  getPrayerTimesList,
  pinCairoEgyptianSurvey, 
  getCurrentCairoTime, 
  requestDeviceLocation,
  PRAYER_CALC_METHODS, 
  PrayerCalcMethod, 
  PrayerMinuteOffsets,
  DEFAULT_PRAYER_OFFSETS,
  CAIRO_LOCATION, 
  POPULAR_CITIES,
  UserLocation,
  PRAYER_SETTINGS_CHANGE_EVENT
} from '../utils/prayerTimes';
import { HowToInstallModal } from './InstallPwaBanner';
import { GitHubBridgeModal } from './GitHubBridgeModal';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onBack
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Microphone diagnostic state
  const [isMicTesting, setIsMicTesting] = useState(false);
  const [micStatusMsg, setMicStatusMsg] = useState<string>('الميكروفون غير مفعل. اضغط على الزر أدناه لتجربته.');
  const [micStatusType, setMicStatusType] = useState<'idle' | 'success' | 'error' | 'testing'>('idle');
  const [showApkGuide, setShowApkGuide] = useState(false);
  const [diagnosticAudioLevel, setDiagnosticAudioLevel] = useState(0);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micAudioCtxRef = useRef<AudioContext | null>(null);
  const micAnimFrameRef = useRef<number | null>(null);

  // Code formats & Export states
  const [selectedCodeTab, setSelectedCodeTab] = useState<'manifest' | 'java' | 'js' | 'html' | 'json'>('manifest');
  const [copiedCodeType, setCopiedCodeType] = useState<string | null>(null);
  const [isExportingZip, setIsExportingZip] = useState(false);

  // Offline & Quran caching state
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [cachedQuranPagesCount, setCachedQuranPagesCount] = useState<number>(0);
  const [isDownloadingQuran, setIsDownloadingQuran] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<{ done: number; total: number; percent: number }>({ done: 0, total: 604, percent: 0 });
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [isGitHubBridgeOpen, setIsGitHubBridgeOpen] = useState<boolean>(false);
  const cancelDownloadRef = useRef<boolean>(false);

  // Prayer calculations, locations & offsets state
  const [prayerMethod, setPrayerMethod] = useState<PrayerCalcMethod>(() => loadSavedPrayerMethod());
  const [prayerLocation, setPrayerLocation] = useState<UserLocation>(() => loadSavedLocation());
  const [prayerOffsets, setPrayerOffsets] = useState<PrayerMinuteOffsets>(() => loadSavedPrayerOffsets());
  const [cairoClock, setCairoClock] = useState<string>(() => getCurrentCairoTime());
  const [prayerSettingsTab, setPrayerSettingsTab] = useState<'methods' | 'location' | 'offsets' | 'preview'>('methods');
  const [citySearchQuery, setCitySearchQuery] = useState<string>('');
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCairoClock(getCurrentCairoTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen to prayer settings changes
  useEffect(() => {
    const handleSettingsChanged = () => {
      setPrayerMethod(loadSavedPrayerMethod());
      setPrayerLocation(loadSavedLocation());
      setPrayerOffsets(loadSavedPrayerOffsets());
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(PRAYER_SETTINGS_CHANGE_EVENT, handleSettingsChanged);
      return () => window.removeEventListener(PRAYER_SETTINGS_CHANGE_EVENT, handleSettingsChanged);
    }
  }, []);

  const handlePinCairoMethod = () => {
    const res = pinCairoEgyptianSurvey();
    setPrayerMethod(res.method);
    setPrayerLocation(res.location);
    setPrayerOffsets(DEFAULT_PRAYER_OFFSETS);
    playChime('bell');
    setToastMessage('تم تثبيت أوقات الصلاة بطريقة هيئة المساحة المصرية وتوقيت القاهرة بنجاح 🇪🇬');
  };

  const handleChangePrayerMethod = (m: PrayerCalcMethod) => {
    setPrayerMethod(m);
    savePrayerMethod(m);
    playChime('click');
    const methodObj = PRAYER_CALC_METHODS.find(x => x.id === m);
    setToastMessage(`تم تفعيل: ${methodObj?.name}`);
  };

  const handleSelectCity = (city: UserLocation) => {
    const updated = { ...city, isGps: false, timestamp: Date.now() };
    saveLocation(updated);
    setPrayerLocation(updated);
    playChime('click');
    setToastMessage(`تم ضبط المدينة على: ${city.cityName} (${city.countryName})`);
  };

  const handleRequestGpsLocation = async () => {
    setIsGpsLoading(true);
    setGpsError(null);
    try {
      const loc = await requestDeviceLocation();
      saveLocation(loc);
      setPrayerLocation(loc);
      playChime('success');
      setToastMessage(`تم تحديد موقعك بدقة عبر GPS: ${loc.cityName}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'تعذر تحديد الموقع الجغرافي';
      setGpsError(msg.includes('denied') ? 'يرجى تفعيل صلاحية الموقع من إعدادات المتصفح' : msg);
      playChime('click');
    } finally {
      setIsGpsLoading(false);
    }
  };

  const handleAdjustPrayerOffset = (prayerKey: keyof PrayerMinuteOffsets, delta: number) => {
    const current = prayerOffsets[prayerKey] || 0;
    const nextVal = Math.max(-60, Math.min(60, current + delta));
    const updated = { ...prayerOffsets, [prayerKey]: nextVal };
    setPrayerOffsets(updated);
    savePrayerOffsets(updated);
    playChime('click');
  };

  const handleResetPrayerOffsets = () => {
    setPrayerOffsets(DEFAULT_PRAYER_OFFSETS);
    savePrayerOffsets(DEFAULT_PRAYER_OFFSETS);
    playChime('success');
    setToastMessage('تمت إعادة ضبط فوارق الدقائق إلى صفر (٠)');
  };

  useEffect(() => {
    // Initial check of cached pages
    getCachedPagesCount().then(setCachedQuranPagesCount);

    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const cleanupMicTest = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (micAnimFrameRef.current) {
      cancelAnimationFrame(micAnimFrameRef.current);
      micAnimFrameRef.current = null;
    }
    if (micAudioCtxRef.current && micAudioCtxRef.current.state !== 'closed') {
      try {
        micAudioCtxRef.current.close();
      } catch {}
      micAudioCtxRef.current = null;
    }
    setIsMicTesting(false);
    setDiagnosticAudioLevel(0);
  };

  useEffect(() => {
    return () => {
      cleanupMicTest();
    };
  }, []);

  const handleTestMicrophone = async () => {
    if (isMicTesting) {
      cleanupMicTest();
      setMicStatusMsg('تم إيقاف فحص الميكروفون.');
      setMicStatusType('idle');
      playChime('click');
      return;
    }

    // التأكد من دعم المتصفح أو التطبيق للميكروفون
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicStatusMsg('❌ جهازك أو تطبيق WebView الحالي لا يدعم الوصول المباشر للميكروفون (getUserMedia).');
      setMicStatusType('error');
      return;
    }

    try {
      setMicStatusMsg('جارٍ طلب الإذن وتجهيز الميكروفون...');
      setMicStatusType('testing');

      // طلب إذن الميكروفون
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      micStreamRef.current = stream;
      setIsMicTesting(true);
      setMicStatusMsg('✅ تم السماح باستخدام الميكروفون وهو يعمل الآن بنجاح! تحدث لترى تفاعل مؤشر الصوت.');
      setMicStatusType('success');
      playChime('success');

      // Setup audio meter
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          micAudioCtxRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateMeter = () => {
            if (!stream.active) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setDiagnosticAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
            micAnimFrameRef.current = requestAnimationFrame(updateMeter);
          };
          updateMeter();
        }
      } catch {}

    } catch (error: unknown) {
      cleanupMicTest();
      console.error('Microphone Error:', error);
      setMicStatusType('error');

      const err = error as { name?: string; message?: string };
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicStatusMsg('❌ تم رفض إذن الميكروفون. يرجى السماح للتطبيق باستخدام الميكروفون من إعدادات الهاتف (Settings > Apps > Permissions).');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setMicStatusMsg('❌ لم يتم العثور على ميكروفون متصل.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setMicStatusMsg('❌ الميكروفون مستخدم بواسطة تطبيق آخر في هاتفك.');
      } else {
        setMicStatusMsg(`❌ حدث خطأ أثناء تشغيل الميكروفون (${err.message || 'خطأ غير معروف'}).`);
      }
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportBackup = () => {
    const jsonStr = exportBackupJSON();
    const dateStr = new Date().toISOString().slice(0, 10);
    triggerFileDownload(`jannat-alrahman-backup-${dateStr}.json`, jsonStr, 'application/json');
    playChime('success');
    showToast('تم تصدير النسخة الاحتياطية بنجاح (ملف JSON)');
  };

  const handleExportHtmlPage = () => {
    const html = generateStandaloneHTML();
    const dateStr = new Date().toISOString().slice(0, 10);
    triggerFileDownload(`jannat-alrahman-page-${dateStr}.html`, html, 'text/html');
    playChime('success');
    showToast('تم تصدير صفحة HTML المستقلة بنجاح');
  };

  const handleExportZipArchive = async () => {
    try {
      setIsExportingZip(true);
      await generateAndDownloadZipArchive();
      playChime('success');
      showToast('تم إنشاء وتنزيل الحزمة المضغوطة (ZIP) بنجاح');
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء تجميع الملف المضغوط');
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleDownloadAllQuran = async () => {
    if (isDownloadingQuran) return;
    setIsDownloadingQuran(true);
    cancelDownloadRef.current = false;
    playChime('click');
    showToast('بدأ تحميل صفحات المصحف الشريف في الخلفية للقراءة بدون إنترنت...');

    try {
      const result = await downloadAllQuranPages(
        (done, total, percent) => {
          setDownloadProgress({ done, total, percent });
          setCachedQuranPagesCount(done);
        },
        () => cancelDownloadRef.current
      );

      if (result.success) {
        playChime('success');
        showToast('تم تحميل صفحات المصحف كاملاً بنجاح! التطبيق جاهز للعمل 100% بدون إنترنت');
      } else {
        showToast('تم إيقاف تنزيل المصحف مؤقتاً.');
      }
    } catch {
      showToast('حدث خطأ أثناء تحميل بعض الصفحات');
    } finally {
      setIsDownloadingQuran(false);
      getCachedPagesCount().then(setCachedQuranPagesCount);
    }
  };

  const handleCancelDownload = () => {
    cancelDownloadRef.current = true;
    setIsDownloadingQuran(false);
    playChime('click');
    showToast('تم إيقاف التحميل');
  };

  const handleClearCache = async () => {
    if (window.confirm('هل تريد بالتأكيد مسح صفحات المصحف المحفوظة مؤقتاً في جهازك؟')) {
      await clearAllOfflinePages();
      setCachedQuranPagesCount(0);
      playChime('click');
      showToast('تم تفريغ ذاكرة التخزين المؤقت لصفحات المصحف');
    }
  };

  const codeSnippets = {
    manifest: {
      title: 'أذونات AndroidManifest.xml',
      lang: 'xml',
      desc: 'إذن تسجيل الصوت والإنترنت لمشاريع أندرويد وAPK.',
      code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.jannat.alrahman">

    <!-- 🎙️ إذن تسجيل واستخدام الميكروفون وسماعات الرأس -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

    <!-- 🌐 أذونات الإنترنت لجلب التلاوات والتفاسير -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
</manifest>`
    },
    java: {
      title: 'كود Java WebView Permissions',
      lang: 'java',
      desc: 'كود تمرير إذن الميكروفون لمتصفح الويب الداخلي في Android Studio.',
      code: `webView.setWebChromeClient(new WebChromeClient() {
    @Override
    public void onPermissionRequest(final PermissionRequest request) {
        // منح الإذن لصفحة الويب للوصول للميكروفون وسماعات الرأس
        request.grant(request.getResources());
    }
});`
    },
    js: {
      title: 'كود البحث الصوتي والميكروفون',
      lang: 'javascript',
      desc: 'كود طلب إذن الميكروفون والتعرف على الصوت (SpeechRecognition) للبحث.',
      code: `const micBtn = document.getElementById('micBtn');
const searchInput = document.getElementById('searchInput');

// التحقق من دعم المتصفح للتعرف على الصوت
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = 'ar-SA'; // ضبط اللغة للعربية
  recognition.continuous = false;

  micBtn.addEventListener('click', async () => {
    try {
      // طلب إذن الميكروفون من المستخدم
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // بدء الاستماع
      recognition.start();
      micBtn.style.backgroundColor = '#ff4d4d'; // تغيير لون الزر للتنبيه بالاستماع
    } catch (err) {
      alert("يرجى السماح بصلاحية الميكروفون من إعدادات الهاتف لاستخدام البحث الصوتي.");
    }
  });

  // عند التقاط الصوت وتحويله لنص
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    searchInput.value = transcript;
    
    // تشغيل دالة البحث عندك تلقائياً
    if (typeof searchFunction === "function") {
      searchFunction(transcript);
    }
  };

  recognition.onend = () => {
    micBtn.style.backgroundColor = ''; // إعادة لون الزر الطبيعي
  };

  recognition.onerror = (event) => {
    console.error("خطأ في الميكروفون:", event.error);
    micBtn.style.backgroundColor = '';
  };
} else {
  micBtn.style.display = 'none'; // إخفاء الزر لو المتصفح لا يدعم الميزة
  console.log("التعرف على الصوت غير مدعوم في هذا المتصفح");
}`
    },
    html: {
      title: 'صفحة HTML مستقلة (Snippets)',
      lang: 'html',
      desc: 'كود صفحة ويب مصغرة متضمنة زر تشغيل الميكروفون وحالته.',
      code: `<!-- كود زر الميكروفون ومؤشر الحالة -->
<button id="micBtn" type="button" onclick="startMic()">🎤 تشغيل الميكروفون</button>
<div id="micStatus">الميكروفون غير مفعل</div>

<script>
async function startMic() {
  try {
    const s = await navigator.mediaDevices.getUserMedia({ audio: true });
    document.getElementById('micStatus').innerText = "✅ الميكروفون يعمل!";
  } catch(e) {
    document.getElementById('micStatus').innerText = "❌ حدث خطأ في الميكروفون.";
  }
}
</script>`
    },
    json: {
      title: 'نسخة احتياطية JSON',
      lang: 'json',
      desc: 'بيانات التطبيق وتقدمك الإيماني بصيغة كود JSON.',
      code: exportBackupJSON()
    }
  };

  const handleCopyCode = (type: keyof typeof codeSnippets) => {
    const targetCode = codeSnippets[type].code;
    navigator.clipboard.writeText(targetCode).then(() => {
      setCopiedCodeType(type);
      playChime('click');
      showToast(`تم نسخ ${codeSnippets[type].title} إلى الحافظة`);
      setTimeout(() => setCopiedCodeType(null), 2500);
    });
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && importBackupJSON(content)) {
        playChime('success');
        showToast('تم استيراد بياناتك بنجاح! سيتم تحديث الصفحة.');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        showToast('ملف النسخة الاحتياطية غير صالح');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="pb-24 pt-2 px-3 sm:px-4 max-w-lg mx-auto space-y-4 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 inset-x-4 max-w-md mx-auto z-50 bg-[#0F6B50] text-white px-4 py-3 rounded-2xl shadow-xl border border-emerald-400/40 text-center text-sm font-bold flex items-center justify-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-[#E8F3ED] dark:bg-[#162D24] text-[#0F6B50] dark:text-[#2DD4BF] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          title="العودة"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div className="text-right flex-1 pr-2">
          <span className="text-[11px] font-bold text-[#B45309] dark:text-amber-300">تفضيلات التطبيق</span>
          <h2 className="text-xl font-bold font-amiri text-[#19302A] dark:text-white">الإعدادات</h2>
        </div>
      </div>

      {/* App Branding Info Card */}
      <div className="p-5 rounded-3xl bg-[#0F6B50] text-white text-center space-y-2 shadow-md relative overflow-hidden">
        <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 mx-auto flex items-center justify-center shadow-sm">
          <img src="/jannat-icon.png" alt="جنّة الرحمن" className="w-full h-full object-cover rounded-2xl" onError={(e) => (e.target as HTMLElement).style.display = 'none'} />
          <Sparkles className="w-7 h-7 text-amber-300" />
        </div>
        <h3 className="text-lg font-bold font-amiri">جنّة الرحمن</h3>
        <p className="text-xs text-emerald-100/90 leading-relaxed max-w-xs mx-auto">
          خصوصيتك محفوظة؛ التقدم والعلامات تُخزّن محلياً على جهازك دون الحاجة لحساب أو اتصال مستمر.
        </p>
      </div>

      {/* Appearance & Dark Mode */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1A2621] border border-[#E5DDCF] dark:border-[#2A3C34] shadow-sm space-y-3 text-right">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-[#0F6B50] dark:text-[#2DD4BF] flex items-center justify-center">
            {settings.isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </div>
          <h4 className="font-bold text-sm text-[#19302A] dark:text-white">المظهر والألوان</h4>
        </div>

        <div className="flex items-center justify-between py-1">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.isDarkMode}
              onChange={(e) => {
                onUpdateSettings({ ...settings, isDarkMode: e.target.checked });
                playChime('click');
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F6B50]" />
          </label>
          <div className="text-right">
            <span className="text-sm font-bold text-[#19302A] dark:text-white block">الوضع الليلي</span>
            <span className="text-[11px] text-gray-500">
              {settings.isDarkMode ? 'مفعل: مريح للعين في المساء' : 'غير مفعل: يستخدم الألوان الهادئة'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between py-1 pt-2 border-t border-gray-100 dark:border-gray-800/60">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={!!settings.enableEyeComfortMode}
              onChange={(e) => {
                onUpdateSettings({ ...settings, enableEyeComfortMode: e.target.checked });
                playChime('click');
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-amber-200/80 peer-focus:outline-none rounded-full peer dark:bg-amber-950 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-amber-400 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600" />
          </label>
          <div className="text-right">
            <span className="text-sm font-bold text-[#19302A] dark:text-white flex items-center justify-end gap-1.5">
              <span>وضع الراحة للعين (Sepia)</span>
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            </span>
            <span className="text-[11px] text-gray-500">
              يغير ألوان صفحات المصحف إلى درجات دافئة مريحة للقراءة الطويلة والليلية
            </span>
          </div>
        </div>

        {/* Quran Page Visual Themes Picker */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#0F6B50] dark:text-[#2DD4BF] font-bold">
              {QURAN_THEMES.find(t => t.id === (settings.quranTheme || 'royal_gold'))?.name}
            </span>
            <div className="text-right">
              <span className="text-sm font-bold text-[#19302A] dark:text-white flex items-center justify-end gap-1.5">
                <span>سمة وتصميم صفحة المصحف</span>
                <Palette className="w-3.5 h-3.5 text-amber-600" />
              </span>
              <span className="text-[11px] text-gray-500">
                اختر النمط البصري والزخارف المناسبة لذوقك مع ثبات رسم المصحف
              </span>
            </div>
          </div>

          {/* Theme Quick Selector Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {QURAN_THEMES.map((th) => {
              const isSelected = (settings.quranTheme || 'royal_gold') === th.id;
              return (
                <button
                  key={th.id}
                  onClick={() => {
                    onUpdateSettings({ ...settings, quranTheme: th.id });
                    saveSavedQuranTheme(th.id);
                    playChime('click');
                    showToast(`تم تطبيق ${th.name}`);
                  }}
                  className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'border-[#0F6B50] dark:border-[#2DD4BF] bg-emerald-50/60 dark:bg-[#1C3328] ring-1 ring-[#0F6B50]'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white/50 dark:bg-black/20'
                  }`}
                >
                  {isSelected ? (
                    <Check className="w-4 h-4 text-[#0F6B50] dark:text-[#2DD4BF] shrink-0" />
                  ) : (
                    <span 
                      className="w-3 h-3 rounded-full shrink-0 border border-black/20" 
                      style={{ backgroundColor: th.previewColors.accent }}
                    />
                  )}
                  <div className="text-right flex-1 truncate">
                    <span className="text-xs font-bold block text-[#19302A] dark:text-white truncate">
                      {th.name}
                    </span>
                    <span className="text-[10px] text-gray-400 block truncate">
                      {th.badge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comprehensive Prayer Times & Egyptian Survey Calculation Settings Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1A2621] border border-[#E5DDCF] dark:border-[#2A3C34] shadow-sm space-y-4 text-right">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-100/80 dark:bg-amber-950/80 text-[#0F6B50] dark:text-[#2DD4BF] border border-amber-300/40 dark:border-amber-800/40">
            {prayerMethod === 'egypt' ? 'المساحة المصرية 🇪🇬' : PRAYER_CALC_METHODS.find(m => m.id === prayerMethod)?.badge}
          </span>
          <div className="flex items-center gap-2">
            <div>
              <h4 className="font-bold text-sm text-[#19302A] dark:text-white">ضبط مواقيت الصلاة والحساب الفلكي</h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">طريقة الحساب، تحديد المدينة، والضبط الدقيق للأذان بالدقائق</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-[#0F6B50] dark:text-[#2DD4BF] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Featured Banner: Cairo & Egyptian Survey Quick Pin */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50/90 via-emerald-50/70 to-amber-50/90 dark:from-amber-950/30 dark:via-emerald-950/30 dark:to-amber-950/30 border border-amber-300/60 dark:border-amber-800/50 shadow-xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              onClick={handlePinCairoMethod}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm ${
                prayerMethod === 'egypt' && prayerLocation.cityName === 'القاهرة'
                  ? 'bg-amber-400 hover:bg-amber-500 text-[#0F4234] ring-2 ring-amber-300'
                  : 'bg-[#0F6B50] hover:bg-[#168064] text-white'
              }`}
            >
              <Pin className="w-4 h-4" />
              <span>
                {prayerMethod === 'egypt' && prayerLocation.cityName === 'القاهرة'
                  ? 'مثبت حالياً: القاهرة (المساحة المصرية 🇪🇬)'
                  : 'تثبيت القاهرة (هيئة المساحة المصرية) 🇪🇬'}
              </span>
            </button>

            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-xs font-bold text-[#19302A] dark:text-white">
                  الهيئة العامة المصرية للمساحة (القاهرة ومصر)
                </span>
                <span className="text-[10px] bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-1.5 py-0.5 rounded font-mono">
                  19.5° / 17.5°
                </span>
              </div>
              <span className="text-[11px] text-[#0F6B50] dark:text-[#2DD4BF] font-mono block mt-0.5">
                توقيت القاهرة الآن: {toArabicNumerals(cairoClock)}
              </span>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs inside Prayer Settings */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-gray-100 dark:bg-gray-800/80 rounded-xl text-xs font-bold">
          <button
            onClick={() => setPrayerSettingsTab('methods')}
            className={`py-2 px-1.5 rounded-lg transition-all text-center truncate ${
              prayerSettingsTab === 'methods'
                ? 'bg-white dark:bg-[#1A2621] text-[#0F6B50] dark:text-[#2DD4BF] shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            طريقة الحساب
          </button>
          <button
            onClick={() => setPrayerSettingsTab('location')}
            className={`py-2 px-1.5 rounded-lg transition-all text-center truncate ${
              prayerSettingsTab === 'location'
                ? 'bg-white dark:bg-[#1A2621] text-[#0F6B50] dark:text-[#2DD4BF] shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            المدينة والموقع
          </button>
          <button
            onClick={() => setPrayerSettingsTab('offsets')}
            className={`py-2 px-1.5 rounded-lg transition-all text-center truncate ${
              prayerSettingsTab === 'offsets'
                ? 'bg-white dark:bg-[#1A2621] text-[#0F6B50] dark:text-[#2DD4BF] shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            الضبط بالدقائق
          </button>
          <button
            onClick={() => setPrayerSettingsTab('preview')}
            className={`py-2 px-1.5 rounded-lg transition-all text-center truncate ${
              prayerSettingsTab === 'preview'
                ? 'bg-white dark:bg-[#1A2621] text-[#0F6B50] dark:text-[#2DD4BF] shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            معاينة الأوقات
          </button>
        </div>

        {/* TAB 1: Calculation Methods */}
        {prayerSettingsTab === 'methods' && (
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">اختر الطريقة الفلكية المعتمدة لبلدك</span>
              <label className="font-bold text-gray-800 dark:text-gray-200">
                طرق الحساب الفلكي المتاحة:
              </label>
            </div>
            
            <div className="space-y-2">
              {PRAYER_CALC_METHODS.map((m) => {
                const isSelected = prayerMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleChangePrayerMethod(m.id)}
                    className={`w-full p-3 rounded-xl text-right transition-all border flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#EBF5F1] dark:bg-[#1B362E] text-[#0F6B50] dark:text-[#2DD4BF] border-[#0F6B50] font-bold shadow-xs'
                        : 'bg-[#FAF7F0] dark:bg-[#15231E] hover:bg-emerald-50/40 dark:hover:bg-[#1D2E27] border-[#E5DDCF] dark:border-[#2A3C34] text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 shrink-0">
                      {isSelected && <CheckCheck className="w-4 h-4 text-[#0F6B50] dark:text-[#2DD4BF]" />}
                      <span className="text-[11px] bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-md font-normal">
                        {m.badge}
                      </span>
                    </div>

                    <div className="text-right flex-1 pr-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-xs font-bold">{m.name}</span>
                        {m.id === 'egypt' && <span className="text-sm">🇪🇬</span>}
                        {m.id === 'makkah' && <span className="text-sm">🇸🇦</span>}
                      </div>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 block mt-0.5 leading-normal">
                        {m.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Egyptian Official Standard Jurisprudential & Astronomical Details Card */}
            {prayerMethod === 'egypt' && (
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 text-right space-y-2 text-xs mt-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-amber-200/50 dark:border-amber-800/30">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-mono">
                    معايير جمهورية مصر العربية 🇪🇬
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200 text-xs">
                    <span>التفصيل الفقهي والفلكي المعتمد بمصر</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed">
                  <div className="flex items-start gap-1.5">
                    <span className="text-amber-700 dark:text-amber-400 font-bold shrink-0">• صلاة الفجر:</span>
                    <span>تُحسب عند درجة انخفاض للشمس تبلغ <strong>١٩.٥°</strong> تحت الأفق وفق التقديرات الفلكية والمعايير المعتمدة رسمياً في مصر.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-amber-700 dark:text-amber-400 font-bold shrink-0">• صلاة العصر (المذهب الشافعي):</span>
                    <span>يُعتمد عليه في تحديد وقت العصر؛ حيث يبدأ عندما يصير ظل كل شيء مثله (بالإضافة إلى ظل الزوال).</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-amber-700 dark:text-amber-400 font-bold shrink-0">• صلاة العشاء (المذهب الحنفي):</span>
                    <span>يُعتمد عليه في تحديد وقت العشاء؛ حيث يُحسب عند غياب الشفق عند انخفاض الشمس <strong>١٧.٥°</strong> تحت الأفق.</span>
                  </div>
                  <div className="pt-1 border-t border-amber-200/40 dark:border-amber-800/30 flex items-center justify-end text-[10px] text-gray-500 dark:text-gray-400">
                    <span>الاعتماد: الهيئة المصرية العامة للمساحة بالنسق والتعاون مع دار الإفتاء المصرية ووزارة الأوقاف.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Location & City Picker */}
        {prayerSettingsTab === 'location' && (
          <div className="space-y-3 pt-1">
            {/* Current Active Location Info Box */}
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRequestGpsLocation}
                  disabled={isGpsLoading}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 active:scale-95 transition-all text-xs"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isGpsLoading ? 'animate-spin' : ''}`} />
                  <span>{isGpsLoading ? 'جاري التحديد...' : 'موقعي الحالي (GPS)'}</span>
                </button>
              </div>

              <div className="text-right">
                <span className="text-gray-500 text-[11px] block">الموقع المعتمد حالياً:</span>
                <span className="font-bold text-gray-800 dark:text-gray-200 text-xs">
                  {prayerLocation.cityName} ({prayerLocation.countryName})
                </span>
              </div>
            </div>

            {gpsError && (
              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-[11px] text-red-600 dark:text-red-300 text-right">
                {gpsError}
              </div>
            )}

            {/* City Search Bar */}
            <div className="relative">
              <input
                type="text"
                value={citySearchQuery}
                onChange={(e) => setCitySearchQuery(e.target.value)}
                placeholder="ابحث عن اسم مدينة أو محافظة..."
                className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-white dark:bg-[#15231E] border border-gray-200 dark:border-gray-700 text-right placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F6B50]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>

            {/* Filtered Search Results if user types */}
            {citySearchQuery.trim() ? (
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {POPULAR_CITIES.filter(c => 
                  c.cityName.includes(citySearchQuery.trim()) || 
                  c.countryName.includes(citySearchQuery.trim())
                ).map((c, i) => {
                  const isSelected = prayerLocation.cityName === c.cityName && prayerLocation.countryName === c.countryName;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelectCity(c)}
                      className={`w-full p-2 rounded-lg text-right text-xs flex items-center justify-between border ${
                        isSelected
                          ? 'bg-[#EBF5F1] dark:bg-[#1B362E] text-[#0F6B50] dark:text-[#2DD4BF] border-[#0F6B50] font-bold'
                          : 'bg-white dark:bg-[#15231E] hover:bg-gray-50 border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5 text-[#0F6B50]" /> : <span className="text-[10px] text-gray-400">{c.countryName}</span>}
                      <span>{c.cityName}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Presets: Egyptian Governorates & Islamic Capitals */
              <div className="space-y-3">
                {/* Egyptian Cities */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-700 dark:text-gray-300">
                    <span className="text-gray-400 text-[10px]">توقيت هيئة المساحة</span>
                    <span className="flex items-center gap-1">
                      <span>محافظات جمهورية مصر العربية 🇪🇬</span>
                      <MapPin className="w-3 h-3 text-amber-600" />
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {POPULAR_CITIES.filter(c => c.countryName === 'مصر').map((c, i) => {
                      const isSelected = prayerLocation.cityName === c.cityName;
                      return (
                        <button
                          key={i}
                          onClick={() => handleSelectCity(c)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all text-center border truncate active:scale-95 ${
                            isSelected
                              ? 'bg-[#0F6B50] text-white border-[#0F6B50] shadow-xs'
                              : 'bg-gray-50 dark:bg-gray-800/70 hover:bg-amber-50/50 border-gray-200/80 dark:border-gray-700/80 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {c.cityName}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Holy Cities & Capitals */}
                <div className="space-y-1.5 pt-1 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-end text-[11px] font-bold text-gray-700 dark:text-gray-300 gap-1">
                    <span>العواصم والمدن الإسلامية والعربية</span>
                    <MapPin className="w-3 h-3 text-emerald-600" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {POPULAR_CITIES.filter(c => c.countryName !== 'مصر').slice(0, 9).map((c, i) => {
                      const isSelected = prayerLocation.cityName === c.cityName;
                      return (
                        <button
                          key={i}
                          onClick={() => handleSelectCity(c)}
                          className={`px-2 py-1.5 rounded-lg text-xs transition-all text-center border truncate active:scale-95 ${
                            isSelected
                              ? 'bg-[#0F6B50] text-white border-[#0F6B50] font-bold shadow-xs'
                              : 'bg-gray-50 dark:bg-gray-800/70 hover:bg-emerald-50/50 border-gray-200/80 dark:border-gray-700/80 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {c.cityName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Fine-Tuning Minute Offsets */}
        {prayerSettingsTab === 'offsets' && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <button
                onClick={handleResetPrayerOffsets}
                className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 active:scale-95 transition-all"
              >
                <RotateCcw className="w-3 h-3" />
                <span>إعادة ضبط الكل لصفر (٠)</span>
              </button>

              <p className="text-[11px] text-gray-500">
                تقديم (+) أو تأخير (-) الموعد بالدقائق لمطابقة مسجد حيك
              </p>
            </div>

            {/* Prayers Stepper Rows */}
            <div className="space-y-2">
              {[
                { key: 'fajr' as keyof PrayerMinuteOffsets, name: 'الفجر' },
                { key: 'sunrise' as keyof PrayerMinuteOffsets, name: 'الشروق' },
                { key: 'dhuhr' as keyof PrayerMinuteOffsets, name: 'الظهر' },
                { key: 'asr' as keyof PrayerMinuteOffsets, name: 'العصر' },
                { key: 'maghrib' as keyof PrayerMinuteOffsets, name: 'المغرب' },
                { key: 'isha' as keyof PrayerMinuteOffsets, name: 'العشاء' }
              ].map((p) => {
                const val = prayerOffsets[p.key] || 0;
                return (
                  <div
                    key={p.key}
                    className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700/70 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAdjustPrayerOffset(p.key, -1)}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 active:scale-90 transition-all"
                        title="إنقاص دقيقة"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <span
                        className={`min-w-16 text-center font-mono text-xs font-bold px-2 py-1 rounded-md ${
                          val > 0
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : val < 0
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {val > 0 ? `+${toArabicNumerals(val)}` : val < 0 ? `-${toArabicNumerals(Math.abs(val))}` : '٠'}{' '}
                        دقيقة
                      </span>

                      <button
                        onClick={() => handleAdjustPrayerOffset(p.key, 1)}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 active:scale-90 transition-all"
                        title="زيادة دقيقة"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                        صلاة {p.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: Live Schedule Preview */}
        {prayerSettingsTab === 'preview' && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  playChime('bell');
                  setToastMessage('تم تشغيل صوت نداء الأذان والتنبيه 🔊');
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800/60 font-bold flex items-center gap-1.5 active:scale-95 transition-all text-xs"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>تجربة صوت التنبيه</span>
              </button>

              <span className="text-gray-500 text-[11px]">
                المواقيت لليوم بحسب {prayerLocation.cityName}:
              </span>
            </div>

            {/* Prayer times list */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {getPrayerTimesList(prayerLocation, new Date(), prayerMethod, prayerOffsets).map((item) => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    item.isNext
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-[#0F6B50] dark:border-[#2DD4BF] ring-1 ring-[#0F6B50]'
                      : item.isPassed
                      ? 'bg-gray-50/70 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800 text-gray-400 opacity-80'
                      : 'bg-white dark:bg-gray-800/70 border-gray-200/80 dark:border-gray-700/80'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {item.isNext && (
                      <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded">
                        القادمة
                      </span>
                    )}
                    <span className="mr-auto">{item.name}</span>
                  </div>
                  <div className="font-mono text-xs font-bold text-[#0F6B50] dark:text-[#2DD4BF] dir-rtl">
                    {toArabicNumerals(item.formattedTime)}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-gray-400 text-center">
              يتم تحديث جميع مواقيت الصلاة تلقائياً في الواجهة الرئيسية وبطاقات الودجت فور التعديل.
            </p>
          </div>
        )}
      </div>

      {/* Quran Font Size Slider Section */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1A2621] border border-[#E5DDCF] dark:border-[#2A3C34] shadow-sm space-y-3.5 text-right">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
          <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/80 text-[#0F6B50] dark:text-[#2DD4BF] border border-emerald-300/40 dark:border-emerald-800/40">
            {toArabicNumerals(settings.quranFontSize || 26)} بكسل
          </span>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-[#19302A] dark:text-white">حجم خط المصحف الشريف</h4>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-[#0F6B50] dark:text-[#2DD4BF] flex items-center justify-center">
              <Type className="w-4 h-4" />
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed">
          حرك المنزلق لتحديد حجم الخط الأنسب لقراءة آيات المصحف الشريف بسهولة ووضوح.
        </p>

        {/* Range Input Slider & Preset Buttons */}
        <div className="space-y-2 pt-1">
          <input
            type="range"
            min={18}
            max={40}
            step={1}
            value={settings.quranFontSize || 26}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              onUpdateSettings({ ...settings, quranFontSize: newSize });
            }}
            className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#0F6B50] dark:accent-[#2DD4BF] focus:outline-none"
            aria-label="حجم خط المصحف"
          />

          <div className="flex items-center justify-between gap-1 text-[11px]">
            {[
              { label: 'صغير', size: 20 },
              { label: 'متوسط', size: 26 },
              { label: 'كبير', size: 32 },
              { label: 'ضخم', size: 38 }
            ].map((preset) => {
              const isActive = (settings.quranFontSize || 26) === preset.size;
              return (
                <button
                  key={preset.size}
                  onClick={() => {
                    onUpdateSettings({ ...settings, quranFontSize: preset.size });
                    playChime('click');
                  }}
                  className={`px-2 py-1 rounded-lg font-bold transition-all ${
                    isActive
                      ? 'bg-[#0F6B50] text-white shadow-xs'
                      : 'bg-[#FAF7F0] dark:bg-[#14201B] text-gray-600 dark:text-gray-400 hover:text-[#0F6B50]'
                  }`}
                >
                  {preset.label} ({toArabicNumerals(preset.size)})
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Font Sample Preview */}
        <div className="p-3.5 rounded-2xl bg-[#FAF7F0] dark:bg-[#121E19] border border-[#E5DDCF] dark:border-[#22362D] text-center space-y-1 shadow-inner overflow-hidden transition-all duration-200">
          <span className="text-[10px] font-bold text-[#8A743F] dark:text-amber-400 block">معاينة مباشرة لنص المصحف</span>
          <p
            className="font-quran font-bold text-[#0F6B50] dark:text-emerald-300 leading-relaxed transition-all duration-150 py-1"
            style={{ fontSize: `${settings.quranFontSize || 26}px` }}
          >
            ﴿ بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ﴾
          </p>
        </div>
      </div>

      {/* Reciter Default Selection */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1A2621] border border-[#E5DDCF] dark:border-[#2A3C34] shadow-sm space-y-3 text-right">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-[#0F6B50] dark:text-[#2DD4BF] flex items-center justify-center">
            <Headphones className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-[#19302A] dark:text-white">القارئ الافتراضي للتلاوة</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {RECITERS_LIST.map((r) => {
            const isSelected = settings.selectedReciter === r.id;
            return (
              <button
                key={r.id}
                onClick={() => {
                  onUpdateSettings({ ...settings, selectedReciter: r.id });
                  playChime('click');
                }}
                className={`p-2.5 rounded-xl border text-right flex items-center justify-between text-xs transition-all ${
                  isSelected
                    ? 'bg-[#E8F3ED] dark:bg-[#162D24] border-[#0F6B50] text-[#0F6B50] dark:text-[#2DD4BF] font-bold'
                    : 'bg-[#FAF7F0] dark:bg-[#14201B] border-transparent text-[#19302A] dark:text-white'
                }`}
              >
                {isSelected && <Check className="w-4 h-4 text-[#0F6B50]" />}
                <div>
                  <div className="font-bold">{r.name}</div>
                  <div className="text-[10px] text-gray-500">{r.subname}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Audio & Haptic Cues */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1A2621] border border-[#E5DDCF] dark:border-[#2A3C34] shadow-sm space-y-3 text-right">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-[#0F6B50] dark:text-[#2DD4BF] flex items-center justify-center">
            <Volume2 className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-[#19302A] dark:text-white">الأصوات والتنبيهات</h4>
        </div>

        <div className="flex items-center justify-between py-1">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableAudioChimes}
              onChange={(e) => {
                onUpdateSettings({ ...settings, enableAudioChimes: e.target.checked });
                playChime('click');
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F6B50]" />
          </label>
          <div className="text-right">
            <span className="text-sm font-bold text-[#19302A] dark:text-white block">نغمات التسبيح والإنجاز</span>
            <span className="text-[11px] text-gray-500">نغمة هادئة عند إتمام الأذكار وبلوغ الأهداف</span>
          </div>
        </div>

        <div className="flex items-center justify-between py-1">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.dailyMorningReminder}
              onChange={(e) => {
                onUpdateSettings({ ...settings, dailyMorningReminder: e.target.checked });
                playChime('click');
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F6B50]" />
          </label>
          <div className="text-right">
            <span className="text-sm font-bold text-[#19302A] dark:text-white block">تذكيرات أذكار الصباح والمساء</span>
            <span className="text-[11px] text-gray-500">تنبيهات يومية في أول النهار وآخره</span>
          </div>
        </div>
      </div>

      {/* Offline & Online Management Section */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1A2621] border border-[#E5DDCF] dark:border-[#2A3C34] shadow-sm space-y-4 text-right">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 ${
            isOnline 
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
          }`}>
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3" />
                <span>متصل بالإنترنت</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                <span>وضع عدم الاتصال (أوفلاين)</span>
              </>
            )}
          </span>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-[#19302A] dark:text-white">العمل بدون إنترنت (أوفلاين وأونلاين)</h4>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-[#0F6B50] dark:text-[#2DD4BF] flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed">
          تطبيق جنّة الرحمن مجهز ليعمل في كلا الوضعين (أونلاين وأوفلاين). الأذكار، السبحة، ومواقيت الصلاة وشجرة العبادات تعمل دائماً بدون شبكة. يمكنك أيضاً تحميل صفحات المصحف والتفاسير لتقرأ أينما كنت دون الحاجة لشبكة الإنترنت.
        </p>

        {/* Offline Quran Storage Card */}
        <div className="p-3.5 rounded-xl bg-[#FAF7F0] dark:bg-[#14201B] border border-[#E5DDCF] dark:border-[#2A3C34] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0F6B50] dark:text-emerald-300 px-2.5 py-1 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300/40 dark:border-emerald-800/40">
              {toArabicNumerals(cachedQuranPagesCount)} / {toArabicNumerals(604)} صفحة
            </span>
            <div className="text-right">
              <span className="text-xs font-bold text-[#19302A] dark:text-white block">صفحات المصحف المحفوظة بجهازك</span>
              <span className="text-[10px] text-gray-500">تُخزن الصفحات تلقائياً عند تصفحها أو يمكنك تنزيلها دفعة واحدة</span>
            </div>
          </div>

          {/* Progress bar if downloading */}
          {isDownloadingQuran && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] font-bold text-gray-600 dark:text-gray-300">
                <span>{toArabicNumerals(downloadProgress.percent)}%</span>
                <span>تم تحميل {toArabicNumerals(downloadProgress.done)} من ٦٠٤ صفحة</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#0F6B50] dark:bg-[#2DD4BF] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${downloadProgress.percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            {isDownloadingQuran ? (
              <button
                onClick={handleCancelDownload}
                className="flex-1 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <PauseCircle className="w-4 h-4" />
                <span>إيقاف التحميل</span>
              </button>
            ) : (
              <button
                onClick={handleDownloadAllQuran}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#0F6B50] hover:bg-[#138061] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <CloudDownload className="w-4 h-4" />
                <span>{cachedQuranPagesCount >= 604 ? 'تحديث صفحات المصحف أوفلاين' : 'تحميل صفحات المصحف أوفلاين'}</span>
              </button>
            )}

            {cachedQuranPagesCount > 0 && !isDownloadingQuran && (
              <button
                onClick={handleClearCache}
                title="تفريغ ذاكرة الصفحات"
                className="py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <Trash className="w-3.5 h-3.5 text-red-500" />
                <span>مسح</span>
              </button>
            )}
          </div>

          {/* Add to home screen / PWA instructions button */}
          <button
            onClick={() => {
              playChime('click');
              setShowInstallModal(true);
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-[#0F6B50] dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-emerald-300/60 dark:border-emerald-800/60 cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>كيف تجعل التطبيق يفتح معك بدون نت في أي وقت؟ (طريقة التثبيت)</span>
          </button>
        </div>
      </div>

      {showInstallModal && (
        <HowToInstallModal
          isIOS={typeof navigator !== 'undefined' && /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())}
          onClose={() => setShowInstallModal(false)}
        />
      )}

      {/* Microphone Diagnostic & APK Troubleshooting Section */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1A2621] border border-[#E5DDCF] dark:border-[#2A3C34] shadow-sm space-y-3.5 text-right">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 ${
            micStatusType === 'success'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              : micStatusType === 'error'
              ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
          }`}>
            {isMicTesting ? 'جارٍ الفحص 🔴' : 'فحص الميكروفون'}
          </span>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-[#19302A] dark:text-white">الميكروفون والتلاوة الصوتية (APK)</h4>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-[#0F6B50] dark:text-[#2DD4BF] flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed">
          يمكنك اختبار عمل الميكروفون وسماعات الرأس والتأكد من إعطاء إذن التقاط الصوت لتسجيل التلاوة دون مشاكل.
        </p>

        {/* Live Status Display */}
        <div className={`p-3 rounded-2xl border text-xs font-bold leading-relaxed transition-all ${
          micStatusType === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 text-emerald-900 dark:text-emerald-200'
            : micStatusType === 'error'
            ? 'bg-red-50 dark:bg-red-950/70 border-red-300 text-red-900 dark:text-red-200'
            : micStatusType === 'testing'
            ? 'bg-amber-50 dark:bg-amber-950/70 border-amber-300 text-amber-900 dark:text-amber-200 animate-pulse'
            : 'bg-[#FAF7F0] dark:bg-[#14201B] border-[#E5DDCF] dark:border-[#2A3C34] text-gray-600 dark:text-gray-400'
        }`}>
          <div className="flex items-start gap-2">
            {micStatusType === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : micStatusType === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 text-[#0F6B50] shrink-0 mt-0.5" />
            )}
            <span className="flex-1">{micStatusMsg}</span>
          </div>
        </div>

        {/* Sound Level Visualizer while testing */}
        {isMicTesting && (
          <div className="p-3 rounded-2xl bg-[#FAF7F0] dark:bg-[#111C17] border border-[#E5DDCF] dark:border-[#243A30] space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-gray-600 dark:text-gray-300">
              <span className="text-[#0F6B50] dark:text-[#2DD4BF]">مستوى التقاط الصوت: {toArabicNumerals(diagnosticAudioLevel)}%</span>
              <span>تحدث الآن لتجربة التقاط الميكروفون 🎙️</span>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 transition-all duration-75"
                style={{ width: `${Math.max(4, diagnosticAudioLevel)}%` }}
              />
            </div>
          </div>
        )}

        {/* Mic Test Button */}
        <button
          onClick={handleTestMicrophone}
          className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95 ${
            isMicTesting
              ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
              : 'bg-[#0F6B50] hover:bg-[#138061] text-white'
          }`}
        >
          {isMicTesting ? (
            <>
              <Square className="w-4 h-4 fill-current" />
              <span>إيقاف فحص الميكروفون</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span>🎤 بدء فحص واختبار الميكروفون</span>
            </>
          )}
        </button>

        {/* APK / Android WebView Troubleshooting Guide Accordion */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setShowApkGuide(!showApkGuide)}
            className="w-full flex items-center justify-between text-xs font-bold text-[#0F6B50] dark:text-[#2DD4BF] hover:underline py-1 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-amber-500" />
              <span>دليل تشغيل الميكروفون في تطبيق الأندرويد (APK)</span>
            </div>
            {showApkGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showApkGuide && (
            <div className="mt-2.5 p-3.5 rounded-2xl bg-[#FAF7F0] dark:bg-[#121E19] border border-[#E5DDCF] dark:border-[#22362D] text-xs text-gray-700 dark:text-gray-300 space-y-2.5 leading-relaxed">
              <p className="font-bold text-[#0F6B50] dark:text-emerald-400">
                إذا قمت بتحويل الموقع إلى تطبيق أندرويد (APK) ولم يعمل الميكروفون، إليك أسباب ذلك وكيفية حلها:
              </p>

              <ol className="list-decimal list-inside space-y-1.5 text-[11px]">
                <li>
                  <strong className="text-[#19302A] dark:text-white">إذن الهاتف الخارجي (Runtime Permission):</strong>
                  {' '}توجه إلى <em>إعدادات الهاتف &gt; التطبيقات &gt; تطبيق جنّة الرحمن &gt; الأذونات &gt; الميكروفون</em> وتأكد من تفعيل «السماح عند استخدام التطبيق».
                </li>
                <li>
                  <strong className="text-[#19302A] dark:text-white">إذن AndroidManifest.xml:</strong>
                  {' '}يجب أن يحتوي ملف الـ Manifest على:
                  <code className="block mt-1 p-1.5 rounded-lg bg-gray-900 text-emerald-300 font-mono text-[10px] text-left dir-ltr">
                    &lt;uses-permission android:name="android.permission.RECORD_AUDIO" /&gt;
                  </code>
                </li>
                <li>
                  <strong className="text-[#19302A] dark:text-white">تفعيل WebView WebChromeClient:</strong>
                  {' '}متصفح WebView في أندرويد يحتاج كود السماح بالـ WebRTC Audio:
                  <code className="block mt-1 p-1.5 rounded-lg bg-gray-900 text-emerald-300 font-mono text-[10px] text-left dir-ltr">
                    webView.setWebChromeClient(new WebChromeClient() &#123;<br/>
                    &nbsp;&nbsp;@Override<br/>
                    &nbsp;&nbsp;public void onPermissionRequest(PermissionRequest request) &#123;<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;request.grant(request.getResources());<br/>
                    &nbsp;&nbsp;&#125;<br/>
                    &#125;);
                  </code>
                </li>
                <li>
                  <strong className="text-[#19302A] dark:text-white">سماعات الرأس (Headphones):</strong>
                  {' '}استخدام سماعات الرأس يمنع ارتداد صدى الصوت (Echo) ويجعل تسجيل التلاوة أنقى وأوضح.
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* GitHub & Google AI Studio Bridge Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-amber-500/10 to-emerald-500/10 dark:from-emerald-950/40 dark:via-amber-950/30 dark:to-emerald-950/40 border-2 border-emerald-600/30 dark:border-emerald-500/30 shadow-sm space-y-3 text-right">
        <div className="flex items-center justify-between pb-2 border-b border-gray-200/60 dark:border-gray-800">
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
            عام ومفتوح للجميع
          </span>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-[#19302A] dark:text-white">جسر النشر السحابي و GitHub</h4>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-[#0F6B50] dark:text-[#2DD4BF] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          اربط مستودع جيت هاب (GitHub) برابط الموقع العام المباشر على Google AI Studio ليتمكن أي زائر من فتح التطبيق فوراً بأدق التفاصيل.
        </p>

        <button
          onClick={() => {
            playChime('click');
            setIsGitHubBridgeOpen(true);
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-[#0F6B50] hover:bg-[#138061] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          <span>عرض وتخصيص روابط النشر (GitHub & AI Studio)</span>
        </button>
      </div>

      {/* Multi-Format Export Center & Offline HTML / ZIP Pack */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1A2621] border border-[#E5DDCF] dark:border-[#2A3C34] shadow-sm space-y-4 text-right">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            تصدير متقدم
          </span>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-[#19302A] dark:text-white">مركز تصدير الصفحة والحزم</h4>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-[#0F6B50] dark:text-[#2DD4BF] flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed">
          يمكنك تصدير الصفحة بصيغة HTML تعمل بدون إنترنت، أو تحميل الحزمة الكاملة كملف مضغوط (ZIP) يحتوي على الأكواد والأذونات وصفحة الويب والنسخة الاحتياطية.
        </p>

        {/* Quick Action Export Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Export Standalone HTML Page */}
          <button
            onClick={handleExportHtmlPage}
            className="p-3 rounded-xl bg-gradient-to-r from-emerald-700 to-[#0F6B50] hover:from-emerald-800 hover:to-[#0B5C46] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <FileCode className="w-4 h-4 text-amber-300" />
            <span>تصدير صفحة HTML المستقلة</span>
          </button>

          {/* Export Complete ZIP Archive */}
          <button
            onClick={handleExportZipArchive}
            disabled={isExportingZip}
            className="p-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <FolderArchive className="w-4 h-4 text-white" />
            <span>{isExportingZip ? 'جارٍ تجميع الحزمة...' : 'تنزيل الحزمة كملف مضغوط (ZIP)'}</span>
          </button>
        </div>

        {/* Multi-type Code Viewer & Copier */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400">انقر للتبديل والنسخ</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#19302A] dark:text-white">
              <span>أكواد التطبيق والأذونات (Manifest / Java / JS / HTML)</span>
              <Code2 className="w-3.5 h-3.5 text-[#0F6B50] dark:text-[#2DD4BF]" />
            </div>
          </div>

          {/* Code Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 text-[11px] font-bold scrollbar-none">
            {(['manifest', 'java', 'js', 'html', 'json'] as const).map((key) => {
              const tab = codeSnippets[key];
              const isSelected = selectedCodeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCodeTab(key)}
                  className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0F6B50] text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {tab.title}
                </button>
              );
            })}
          </div>

          {/* Active Code Block */}
          <div className="rounded-xl bg-[#0F1715] border border-gray-800 p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-gray-400 pb-1.5 border-b border-gray-800">
              <button
                onClick={() => handleCopyCode(selectedCodeTab)}
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold px-2 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900/80 cursor-pointer active:scale-95 transition-all"
              >
                {copiedCodeType === selectedCodeTab ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-300" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>نسخ هذا الكود</span>
                  </>
                )}
              </button>
              <span className="font-mono text-emerald-300 text-[10px]">
                {codeSnippets[selectedCodeTab].lang.toUpperCase()}
              </span>
            </div>

            <p className="text-[11px] text-gray-400">
              {codeSnippets[selectedCodeTab].desc}
            </p>

            <pre className="text-[10px] font-mono text-emerald-300/90 overflow-x-auto max-h-36 p-2 rounded bg-black/40 text-left dir-ltr whitespace-pre">
              {codeSnippets[selectedCodeTab].code}
            </pre>
          </div>
        </div>
      </div>

      {/* Local Backup & Restore */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1A2621] border border-[#E5DDCF] dark:border-[#2A3C34] shadow-sm space-y-3 text-right">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-[#0F6B50] dark:text-[#2DD4BF] flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-[#19302A] dark:text-white">النسخ الاحتياطي ونقل البيانات</h4>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed">
          يمكنك حفظ نسخة احتياطية من تقدمك في شجرة العبادات والعلامات المرجعية والختمات ونقلها إلى أي جهاز آخر.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <label className="py-2.5 px-3 rounded-xl bg-[#FAF7F0] dark:bg-[#14201B] border border-[#E5DDCF] dark:border-[#2A3C34] text-[#0F6B50] dark:text-[#2DD4BF] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-gray-100 active:scale-95 transition-all text-center">
            <Upload className="w-4 h-4" />
            <span>استيراد نسخة</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>

          <button
            onClick={handleExportBackup}
            className="py-2.5 px-3 rounded-xl bg-[#0F6B50] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#138061] active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تصدير نسخة JSON</span>
          </button>
        </div>
      </div>

      {/* GitHub & Google AI Studio Bridge Modal */}
      <GitHubBridgeModal
        isOpen={isGitHubBridgeOpen}
        onClose={() => setIsGitHubBridgeOpen(false)}
      />
    </div>
  );
};

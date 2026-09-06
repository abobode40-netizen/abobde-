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
  HardDrive
} from 'lucide-react';
import { AppSettings, ReciterId } from '../types';
import { RECITERS_LIST, toArabicNumerals } from '../data/quranData';
import { exportBackupJSON, importBackupJSON } from '../utils/storage';
import { playChime } from '../utils/audio';
import { generateStandaloneHTML, generateAndDownloadZipArchive, triggerFileDownload } from '../utils/exportHelpers';
import { getCachedPagesCount, downloadAllQuranPages, clearAllOfflinePages } from '../utils/quranOfflineStorage';
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

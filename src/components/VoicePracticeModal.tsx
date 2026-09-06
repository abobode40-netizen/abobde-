import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, Square, Play, Pause, RotateCcw, Volume2, Check, AlertCircle, Headphones, Smartphone, Copy, Code2 } from 'lucide-react';
import { playChime, triggerHaptic } from '../utils/audio';

interface VoicePracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  ayahText: string;
  surahName: string;
}

export const VoicePracticeModal: React.FC<VoicePracticeModalProps> = ({
  isOpen,
  onClose,
  ayahText,
  surahName,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [isPlayingUser, setIsPlayingUser] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [micPermissionState, setMicPermissionState] = useState<'idle' | 'granted' | 'denied' | 'error'>('idle');
  const [showApkCodeModal, setShowApkCodeModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const userAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  const getSupportedMimeType = (): string => {
    if (typeof MediaRecorder === 'undefined') return '';
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/aac',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      ''
    ];
    for (const t of types) {
      if (!t || MediaRecorder.isTypeSupported(t)) {
        return t;
      }
    }
    return '';
  };

  const cleanupAudio = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try {
        audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }
  };

  useEffect(() => {
    if (!isOpen) {
      cleanupAudio();
      setIsRecording(false);
      setRecordingSeconds(0);
      setAudioLevel(0);
      setErrorMsg(null);
    }
    return () => {
      cleanupAudio();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const startRecording = async () => {
    setErrorMsg(null);
    audioChunksRef.current = [];

    // Check browser / WebView support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg('جهازك أو المتصفح داخل التطبيق لا يدعم واجهة الميكروفون المباشرة (getUserMedia).');
      setMicPermissionState('error');
      return;
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      streamRef.current = stream;
      setMicPermissionState('granted');

      // Setup audio analyzer for visual feedback
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          audioCtxRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkVolume = () => {
            if (!stream.active) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
            animationFrameRef.current = requestAnimationFrame(checkVolume);
          };
          checkVolume();
        }
      } catch {}

      // Select supported MIME type
      const mimeType = getSupportedMimeType();
      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const recordedMime = mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: recordedMime });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedUrl(audioUrl);
        // Stop stream tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingSeconds(0);
      playChime('click');
      triggerHaptic(40);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      console.error('Microphone recording error:', err);
      setIsRecording(false);
      setMicPermissionState('denied');

      const error = err as { name?: string; message?: string };
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setErrorMsg('❌ تم رفض إذن الميكروفون. إذا كنت تستخدم تطبيق APK، يرجى تفعيل إذن الميكروفون من: إعدادات الهاتف > التطبيقات > تطبيق جنّة الرحمن > الأذونات > الميكروفون.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setErrorMsg('❌ لم يتم العثور على ميكروفون متصل بجهازك.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        setErrorMsg('❌ الميكروفون قيد الاستخدام بواسطة تطبيق آخر في هاتفك.');
      } else {
        setErrorMsg(`❌ تعذر تشغيل الميكروفون (${error.message || 'خطأ غير معروف'}).`);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      playChime('success');
      triggerHaptic(50);
    }
  };

  const togglePlayUser = () => {
    if (!userAudioRef.current) return;
    if (isPlayingUser) {
      userAudioRef.current.pause();
      setIsPlayingUser(false);
    } else {
      userAudioRef.current.play()
        .then(() => setIsPlayingUser(true))
        .catch(() => setIsPlayingUser(false));
    }
  };

  const resetRecording = () => {
    setRecordedUrl(null);
    setRecordingSeconds(0);
    setIsPlayingUser(false);
    setAudioLevel(0);
    playChime('click');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start justify-center p-3 sm:p-4 pt-4 sm:pt-8 animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-[#16241E] rounded-3xl p-6 max-w-md w-full border border-emerald-400/40 shadow-2xl space-y-4 text-center my-0">
        {/* Top bar */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 font-bold text-sm text-[#0F6B50] dark:text-[#2DD4BF]">
            <span>تمرين التلاوة</span>
            <Mic className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-xs text-gray-500">سورة {surahName}</span>
        </div>

        {/* Selected Ayah Text display */}
        <div className="p-4 rounded-2xl bg-[#FAF7F0] dark:bg-[#121D18] border border-[#E8DFC8] dark:border-[#2A3C34] text-center space-y-2">
          <span className="text-xs text-[#8A743F] dark:text-amber-300 font-bold block">اقرأ هذه الآية بلسانك:</span>
          <p className="font-quran text-xl sm:text-2xl font-bold leading-loose text-[#19302A] dark:text-amber-100">
            {ayahText}
          </p>
        </div>

        {/* Headphone & Audio Quality Tip Banner */}
        <div className="p-3 rounded-2xl bg-[#F0F8F5] dark:bg-[#12221B] border border-emerald-300/60 dark:border-emerald-800/60 text-right space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setShowApkCodeModal(true);
                playChime('click');
              }}
              className="text-[10px] font-bold text-[#0F6B50] dark:text-[#2DD4BF] hover:underline flex items-center gap-1 bg-white dark:bg-[#192A22] px-2 py-0.5 rounded-lg border border-emerald-300/40"
            >
              <Smartphone className="w-3 h-3 text-amber-500" />
              <span>أكواد APK وأذونات WebView</span>
            </button>
            <div className="flex items-center gap-1.5 font-bold text-[#0F6B50] dark:text-[#2DD4BF]">
              <span>نصيحة تسجيل أنقى</span>
              <Headphones className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            </div>
          </div>
          <p className="text-[11px] text-[#2C453C] dark:text-emerald-100/90 leading-relaxed font-medium">
            🎧 <strong>سماعات الرأس (Headphones):</strong> يوصى باستخدام سماعات الرأس لمنع ارتداد صدى الصوت (Echo) وجعل التقاط التلاوة أنقى وأوضح.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-bold border border-red-200 dark:border-red-900/60 text-right leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 text-red-800 dark:text-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>تنبيه إذن الميكروفون</span>
            </div>
            <p>{errorMsg}</p>
            <button
              onClick={() => {
                setShowApkCodeModal(true);
                playChime('click');
              }}
              className="mt-1 px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] inline-flex items-center gap-1"
            >
              <Code2 className="w-3 h-3" />
              <span>عرض كود أذونات AndroidManifest و WebChromeClient</span>
            </button>
          </div>
        )}

        {/* Recording Controller */}
        <div className="space-y-4 pt-2">
          {/* Waveform / Recording pulse animation */}
          {isRecording ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-1.5 h-12">
                <span
                  className="w-2 bg-red-500 rounded-full transition-all duration-75"
                  style={{ height: `${Math.max(8, (audioLevel / 100) * 44)}px` }}
                />
                <span
                  className="w-2 bg-red-500 rounded-full transition-all duration-75"
                  style={{ height: `${Math.max(12, (audioLevel / 100) * 48)}px` }}
                />
                <span
                  className="w-2 bg-red-500 rounded-full transition-all duration-75"
                  style={{ height: `${Math.max(16, (audioLevel / 100) * 52)}px` }}
                />
                <span
                  className="w-2 bg-red-500 rounded-full transition-all duration-75"
                  style={{ height: `${Math.max(12, (audioLevel / 100) * 48)}px` }}
                />
                <span
                  className="w-2 bg-red-500 rounded-full transition-all duration-75"
                  style={{ height: `${Math.max(8, (audioLevel / 100) * 44)}px` }}
                />
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400">
                  00:{String(recordingSeconds).padStart(2, '0')} (جارٍ التقاط الصوت...)
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500">
              اضغط على زر التسجيل أدناه لتسجيل صوتك بالآية ثم الاستماع إليه ومقارنته.
            </p>
          )}

          {/* Action Buttons */}
          {!recordedUrl ? (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                  : 'bg-[#0F6B50] hover:bg-[#138061] text-white'
              }`}
            >
              {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
              <span>{isRecording ? 'إيقاف التسجيل' : 'ابدأ تسجيل تلاوتك'}</span>
            </button>
          ) : (
            <div className="space-y-3">
              {/* Recorded Audio Element */}
              <audio
                ref={userAudioRef}
                src={recordedUrl}
                onEnded={() => setIsPlayingUser(false)}
              />

              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>تم تسجيل تلاوتك بنجاح!</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={togglePlayUser}
                  className="flex-1 py-3 rounded-xl bg-[#0F6B50] text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm cursor-pointer hover:bg-[#138061]"
                >
                  {isPlayingUser ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlayingUser ? 'إيقاف الاستماع' : 'استمع لتسجيلك'}</span>
                </button>

                <button
                  onClick={resetRecording}
                  className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center justify-center gap-1 hover:bg-gray-200 cursor-pointer"
                  title="إعادة التسجيل"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>إعادة</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* APK Microphone Code Sub-Modal */}
      {showApkCodeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-fadeIn">
          <div className="bg-white dark:bg-[#162720] rounded-3xl p-5 max-w-lg w-full border-2 border-[#0F6B50] shadow-2xl space-y-3.5 text-right max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setShowApkCodeModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1.5 font-bold text-sm text-[#0F6B50] dark:text-[#2DD4BF]">
                <span>أكواد تفعيل الميكروفون للـ APK</span>
                <Smartphone className="w-4 h-4 text-amber-500" />
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
              عند تحويل موقع الويب إلى تطبيق أندرويد APK عبر WebView، يتوجب إضافة كود الأذونات التالي لملف <code className="text-[#0F6B50] font-bold">AndroidManifest.xml</code> وكود <code className="text-[#0F6B50] font-bold">WebChromeClient</code> في نشاط أندرويد:
            </p>

            {/* Code Snippet 1: Manifest */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    const code = `<uses-permission android:name="android.permission.RECORD_AUDIO" />\n<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />`;
                    navigator.clipboard.writeText(code);
                    setCopiedKey('manifest');
                    playChime('click');
                    setTimeout(() => setCopiedKey(null), 2000);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[11px] flex items-center gap-1 hover:bg-emerald-200"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedKey === 'manifest' ? 'تم النسخ!' : 'نسخ إذن Manifest'}</span>
                </button>
                <span className="font-bold text-[#19302A] dark:text-white">1. إذن AndroidManifest.xml</span>
              </div>
              <pre className="p-2.5 rounded-xl bg-black/90 text-emerald-300 text-[10px] font-mono text-left dir-ltr overflow-x-auto">
{`<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />`}
              </pre>
            </div>

            {/* Code Snippet 2: Java WebChromeClient */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    const code = `webView.setWebChromeClient(new WebChromeClient() {\n    @Override\n    public void onPermissionRequest(PermissionRequest request) {\n        request.grant(request.getResources());\n    }\n});`;
                    navigator.clipboard.writeText(code);
                    setCopiedKey('java');
                    playChime('click');
                    setTimeout(() => setCopiedKey(null), 2000);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[11px] flex items-center gap-1 hover:bg-emerald-200"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedKey === 'java' ? 'تم النسخ!' : 'نسخ كود WebChromeClient'}</span>
                </button>
                <span className="font-bold text-[#19302A] dark:text-white">2. كود Java WebView (WebChromeClient)</span>
              </div>
              <pre className="p-2.5 rounded-xl bg-black/90 text-emerald-300 text-[10px] font-mono text-left dir-ltr overflow-x-auto">
{`webView.setWebChromeClient(new WebChromeClient() {
  @Override
  public void onPermissionRequest(PermissionRequest request) {
    request.grant(request.getResources());
  }
});`}
              </pre>
            </div>

            {/* Headphone Recommendation */}
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Headphones className="w-4 h-4 text-amber-600" />
                <span>🎧 استخدام سماعات الرأس (Headphones)</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                استخدام سماعات الرأس يمنع ارتداد صدى الصوت (Echo) ويجعل تسجيل التلاوة أنقى وأوضح لك وللتقييم الصوتي.
              </p>
            </div>

            <button
              onClick={() => setShowApkCodeModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#0F6B50] hover:bg-[#138061] text-white font-bold text-xs"
            >
              إغلاق وحفظ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


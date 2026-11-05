/**
 * Serene Male Modern Standard Arabic Speech Engine for Morning & Evening Athkar
 * (المحرك الصوتي الخاشع لأذكار الصباح والمساء باللغة العربية الفصحى)
 */

export interface AthkarAudioState {
  playingThikrId: string | null;
  isPlaying: boolean;
  progressPercent: number; // 0 to 100
  activeCategoryTitle?: string;
}

type ProgressCallback = (thikrId: string, percent: number) => void;
type EndCallback = (thikrId: string) => void;
type ErrorCallback = (err?: any) => void;

let currentUtterance: SpeechSynthesisUtterance | null = null;
let currentThikrId: string | null = null;
let progressInterval: number | null = null;

/**
 * Strips Quranic brackets and special symbols for smooth Modern Standard Arabic speech
 */
export function cleanThikrTextForSpeech(text: string): string {
  if (!text) return '';
  return text
    .replace(/[﴿﴾۝۩ۣ۟۠ۡۢۤ]/g, ' ')
    .replace(/ثَلَاثَ مَرَّاتٍ|ثَلاَثَ مَرَّاتٍ|\(ثلاث مرات\)|\(3 مرات\)/gi, '')
    .replace(/قراءة سورة.*:\s*/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Returns available Arabic voices, prioritizing male voices if available
 */
export function getArabicMaleVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Try to find a male Arabic voice
  const arVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('ar'));
  
  const maleAr = arVoices.find(v => 
    v.name.toLowerCase().includes('male') || 
    v.name.toLowerCase().includes('maged') || 
    v.name.toLowerCase().includes('tariq') || 
    v.name.toLowerCase().includes('naayf') ||
    v.name.toLowerCase().includes('saudi')
  );

  if (maleAr) return maleAr;

  // 2. Fallback to any Arabic voice
  if (arVoices.length > 0) return arVoices[0];

  return null;
}

/**
 * Speak a Thikr in serene male Modern Standard Arabic with progress updates
 */
export function speakThikr(
  thikrId: string,
  rawText: string,
  onProgress?: ProgressCallback,
  onEnd?: EndCallback,
  onError?: ErrorCallback
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onError) onError('Speech synthesis not supported');
    return false;
  }

  const synth = window.speechSynthesis;

  // Cancel any ongoing speech and clear progress timers
  stopAthkarAudio();

  const cleanText = cleanThikrTextForSpeech(rawText);
  if (!cleanText) {
    if (onError) onError('Empty text');
    return false;
  }

  currentUtterance = new SpeechSynthesisUtterance(cleanText);
  currentThikrId = thikrId;

  // Voice setup for male Modern Standard Arabic
  const arVoice = getArabicMaleVoice();
  if (arVoice) {
    currentUtterance.voice = arVoice;
  }
  currentUtterance.lang = 'ar-SA';
  
  // Serene, calm, contemplative recitation pacing
  currentUtterance.rate = 0.82; // Slightly slow and tranquil
  currentUtterance.pitch = 0.85; // Deep male pitch

  // Calculate estimated total speech duration based on text length (~12 chars per second at 0.82 rate)
  const estimatedCharLength = cleanText.length;
  const estimatedDurationMs = Math.max(3000, (estimatedCharLength / 12) * 1000);
  let startTime = Date.now();

  if (onProgress) {
    onProgress(thikrId, 0);
  }

  // Live Progress interval tracker
  progressInterval = window.setInterval(() => {
    if (!currentUtterance || !synth.speaking) {
      if (progressInterval) clearInterval(progressInterval);
      return;
    }
    const elapsed = Date.now() - startTime;
    const progress = Math.min(99, Math.floor((elapsed / estimatedDurationMs) * 100));
    if (onProgress && currentThikrId === thikrId) {
      onProgress(thikrId, progress);
    }
  }, 100);

  currentUtterance.onboundary = (e) => {
    if (e.charIndex && cleanText.length > 0) {
      const charPercent = Math.min(98, Math.floor((e.charIndex / cleanText.length) * 100));
      if (onProgress && currentThikrId === thikrId) {
        onProgress(thikrId, charPercent);
      }
    }
  };

  currentUtterance.onend = () => {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
    if (onProgress && currentThikrId === thikrId) {
      onProgress(thikrId, 100);
    }
    const finishedId = currentThikrId;
    currentUtterance = null;
    currentThikrId = null;

    if (onEnd && finishedId) {
      onEnd(finishedId);
    }
  };

  currentUtterance.onerror = (err) => {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
    currentUtterance = null;
    currentThikrId = null;
    if (onError) onError(err);
  };

  synth.speak(currentUtterance);
  return true;
}

/**
 * Pause active speech
 */
export function pauseAthkarAudio() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.pause();
  }
}

/**
 * Resume paused speech
 */
export function resumeAthkarAudio() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.resume();
  }
}

/**
 * Stop any active Athkar audio recitation
 */
export function stopAthkarAudio() {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
  currentThikrId = null;
  currentUtterance = null;

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Get currently playing Thikr ID
 */
export function getActiveThikrId(): string | null {
  return currentThikrId;
}

/**
 * Check if speech synthesis is currently active
 */
export function isAthkarAudioSpeaking(): boolean {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}

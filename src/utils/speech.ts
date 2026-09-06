/**
 * Helper for Arabic Speech Synthesis (TTS)
 * Provides clear audio reading of Adhkar with authentic male voice priority and pitch calibration for non-readers.
 */

// Clean Quranic symbols, waqf signs, and markdown brackets for clean, natural reading
export function cleanTextForSpeech(text: string): string {
  if (!text) return '';
  return text
    .replace(/[﴿﴾۝۞۩ۚۖۗۘۙۚۛۜ]/g, ' ')
    .replace(/\[.*?\]/g, '') // remove bracketed notes
    .replace(/\(.*?\)/g, '') // remove parenthesized remarks like (ثلاث مرات)
    .replace(/[ـ]/g, '') // remove tatweel
    .replace(/\s+/g, ' ')
    .trim();
}

let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== 'undefined' && window.speechSynthesis) {
  const loadVoices = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

/**
 * Finds the best available Arabic male voice on the current platform/browser.
 */
export function getArabicMaleVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  
  // All Arabic voices
  const arabicVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('ar'));
  
  if (arabicVoices.length > 0) {
    // 1. Explicit Male Arabic voices by name (Google, Microsoft, Apple, Android)
    const maleNames = ['maged', 'tarik', 'hamed', 'shakir', 'naayf', 'youssef', 'zayd', 'male', 'standard-b', 'standard-d', 'wavenet-b', 'wavenet-d', 'ar-sa-x-'];
    const femaleNames = ['laila', 'mariam', 'salma', 'zari', 'hoda', 'female', 'standard-a', 'standard-c', 'wavenet-a', 'wavenet-c'];

    // First try: strictly matching male keywords
    const strictMale = arabicVoices.find(v => {
      const name = v.name.toLowerCase();
      return maleNames.some(m => name.includes(m)) && !femaleNames.some(f => name.includes(f));
    });
    if (strictMale) return strictMale;

    // Second try: exclude known female names
    const nonFemale = arabicVoices.find(v => {
      const name = v.name.toLowerCase();
      return !femaleNames.some(f => name.includes(f));
    });
    if (nonFemale) return nonFemale;

    // Fallback to any arabic voice (we will apply pitch modulation)
    return arabicVoices[0];
  }

  return null;
}

export type MaleVoiceTone = 'deep' | 'balanced' | 'clear';

export interface MaleSpeechOptions {
  rate?: number;
  pitch?: number;
  tone?: MaleVoiceTone;
  volume?: number;
  gender?: 'male';
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

/**
 * Speaks a given text in Arabic with a dignified, comfortable male voice.
 */
export function speakArabicText(
  text: string,
  options: MaleSpeechOptions = {}
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (options.onError) options.onError(new Error('SpeechSynthesis not supported'));
    return null;
  }

  // Cancel any ongoing speech first
  window.speechSynthesis.cancel();

  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) {
    if (options.onEnd) options.onEnd();
    return null;
  }

  const utterance = new SpeechSynthesisUtterance(cleaned);
  utterance.lang = 'ar-SA';
  
  // Rate: 0.80 - 0.82 is deliberate, steady, and clear for listening and repeating
  utterance.rate = options.rate ?? 0.80;
  
  // Male Pitch adjustments:
  // deep: 0.74 (Deep masculine reverent tone)
  // balanced: 0.80 (Natural male tone)
  // clear: 0.86 (Crisp standard tone)
  let pitchVal = 0.78;
  if (options.pitch !== undefined) {
    pitchVal = options.pitch;
  } else if (options.tone === 'deep') {
    pitchVal = 0.72;
  } else if (options.tone === 'clear') {
    pitchVal = 0.86;
  } else {
    pitchVal = 0.78;
  }

  utterance.pitch = pitchVal;
  utterance.volume = options.volume ?? 1;

  const maleVoice = getArabicMaleVoice();
  if (maleVoice) {
    utterance.voice = maleVoice;
  }

  utterance.onstart = () => {
    if (options.onStart) options.onStart();
  };

  utterance.onend = () => {
    if (options.onEnd) options.onEnd();
  };

  utterance.onerror = (e) => {
    // 'canceled' or 'interrupted' is expected when stopping intentionally
    if (e.error !== 'canceled' && e.error !== 'interrupted' && options.onError) {
      options.onError(e);
    }
  };

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}



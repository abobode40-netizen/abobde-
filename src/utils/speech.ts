/**
 * Speech utility placeholder - Disabled per user request (no AI/synthetic speech voices).
 */

export function cleanTextForSpeech(text: string): string {
  if (!text) return '';
  return text
    .replace(/[﴿﴾۝۞۩ۚۖۗۘۙۚۛۜ]/g, ' ')
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/[ـ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getArabicMaleVoice(): SpeechSynthesisVoice | null {
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
 * Speech synthesis is disabled to respect user preference against synthetic/female AI voices.
 */
export function speakArabicText(
  _text: string,
  options: MaleSpeechOptions = {}
): SpeechSynthesisUtterance | null {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  if (options.onEnd) {
    options.onEnd();
  }
  return null;
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}



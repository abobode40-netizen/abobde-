import { ThimarahItem, RelatedQuranVerse } from '../types';
import { THIMAR_LIST } from '../data/thimarData';

export async function fetchAIThimar(topic?: string, era?: string): Promise<ThimarahItem | null> {
  try {
    const res = await fetch('/api/ai-thimar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, era })
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) {
      return {
        id: `ai-${Date.now()}`,
        quote: json.data.quote,
        author: json.data.author,
        category: json.data.category || 'فوائد الذكاء الاصطناعي',
        source: json.data.source || 'من درر أعلام السنة',
        reflectionPrompt: json.data.reflectionPrompt,
        era: json.data.era,
        relatedVerse: json.data.relatedVerse
      };
    }
  } catch (err) {
    console.warn('AI Thimar fetch failed, fallback to local database:', err);
  }
  return null;
}

export async function fetchAIQuranLink(textToLink: string): Promise<RelatedQuranVerse | null> {
  try {
    const res = await fetch('/api/ai-quran-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ textToLink })
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) {
      return json.data as RelatedQuranVerse;
    }
  } catch (err) {
    console.warn('AI Quran link fetch failed:', err);
  }
  return null;
}

/**
 * Returns today's featured daily wisdom based on YYYY-MM-DD string seed.
 * Guarantees a fresh, auto-updated scholar wisdom every 24 hours!
 */
export function getDailyFeaturedThimarah(): ThimarahItem {
  const todayStr = new Date().toISOString().split('T')[0]; // e.g. "2026-08-23"
  let hash = 0;
  for (let i = 0; i < todayStr.length; i++) {
    hash = (hash << 5) - hash + todayStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % THIMAR_LIST.length;
  return THIMAR_LIST[index] || THIMAR_LIST[0];
}

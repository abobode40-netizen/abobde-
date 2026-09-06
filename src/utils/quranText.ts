/**
 * Utilities for cleaning and formatting pure Uthmani Quranic Arabic text
 * based on the King Fahd Glorious Quran Printing Complex standards.
 */

/**
 * Strips any bracket tags, orphan characters, or trailing numerals,
 * returning 100% pure, authentic Uthmani Quranic Arabic text.
 */
export function stripAllFormatting(str: string): string {
  if (!str) return '';
  let cleaned = str;
  let prev = '';
  while (cleaned !== prev) {
    prev = cleaned;
    cleaned = cleaned.replace(/\[[a-z]+(?::\d+)*\[([^\[\]]*)\]\]/gi, '$1');
  }
  cleaned = cleaned.replace(/\[[a-z]+(?::\d+)*\[?/gi, '').replace(/\]+/g, '');
  // Strip trailing numbers/end markers
  return cleaned.replace(/[\u06DD\u0660-\u06690-9\s]+$/g, '').trim();
}

/**
 * Clean helper to return pure Uthmani Arabic text without numbers or tags
 */
export function cleanQuranText(str: string): string {
  if (!str) return '';
  return stripAllFormatting(str);
}

/**
 * Strips prepended Bismillah from Ayah 1 text for Surahs other than Al-Fatihah (1) and At-Tawbah (9)
 * so that Bismillah is not duplicated in both the Surah header and Ayah 1.
 */
export function removeBismillahFromAyah1(text: string): string {
  if (!text) return '';
  return text
    .replace(/^(?:\[[^\]]+\[)*\s*بِسْمِ[\s\S]*?(?:ٱلرَّحْمَٰنِ|الرَّحْمَٰنِ)[\s\S]*?(?:ٱلرَّحِيمِ|الرَّحِيمِ)\s*(?:\]\])*/iu, '')
    .trim();
}

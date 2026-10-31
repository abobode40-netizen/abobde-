/**
 * Universal Islamic Export & Sharing Utility
 * Generates formatted Arabic texts for WhatsApp/Telegram, .txt files, and .json data
 * Without green colors - using celestial sky blue accents.
 */

export interface ExportPayload {
  title: string;
  doorName: string;
  formattedText: string;
  jsonData: any;
  filenamePrefix: string;
}

/**
 * Copies plain or formatted text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers or restricted contexts
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      textArea.remove();
      return success;
    }
  } catch (err) {
    console.warn('Clipboard copy failed:', err);
    return false;
  }
}

/**
 * Triggers native share sheet if supported
 */
export async function shareContent(title: string, text: string): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text
      });
      return true;
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Share sheet failed:', err);
      }
      return false;
    }
  }
  return false;
}

/**
 * Downloads a text or JSON file directly
 */
export function downloadFile(filename: string, content: string, mimeType = 'text/plain;charset=utf-8'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Formatters for each door

export function generateQuranPageExport(
  pageNum: number,
  surahName: string,
  juzNum: number,
  ayahs: Array<{ numberInSurah?: number; ayahNumber?: number; text: string; tafseer?: string }>
): ExportPayload {
  const lines: string[] = [
    `﷽`,
    `📖 *المصحف الشريف - صفحة (${pageNum}) - سورة ${surahName}*`,
    `📍 الجزء (${juzNum}) | تطبيق جنّة الرحمن`,
    `────────────────────`,
    ``
  ];

  ayahs.forEach((ayah, idx) => {
    const num = ayah.numberInSurah || ayah.ayahNumber || (idx + 1);
    lines.push(`﴿ ${ayah.text.trim()} ﴾ [${num}]`);
    if (ayah.tafseer) {
      lines.push(`💡 *التفسير الميسر:* ${ayah.tafseer.trim()}`);
      lines.push(``);
    }
  });

  lines.push(`────────────────────`);
  lines.push(`✨ تم التصدير عبر تطبيق «جنّة الرحمن» - زاد المسلم ورفيق القلوب`);

  const fullText = lines.join('\n');
  return {
    title: `سورة ${surahName} - صفحة ${pageNum}`,
    doorName: 'المصحف الشريف',
    formattedText: fullText,
    jsonData: {
      door: 'quran',
      page: pageNum,
      surah: surahName,
      juz: juzNum,
      ayahsCount: ayahs.length,
      ayahs: ayahs.map((a, i) => ({
        ayahNumber: a.numberInSurah || a.ayahNumber || i + 1,
        text: a.text,
        tafseer: a.tafseer
      })),
      exportedAt: new Date().toISOString()
    },
    filenamePrefix: `quran_page_${pageNum}_${surahName}`
  };
}

export function generateAthkarExport(
  categoryTitle: string,
  items: Array<{ text: string; repeatCount: number; fadl?: string; source?: string }>
): ExportPayload {
  const lines: string[] = [
    `﷽`,
    `🌿 *${categoryTitle}*`,
    `📍 حصن المسلم وغراس الجنة | تطبيق جنّة الرحمن`,
    `────────────────────`,
    ``
  ];

  items.forEach((item, idx) => {
    lines.push(`*(${idx + 1}) الذكر:*`);
    lines.push(`« ${item.text.trim()} »`);
    lines.push(`🔁 التكرار: [${item.repeatCount} مرات]`);
    if (item.fadl) {
      lines.push(`✨ الفضل: ${item.fadl.trim()}`);
    }
    if (item.source) {
      lines.push(`📚 المصدر: ${item.source.trim()}`);
    }
    lines.push(`────────────────────`);
    lines.push(``);
  });

  lines.push(`✨ حُفظ ونُشر عبر تطبيق «جنّة الرحمن»`);

  return {
    title: categoryTitle,
    doorName: 'غراس الأذكار وحصن المسلم',
    formattedText: lines.join('\n'),
    jsonData: {
      door: 'athkar',
      category: categoryTitle,
      totalItems: items.length,
      items,
      exportedAt: new Date().toISOString()
    },
    filenamePrefix: `athkar_${categoryTitle.replace(/\s+/g, '_')}`
  };
}

export function generateDuasExport(
  categoryTitle: string,
  duas: Array<{ title: string; arabicText: string; source: string; benefit?: string; narrator?: string }>
): ExportPayload {
  const lines: string[] = [
    `﷽`,
    `🤲 *${categoryTitle}*`,
    `📍 روائع الأدعية المأثورة ونصح الشباب | تطبيق جنّة الرحمن`,
    `────────────────────`,
    ``
  ];

  duas.forEach((dua, idx) => {
    lines.push(`*(${idx + 1}) ${dua.title}*`);
    lines.push(`« ${dua.arabicText.trim()} »`);
    if (dua.benefit) {
      lines.push(`💎 المناسبة والفضل: ${dua.benefit.trim()}`);
    }
    lines.push(`📖 التحقيق والمصدر: ${dua.source.trim()}`);
    if (dua.narrator) {
      lines.push(`👤 الراوي: ${dua.narrator.trim()}`);
    }
    lines.push(`────────────────────`);
    lines.push(``);
  });

  lines.push(`✨ شارك الخير وانشره | تطبيق «جنّة الرحمن»`);

  return {
    title: categoryTitle,
    doorName: 'الأدعية المأثورة',
    formattedText: lines.join('\n'),
    jsonData: {
      door: 'duas',
      category: categoryTitle,
      totalCount: duas.length,
      duas,
      exportedAt: new Date().toISOString()
    },
    filenamePrefix: `duas_${categoryTitle.replace(/\s+/g, '_')}`
  };
}

export function generateThimarExport(
  scholarOrCategory: string,
  quotes: Array<{ quote: string; author: string; source?: string; category?: string }>
): ExportPayload {
  const lines: string[] = [
    `﷽`,
    `💎 *ثمار المشايخ ودرر أهل العلم*`,
    `📍 ${scholarOrCategory} | تطبيق جنّة الرحمن`,
    `────────────────────`,
    ``
  ];

  quotes.forEach((q, idx) => {
    lines.push(`*(${idx + 1}) قائل الدرة: ${q.author}*`);
    lines.push(`« ${q.quote.trim()} »`);
    if (q.source) {
      lines.push(`📚 المصدر: ${q.source.trim()}`);
    }
    lines.push(`────────────────────`);
    lines.push(``);
  });

  lines.push(`✨ من ثمار العلم النافع | تطبيق «جنّة الرحمن»`);

  return {
    title: `ثمار المشايخ - ${scholarOrCategory}`,
    doorName: 'ثمار المشايخ والمكتبة الصوتية',
    formattedText: lines.join('\n'),
    jsonData: {
      door: 'thimar',
      scholarOrCategory,
      totalQuotes: quotes.length,
      quotes,
      exportedAt: new Date().toISOString()
    },
    filenamePrefix: `thimar_${scholarOrCategory.replace(/\s+/g, '_')}`
  };
}

export function generateMishkatExport(
  title: string,
  lessons: Array<{
    title: string;
    storyText: string;
    authenticitySource: string;
    authenticityGrade?: string;
    practicalTakeaway: string;
    propheticGuidance: string;
    actionTip?: string;
  }>
): ExportPayload {
  const lines: string[] = [
    `﷽`,
    `🌟 *مشكاة الأنوار - قبسات السيرة النبوية وهمّة الشباب*`,
    `📍 ${title} | تطبيق جنّة الرحمن`,
    `────────────────────`,
    ``
  ];

  lessons.forEach((l, idx) => {
    lines.push(`*(${idx + 1}) ${l.title}*`);
    lines.push(``);
    lines.push(`📜 *الموقف والقصة الشريفة:*`);
    lines.push(l.storyText.trim());
    lines.push(``);
    lines.push(`💡 *الهدي والوصية النبوية:*`);
    lines.push(`« ${l.propheticGuidance.trim()} »`);
    lines.push(``);
    lines.push(`🌱 *القبس العملي لواقع الشباب اليوم:*`);
    lines.push(l.practicalTakeaway.trim());
    if (l.actionTip) {
      lines.push(`🎯 *خطوة عملية لليوم:* ${l.actionTip.trim()}`);
    }
    lines.push(``);
    lines.push(`📚 *التخريج والأثر:* ${l.authenticitySource} (${l.authenticityGrade || 'صحيح'})`);
    lines.push(`────────────────────`);
    lines.push(``);
  });

  lines.push(`✨ ربيع القلوب وسيرة الحبيب ﷺ | تطبيق «جنّة الرحمن»`);

  return {
    title: `مشكاة الأنوار - ${title}`,
    doorName: 'مشكاة الأنوار',
    formattedText: lines.join('\n'),
    jsonData: {
      door: 'mishkat',
      title,
      lessons,
      exportedAt: new Date().toISOString()
    },
    filenamePrefix: `mishkat_${title.replace(/\s+/g, '_')}`
  };
}

export function generateTrackerExport(trackerData: any, dateStr?: string): ExportPayload {
  const today = dateStr || new Date().toISOString().split('T')[0];
  const prayers = trackerData.prayers || {};
  const habits = trackerData.habits || {};

  const prayerStatusMap: Record<string, string> = {
    congregation: '✅ في المسجد / جماعة',
    alone: '✔️ في أول وقتها',
    missed: '❌ لم تؤدَّ'
  };

  const lines: string[] = [
    `﷽`,
    `📊 *تقرير شجرة العبادات ومحاسبة النفس*`,
    `📅 التاريخ: ${today} | تطبيق جنّة الرحمن`,
    `────────────────────`,
    `🕌 *الصلوات المكتوبة:*`,
    `• الفجر: ${prayerStatusMap[prayers.fajr] || 'غير مسجلة'}`,
    `• الظهر: ${prayerStatusMap[prayers.dhuhr] || 'غير مسجلة'}`,
    `• العصر: ${prayerStatusMap[prayers.asr] || 'غير مسجلة'}`,
    `• المغرب: ${prayerStatusMap[prayers.maghrib] || 'غير مسجلة'}`,
    `• العشاء: ${prayerStatusMap[prayers.isha] || 'غير مسجلة'}`,
    ``,
    `📖 *الورد القرآني:* ${trackerData.quranPagesRead || 0} من ${trackerData.quranTargetPages || 4} صفحة`,
    `🌿 *الأذكار والتسبيح:* ${trackerData.athkarCompletedCount || 0} ذكراً منجزاً`,
    `🌳 *اكتمال غراس الجنة اليوم:* ${Math.round(trackerData.treeGrowthPercentage || 0)}%`,
    `────────────────────`,
    `✨ حاسبوا أنفسكم قبل أن تحاسبوا | تطبيق «جنّة الرحمن»`
  ];

  return {
    title: `شجرة العبادات - ${today}`,
    doorName: 'شجرة العبادات ومحاسبة النفس',
    formattedText: lines.join('\n'),
    jsonData: {
      door: 'tracker',
      date: today,
      trackerData,
      exportedAt: new Date().toISOString()
    },
    filenamePrefix: `ibadah_tracker_${today}`
  };
}

export function generatePrayerTimesExport(
  cityName: string,
  hijriDate: string,
  times: Record<string, string>
): ExportPayload {
  const lines: string[] = [
    `﷽`,
    `🕌 *مواقيت الصلاة لمدينة: ${cityName}*`,
    `📅 التاريخ الهجري: ${hijriDate}`,
    `────────────────────`,
    `🌅 الفجر: ${times.fajr || '--'}`,
    `☀️ الشروق: ${times.sunrise || '--'}`,
    `☀️ الظهر: ${times.dhuhr || '--'}`,
    `🌤️ العصر: ${times.asr || '--'}`,
    `🌇 المغرب: ${times.maghrib || '--'}`,
    `🌌 العشاء: ${times.isha || '--'}`,
    `────────────────────`,
    `«إن الصلاة كانت على المؤمنين كتاباً موقوتاً»`,
    `✨ مواقيت دقيقة عبر تطبيق «جنّة الرحمن»`
  ];

  return {
    title: `مواقيت الصلاة - ${cityName}`,
    doorName: 'مواقيت الصلاة',
    formattedText: lines.join('\n'),
    jsonData: {
      door: 'prayer_times',
      city: cityName,
      hijriDate,
      times,
      exportedAt: new Date().toISOString()
    },
    filenamePrefix: `prayer_times_${cityName.replace(/\s+/g, '_')}`
  };
}

export function generateSebhaExport(counts: Record<string, number>, totalPraises: number): ExportPayload {
  const lines: string[] = [
    `﷽`,
    `📿 *سجل السبحة الإلكترونية والاستغفار*`,
    `✨ مجموع التسبيحات المباركة: (${totalPraises}) تسبيحة`,
    `────────────────────`
  ];

  Object.entries(counts).forEach(([thikr, count]) => {
    lines.push(`• ${thikr}: [${count}] مرة`);
  });

  lines.push(`────────────────────`);
  lines.push(`«ألا بذكر الله تطمئن القلوب»`);
  lines.push(`✨ تم التصدير عبر تطبيق «جنّة الرحمن»`);

  return {
    title: 'سجل السبحة الإلكترونية',
    doorName: 'السبحة الإلكترونية',
    formattedText: lines.join('\n'),
    jsonData: {
      door: 'sebha',
      totalPraises,
      counts,
      exportedAt: new Date().toISOString()
    },
    filenamePrefix: `sebha_log_${Date.now()}`
  };
}

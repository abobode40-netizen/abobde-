import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  Send, 
  MessageCircle, 
  Twitter, 
  Palette, 
  Image as ImageIcon,
  TreePine,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { DayTrackerData, PrayerStatus } from '../types';
import { DAILY_HABITS_LIST } from '../data/prayersData';
import { toArabicNumerals } from '../data/quranData';
import { playChime, triggerHaptic } from '../utils/audio';

interface TreeShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackerData: DayTrackerData;
}

type CardTheme = 'emerald' | 'gold_dark' | 'pearl_light';

export const TreeShareModal: React.FC<TreeShareModalProps> = ({
  isOpen,
  onClose,
  trackerData
}) => {
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>('emerald');
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [copiedImage, setCopiedImage] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getHijriFormattedDate = (): string => {
    try {
      const today = new Date();
      return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(today);
    } catch {
      return 'تاريخ اليوم المبارك';
    }
  };

  const getGregorianFormattedDate = (): string => {
    const today = new Date();
    return today.toLocaleDateString('ar-EG', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const renderCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High resolution dimensions (1080 x 1350 portrait)
    const width = 1080;
    const height = 1350;
    canvas.width = width;
    canvas.height = height;

    const pct = trackerData.treeGrowthPercentage || 0;
    const completedHabits = DAILY_HABITS_LIST.filter(h => !!trackerData.habits[h.id]);
    const prayerNames: Record<string, string> = {
      fajr: 'الفجر',
      dhuhr: 'الظهر',
      asr: 'العصر',
      maghrib: 'المغرب',
      isha: 'العشاء'
    };

    // Color Palette definition based on theme
    let bgGradStart = '#0B4D3B';
    let bgGradEnd = '#166E54';
    let borderColor = '#D4AF37';
    let cardBg = 'rgba(255, 255, 255, 0.08)';
    let cardBorder = 'rgba(212, 175, 55, 0.35)';
    let primaryText = '#FFFFFF';
    let subText = '#E0F2E9';
    let goldText = '#FFDF78';
    let progressBg = '#073327';
    let progressFill = '#FFDF78';

    if (selectedTheme === 'gold_dark') {
      bgGradStart = '#0F1E19';
      bgGradEnd = '#1B2C24';
      borderColor = '#E5C07B';
      cardBg = 'rgba(229, 192, 123, 0.07)';
      cardBorder = 'rgba(229, 192, 123, 0.4)';
      primaryText = '#FFFFFF';
      subText = '#D1DDD6';
      goldText = '#F3D289';
      progressBg = '#09120F';
      progressFill = '#F3D289';
    } else if (selectedTheme === 'pearl_light') {
      bgGradStart = '#FAF7F0';
      bgGradEnd = '#EFE9DA';
      borderColor = '#0F6B50';
      cardBg = 'rgba(255, 255, 255, 0.85)';
      cardBorder = 'rgba(15, 107, 80, 0.25)';
      primaryText = '#19302A';
      subText = '#4A5B53';
      goldText = '#B45309';
      progressBg = '#E0D8C8';
      progressFill = '#0F6B50';
    }

    // 1. Draw Background Gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, bgGradStart);
    bgGradient.addColorStop(1, bgGradEnd);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Decorative Islamic Pattern Grid & Geometry in background
    ctx.save();
    ctx.strokeStyle = selectedTheme === 'pearl_light' ? 'rgba(15, 107, 80, 0.04)' : 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1.5;
    for (let x = 40; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 40; y < height; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Draw Outer Elegant Border Frame
    ctx.save();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    ctx.strokeStyle = selectedTheme === 'pearl_light' ? 'rgba(15, 107, 80, 0.3)' : 'rgba(212, 175, 55, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(48, 48, width - 96, height - 96);

    // Corner Ornaments
    const drawCornerOrnament = (cx: number, cy: number) => {
      ctx.save();
      ctx.fillStyle = borderColor;
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 16, cy);
      ctx.lineTo(cx + 16, cy);
      ctx.moveTo(cx, cy - 16);
      ctx.lineTo(cx, cy + 16);
      ctx.stroke();
      ctx.restore();
    };
    drawCornerOrnament(48, 48);
    drawCornerOrnament(width - 48, 48);
    drawCornerOrnament(48, height - 48);
    drawCornerOrnament(width - 48, height - 48);
    ctx.restore();

    // 4. Header: Bismillah & App Title
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = goldText;
    ctx.font = 'bold 28px "Amiri", serif';
    ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', width / 2, 95);

    ctx.fillStyle = primaryText;
    ctx.font = 'bold 44px "Cairo", sans-serif';
    ctx.fillText('شجرة العبادات اليومية', width / 2, 155);

    ctx.fillStyle = subText;
    ctx.font = '22px "Cairo", sans-serif';
    ctx.fillText('تطبيق جنّة الرحمن • زاد المسلم ورفيقه', width / 2, 192);

    // Date Badge
    const hijri = getHijriFormattedDate();
    const gregorian = getGregorianFormattedDate();
    ctx.fillStyle = cardBg;
    ctx.strokeStyle = cardBorder;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(width / 2 - 320, 215, 640, 48, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = primaryText;
    ctx.font = 'bold 18px "Cairo", sans-serif';
    ctx.fillText(`🗓️  ${hijri}  |  ${gregorian}`, width / 2, 246);
    ctx.restore();

    // 5. Growth Progress Main Banner
    ctx.save();
    ctx.fillStyle = cardBg;
    ctx.strokeStyle = cardBorder;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(80, 285, width - 160, 200, 32);
    ctx.fill();
    ctx.stroke();

    // Circular Progress Gauge on the right
    const gaugeCenterX = width - 180;
    const gaugeCenterY = 385;
    const gaugeRadius = 64;

    // Background circle
    ctx.lineWidth = 14;
    ctx.strokeStyle = progressBg;
    ctx.beginPath();
    ctx.arc(gaugeCenterX, gaugeCenterY, gaugeRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Foreground progress arc
    ctx.strokeStyle = progressFill;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (Math.PI * 2 * (pct / 100));
    ctx.arc(gaugeCenterX, gaugeCenterY, gaugeRadius, startAngle, endAngle);
    ctx.stroke();

    // Gauge Text
    ctx.textAlign = 'center';
    ctx.fillStyle = primaryText;
    ctx.font = 'bold 34px "Cairo", sans-serif';
    ctx.fillText(`٪${toArabicNumerals(pct)}`, gaugeCenterX, gaugeCenterY + 12);

    // Growth Details on the left
    ctx.textAlign = 'right';
    ctx.fillStyle = goldText;
    ctx.font = 'bold 30px "Cairo", sans-serif';
    ctx.fillText('أغصان اليوم المباركة', width - 280, 350);

    ctx.fillStyle = primaryText;
    ctx.font = '22px "Cairo", sans-serif';
    ctx.fillText(
      `تم إنجاز ${toArabicNumerals(completedHabits.length)} من أصل ${toArabicNumerals(DAILY_HABITS_LIST.length)} طاعات وأغصان مباركة`,
      width - 280,
      390
    );

    ctx.fillStyle = subText;
    ctx.font = '18px "Cairo", sans-serif';
    ctx.fillText('«أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ»', width - 280, 430);
    ctx.restore();

    // 6. Section 1: Prayers (الصلوات الخمس)
    ctx.save();
    ctx.textAlign = 'right';
    ctx.fillStyle = goldText;
    ctx.font = 'bold 24px "Cairo", sans-serif';
    ctx.fillText('🕌  متابعة الصلوات الخمس المفروضة', width - 85, 525);

    const prayerKeys: Array<'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'> = [
      'fajr', 'dhuhr', 'asr', 'maghrib', 'isha'
    ];
    const prayerBoxWidth = (width - 160 - (4 * 16)) / 5;
    const prayerBoxY = 545;
    const prayerBoxHeight = 110;

    prayerKeys.forEach((key, idx) => {
      const boxX = width - 80 - (idx + 1) * prayerBoxWidth - idx * 16;
      const status: PrayerStatus = trackerData.prayers[key] || 'missed';

      let pBg = 'rgba(255, 255, 255, 0.05)';
      let pBorder = 'rgba(255, 255, 255, 0.15)';
      let pLabel = 'لم تُؤدَّ';
      let pStatusColor = subText;

      if (status === 'congregation') {
        pBg = selectedTheme === 'pearl_light' ? '#D1FAE5' : 'rgba(16, 185, 129, 0.25)';
        pBorder = '#10B981';
        pLabel = '🕌 جماعة';
        pStatusColor = selectedTheme === 'pearl_light' ? '#065F46' : '#6EE7B7';
      } else if (status === 'alone') {
        pBg = selectedTheme === 'pearl_light' ? '#FEF3C7' : 'rgba(245, 158, 11, 0.25)';
        pBorder = '#F59E0B';
        pLabel = '👤 منفرداً';
        pStatusColor = selectedTheme === 'pearl_light' ? '#92400E' : '#FDE68A';
      } else {
        pBg = selectedTheme === 'pearl_light' ? '#F3F4F6' : 'rgba(255, 255, 255, 0.04)';
        pBorder = selectedTheme === 'pearl_light' ? '#E5E7EB' : 'rgba(255, 255, 255, 0.1)';
        pLabel = '⭕ لم تُؤدَّ';
        pStatusColor = selectedTheme === 'pearl_light' ? '#9CA3AF' : '#6B7280';
      }

      ctx.fillStyle = pBg;
      ctx.strokeStyle = pBorder;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(boxX, prayerBoxY, prayerBoxWidth, prayerBoxHeight, 18);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = primaryText;
      ctx.font = 'bold 22px "Cairo", sans-serif';
      ctx.fillText(prayerNames[key], boxX + prayerBoxWidth / 2, prayerBoxY + 45);

      ctx.fillStyle = pStatusColor;
      ctx.font = 'bold 16px "Cairo", sans-serif';
      ctx.fillText(pLabel, boxX + prayerBoxWidth / 2, prayerBoxY + 82);
    });
    ctx.restore();

    // 7. Section 2: Daily Habits & Worship Deeds (أغصان البر والأذكار)
    ctx.save();
    ctx.textAlign = 'right';
    ctx.fillStyle = goldText;
    ctx.font = 'bold 24px "Cairo", sans-serif';
    ctx.fillText('🌿  أغصان البر والأذكار والسنن', width - 85, 695);

    const habitsBoxY = 715;
    const habitsBoxWidth = width - 160;
    const habitsBoxHeight = 310;

    ctx.fillStyle = cardBg;
    ctx.strokeStyle = cardBorder;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(80, habitsBoxY, habitsBoxWidth, habitsBoxHeight, 24);
    ctx.fill();
    ctx.stroke();

    // Draw Habit Chips in 2 columns
    const colWidth = (habitsBoxWidth - 48) / 2;
    DAILY_HABITS_LIST.forEach((habit, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const isDone = !!trackerData.habits[habit.id];

      const chipX = width - 80 - 24 - (col + 1) * colWidth - (col * 0);
      const chipY = habitsBoxY + 20 + row * 52;
      const chipHeight = 42;

      ctx.fillStyle = isDone
        ? (selectedTheme === 'pearl_light' ? '#D1FAE5' : 'rgba(16, 185, 129, 0.2)')
        : (selectedTheme === 'pearl_light' ? '#F9FAFB' : 'rgba(255, 255, 255, 0.03)');
      ctx.strokeStyle = isDone
        ? '#10B981'
        : (selectedTheme === 'pearl_light' ? '#E5E7EB' : 'rgba(255, 255, 255, 0.1)');
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(chipX, chipY, colWidth, chipHeight, 12);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'right';
      ctx.fillStyle = isDone ? primaryText : (selectedTheme === 'pearl_light' ? '#9CA3AF' : '#6B7280');
      ctx.font = isDone ? 'bold 18px "Cairo", sans-serif' : '17px "Cairo", sans-serif';
      ctx.fillText(habit.title, chipX + colWidth - 45, chipY + 27);

      // Checkmark icon
      ctx.textAlign = 'center';
      ctx.fillStyle = isDone ? '#10B981' : (selectedTheme === 'pearl_light' ? '#D1D5DB' : '#4B5563');
      ctx.font = 'bold 20px "Cairo", sans-serif';
      ctx.fillText(isDone ? '✓' : '○', chipX + colWidth - 22, chipY + 28);
    });
    ctx.restore();

    // 8. Section 3: Quran Ward & Remembrance Highlight
    ctx.save();
    const quranBoxY = 1045;
    const quranBoxHeight = 110;
    ctx.fillStyle = selectedTheme === 'pearl_light' ? '#FEF3C7' : 'rgba(245, 158, 11, 0.15)';
    ctx.strokeStyle = selectedTheme === 'pearl_light' ? '#F59E0B' : 'rgba(245, 158, 11, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(80, quranBoxY, width - 160, quranBoxHeight, 20);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'right';
    ctx.fillStyle = goldText;
    ctx.font = 'bold 22px "Cairo", sans-serif';
    ctx.fillText('📖  ورد القرآن الكريم وتلاوة الآيات اليومية', width - 110, quranBoxY + 42);

    ctx.fillStyle = primaryText;
    ctx.font = '20px "Cairo", sans-serif';
    ctx.fillText(
      `تمت قراءة ${toArabicNumerals(trackerData.quranPagesRead)} صفحة من المصحف الشريف بتوفيق الله تعالى`,
      width - 110,
      quranBoxY + 80
    );
    ctx.restore();

    // 9. Footer: Encouragement & App Watermark
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = subText;
    ctx.font = 'bold 20px "Amiri", serif';
    ctx.fillText('«الدَّالُّ عَلَى الْخَيْرِ كَفَاعِلِهِ • شَارِكْ لِتَكُونَ مُشَجِّعاً عَلَى الطَّاعَةِ»', width / 2, 1205);

    // Bottom App Tag
    ctx.fillStyle = cardBg;
    ctx.strokeStyle = cardBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(width / 2 - 250, 1235, 500, 46, 23);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = goldText;
    ctx.font = 'bold 18px "Cairo", sans-serif';
    ctx.fillText('🌿 تم الإنشاء عبر تطبيق جنّة الرحمن', width / 2, 1264);
    ctx.restore();

    // Generate preview data URL
    const dataUrl = canvas.toDataURL('image/png');
    setImagePreviewUrl(dataUrl);
    setIsGenerating(false);
  }, [trackerData, selectedTheme]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        renderCanvas();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, renderCanvas, selectedTheme]);

  if (!isOpen) return null;

  const getCanvasBlob = async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png', 0.95);
    });
  };

  // 1. Native Web Share API (with PNG File)
  const handleNativeShare = async () => {
    try {
      playChime('click');
      const blob = await getCanvasBlob();
      const shareTitle = 'تقرير شجرة العبادات اليومية - تطبيق جنّة الرحمن';
      const shareText = `🌿 تقرير شجرة العبادات اليومية (${trackerData.date}):\n` +
        `• نسبة نمو الشجرة: ٪${toArabicNumerals(trackerData.treeGrowthPercentage || 0)}\n` +
        `• ورد القرآن: ${toArabicNumerals(trackerData.quranPagesRead)} صفحة\n` +
        `• الأغصان المنجزة: ${toArabicNumerals(Object.values(trackerData.habits).filter(Boolean).length)} طاعات\n\n` +
        `«الدال على الخير كفاعله» - تطبيق جنّة الرحمن 🌿`;

      if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], 'tree.png', { type: 'image/png' })] })) {
        const file = new File([blob], 'jannat-alrahman-tree.png', { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: shareTitle,
          text: shareText
        });
        showToast('تمت مشاركة الصورة بنجاح!');
        triggerHaptic(50);
        return;
      }

      // Fallback if file sharing not supported
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText
        });
        showToast('تمت المشاركة!');
      } else {
        handleDownloadImage();
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Share error:', err);
        handleDownloadImage();
      }
    }
  };

  // 2. Download Image PNG
  const handleDownloadImage = async () => {
    try {
      playChime('milestone');
      const blob = await getCanvasBlob();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shajarat-alibadat-${trackerData.date || 'today'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast('تم تحميل صورة شجرة العبادات بنجاح!');
      triggerHaptic(40);
    } catch (e) {
      console.error(e);
    }
  };

  // 3. Copy Image to Clipboard
  const handleCopyImageToClipboard = async () => {
    try {
      playChime('click');
      const blob = await getCanvasBlob();
      if (!blob) return;

      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopiedImage(true);
        showToast('تم نسخ الصورة إلى الحافظة! يمكنك لصقها في أي محادثة.');
        triggerHaptic(50);
        setTimeout(() => setCopiedImage(false), 2500);
      } else {
        handleDownloadImage();
      }
    } catch (err) {
      console.error('Copy image error:', err);
      handleDownloadImage();
    }
  };

  // 4. Copy Summary Text
  const handleCopySummaryText = () => {
    const prayerSummary = Object.entries(trackerData.prayers)
      .map(([p, st]) => {
        const names: Record<string, string> = { fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' };
        const stLabel = st === 'congregation' ? 'جماعة 🕌' : st === 'alone' ? 'منفرداً 👤' : 'لم تؤدَّ ⭕';
        return `${names[p]}: ${stLabel}`;
      })
      .join(' | ');

    const completedHabits = DAILY_HABITS_LIST.filter(h => !!trackerData.habits[h.id]).map(h => `• ${h.title}`).join('\n');

    const text = `🌿 تقرير شجرة العبادات اليومية (${trackerData.date}) 🌿\n\n` +
      `🌱 نسبة نمو الشجرة: ٪${toArabicNumerals(trackerData.treeGrowthPercentage || 0)}\n` +
      `🕌 الصلوات الخمس: ${prayerSummary}\n` +
      `📖 ورد القرآن: ${toArabicNumerals(trackerData.quranPagesRead)} صفحة\n\n` +
      `✨ أغصان البر والأذكار المنجزة:\n${completedHabits || '• في بداية الغراس المبارك'}\n\n` +
      `«أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ»\n` +
      `تطبيق جنّة الرحمن 🌿`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    showToast('تم نسخ نص التقرير بالكامل!');
    playChime('click');
    triggerHaptic(30);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // 5. WhatsApp Share
  const handleWhatsAppShare = () => {
    playChime('click');
    const text = `🌿 *تقرير شجرة العبادات اليومية (${trackerData.date})* 🌿\n\n` +
      `🌱 *نسبة نمو الشجرة اليوم:* ٪${toArabicNumerals(trackerData.treeGrowthPercentage || 0)}\n` +
      `📖 *ورد القرآن:* ${toArabicNumerals(trackerData.quranPagesRead)} صفحة\n` +
      `✨ *الأغصان المنجزة:* ${toArabicNumerals(Object.values(trackerData.habits).filter(Boolean).length)} طاعات\n\n` +
      `«الدال على الخير كفاعله» 🌿\n_تطبيق جنّة الرحمن_`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // 6. Telegram Share
  const handleTelegramShare = () => {
    playChime('click');
    const text = `🌿 تقرير شجرة العبادات اليومية (${trackerData.date}): نمو الشجرة ٪${toArabicNumerals(trackerData.treeGrowthPercentage || 0)} - تطبيق جنّة الرحمن`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // 7. Twitter / X Share
  const handleTwitterShare = () => {
    playChime('click');
    const text = `🌿 تقرير شجرة العبادات اليومية (${trackerData.date}) - نسبة نمو الشجرة ٪${toArabicNumerals(trackerData.treeGrowthPercentage || 0)} 🌱\n«أحب الأعمال إلى الله أدومها وإن قل»\n#جنة_الرحمن #شجرة_العبادات`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-[#14231D] rounded-3xl max-w-lg w-full border border-amber-300/40 dark:border-[#2C4238] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-[#FAF7F0] dark:bg-[#162922]">
          <button
            onClick={() => {
              playChime('click');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-gray-200/70 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end text-[#0F6B50] dark:text-[#2DD4BF] font-bold text-base">
              <span>مشاركة شجرة العبادات</span>
              <TreePine className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              شارك إنجازك الإيماني كصورة راقية مع الأهل والأصدقاء
            </p>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-right">
          {/* Toast message inside modal */}
          {toastMessage && (
            <div className="p-3 rounded-2xl bg-emerald-700 text-white text-xs font-bold text-center animate-fadeIn shadow-lg flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Theme Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">اختر طابع التصميم المفضل:</span>
              <span className="font-bold text-[#0F6B50] dark:text-[#2DD4BF] flex items-center gap-1">
                <Palette className="w-3.5 h-3.5" />
                طابع الصورة
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'emerald' as CardTheme, name: 'الزمردي الملكي', bg: 'from-[#0B4D3B] to-[#166E54]', text: 'text-white' },
                { id: 'gold_dark' as CardTheme, name: 'الأندلسي الليلي', bg: 'from-[#0F1E19] to-[#1B2C24]', text: 'text-amber-200' },
                { id: 'pearl_light' as CardTheme, name: 'النقاء الصباحي', bg: 'from-[#FAF7F0] to-[#EFE9DA]', text: 'text-emerald-950' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTheme(t.id);
                    playChime('click');
                  }}
                  className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    selectedTheme === t.id
                      ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-md scale-102'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 opacity-80'
                  } bg-gradient-to-br ${t.bg} ${t.text}`}
                >
                  <span>{t.name}</span>
                  {selectedTheme === t.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* High Quality Canvas Image Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] text-gray-500">دقة فائقة (1080×1350) مناسبة للواتساب والستوري</span>
              <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                معاينة البطاقة الجاهزة
              </span>
            </div>

            <div className="p-2 rounded-2xl bg-gray-100 dark:bg-[#0E1A15] border border-gray-200 dark:border-gray-800 flex items-center justify-center overflow-hidden relative min-h-[280px]">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center gap-2 text-gray-400 py-12">
                  <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold">جاري توليد الصورة الفنية...</span>
                </div>
              ) : imagePreviewUrl ? (
                <img
                  src={imagePreviewUrl}
                  alt="شجرة العبادات"
                  className="rounded-xl max-h-[340px] w-auto shadow-md border border-black/10 object-contain hover:scale-101 transition-transform"
                />
              ) : null}

              {/* Hidden Canvas Element used for 2D rendering */}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>

          {/* Primary Quick Share Buttons */}
          <div className="space-y-2.5 pt-1">
            {/* Native Full Share Button */}
            <button
              onClick={handleNativeShare}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#0F6B50] via-[#148668] to-[#0F6B50] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-600/30 transition-all active:scale-98 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-amber-300" />
              <span>مشاركة مباشرة عبر التطبيقات (واتساب، ستوري، تليجرام)</span>
            </button>

            {/* Sub Action Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              {/* Download PNG */}
              <button
                onClick={handleDownloadImage}
                className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#0F6B50] dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>تحميل الصورة (PNG)</span>
              </button>

              {/* Copy Image to Clipboard */}
              <button
                onClick={handleCopyImageToClipboard}
                className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-[#B45309] dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedImage ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedImage ? 'تم نسخ الصورة' : 'نسخ الصورة للحافظة'}</span>
              </button>
            </div>

            {/* Social Media Specific Buttons */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
              <span className="text-[11px] text-gray-500 block text-right">
                مشاركة سريعة عبر وسائل التواصل:
              </span>
              <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
                {/* WhatsApp */}
                <button
                  onClick={handleWhatsAppShare}
                  className="py-2 px-1 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] dark:text-[#25D366] border border-[#25D366]/30 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                  title="مشاركة عبر واتساب"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-[10px]">واتساب</span>
                </button>

                {/* Telegram */}
                <button
                  onClick={handleTelegramShare}
                  className="py-2 px-1 rounded-xl bg-[#0088cc]/15 hover:bg-[#0088cc]/25 text-[#0088cc] border border-[#0088cc]/30 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                  title="مشاركة عبر تلغرام"
                >
                  <Send className="w-4 h-4" />
                  <span className="text-[10px]">تلغرام</span>
                </button>

                {/* Twitter / X */}
                <button
                  onClick={handleTwitterShare}
                  className="py-2 px-1 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                  title="مشاركة عبر إكس"
                >
                  <Twitter className="w-4 h-4" />
                  <span className="text-[10px]">إكس (تويتر)</span>
                </button>

                {/* Copy Text */}
                <button
                  onClick={handleCopySummaryText}
                  className="py-2 px-1 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                  title="نسخ التقرير كنص"
                >
                  {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span className="text-[10px]">{copiedText ? 'تم النسخ' : 'نسخ النص'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-gray-50 dark:bg-[#101C17] border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-[11px] text-gray-500">
            🌿 «الدَّالُّ عَلَى الْخَيْرِ كَفَاعِلِهِ» — شارك لتشجيع أحبابك على المداومة
          </p>
        </div>
      </div>
    </div>
  );
};

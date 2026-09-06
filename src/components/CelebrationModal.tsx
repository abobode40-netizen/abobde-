import React, { useEffect } from 'react';
import { Sparkles, Trophy, TreePine, BookOpen, Check, Heart, Share2, Star } from 'lucide-react';
import { fireCelebrationConfetti } from '../utils/confetti';
import { playChime } from '../utils/audio';

export type CelebrationType = 'khatma' | 'tree_full' | 'tree_half' | 'quran_goal';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: CelebrationType;
  details?: {
    title?: string;
    description?: string;
    statsText?: string;
  };
  onShare?: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  type,
  details,
  onShare
}) => {
  useEffect(() => {
    if (isOpen) {
      if (type === 'khatma') {
        fireCelebrationConfetti('khatma');
      } else if (type === 'tree_full') {
        fireCelebrationConfetti('tree_full');
      } else {
        fireCelebrationConfetti('milestone');
      }
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  const contentMap: Record<CelebrationType, {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    quote: string;
    badge: string;
  }> = {
    khatma: {
      icon: <BookOpen className="w-10 h-10 text-amber-300" />,
      title: details?.title || 'مبارك إتمام ختمة القرآن الكريم!',
      subtitle: details?.description || 'هنيئاً لك ما وفّقك الله إليه من تلاوة وتدبر كتاب الله العظيم. نسأل الله أن يجعله شفيعاً ونوراً لك في الدارين.',
      quote: '«يُقَالُ لِصَاحِبِ الْقُرْآنِ: اقْرَأْ وَارْتَقِ وَرَتِّلْ كَمَا كُنْتَ تُرَتِّلُ فِي الدُّنْيَا، فَإِنَّ مَنْزِلَتَكَ عِنْدَ آخِرِ آيَةٍ تَقْرَؤُهَا»',
      badge: '👑 إنجاز ختمة القرآن الكريم'
    },
    tree_full: {
      icon: <TreePine className="w-10 h-10 text-amber-300" />,
      title: details?.title || 'ما شاء الله! شجرتك أورقت بالكامل (١٠٠٪)',
      subtitle: details?.description || 'أتممت جميع طاعات وأغصان اليوم المباركة من صلوات وأذكار وأعمال بر. تقبل الله طاعاتك وزادك ثباتاً وقرباً.',
      quote: '«أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ»',
      badge: '🌿 إتمام شجرة العبادات اليومية'
    },
    tree_half: {
      icon: <Star className="w-10 h-10 text-amber-300" />,
      title: details?.title || 'إنجاز رائع! تجاوزت منتصف أغصان اليوم (٥٠٪)',
      subtitle: details?.description || 'خطواتك الإيمانية المباركة تثمر وتكبر، واصل المسير لإتمام باقي الأغصان والصلوات.',
      quote: '«وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ وَجَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ»',
      badge: '⭐ إنجاز نصف شجرة العبادات'
    },
    quran_goal: {
      icon: <Trophy className="w-10 h-10 text-amber-300" />,
      title: details?.title || 'مبارك! أنجزت ورد القراءة اليومي بالكامل',
      subtitle: details?.description || 'حققت هدف التلاوة المحدد لليوم، جعله الله نوراً لقلبك وزاداً لآخرتك.',
      quote: '«إِنَّ الَّذِينَ يَتْلُونَ كِتَابَ اللَّهِ وَأَقَامُوا الصَّلَاةَ... يَرْجُونَ تِجَارَةً لَّن تَبُورَ»',
      badge: '📖 إتمام الورد اليومي'
    }
  };

  const currentContent = contentMap[type] || contentMap.khatma;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-[#15231D] rounded-3xl p-6 max-w-sm w-full border-2 border-amber-400/80 shadow-2xl space-y-4 text-center relative overflow-hidden transform animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Crown / Icon badge */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-0.5 shadow-lg flex items-center justify-center relative">
          <div className="w-full h-full rounded-[22px] bg-[#0F6B50] flex items-center justify-center">
            {currentContent.icon}
          </div>
          <span className="absolute -top-2 -right-2 p-1.5 rounded-full bg-amber-400 text-[#0F6B50] shadow-md animate-bounce">
            <Sparkles className="w-4 h-4" />
          </span>
        </div>

        {/* Achievement Badge */}
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-[#B45309] dark:text-amber-300 text-xs font-extrabold border border-amber-300/40">
            {currentContent.badge}
          </span>
          <h3 className="text-xl font-bold font-amiri text-[#19302A] dark:text-white mt-2">
            {currentContent.title}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
            {currentContent.subtitle}
          </p>
        </div>

        {/* Hadith / Quranic Quote */}
        <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-[#1B2B23] border border-amber-200/60 dark:border-[#2A3C34] text-center">
          <p className="font-amiri text-sm leading-relaxed text-[#0F6B50] dark:text-amber-200 font-semibold">
            {currentContent.quote}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          {onShare && (
            <button
              onClick={() => {
                playChime('click');
                onShare();
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-emerald-950" />
              <span>مشاركة بطاقة الإنجاز مع الأحباب</span>
            </button>
          )}

          <button
            onClick={() => {
              fireCelebrationConfetti(type === 'khatma' ? 'khatma' : 'tree_full');
            }}
            className="w-full py-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 text-[#B45309] dark:text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-300/50 transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>إطلاق المؤثرات الاحتفالية مجدداً</span>
          </button>

          <button
            onClick={() => {
              playChime('click');
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0F6B50] to-[#168064] hover:from-[#0B5C46] hover:to-[#0F6B50] text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            الحمد لله الذي بنعمته تتم الصالحات (متابعة)
          </button>
        </div>
      </div>
    </div>
  );
};

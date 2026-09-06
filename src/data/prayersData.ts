import { OneMinuteDeed } from '../types';

export const DAILY_HABITS_LIST = [
  { id: 'fajr', title: 'صلاة الفجر', category: 'prayer' },
  { id: 'dhuhr', title: 'صلاة الظهر', category: 'prayer' },
  { id: 'asr', title: 'صلاة العصر', category: 'prayer' },
  { id: 'maghrib', title: 'صلاة المغرب', category: 'prayer' },
  { id: 'isha', title: 'صلاة العشاء', category: 'prayer' },
  { id: 'morning_athkar', title: 'أذكار الصباح', category: 'athkar' },
  { id: 'evening_athkar', title: 'أذكار المساء', category: 'athkar' },
  { id: 'sleep_athkar', title: 'أذكار النوم', category: 'athkar' },
  { id: 'quran_ward', title: 'الورد القرآني', category: 'quran' },
  { id: 'tadabbur', title: 'قطفة تدبر', category: 'sunnah' }
];

export const ONE_MINUTE_DEEDS: OneMinuteDeed[] = [
  {
    id: 'om1',
    title: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    targetCount: 100,
    categoryName: 'ورد التسبيح',
    rewardFadl: 'تُحط بها الخطايا وإن كانت مثل زبد البحر، وتُغرس بها نخلة في الجنة.'
  },
  {
    id: 'om2',
    title: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    targetCount: 70,
    categoryName: 'ورد الاستغفار',
    rewardFadl: 'سبب لمغفرة الذنوب، وسعة الرزق، ونزول الغيث، وتفريج الهموم.'
  },
  {
    id: 'om3',
    title: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
    targetCount: 20,
    categoryName: 'الصلاة على النبي ﷺ',
    rewardFadl: 'من صلى عليّ صلاة صلى الله عليه بها عشراً وحُطت عنه عشر خطيئات.'
  },
  {
    id: 'om4',
    title: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    targetCount: 40,
    categoryName: 'كنز الجنة',
    rewardFadl: 'كنز من كنوز الجنة، وباب من أبواب تفويض الأمر ودفع المشاق.'
  },
  {
    id: 'om5',
    title: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    targetCount: 10,
    categoryName: 'ورد التوحيد',
    rewardFadl: 'تعدل عتق رقاب وتكتب له مئة حسنة وتُمحى عنه مئة سيئة.'
  },
  {
    id: 'om6',
    title: 'سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ',
    targetCount: 25,
    categoryName: 'الباقيات الصالحات',
    rewardFadl: 'أحب الكلام إلى الله تعالى، ومكفرات للذنوب، ومغارس الجنان.'
  }
];

export const WORK_MODE_THOUGHTS = [
  'اجعل نيتك في عملك إعفاف النفس ونفع المسلمين ليكون عملك عبادة تُؤجر عليها.',
  'سبحان الله وبحمده.. قطفة ذكر تضيء ساعتك وتبث البركة في جهدك.',
  'صلّ على النبي ﷺ.. تُكفى همك ويُغفر ذنبك وتُفتح لك أبواب التوفيق.',
  'لا حول ولا قوة إلا بالله.. استعن بالله ولا تعجز، فكل عسير عليه يسير.',
  'أستغفر الله العظيم وأتوب إليه.. مفتاح التيسير وسكينة الفؤاد.',
  '«أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ».. قليل دائم خير من كثير منقطع.'
];

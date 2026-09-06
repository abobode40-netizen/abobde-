import { SurahMeta, ReciterInfo, ReciterId } from '../types';

export const RECITERS_LIST: ReciterInfo[] = [
  {
    id: 'alafasy',
    name: 'مشاري راشد العفاسي',
    subname: 'تلاوة مرئية ومسموعة عذبة وشجية',
    category: 'مرتل',
    serverUrl: 'https://server8.mp3quran.net/afs',
    hasAyahAudio: true
  },
  {
    id: 'sudais',
    name: 'عبد الرحمن السديس',
    subname: 'إمام وخطيب المسجد الحرام',
    category: 'أئمة الحرمين',
    serverUrl: 'https://server11.mp3quran.net/sds',
    hasAyahAudio: true
  },
  {
    id: 'shuraym',
    name: 'سعود الشريم',
    subname: 'إمام المسجد الحرام سابقاً - تلاوة حجازية',
    category: 'أئمة الحرمين',
    serverUrl: 'https://server7.mp3quran.net/shur',
    hasAyahAudio: true
  },
  {
    id: 'muaiqly',
    name: 'ماهر المعيقلي',
    subname: 'إمام الحرم المكي الشريف - صوت خاشع',
    category: 'أئمة الحرمين',
    serverUrl: 'https://server12.mp3quran.net/maher',
    hasAyahAudio: true
  },
  {
    id: 'dussary',
    name: 'ياسر الدوسري',
    subname: 'إمام المسجد الحرام - تلاوة مؤثرة تأسر القلوب',
    category: 'أئمة الحرمين',
    serverUrl: 'https://server11.mp3quran.net/yasser',
    hasAyahAudio: true
  },
  {
    id: 'hussary',
    name: 'محمود خليل الحصري',
    subname: 'شيخ عموم المقارئ المصرية - أتقن المرتل',
    category: 'مرتل',
    serverUrl: 'https://server13.mp3quran.net/husr',
    hasAyahAudio: true
  },
  {
    id: 'minshawi',
    name: 'محمد صديق المنشاوي',
    subname: 'الصوت الباكي - تلاوة خاشعة مرققة للقلوب',
    category: 'مرتل',
    serverUrl: 'https://server10.mp3quran.net/minsh',
    hasAyahAudio: true
  },
  {
    id: 'abdulbasit',
    name: 'عبد الباسط عبد الصمد',
    subname: 'صوت مكة - المصحف المرتل برواية حفص',
    category: 'مجود',
    serverUrl: 'https://server7.mp3quran.net/basit',
    hasAyahAudio: true
  },
  {
    id: 'ajmi',
    name: 'أحمد بن علي العجمي',
    subname: 'تلاوة بنبرة مؤثرة وقوية وواضحة',
    category: 'تلاوات خاشعة',
    serverUrl: 'https://server10.mp3quran.net/ajm',
    hasAyahAudio: true
  },
  {
    id: 'ghamadi',
    name: 'سعد الغامدي',
    subname: 'صوت هادئ ونطق متقن يبعث السكينة',
    category: 'مرتل',
    serverUrl: 'https://server7.mp3quran.net/s_gmd',
    hasAyahAudio: true
  },
  {
    id: 'qatam',
    name: 'ناصر القطامي',
    subname: 'تلاوات تهجد ومناجاة باكية ومؤثرة',
    category: 'تلاوات خاشعة',
    serverUrl: 'https://server6.mp3quran.net/qtm',
    hasAyahAudio: true
  },
  {
    id: 'shatri',
    name: 'أبو بكر الشاطري',
    subname: 'ترتيل عذب متناسق ومريح للنفس',
    category: 'مرتل',
    serverUrl: 'https://server11.mp3quran.net/shatri',
    hasAyahAudio: true
  },
  {
    id: 'huthifi',
    name: 'علي بن عبد الرحمن الحذيفي',
    subname: 'إمام وخطيب المسجد النبوي الشريف',
    category: 'أئمة الحرمين',
    serverUrl: 'https://server9.mp3quran.net/hthfi',
    hasAyahAudio: true
  },
  {
    id: 'abkar',
    name: 'إدريس أبكر',
    subname: 'تلاوة بنبرة دعاء وخشوع فريدة',
    category: 'تلاوات خاشعة',
    serverUrl: 'https://server6.mp3quran.net/abkr',
    hasAyahAudio: true
  },
  {
    id: 'abbad',
    name: 'فارس عباد',
    subname: 'صوت رخيم وأداء شجي متميز',
    category: 'مرتل',
    serverUrl: 'https://server8.mp3quran.net/frs_a',
    hasAyahAudio: true
  }
];

export const SURAHS_LIST: SurahMeta[] = [
  { number: 1, name: 'الفاتحة', englishName: 'Al-Faatiha', englishNameTranslation: 'The Opening', revelationType: 'Meccan', numberOfAyahs: 7, startPage: 1, juz: 1 },
  { number: 2, name: 'البقرة', englishName: 'Al-Baqara', englishNameTranslation: 'The Cow', revelationType: 'Medinan', numberOfAyahs: 286, startPage: 2, juz: 1 },
  { number: 3, name: 'آل عمران', englishName: 'Aal-i-Imraan', englishNameTranslation: 'The Family of Imran', revelationType: 'Medinan', numberOfAyahs: 200, startPage: 50, juz: 3 },
  { number: 4, name: 'النساء', englishName: 'An-Nisaa', englishNameTranslation: 'The Women', revelationType: 'Medinan', numberOfAyahs: 176, startPage: 77, juz: 4 },
  { number: 5, name: 'المائدة', englishName: 'Al-Maaida', englishNameTranslation: 'The Table Spread', revelationType: 'Medinan', numberOfAyahs: 120, startPage: 106, juz: 6 },
  { number: 6, name: 'الأنعام', englishName: 'Al-An\'aam', englishNameTranslation: 'The Cattle', revelationType: 'Meccan', numberOfAyahs: 165, startPage: 128, juz: 7 },
  { number: 7, name: 'الأعراف', englishName: 'Al-A\'raaf', englishNameTranslation: 'The Heights', revelationType: 'Meccan', numberOfAyahs: 206, startPage: 151, juz: 8 },
  { number: 8, name: 'الأنفال', englishName: 'Al-Anfaal', englishNameTranslation: 'The Spoils of War', revelationType: 'Medinan', numberOfAyahs: 75, startPage: 177, juz: 9 },
  { number: 9, name: 'التوبة', englishName: 'At-Tawba', englishNameTranslation: 'The Repentance', revelationType: 'Medinan', numberOfAyahs: 129, startPage: 187, juz: 10 },
  { number: 10, name: 'يونس', englishName: 'Yunus', englishNameTranslation: 'Jonah', revelationType: 'Meccan', numberOfAyahs: 109, startPage: 208, juz: 11 },
  { number: 11, name: 'هود', englishName: 'Hud', englishNameTranslation: 'Hud', revelationType: 'Meccan', numberOfAyahs: 123, startPage: 221, juz: 11 },
  { number: 12, name: 'يوسف', englishName: 'Yusuf', englishNameTranslation: 'Joseph', revelationType: 'Meccan', numberOfAyahs: 111, startPage: 235, juz: 12 },
  { number: 13, name: 'الرعد', englishName: 'Ar-Ra\'d', englishNameTranslation: 'The Thunder', revelationType: 'Medinan', numberOfAyahs: 43, startPage: 249, juz: 13 },
  { number: 14, name: 'إبراهيم', englishName: 'Ibrahim', englishNameTranslation: 'Abraham', revelationType: 'Meccan', numberOfAyahs: 52, startPage: 255, juz: 13 },
  { number: 15, name: 'الحجر', englishName: 'Al-Hijr', englishNameTranslation: 'The Rocky Tract', revelationType: 'Meccan', numberOfAyahs: 99, startPage: 262, juz: 14 },
  { number: 16, name: 'النحل', englishName: 'An-Nahl', englishNameTranslation: 'The Bee', revelationType: 'Meccan', numberOfAyahs: 128, startPage: 267, juz: 14 },
  { number: 17, name: 'الإسراء', englishName: 'Al-Israa', englishNameTranslation: 'The Night Journey', revelationType: 'Meccan', numberOfAyahs: 111, startPage: 282, juz: 15 },
  { number: 18, name: 'الكهف', englishName: 'Al-Kahf', englishNameTranslation: 'The Cave', revelationType: 'Meccan', numberOfAyahs: 110, startPage: 293, juz: 15 },
  { number: 19, name: 'مريم', englishName: 'Maryam', englishNameTranslation: 'Mary', revelationType: 'Meccan', numberOfAyahs: 98, startPage: 305, juz: 16 },
  { number: 20, name: 'طه', englishName: 'Taa-Haa', englishNameTranslation: 'Ta-Ha', revelationType: 'Meccan', numberOfAyahs: 135, startPage: 312, juz: 16 },
  { number: 21, name: 'الأنبياء', englishName: 'Al-Anbiyaa', englishNameTranslation: 'The Prophets', revelationType: 'Meccan', numberOfAyahs: 112, startPage: 322, juz: 17 },
  { number: 22, name: 'الحج', englishName: 'Al-Hajj', englishNameTranslation: 'The Pilgrimage', revelationType: 'Medinan', numberOfAyahs: 78, startPage: 332, juz: 17 },
  { number: 23, name: 'المؤمنون', englishName: 'Al-Muminoon', englishNameTranslation: 'The Believers', revelationType: 'Meccan', numberOfAyahs: 118, startPage: 342, juz: 18 },
  { number: 24, name: 'النور', englishName: 'An-Noor', englishNameTranslation: 'The Light', revelationType: 'Medinan', numberOfAyahs: 64, startPage: 350, juz: 18 },
  { number: 25, name: 'الفرقان', englishName: 'Al-Furqaan', englishNameTranslation: 'The Criterion', revelationType: 'Meccan', numberOfAyahs: 77, startPage: 359, juz: 18 },
  { number: 26, name: 'الشعراء', englishName: 'Ash-Shu\'araa', englishNameTranslation: 'The Poets', revelationType: 'Meccan', numberOfAyahs: 227, startPage: 367, juz: 19 },
  { number: 27, name: 'النمل', englishName: 'An-Naml', englishNameTranslation: 'The Ant', revelationType: 'Meccan', numberOfAyahs: 93, startPage: 377, juz: 19 },
  { number: 28, name: 'القصص', englishName: 'Al-Qasas', englishNameTranslation: 'The Stories', revelationType: 'Meccan', numberOfAyahs: 88, startPage: 385, juz: 20 },
  { number: 29, name: 'العنكبوت', englishName: 'Al-Ankaboot', englishNameTranslation: 'The Spider', revelationType: 'Meccan', numberOfAyahs: 69, startPage: 396, juz: 20 },
  { number: 30, name: 'الروم', englishName: 'Ar-Room', englishNameTranslation: 'The Romans', revelationType: 'Meccan', numberOfAyahs: 60, startPage: 404, juz: 21 },
  { number: 31, name: 'لقمان', englishName: 'Luqman', englishNameTranslation: 'Luqman', revelationType: 'Meccan', numberOfAyahs: 34, startPage: 411, juz: 21 },
  { number: 32, name: 'السجدة', englishName: 'As-Sajda', englishNameTranslation: 'The Prostration', revelationType: 'Meccan', numberOfAyahs: 30, startPage: 415, juz: 21 },
  { number: 33, name: 'الأحزاب', englishName: 'Al-Ahzaab', englishNameTranslation: 'The Clans', revelationType: 'Medinan', numberOfAyahs: 73, startPage: 418, juz: 21 },
  { number: 34, name: 'سبأ', englishName: 'Saba', englishNameTranslation: 'Sheba', revelationType: 'Meccan', numberOfAyahs: 54, startPage: 428, juz: 22 },
  { number: 35, name: 'فاطر', englishName: 'Faatir', englishNameTranslation: 'The Originator', revelationType: 'Meccan', numberOfAyahs: 45, startPage: 434, juz: 22 },
  { number: 36, name: 'يس', englishName: 'Yaseen', englishNameTranslation: 'Ya-Sin', revelationType: 'Meccan', numberOfAyahs: 83, startPage: 440, juz: 22 },
  { number: 37, name: 'الصافات', englishName: 'As-Saaffaat', englishNameTranslation: 'Those drawn up in Ranks', revelationType: 'Meccan', numberOfAyahs: 182, startPage: 446, juz: 23 },
  { number: 38, name: 'ص', englishName: 'Saad', englishNameTranslation: 'The letter Saad', revelationType: 'Meccan', numberOfAyahs: 88, startPage: 453, juz: 23 },
  { number: 39, name: 'الزمر', englishName: 'Az-Zumar', englishNameTranslation: 'The Groups', revelationType: 'Meccan', numberOfAyahs: 75, startPage: 458, juz: 23 },
  { number: 40, name: 'غافر', englishName: 'Ghafir', englishNameTranslation: 'The Forgiver', revelationType: 'Meccan', numberOfAyahs: 85, startPage: 467, juz: 24 },
  { number: 41, name: 'فصلت', englishName: 'Fussilat', englishNameTranslation: 'Explained in Detail', revelationType: 'Meccan', numberOfAyahs: 54, startPage: 477, juz: 24 },
  { number: 42, name: 'الشورى', englishName: 'Ash-Shura', englishNameTranslation: 'Consultation', revelationType: 'Meccan', numberOfAyahs: 53, startPage: 483, juz: 25 },
  { number: 43, name: 'الزخرف', englishName: 'Az-Zukhruf', englishNameTranslation: 'Ornaments of gold', revelationType: 'Meccan', numberOfAyahs: 89, startPage: 489, juz: 25 },
  { number: 44, name: 'الدخان', englishName: 'Ad-Dukhaan', englishNameTranslation: 'The Smoke', revelationType: 'Meccan', numberOfAyahs: 59, startPage: 496, juz: 25 },
  { number: 45, name: 'الجاثية', englishName: 'Al-Jaathiya', englishNameTranslation: 'Crouching', revelationType: 'Meccan', numberOfAyahs: 37, startPage: 499, juz: 25 },
  { number: 46, name: 'الأحقاف', englishName: 'Al-Ahqaaf', englishNameTranslation: 'The Dunes', revelationType: 'Meccan', numberOfAyahs: 35, startPage: 502, juz: 26 },
  { number: 47, name: 'محمد', englishName: 'Muhammad', englishNameTranslation: 'Muhammad', revelationType: 'Medinan', numberOfAyahs: 38, startPage: 507, juz: 26 },
  { number: 48, name: 'الفتح', englishName: 'Al-Fath', englishNameTranslation: 'The Victory', revelationType: 'Medinan', numberOfAyahs: 29, startPage: 511, juz: 26 },
  { number: 49, name: 'الحجرات', englishName: 'Al-Hujuraat', englishNameTranslation: 'The Inner Apartments', revelationType: 'Medinan', numberOfAyahs: 18, startPage: 515, juz: 26 },
  { number: 50, name: 'ق', englishName: 'Qaaf', englishNameTranslation: 'The letter Qaaf', revelationType: 'Meccan', numberOfAyahs: 45, startPage: 518, juz: 26 },
  { number: 51, name: 'الذاريات', englishName: 'Adh-Dhaariyat', englishNameTranslation: 'The Winnowing Winds', revelationType: 'Meccan', numberOfAyahs: 60, startPage: 520, juz: 26 },
  { number: 52, name: 'الطور', englishName: 'At-Toor', englishNameTranslation: 'The Mount', revelationType: 'Meccan', numberOfAyahs: 49, startPage: 523, juz: 27 },
  { number: 53, name: 'النجم', englishName: 'An-Najm', englishNameTranslation: 'The Star', revelationType: 'Meccan', numberOfAyahs: 62, startPage: 526, juz: 27 },
  { number: 54, name: 'القمر', englishName: 'Al-Qamar', englishNameTranslation: 'The Moon', revelationType: 'Meccan', numberOfAyahs: 55, startPage: 528, juz: 27 },
  { number: 55, name: 'الرحمن', englishName: 'Ar-Rahmaan', englishNameTranslation: 'The Beneficent', revelationType: 'Medinan', numberOfAyahs: 78, startPage: 531, juz: 27 },
  { number: 56, name: 'الواقعة', englishName: 'Al-Waaqia', englishNameTranslation: 'The Inevitable', revelationType: 'Meccan', numberOfAyahs: 96, startPage: 534, juz: 27 },
  { number: 57, name: 'الحديد', englishName: 'Al-Hadid', englishNameTranslation: 'The Iron', revelationType: 'Medinan', numberOfAyahs: 29, startPage: 537, juz: 27 },
  { number: 58, name: 'المجادلة', englishName: 'Al-Mujaadila', englishNameTranslation: 'The Pleading Woman', revelationType: 'Medinan', numberOfAyahs: 22, startPage: 542, juz: 28 },
  { number: 59, name: 'الحشر', englishName: 'Al-Hashr', englishNameTranslation: 'The Exile', revelationType: 'Medinan', numberOfAyahs: 24, startPage: 545, juz: 28 },
  { number: 60, name: 'الممتحنة', englishName: 'Al-Mumtahana', englishNameTranslation: 'She that is to be examined', revelationType: 'Medinan', numberOfAyahs: 13, startPage: 549, juz: 28 },
  { number: 61, name: 'الصف', englishName: 'As-Saff', englishNameTranslation: 'The Ranks', revelationType: 'Medinan', numberOfAyahs: 14, startPage: 551, juz: 28 },
  { number: 62, name: 'الجمعة', englishName: 'Al-Jumu\'a', englishNameTranslation: 'Friday', revelationType: 'Medinan', numberOfAyahs: 11, startPage: 553, juz: 28 },
  { number: 63, name: 'المنافقون', englishName: 'Al-Munaafiqoon', englishNameTranslation: 'The Hypocrites', revelationType: 'Medinan', numberOfAyahs: 11, startPage: 554, juz: 28 },
  { number: 64, name: 'التغابن', englishName: 'At-Taghaabun', englishNameTranslation: 'Mutual Disillusion', revelationType: 'Medinan', numberOfAyahs: 18, startPage: 556, juz: 28 },
  { number: 65, name: 'الطلاق', englishName: 'At-Talaaq', englishNameTranslation: 'Divorce', revelationType: 'Medinan', numberOfAyahs: 12, startPage: 558, juz: 28 },
  { number: 66, name: 'التحريم', englishName: 'At-Tahrim', englishNameTranslation: 'The Prohibition', revelationType: 'Medinan', numberOfAyahs: 12, startPage: 560, juz: 28 },
  { number: 67, name: 'الملك', englishName: 'Al-Mulk', englishNameTranslation: 'The Sovereignty', revelationType: 'Meccan', numberOfAyahs: 30, startPage: 562, juz: 29 },
  { number: 68, name: 'القلم', englishName: 'Al-Qalam', englishNameTranslation: 'The Pen', revelationType: 'Meccan', numberOfAyahs: 52, startPage: 564, juz: 29 },
  { number: 69, name: 'الحاقة', englishName: 'Al-Haaqqa', englishNameTranslation: 'The Reality', revelationType: 'Meccan', numberOfAyahs: 52, startPage: 566, juz: 29 },
  { number: 70, name: 'المعارج', englishName: 'Al-Ma\'aarij', englishNameTranslation: 'The Ascending Stairways', revelationType: 'Meccan', numberOfAyahs: 44, startPage: 568, juz: 29 },
  { number: 71, name: 'نوح', englishName: 'Nooh', englishNameTranslation: 'Noah', revelationType: 'Meccan', numberOfAyahs: 28, startPage: 570, juz: 29 },
  { number: 72, name: 'الجن', englishName: 'Al-Jinn', englishNameTranslation: 'The Jinn', revelationType: 'Meccan', numberOfAyahs: 28, startPage: 572, juz: 29 },
  { number: 73, name: 'المزمل', englishName: 'Al-Muzzammil', englishNameTranslation: 'The Enshrouded One', revelationType: 'Meccan', numberOfAyahs: 20, startPage: 574, juz: 29 },
  { number: 74, name: 'المدثر', englishName: 'Al-Muddaththir', englishNameTranslation: 'The Cloaked One', revelationType: 'Meccan', numberOfAyahs: 56, startPage: 575, juz: 29 },
  { number: 75, name: 'القيامة', englishName: 'Al-Qiyaama', englishNameTranslation: 'The Resurrection', revelationType: 'Meccan', numberOfAyahs: 40, startPage: 577, juz: 29 },
  { number: 76, name: 'الإنسان', englishName: 'Al-Insaan', englishNameTranslation: 'Man', revelationType: 'Medinan', numberOfAyahs: 31, startPage: 578, juz: 29 },
  { number: 77, name: 'المرسلات', englishName: 'Al-Mursalaat', englishNameTranslation: 'The Emissaries', revelationType: 'Meccan', numberOfAyahs: 50, startPage: 580, juz: 29 },
  { number: 78, name: 'النبأ', englishName: 'An-Naba', englishNameTranslation: 'The Tidings', revelationType: 'Meccan', numberOfAyahs: 40, startPage: 582, juz: 30 },
  { number: 79, name: 'النازعات', englishName: 'An-Naazi\'aat', englishNameTranslation: 'Those who drag forth', revelationType: 'Meccan', numberOfAyahs: 46, startPage: 583, juz: 30 },
  { number: 80, name: 'عبس', englishName: 'Abasa', englishNameTranslation: 'He frowned', revelationType: 'Meccan', numberOfAyahs: 42, startPage: 585, juz: 30 },
  { number: 81, name: 'التكوير', englishName: 'At-Takwir', englishNameTranslation: 'The Overthrowing', revelationType: 'Meccan', numberOfAyahs: 29, startPage: 586, juz: 30 },
  { number: 82, name: 'الانفطار', englishName: 'Al-Infitaar', englishNameTranslation: 'The Cleaving', revelationType: 'Meccan', numberOfAyahs: 19, startPage: 587, juz: 30 },
  { number: 83, name: 'المطففين', englishName: 'Al-Mutaffifin', englishNameTranslation: 'Defrauding', revelationType: 'Meccan', numberOfAyahs: 36, startPage: 587, juz: 30 },
  { number: 84, name: 'الانشقاق', englishName: 'Al-Inshiqaaq', englishNameTranslation: 'The Splitting Open', revelationType: 'Meccan', numberOfAyahs: 25, startPage: 589, juz: 30 },
  { number: 85, name: 'البروج', englishName: 'Al-Burooj', englishNameTranslation: 'The Constellations', revelationType: 'Meccan', numberOfAyahs: 22, startPage: 590, juz: 30 },
  { number: 86, name: 'الطارق', englishName: 'At-Taariq', englishNameTranslation: 'The Morning Star', revelationType: 'Meccan', numberOfAyahs: 17, startPage: 591, juz: 30 },
  { number: 87, name: 'الأعلى', englishName: 'Al-A\'laa', englishNameTranslation: 'The Most High', revelationType: 'Meccan', numberOfAyahs: 19, startPage: 591, juz: 30 },
  { number: 88, name: 'الغاشية', englishName: 'Al-Ghaashiya', englishNameTranslation: 'The Overwhelming', revelationType: 'Meccan', numberOfAyahs: 26, startPage: 592, juz: 30 },
  { number: 89, name: 'الفجر', englishName: 'Al-Fajr', englishNameTranslation: 'The Dawn', revelationType: 'Meccan', numberOfAyahs: 30, startPage: 593, juz: 30 },
  { number: 90, name: 'البلد', englishName: 'Al-Balad', englishNameTranslation: 'The City', revelationType: 'Meccan', numberOfAyahs: 20, startPage: 594, juz: 30 },
  { number: 91, name: 'الشمس', englishName: 'Ash-Shams', englishNameTranslation: 'The Sun', revelationType: 'Meccan', numberOfAyahs: 15, startPage: 595, juz: 30 },
  { number: 92, name: 'الليل', englishName: 'Al-Layl', englishNameTranslation: 'The Night', revelationType: 'Meccan', numberOfAyahs: 21, startPage: 595, juz: 30 },
  { number: 93, name: 'الضحى', englishName: 'Ad-Dhuhaa', englishNameTranslation: 'The Morning Hours', revelationType: 'Meccan', numberOfAyahs: 11, startPage: 596, juz: 30 },
  { number: 94, name: 'الشرح', englishName: 'Ash-Sharh', englishNameTranslation: 'The Relief', revelationType: 'Meccan', numberOfAyahs: 8, startPage: 596, juz: 30 },
  { number: 95, name: 'التين', englishName: 'At-Tin', englishNameTranslation: 'The Fig', revelationType: 'Meccan', numberOfAyahs: 8, startPage: 597, juz: 30 },
  { number: 96, name: 'العلق', englishName: 'Al-Alaq', englishNameTranslation: 'The Clot', revelationType: 'Meccan', numberOfAyahs: 19, startPage: 597, juz: 30 },
  { number: 97, name: 'القدر', englishName: 'Al-Qadr', englishNameTranslation: 'The Power', revelationType: 'Meccan', numberOfAyahs: 5, startPage: 598, juz: 30 },
  { number: 98, name: 'البينة', englishName: 'Al-Bayyina', englishNameTranslation: 'The Clear Proof', revelationType: 'Medinan', numberOfAyahs: 8, startPage: 598, juz: 30 },
  { number: 99, name: 'الزلزلة', englishName: 'Az-Zalzala', englishNameTranslation: 'The Earthquake', revelationType: 'Medinan', numberOfAyahs: 8, startPage: 599, juz: 30 },
  { number: 100, name: 'العاديات', englishName: 'Al-Aadiyaat', englishNameTranslation: 'The Courser', revelationType: 'Meccan', numberOfAyahs: 11, startPage: 599, juz: 30 },
  { number: 101, name: 'القارعة', englishName: 'Al-Qaari\'a', englishNameTranslation: 'The Calamity', revelationType: 'Meccan', numberOfAyahs: 11, startPage: 600, juz: 30 },
  { number: 102, name: 'التكاثر', englishName: 'At-Takaathur', englishNameTranslation: 'The Rivalry in world increase', revelationType: 'Meccan', numberOfAyahs: 8, startPage: 600, juz: 30 },
  { number: 103, name: 'العصر', englishName: 'Al-Asr', englishNameTranslation: 'The Declining Day', revelationType: 'Meccan', numberOfAyahs: 3, startPage: 601, juz: 30 },
  { number: 104, name: 'الهمزة', englishName: 'Al-Humaza', englishNameTranslation: 'The Traducer', revelationType: 'Meccan', numberOfAyahs: 9, startPage: 601, juz: 30 },
  { number: 105, name: 'الفيل', englishName: 'Al-Fil', englishNameTranslation: 'The Elephant', revelationType: 'Meccan', numberOfAyahs: 5, startPage: 601, juz: 30 },
  { number: 106, name: 'قريش', englishName: 'Quraish', englishNameTranslation: 'Quraysh', revelationType: 'Meccan', numberOfAyahs: 4, startPage: 602, juz: 30 },
  { number: 107, name: 'الماعون', englishName: 'Al-Maa\'oon', englishNameTranslation: 'The Small Kindness', revelationType: 'Meccan', numberOfAyahs: 7, startPage: 602, juz: 30 },
  { number: 108, name: 'الكوثر', englishName: 'Al-Kawthar', englishNameTranslation: 'The Abundance', revelationType: 'Meccan', numberOfAyahs: 3, startPage: 602, juz: 30 },
  { number: 109, name: 'الكافرون', englishName: 'Al-Kaafiroon', englishNameTranslation: 'The Disbelievers', revelationType: 'Meccan', numberOfAyahs: 6, startPage: 603, juz: 30 },
  { number: 110, name: 'النصر', englishName: 'An-Nasr', englishNameTranslation: 'The Divine Support', revelationType: 'Medinan', numberOfAyahs: 3, startPage: 603, juz: 30 },
  { number: 111, name: 'المسد', englishName: 'Al-Masad', englishNameTranslation: 'The Palm Fibre', revelationType: 'Meccan', numberOfAyahs: 5, startPage: 603, juz: 30 },
  { number: 112, name: 'الإخلاص', englishName: 'Al-Ikhlaas', englishNameTranslation: 'The Sincerity', revelationType: 'Meccan', numberOfAyahs: 4, startPage: 604, juz: 30 },
  { number: 113, name: 'الفلق', englishName: 'Al-Falaq', englishNameTranslation: 'The Daybreak', revelationType: 'Meccan', numberOfAyahs: 5, startPage: 604, juz: 30 },
  { number: 114, name: 'الناس', englishName: 'An-Naas', englishNameTranslation: 'Mankind', revelationType: 'Meccan', numberOfAyahs: 6, startPage: 604, juz: 30 }
];

// Offline built-in Quran Page 604 data (Al-Ikhlas, Al-Falaq, An-Nas)
export const PAGE_604_DATA = {
  pageNumber: 604,
  juz: 30,
  hizb: 60,
  surahs: [
    {
      number: 112,
      name: 'الإخلاص',
      bismillah: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      ayahs: [
        { number: 1, text: 'قُلْ هُوَ اللَّهُ أَحَدٌ', tafseer: 'قل يا محمد لهؤلاء المشركين: الله هو الواحد الأحد الذي لا شريك له ولا ند له.' },
        { number: 2, text: 'اللَّهُ الصَّمَدُ', tafseer: 'المقصود في الحوائج كلها، الذي كمل في سؤدده وشرفه وعظمته وغناه.' },
        { number: 3, text: 'لَمْ يَلِدْ وَلَمْ يُولَدْ', tafseer: 'ليس له ولد ولا والد ولا صاحبة.' },
        { number: 4, text: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', tafseer: 'وليس له مكافئ ولا مماثل في ذاته ولا في صفاته ولا في أفعاله.' }
      ]
    },
    {
      number: 113,
      name: 'الفلق',
      bismillah: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      ayahs: [
        { number: 1, text: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', tafseer: 'قل أعتصم وأتحصن برب الصبح وفالقه.' },
        { number: 2, text: 'مِن شَرِّ مَا خَلَقَ', tafseer: 'من شر جميع المخلوقات وأذاها.' },
        { number: 3, text: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ', tafseer: 'ومن شر ليل مظلم شديد الظلمة إذا دخل وغمر كل شيء.' },
        { number: 4, text: 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ', tafseer: 'ومن شر السواحر اللاتي ينفثن في عقد السحر للإضرار بالناس.' },
        { number: 5, text: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ', tafseer: 'ومن شر من يتمنى زوال النعمة عن غيره ويسعى في إيذائه.' }
      ]
    },
    {
      number: 114,
      name: 'الناس',
      bismillah: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      ayahs: [
        { number: 1, text: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', tafseer: 'قل أعتصم وألوذ بخالق الناس ومدبر أمورهم.' },
        { number: 2, text: 'مَلِكِ النَّاسِ', tafseer: 'الملك المتصرف في شؤونهم الذي لا غنى لهم عنه.' },
        { number: 3, text: 'إِلَٰهِ النَّاسِ', tafseer: 'معبودهم الحق الذي لا إله غيره.' },
        { number: 4, text: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ', tafseer: 'من شر الشيطان الذي يوسوس عند الغفلة، ويخنس ويختفي عند ذكر الله.' },
        { number: 5, text: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ', tafseer: 'الذي يلقي الشر والشكوك في قلوب بني آدم.' },
        { number: 6, text: 'مِنَ الْجِنَّةِ وَالنَّاسِ', tafseer: 'وسواسه يكون من شياطين الإنس وشياطين الجن.' }
      ]
    }
  ]
};

// Built-in Page 1 (Al-Fatihah)
export const PAGE_1_DATA = {
  pageNumber: 1,
  juz: 1,
  hizb: 1,
  surahs: [
    {
      number: 1,
      name: 'الفاتحة',
      bismillah: '',
      ayahs: [
        { number: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', tafseer: 'أبدأ قراءتي مستعيناً باسم الله الرحمن الرحيم، المستحق وحده للعبادة.' },
        { number: 2, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', tafseer: 'الثناء الكامل المطلق لله تعالى، خالق الإنس والجن والملائكة والسموات والأرض.' },
        { number: 3, text: 'الرَّحْمَٰنِ الرَّحِيمِ', tafseer: 'ذو الرحمة الواسعة الشاملة لجميع الخلائق، والرحمة الخاصة بالمؤمنين.' },
        { number: 4, text: 'مَالِكِ يَوْمِ الدِّينِ', tafseer: 'المالك المتفرد بيوم القيامة والجزاء والحساب.' },
        { number: 5, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', tafseer: 'نخصك وحدك بالعبادة والإخلاص، ونطلب معونتك وحدك في كل شؤوننا.' },
        { number: 6, text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', tafseer: 'دلنا ووفقنا وثبتنا على الطريق المستقيم الواضح الموصل إلى رضاك وجنتك.' },
        { number: 7, text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', tafseer: 'طريق النبيين والصدّيقين والشهداء والصالحين، لا طريق المغضوب عليهم (اليهود) ولا الضالين (النصارى).' }
      ]
    }
  ]
};

// Folder mappings for EveryAyah high-bitrate Ayah-by-Ayah Sheikh audio streams
export const RECITER_AYAH_FOLDERS: Record<ReciterId, string> = {
  alafasy: 'Alafasy_128kbps',
  hussary: 'Husary_128kbps',
  minshawi: 'Minshawy_Murattal_128kbps',
  abdulbasit: 'Abdul_Basit_Murattal_192kbps',
  ghamadi: 'Ghamadi_40kbps',
  muaiqly: 'MaherAlMuaiqly128kbps',
  sudais: 'Abdurrahmaan_As-Sudais_192kbps',
  shuraym: 'Saood_ash-Shuraym_128kbps',
  dussary: 'Yasser_Ad-Dussary_128kbps',
  ajmi: 'Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net',
  shatri: 'Abu_Bakr_Ash-Shaatree_128kbps',
  huthifi: 'Hudhaify_128kbps',
  abkar: 'Alafasy_128kbps',
  abbad: 'Fares_Abbad_64kbps',
  qatam: 'Nasser_Alqatami_128kbps'
};

// Helper function to format Ayah audio URL (e.g. 002255.mp3 for Ayat al-Kursi)
export function getAyahAudioUrl(reciterId: ReciterId = 'alafasy', surahNumber: number, ayahNumber: number): string {
  const folder = RECITER_AYAH_FOLDERS[reciterId] || 'Alafasy_128kbps';
  const surahPadded = String(surahNumber).padStart(3, '0');
  const ayahPadded = String(ayahNumber).padStart(3, '0');
  return `https://everyayah.com/data/${folder}/${surahPadded}${ayahPadded}.mp3`;
}

// Helper function to format 3 digits surah audio link (e.g., "001.mp3", "114.mp3")
export function getSurahAudioUrl(reciterServerUrl: string, surahNumber: number): string {
  const padded = String(surahNumber).padStart(3, '0');
  return `${reciterServerUrl}/${padded}.mp3`;
}

// Convert Eastern Arabic numerals (١، ٢، ٣) to standard or vice versa
export function toArabicNumerals(num: number | string): string {
  const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (w) => digits[+w]);
}

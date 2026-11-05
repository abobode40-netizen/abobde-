/**
 * بيانات القاعدة النورانية الشاملة لتعليم قراءة القرآن الكريم
 * مصنفة ومبوبة حسب الدروس النورانية المعتمدة مع الأمثلة القرآنية، المخارج، وأسلوب التهجي
 */

export interface NooraniyahLetter {
  char: string;
  name: string;
  makhraj: string; // مخرج الحرف
  sifah: string; // صفة الحرف (استعلاء، ترقيق، همس، قلقلة...)
  examples: string[]; // أمثلة قرآنية
  tajweedTip?: string;
  audioUrl?: string; // تلاوة مسجلة بصوت القارئ
}

export interface NooraniyahLesson {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  importance: string;
  category: 'letters' | 'harakat' | 'tanween' | 'sukoon' | 'shaddah' | 'madd' | 'words';
  imageBadge?: string;
  audioUrl?: string; // رابط التسجيل الصوتي المعتمد بصوت الشيخ المقرئ
  learningPoints: string[];
  items: {
    text: string;
    pronunciation: string; // طريقة التهجي
    breakdown?: string; // تحليل التهجي
    note?: string; // توجيه تجويدي
    quranicReference?: string; // أين وردت في القرآن
  }[];
  interactiveQuiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface MakhrajCategory {
  id: string;
  title: string;
  description: string;
  letters: string[];
  guideText: string;
  color: string;
}

// مخارج الحروف الخمسة الرئيسية
export const MAKHARIJ_CATEGORIES: MakhrajCategory[] = [
  {
    id: 'jawf',
    title: 'الجَوْف (التجويف الفموي والحلقي)',
    description: 'مخرج حروف المد الثلاثة (الألف الساكنة المفتوح ما قبلها، الواو الساكنة المضموم ما قبلها، الياء الساكنة المكسور ما قبلها).',
    letters: ['ا', 'و', 'ي'],
    guideText: 'تخرج بحركة اهتزازية من الجوف دون الاعتماد على نقطة معينة في الفم، وتُمد بمقدار حركتين في الطبيعي.',
    color: '#0284C7'
  },
  {
    id: 'halq',
    title: 'الحَلْق (أقصى ووسط وأدنى الحلق)',
    description: 'مخرج حروف الإظهار الستة، وتخرج من الحلق بصفاء دون غنة.',
    letters: ['ء', 'هـ', 'ع', 'ح', 'غ', 'خ'],
    guideText: 'أقصى الحلق (ء، هـ)، وسط الحلق (ع، ح)، أدنى الحلق قريباً من اللهاة (غ، خ).',
    color: '#059669'
  },
  {
    id: 'lisan',
    title: 'اللِّسَان (أكبر المخارج: ١٠ مخارج لـ ١٨ حرفاً)',
    description: 'أقصى اللسان، وسطه، حافتاه، وطرفه الدقيق.',
    letters: ['ق', 'ك', 'ج', 'ش', 'ي', 'ض', 'ل', 'ن', 'ر', 'ط', 'د', 'ت', 'ص', 'ز', 'س', 'ظ', 'ذ', 'ث'],
    guideText: 'يشمل حروف الاستعلاء المفخمة (خص ضغط قظ) وحروف الصفير وحروف الذلاقة والطرف.',
    color: '#D97706'
  },
  {
    id: 'shafatayn',
    title: 'الشَّفَتَان (الفاء، والباء، والميم، والواو)',
    description: 'مخرج الحروف الشفوية بالانطباق أو الملامسة.',
    letters: ['ف', 'ب', 'م', 'و'],
    guideText: 'الفاء من باطن الشفة السفلى مع أطراف الثنايا العليا، والباء والميم بالانطباق، والواو غير المدية باستدارة الشفتين.',
    color: '#8B5CF6'
  },
  {
    id: 'khayshoom',
    title: 'الخَيْشُوم (أعلى الأنف الداخلي)',
    description: 'مخرج صوت الغنة المركب في النون والميم المشددتين والمخفيتين والمدغمتين.',
    letters: ['نّ', 'مّ'],
    guideText: 'صوت رخيم يخرج من الأنف لا عمل للسان فيه، ومقداره حركتان في التلاوة المتقنة.',
    color: '#E11D48'
  }
];

// الحروف الهجائية المفردة مع مخارجها وصفاتها وروابط النطق بصوت رجالي قرآني متقن
export const NOORANIYAH_LETTERS: NooraniyahLetter[] = [
  { char: 'ا', name: 'أَلِف', makhraj: 'الجوف (حرف مد) / الهمزة من أقصى الحلق', sifah: 'انفتاح واستفال وترقيق', examples: ['إِبْرَاهِيمَ', 'أَنْعَمْتَ'], tajweedTip: 'احذر من نطق الألف ممالة أو مفخمة إذا لم يسبقها مفخم', audioUrl: 'https://raw.githubusercontent.com/razunatmohammed88-cyber/arabic-alphabet-audio/main/alif.mp3' },
  { char: 'ب', name: 'بَاء', makhraj: 'انطباق الشفتين', sifah: 'جهر، شدة، قلقلة عند السكون', examples: ['بِسْمِ اللَّهِ', 'فَانفَلَقَ'], tajweedTip: 'حرف مرقق دائماً، ويقلقل إذا كان ساكناً نحو (تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ)', audioUrl: 'https://raw.githubusercontent.com/razunatmohammed88-cyber/arabic-alphabet-audio/main/baa.mp3' },
  { char: 'ت', name: 'تَاء', makhraj: 'طرف اللسان مع أصول الثنايا العليا', sifah: 'همس وشدة', examples: ['التَّوَّابُ', 'فَتَابَ'], tajweedTip: 'يظهر همسها اللطيف عند سكونها دون مبالغة نحو (كَوِّرَتْ)', audioUrl: 'https://raw.githubusercontent.com/razunatmohammed88-cyber/arabic-alphabet-audio/main/taa.mp3' },
  { char: 'ث', name: 'ثَاء', makhraj: 'طرف اللسان مع أطراف الثنايا العليا', sifah: 'همس ورخاوة ولين', examples: ['ثُمَّ', 'مَثَلُهُمْ'], tajweedTip: 'إخراج طرف اللسان قليلاً ليتميز عن حرف السين والتاء', audioUrl: 'https://raw.githubusercontent.com/razunatmohammed88-cyber/arabic-alphabet-audio/main/thaa.mp3' },
  { char: 'ج', name: 'جِيم', makhraj: 'وسط اللسان مع ما يحاذيه من الحنك الأعلى', sifah: 'جهر وشدة وقلقلة', examples: ['جَنَّاتٍ', 'وَالْفَجْرِ'], tajweedTip: 'حرف شديد لا يجري معه الهواء، احذر من نطقه كالجيم القاهرية أو الشامية', audioUrl: 'https://raw.githubusercontent.com/razunatmohammed88-cyber/arabic-alphabet-audio/main/jiim.mp3' },
  { char: 'ح', name: 'حَاء', makhraj: 'وسط الحلق', sifah: 'همس ورخاوة وبحّة صافية', examples: ['الرَّحْمَنِ', 'الْحَمْدُ'], tajweedTip: 'صفاء المخرج من وسط الحلق دون خلط بالخاء أو الهاء', audioUrl: 'https://raw.githubusercontent.com/razunatmohammed88-cyber/arabic-alphabet-audio/main/haa.mp3' },
  { char: 'خ', name: 'خَاء', makhraj: 'أدنى الحلق مما يلي الفم', sifah: 'استعلاء وتفخيم وهمس', examples: ['خَالِدِينَ', 'خَلَقَ'], tajweedTip: 'مفخم دائماً، ومرتبة تفخيمه تقل عند الكسر مثل (خِيَانَةً)', audioUrl: 'https://raw.githubusercontent.com/razunatmohammed88-cyber/arabic-alphabet-audio/main/khaa.mp3' },
  { char: 'د', name: 'دَال', makhraj: 'طرف اللسان مع أصول الثنايا العليا', sifah: 'جهر وشدة وقلقلة', examples: ['دِينِ اللَّهِ', 'قُلْ هُوَ اللَّهُ أَحَدٌ'], tajweedTip: 'حرف مرقق يقلقل بقوة عند سكونه نحو (أَحَدٌ)', audioUrl: 'https://raw.githubusercontent.com/razunatmohammed88-cyber/arabic-alphabet-audio/main/daal.mp3' },
  { char: 'ذ', name: 'ذَال', makhraj: 'طرف اللسان مع أطراف الثنايا العليا', sifah: 'جهر ورخاوة', examples: ['ذَلِكَ الْكِتَابُ', 'الَّذِينَ'], tajweedTip: 'إخراج طرف اللسان والترقيق حتى لا ينقلب زاياً', audioUrl: 'https://raw.githubusercontent.com/razunatmohammed88-cyber/arabic-alphabet-audio/main/thaal.mp3' },
  { char: 'ر', name: 'رَاء', makhraj: 'طرف اللسان مائلاً لظهره قليلاً', sifah: 'بينية وانحراف وتكرير خفي', examples: ['الرَّحِيمِ', 'فِرْعَوْنَ'], tajweedTip: 'يفخم مع الفتح والضم (رَبَّنَا)، ويرقق مع الكسر (رِزْقاً)', audioUrl: 'https://raw.githubusercontent.com/razunatmohammed88-cyber/arabic-alphabet-audio/main/raa.mp3' },
  { char: 'ز', name: 'زَاي', makhraj: 'طرف اللسان مع فوق الثنايا السفلى', sifah: 'جهر ورخاوة وصفير', examples: ['زَيَّنَّا', 'زُلْزِلَتِ'], tajweedTip: 'صوت الصفير واضح مع الجهر التام', audioUrl: 'https://raw.githubusercontent.com/razunatmohammed88-cyber/arabic-alphabet-audio/main/zaay.mp3' },
  { char: 'س', name: 'سِين', makhraj: 'طرف اللسان مع فوق الثنايا السفلى', sifah: 'همس ورخاوة وصفير واستفال', examples: ['الْإِنسَانَ', 'سَلَامٌ'], tajweedTip: 'حرف مرقق دائماً، احذر من تفخيمه إذا جاور مفخماً كـ (عَسَى)', audioUrl: 'https://raw.githubusercontent.com/razunatmohammed88-cyber/arabic-alphabet-audio/main/siin.mp3' },
  { char: 'ش', name: 'شِين', makhraj: 'وسط اللسان مع الحنك الأعلى', sifah: 'همس ورخاوة وتفشٍّ', examples: ['الشَّمْسُ', 'الشَّيْطَانِ'], tajweedTip: 'التفشي هو انتشار الهواء في الفم عند النطق به', audioUrl: 'https://raw.githubusercontent.com/razunatmohammed88-cyber/arabic-alphabet-audio/main/shiin.mp3' },
  { char: 'ص', name: 'صَاد', makhraj: 'طرف اللسان مع فوق الثنايا السفلى', sifah: 'استعلاء وإطباق وصفير وتفخيم', examples: ['الصِّرَاطَ', 'الصَّابِرِينَ'], tajweedTip: 'حرف مفخم مطبق قوي الصوت بالصفير', audioUrl: 'https://raw.githubusercontent.com/razunatmohammed88-cyber/arabic-alphabet-audio/main/saad.mp3' },
  { char: 'ض', name: 'ضَاد', makhraj: 'إحدى حافتي اللسان أو كلاهما مع الأضراس العليا', sifah: 'استطالة وإطباق وتفخيم وجهر', examples: ['وَلَا الضَّالِّينَ', 'مَغْضُوبِ'], tajweedTip: 'أصعب الحروف مخرجاً، ويتميز بالاستطالة دون إخراجه ظاءً', audioUrl: 'https://raw.githubusercontent.com/razunatmohammed88-cyber/arabic-alphabet-audio/main/daad.mp3' },
  { char: 'ط', name: 'طَاء', makhraj: 'طرف اللسان مع أصول الثنايا العليا', sifah: 'أقوى الحروف: جهر وشدة واستعلاء وإطباق وقلقلة', examples: ['طِبْتُمْ', 'مُحِيطٌ'], tajweedTip: 'أقوى حروف الهجاء إطباقاً وتفخيماً وقلقلة عند الوقف', audioUrl: 'https://raw.githubusercontent.com/razunatmohammed88-cyber/arabic-alphabet-audio/main/taa\'.mp3' },
  { char: 'ظ', name: 'ظَاء', makhraj: 'طرف اللسان مع أطراف الثنايا العليا', sifah: 'استعلاء وإطباق وجهر ورخاوة', examples: ['الظَّالِمِينَ', 'عَظِيمٌ'], tajweedTip: 'إخراج طرف اللسان مع الإطباق والتفخيم لتمييزه عن الذال', audioUrl: 'https://raw.githubusercontent.com/razunatmohammed88-cyber/arabic-alphabet-audio/main/thaa\'.mp3' },
  { char: 'ع', name: 'عَيْن', makhraj: 'وسط الحلق', sifah: 'جهر وتوسط (بينية) واستفال', examples: ['الْعَالَمِينَ', 'نَعْبُدُ'], tajweedTip: 'العناية ببيانه عند مجاورة هاء أو عين أخرى نحو (فَبَايِعْهُنَّ)', audioUrl: 'https://raw.githubusercontent.com/razunatmohammed88-cyber/arabic-alphabet-audio/main/àyn.mp3' },
  { char: 'غ', name: 'غَيْن', makhraj: 'أدنى الحلق', sifah: 'استعلاء وتفخيم ورخاوة وجهر', examples: ['الْمَغْضُوبِ', 'غَفُورٌ'], tajweedTip: 'جريان الصوت معه دون انحباس لكونه حرفاً رخواً', audioUrl: 'https://raw.githubusercontent.com/razunatmohammed88-cyber/arabic-alphabet-audio/main/ghayn.mp3' },
  { char: 'ف', name: 'فَاء', makhraj: 'باطن الشفة السفلى مع أطراف الثنايا العليا', sifah: 'همس ورخاوة واستفال', examples: ['الْفَلَقِ', 'فَتَحْنَا'], tajweedTip: 'الاعتماد على الثنايا العليا مع باطن الشفة لخروج همس نقي', audioUrl: 'https://raw.githubusercontent.com/razunatmohammed88-cyber/arabic-alphabet-audio/main/faa.mp3' },
  { char: 'ق', name: 'قَاف', makhraj: 'أقصى اللسان مع ما يحاذيه من الحنك اللحمي', sifah: 'استعلاء وتفخيم وشدة وقلقلة', examples: ['قُلْ', 'الْقَمَرِ'], tajweedTip: 'تفخيم قوي وقلقلة كبرى عند الوقف نحو (وَالْقُرْآنِ الْمَجِيدِ)', audioUrl: 'https://raw.githubusercontent.com/razunatmohammed88-cyber/arabic-alphabet-audio/main/qaaf.mp3' },
  { char: 'ك', name: 'كَاف', makhraj: 'أقصى اللسان تحت مخرج القاف قليلاً', sifah: 'شدة وهمس واستفال', examples: ['الْكَوْثَرَ', 'كِتَابٌ'], tajweedTip: 'ينحبس الصوت أولاً لشدته ثم يتبعه همس لطيف دون مبالغة', audioUrl: 'https://raw.githubusercontent.com/razunatmohammed88-cyber/arabic-alphabet-audio/main/kaaf.mp3' },
  { char: 'ل', name: 'لَام', makhraj: 'أدنى حافة اللسان إلى منتهى طرفه مع لثة الأسنان العليا', sifah: 'توسط وانحراف واستفال', examples: ['الْحَمْدُ', 'لَيْلَةُ الْقَدْرِ'], tajweedTip: 'مرقق دائماً إلا في لفظ الجلالة (اللَّه) بعد فتح أو ضم فيفخم', audioUrl: 'https://raw.githubusercontent.com/razunatmohammed88-cyber/arabic-alphabet-audio/main/laam.mp3' },
  { char: 'م', name: 'مِيم', makhraj: 'انطباق الشفتين مع غنة من الخيشوم', sifah: 'توسط وغنة واستفال', examples: ['مَالِكِ', 'الْمُسْتَقِيمَ'], tajweedTip: 'تظهر غنتها حركتين إذا كانت مشددة نحو (عَمَّ)', audioUrl: 'https://raw.githubusercontent.com/razunatmohammed88-cyber/arabic-alphabet-audio/main/miim.mp3' },
  { char: 'ن', name: 'نُون', makhraj: 'طرف اللسان تحت مخرج اللام قليلاً مع غنة الخيشوم', sifah: 'توسط وغنة واستفال', examples: ['النَّاسِ', 'نَسْتَعِينُ'], tajweedTip: 'أصل أحكام التجويد (الإظهار، الإدغام، الإقلاب، الإخفاء)', audioUrl: 'https://raw.githubusercontent.com/razunatmohammed88-cyber/arabic-alphabet-audio/main/nuun.mp3' },
  { char: 'هـ', name: 'هَاء', makhraj: 'أقصى الحلق', sifah: 'همس ورخاوة وخفاء واستفال', examples: ['هُدًى', 'اهْدِنَا'], tajweedTip: 'أضعف الحروف خفاءً، فينبغي بيانها وإظهارها لا سيما عند الوقف', audioUrl: 'https://raw.githubusercontent.com/razunatmohammed88-cyber/arabic-alphabet-audio/main/haa\'.mp3' },
  { char: 'و', name: 'وَاو', makhraj: 'انضمام الشفتين مع فرجة يسيرة', sifah: 'جهر ورخاوة ولين واستفال', examples: ['وَالضُّحَى', 'قَوْلٌ'], tajweedTip: 'ضم الشفتين تماماً دون إشراك الخيشوم بالغنة', audioUrl: 'https://raw.githubusercontent.com/razunatmohammed88-cyber/arabic-alphabet-audio/main/waaw.mp3' },
  { char: 'ء', name: 'هَمْزَة', makhraj: 'أقصى الحلق', sifah: 'جهر وشدة وانفتاح واستفال', examples: ['أَنْعَمْتَ', 'ءَامَنَ'], tajweedTip: 'تحقيق مخرجها دون قلقلة أو تسهيل إلا برواية', audioUrl: 'https://raw.githubusercontent.com/razunatmohammed88-cyber/arabic-alphabet-audio/main/hamzah.mp3' },
  { char: 'ي', name: 'يَاء', makhraj: 'وسط اللسان مع الحنك الأعلى', sifah: 'جهر ورخاوة ولين واستفال', examples: ['يَوْمِ الدِّينِ', 'إِيَّاكَ'], tajweedTip: 'رفع وسط اللسان وتحقيق الكسر قبلها دون تمطيط زائد', audioUrl: 'https://raw.githubusercontent.com/razunatmohammed88-cyber/arabic-alphabet-audio/main/yaa.mp3' }
];

// دروس القاعدة النورانية السبعة عشر بالترتيب المنهجي المحقق
export const NOORANIYAH_LESSONS: NooraniyahLesson[] = [
  {
    id: 1,
    audioUrl: "https://archive.org/download/alnawrania1-17/n1.mp3",
    title: 'الدرس الأول: الحُرُوفُ المُفْرَدَة',
    subtitle: 'أسماء الحروف الهجائية بصوتها القرآني الصحيح',
    description: 'الأساس المتين لنطق أسماء حروف كتاب الله تعالى دون مدود زائدة أو بتر لأواخرها.',
    importance: 'يمكّن المتعلم من معرفة أصل الحرف ومخرجه قبل تركيب الحركات عليه.',
    category: 'letters',
    learningPoints: [
      'تُقرأ الألف (أَلِف) بثلاثة أحرف دون مد.',
      'الحروف المبنية على حرفين ثانيهما ألف مدية تُمد حركتين: (با، تا، ثا، حا، خا، را، طا، ظا، فا، ها، يا).',
      'الحروف المبنية على ثلاثة أحرف أوسطها مد أو لين تُمد مداً مشبعاً (٦ حركات عند التهجي الموسع): (جيم، سين، شين، صاد، ضاد، عين، غين، قاف، كاف، لام، ميم، نون).'
    ],
    items: [
      { text: 'ا', pronunciation: 'أَلِف', breakdown: 'أ - ل - ف', note: 'لا يُقال (آ) بل أَلِف', quranicReference: 'سورة البقرة: الم' },
      { text: 'ب', pronunciation: 'بَا', breakdown: 'ب - ا', note: 'مد طبيعي حركتان بدون همزة في آخره', quranicReference: 'سورة الفاتحة: بِسْمِ' },
      { text: 'ت', pronunciation: 'تَا', breakdown: 'ت - ا', note: 'ترقيق مع مد حركتين', quranicReference: 'سورة البقرة: تِلْكَ' },
      { text: 'ث', pronunciation: 'ثَا', breakdown: 'ث - ا', note: 'إخراج طرف اللسان', quranicReference: 'سورة النصر: ثُمَّ' },
      { text: 'ج', pronunciation: 'جِيم', breakdown: 'ج - ي - م', note: 'شدة الجيم وقفل المخرج', quranicReference: 'سورة النصر: إِذَا جَاءَ' },
      { text: 'ح', pronunciation: 'حَا', breakdown: 'ح - ا', note: 'بحة الحاء من وسط الحلق', quranicReference: 'سورة الفاتحة: الْحَمْدُ' },
      { text: 'خ', pronunciation: 'خَا', breakdown: 'خ - ا', note: 'تفخيم الحرف من أدنى الحلق', quranicReference: 'سورة الفلق: خَلَقَ' },
      { text: 'د', pronunciation: 'دَال', breakdown: 'د - ا - ل', note: 'ترقيق الدال مع قلقلة خفيفة عند التهجي', quranicReference: 'سورة الإخلاص: أَحَدٌ' },
      { text: 'ذ', pronunciation: 'ذَال', breakdown: 'ذ - ا - ل', note: 'إخراج طرف اللسان والترقيق', quranicReference: 'سورة الفاتحة: الَّذِينَ' },
      { text: 'ر', pronunciation: 'رَا', breakdown: 'ر - ا', note: 'تفخيم الراء المفتوحة', quranicReference: 'سورة الفاتحة: الرَّحْمَنِ' },
      { text: 'ز', pronunciation: 'زَاي', breakdown: 'ز - ا - ي', note: 'صفير الزاي وجهرها', quranicReference: 'سورة الزلزلة: زُلْزِلَتِ' },
      { text: 'س', pronunciation: 'سِين', breakdown: 'س - ي - ن', note: 'صفير السين والترقيق التام', quranicReference: 'سورة الناس: النَّاسِ' },
      { text: 'ش', pronunciation: 'شِين', breakdown: 'ش - ي - ن', note: 'تفشي الهواء في الفم', quranicReference: 'سورة الفلق: شَرِّ' },
      { text: 'ص', pronunciation: 'صَاد', breakdown: 'ص - ا - د', note: 'تفخيم مع إطباق وصفير', quranicReference: 'سورة الفاتحة: الصِّرَاطَ' },
      { text: 'ض', pronunciation: 'ضَاد', breakdown: 'ض - ا - د', note: 'استطالة الضاد من حافة اللسان', quranicReference: 'سورة الفاتحة: وَلَا الضَّالِّينَ' },
      { text: 'ط', pronunciation: 'طَا', breakdown: 'ط - ا', note: 'أقوى الحروف إطباقاً', quranicReference: 'سورة النصر: إِذَا جَاءَ نَصْرُ اللَّهِ' },
      { text: 'ظ', pronunciation: 'ظَا', breakdown: 'ظ - ا', note: 'طرف اللسان مع الإطباق والتفخيم', quranicReference: 'سورة البقرة: الظَّالِمِينَ' },
      { text: 'ع', pronunciation: 'عَيْن', breakdown: 'ع - ي - ن', note: 'توسط العين من وسط الحلق', quranicReference: 'سورة الفاتحة: نَعْبُدُ' },
      { text: 'غ', pronunciation: 'غَيْن', breakdown: 'غ - ي - ن', note: 'رخاوة الغين وتفخيمها', quranicReference: 'سورة الفاتحة: غَيْرِ' },
      { text: 'ف', pronunciation: 'فَا', breakdown: 'ف - ا', note: 'همس الفاء من باطن الشفة', quranicReference: 'سورة الفلق: الْفَلَقِ' },
      { text: 'ق', pronunciation: 'قَاف', breakdown: 'ق - ا - ف', note: 'استعلاء وتفخيم من أقصى اللسان', quranicReference: 'سورة الإخلاص: قُلْ' },
      { text: 'ك', pronunciation: 'كَاف', breakdown: 'ك - ا - ف', note: 'شدة ثم همس لطيف', quranicReference: 'سورة الكوثر: الْكَوْثَرَ' },
      { text: 'ل', pronunciation: 'لَام', breakdown: 'ل - ا - م', note: 'انحراف اللام وترقيقها', quranicReference: 'سورة الفاتحة: لِلَّهِ' },
      { text: 'م', pronunciation: 'مِيم', breakdown: 'م - ي - م', note: 'غنة الميم الملازمة', quranicReference: 'سورة الفاتحة: مَالِكِ' },
      { text: 'ن', pronunciation: 'نُون', breakdown: 'ن - و - ن', note: 'غنة النون من الخيشوم', quranicReference: 'سورة الفاتحة: نَسْتَعِينُ' },
      { text: 'و', pronunciation: 'وَاو', breakdown: 'و - ا - و', note: 'انضمام الشفتين دون غنة', quranicReference: 'سورة الإخلاص: وَلَمْ يَكُن' },
      { text: 'هـ', pronunciation: 'هَا', breakdown: 'هـ - ا', note: 'همس الهاء وخفاؤها', quranicReference: 'سورة الإخلاص: هُوَ' },
      { text: 'ء', pronunciation: 'هَمْزَة', breakdown: 'هـ - مـ - ز - ة', note: 'نبرة الهمزة من أقصى الحلق', quranicReference: 'سورة البقرة: ءَامَنَ' },
      { text: 'ي', pronunciation: 'يَا', breakdown: 'ي - ا', note: 'ترقيق الياء ووضوحها', quranicReference: 'سورة الفاتحة: يَوْمِ' }
    ],
    interactiveQuiz: [
      {
        question: 'ما هو النطق الصحيح لحرف (ح) في القاعدة النورانية؟',
        options: ['حَاءْ بالهمزة في الآخر', 'حَا بمد طبيعي حركتين', 'حِـي بالكسر', 'أَحْ بالسكون'],
        correctIndex: 1,
        explanation: 'الحروف الهجائية المبنية على حرفين ثانيهما ألف مدية تُقرأ بالمد الطبيعي حركتين بدون همز: حا، خا، طا، ظا، يا.'
      },
      {
        question: 'أي من الحروف التالية يُنطق بثلاثة أحرف أوسطها حرف مد؟',
        options: ['بَا', 'تَا', 'جِيم', 'رَا'],
        correctIndex: 2,
        explanation: 'حرف الجيم يُتهجى (جِيم: جيم - ياء - ميم)، وهو مركب من ثلاثة أحرف.'
      }
    ]
  },
  {
    id: 2,
    audioUrl: "https://archive.org/download/alnawrania1-17/n2.mp3",
    title: 'الدرس الثاني: الحُرُوفُ المُرَكَّبَة',
    subtitle: 'أشكال الحروف واتصالها في رسم المصحف العثماني',
    description: 'تدريب البصر واللسان على تمييز أشكال الحروف في أول الكلمة ووسطها وآخرها في خط المصحف.',
    importance: 'يمكّن القارئ من فك رموز الكلمات القرآنية ورسمها العثماني العريق.',
    category: 'letters',
    learningPoints: [
      'التمييز بين النقط ومواضعها (باء نقطة تحت، تاء نقطتان فوق، ثاء ثلاث فوق، نون نقطة فوق، ياء نقطتان تحت).',
      'أشكال حرف اللام والألف المتصلة (لا، لأ، لإ).',
      'تركيبات الحروف مع الجيم والحاء والخاء (تج، تح، تخ).'
    ],
    items: [
      { text: 'لا', pronunciation: 'لَامْ أَلِف', breakdown: 'ل + ا', note: 'مركب من لام وألف', quranicReference: 'لَا إِلَهَ إِلَّا اللَّهُ' },
      { text: 'با', pronunciation: 'بَا أَلِف', breakdown: 'ب + ا', note: 'باء في أول الكلمة متصلة بألف', quranicReference: 'بَابٌ' },
      { text: 'بلب', pronunciation: 'بَا لَام بَا', breakdown: 'ب + ل + ب', note: 'باء أولى، لام وسطى، باء أخيرة', quranicReference: 'رسم قرآني مركب' },
      { text: 'كاف ب', pronunciation: 'كَاف بَا', breakdown: 'ك + ب', note: 'كاف مبسوطة مع باء', quranicReference: 'كُتِبَ' },
      { text: 'كاف ت', pronunciation: 'كَاف تَا', breakdown: 'ك + ت', note: 'كاف مع تاء', quranicReference: 'كِتَابٌ' },
      { text: 'ن ت ث ي', pronunciation: 'نُون تَا ثَا يَا', breakdown: 'مقارنة النقط', note: 'التمييز بين الحروف المتشابهة في الرسم بحسب النقط', quranicReference: 'أصول التهجي' },
      { text: 'ب ج ت', pronunciation: 'بَا جِيم تَا', breakdown: 'ب + ج + ت', note: 'اتصال الجيم بالباء والتاء', quranicReference: 'بَيْتٌ' },
      { text: 'ت ح ث', pronunciation: 'تَا حَا ثَا', breakdown: 'ت + ح + ث', note: 'اتصال الحاء', quranicReference: 'تَحْتِهَا' },
      { text: 'ن خ ب', pronunciation: 'نُون خَا بَا', breakdown: 'ن + خ + ب', note: 'اتصال الخاء بالنقطة الفوقية', quranicReference: 'نَخِيلٍ' }
    ]
  },
  {
    id: 3,
    audioUrl: "https://archive.org/download/alnawrania1-17/n3.mp3",
    title: 'الدرس الثالث: الحُرُوفُ المُقَطَّعَة',
    subtitle: 'فواتح السور في التنزيل الحكيم وأحكام مدودها',
    description: 'أسرار فواتح السور الـ ٢٩ في القرآن الكريم ومدودها اللازمة الست حركات.',
    importance: 'تطبيق مباشر لأحكام المد اللازم الحرفي المثقل والمخفف وأحكام الإدغام والإخفاء.',
    category: 'letters',
    learningPoints: [
      'حروف (نَقَصَ عَسَلُكُمْ) تُمد ٦ حركات مداً لازماً حرفياً.',
      'حروف (حَيٌّ طَهُرَ) تُمد حركتين مداً طبيعياً حرفياً.',
      'الألف لا مد فيها: (أَلِف).',
      'حرف العين في فواتح مريم والشورى يجوز فيه التوسط (٤) والطول (٦) والطول أفضل.'
    ],
    items: [
      { text: 'الم', pronunciation: 'أَلِفْ لَامْ مِّيمْ', breakdown: 'ألف (لا مد) + لام (٦ حركات مع إدغام في الميم) + ميم (٦ حركات)', note: 'مد لازم حرفي مثقل في اللام ومخفف في الميم وغنة حركتين بينهما', quranicReference: 'سورة البقرة وآل عمران' },
      { text: 'المر', pronunciation: 'أَلِفْ لَامْ مِّيمْ رَا', breakdown: 'ألف + لام (٦) + ميم (٦) + را (حركتان)', note: 'الراء من حروف (حي طهر) تمد حركتين فقط', quranicReference: 'سورة الرعد' },
      { text: 'كهيعص', pronunciation: 'كَافْ هَا يَا عَيْنْ صَادْ', breakdown: 'كاف (٦) + ها (٢) + يا (٢) + عين (٤ أو ٦ مع إخفاء الصاد) + صاد (٦)', note: 'مجموع المدود ٢٠ إلى ٢٢ حركة مع الإخفاء بغنة مفخمة عند الصاد', quranicReference: 'فاتحة سورة مريم' },
      { text: 'طه', pronunciation: 'طَا هَا', breakdown: 'طا (حركتان) + ها (حركتان)', note: 'مد طبيعي حرفي حركتان لكل منهما', quranicReference: 'سورة طه' },
      { text: 'طسم', pronunciation: 'طَا سِينْ مِّيمْ', breakdown: 'طا (٢) + سين (٦ مع إدغام النون في الميم) + ميم (٦)', note: 'إدغام النون الساكنة في الميم بغنة أكمل ما تكون', quranicReference: 'سورة الشعراء والقصص' },
      { text: 'يس', pronunciation: 'يَا سِينْ', breakdown: 'يا (٢) + سين (٦)', note: 'مد طبيعي في الياء ولازم مخفف في السين', quranicReference: 'سورة يس' },
      { text: 'حم', pronunciation: 'حَا مِيمْ', breakdown: 'حا (٢) + ميم (٦)', note: 'الحواميم السبع في القرآن', quranicReference: 'سورة غافر وفصلت وغيرها' },
      { text: 'حم عسق', pronunciation: 'حَا مِيمْ • عَيْنْ سِينْ قَافْ', breakdown: 'حا (٢) ميم (٦) • عين (٦ مع إخفاء) سين (٦ مع إخفاء) قاف (٦)', note: 'إخفاء مرقق عند السين وإخفاء مفخم عند القاف', quranicReference: 'سورة الشورى' },
      { text: 'ق', pronunciation: 'قَافْ', breakdown: 'قاف (٦ حركات)', note: 'مد لازم حرفي مخفف مع قلقلة الفاء عند الوقف', quranicReference: 'سورة ق: وَالْقُرْآنِ الْمَجِيدِ' },
      { text: 'ن', pronunciation: 'نُونْ', breakdown: 'نون (٦ حركات)', note: 'مد لازم حرفي مخفف', quranicReference: 'سورة القلم: ن وَالْقَلَمِ' }
    ]
  },
  {
    id: 4,
    audioUrl: "https://archive.org/download/alnawrania1-17/n4.mp3",
    title: 'الدرس الرابع: الحَرَكَاتُ الثَّلَاثُ',
    subtitle: 'الفَتْحَةُ وَالكَسْرَةُ وَالضَّمَّةُ',
    description: 'ميزان ضبط الصوت العربي بحركاته الفصيحة دون تمطيط يولد حروف مد ولا اختلاس يضيع المعنى.',
    importance: 'الحركات هي روح الحرف، وضبطها يمنع اللحن الجلي والخفي في تلاوة القرآن.',
    category: 'harakat',
    learningPoints: [
      'الفتحة: فتح الفم رأسياً بصوت متوسط نقي نحو الأعلى (أَ، بَ، تَ).',
      'الكسرة: خفض الفك السفلي نحو الأسفل بكسر خالص دون خلط بالإمالة (إِ، بِ، تِ).',
      'الضمة: ضم الشفتين مع بقاء فرجة يسيرة لخروج الصوت نقياً نحو الأمام (أُ، بُ، تُ).',
      'طريقة التهجي النورانية: (همزة فتحة أَ، همزة كسرة إِ، أَ إِ، همزة ضمة أُ، أَ إِ أُ).'
    ],
    items: [
      { text: 'ءَ ءِ ءُ', pronunciation: 'هَمْزَة فَتْحَة (أَ) • هَمْزَة كَسْرَة (إِ) • هَمْزَة ضَمَّة (أُ)', breakdown: 'أَ - إِ - أُ', note: 'تحقيق مخرج الهمزة في الحركات الثلاث', quranicReference: 'أَمَرَ • إِبِلِ • أُذِنَ' },
      { text: 'بَ بِ بُ', pronunciation: 'بَا فَتْحَة (بَ) • بَا كَسْرَة (بِ) • بَا ضَمَّة (بُ)', breakdown: 'بَ - بِ - بُ', note: 'انطباق الشفتين في الحركات الثلاث مع ترقيق الباء', quranicReference: 'بَلَدٍ • بِسْمِ • بُورِكَ' },
      { text: 'تَ تِ تُ', pronunciation: 'تَا فَتْحَة (تَ) • تَا كَسْرَة (تِ) • تَا ضَمَّة (تُ)', breakdown: 'تَ - تِ - تُ', note: 'بيان صفة الهمس برقة دون صفير', quranicReference: 'تَبَّتْ • تِلْكَ • تُوبُوا' },
      { text: 'ثَ ثِ ثُ', pronunciation: 'ثَا فَتْحَة (ثَ) • ثَا كَسْرَة (ثِ) • ثَا ضَمَّة (ثُ)', breakdown: 'ثَ - ثِ - ثُ', note: 'إخراج طرف اللسان مع جريان النفس', quranicReference: 'ثَقُلَتْ • ثِيَابَكَ • ثُمَّ' },
      { text: 'جَ جِ جُ', pronunciation: 'جِيم فَتْحَة (جَ) • جِيم كَسْرَة (جِ) • جِيم ضَمَّة (جُ)', breakdown: 'جَ - جِ - جُ', note: 'حبس الصوت في الجيم الشديدة', quranicReference: 'جَعَلَ • جِبْرِيلَ • جُمِعَ' },
      { text: 'حَ حِ حُ', pronunciation: 'حَا فَتْحَة (حَ) • حَا كَسْرَة (حِ) • حَا ضَمَّة (حُ)', breakdown: 'حَ - حِ - حُ', note: 'بحة وسط الحلق الصافية', quranicReference: 'حَسَدَ • حِكْمَةٍ • حُرِّمَتْ' },
      { text: 'خَ خِ خُ', pronunciation: 'خَا فَتْحَة (خَ) • خَا كَسْرَة (خِ) • خَا ضَمَّة (خُ)', breakdown: 'خَ - خِ - خُ', note: 'تفخيم الخاء المفتوحة والمضمومة، ونقصان التفخيم في المكسورة', quranicReference: 'خَلَقَ • خِفَافاً • خُلِقَ' },
      { text: 'دَ دِ دُ', pronunciation: 'دَال فَتْحَة (دَ) • دَال كَسْرَة (دِ) • دَال ضَمَّة (دُ)', breakdown: 'دَ - دِ - دُ', note: 'ترقيق الدال دائماً', quranicReference: 'دَرَجَاتٍ • دِينِ • دُعَاءً' },
      { text: 'رَ رِ رُ', pronunciation: 'رَا فَتْحَة (رَ) • رَا كَسْرَة (رِ) • رَا ضَمَّة (رُ)', breakdown: 'رَ - رِ - رُ', note: 'الراء مفخمة في الفتح والضم، ومرققة في الكسر', quranicReference: 'رَبَّنَا • رِزْقاً • رُوحُ' },
      { text: 'صَ صِ صُ', pronunciation: 'صَاد فَتْحَة (صَ) • صَاد كَسْرَة (صِ) • صَاد ضَمَّة (صُ)', breakdown: 'صَ - صِ - صُ', note: 'استعلاء وإطباق مع المحافظة على الصفير', quranicReference: 'صَبَرُوا • صِرَاطَ • صُحُفِ' }
    ]
  },
  {
    id: 5,
    audioUrl: "https://archive.org/download/alnawrania1-17/n5.mp3",
    title: 'الدرس الخامس: أَنْوَاعُ التَّنْوِينِ',
    subtitle: 'فَتْحَتَانِ وَكَسْرَتَانِ وَضَمَّتَانِ',
    description: 'التنوين نون ساكنة زائدة تلحق آخر الأسماء لفظاً لا خطاً ووصلاً لا وقفاً.',
    importance: 'أساس أحكام النون الساكنة والتنوين (الإظهار والإدغام والإقلاب والإخفاء).',
    category: 'tanween',
    learningPoints: [
      'التنوين بالفتح يُكتب مع ألف عوض غالباً ويوقف عليه بالألف: (حَكِيماً -> حَكِيمَا).',
      'التنوين بالكسر والضم يُحذف عند الوقف ويُسكن الحرف: (حَكِيمٌ -> حَكِيمْ).',
      'طريقة التهجي: (ميم فتحتان مَنْ، ميم كسرتان مِنْ، مَنْ مِنْ، ميم ضمتان مُنْ، مَنْ مِنْ مُنْ).'
    ],
    items: [
      { text: 'بًا بٍ بٌ', pronunciation: 'بَا فَتْحَتَانِ (بَنْ) • بَا كَسْرَتَانِ (بِنْ) • بَا ضَمَّتَانِ (بُنْ)', breakdown: 'بَنْ - بِنْ - بُنْ', note: 'ترقيق صوت التنوين مع غنة خفيفة طبيعية', quranicReference: 'نَصَبًا • لَهَبٍ • قَرِيبٌ' },
      { text: 'تًا تٍ تٌ', pronunciation: 'تَا فَتْحَتَانِ (تَنْ) • تَا كَسْرَتَانِ (تِنْ) • تَا ضَمَّتَانِ (تُنْ)', breakdown: 'تَنْ - تِنْ - تُنْ', note: 'ترقيق التاء والتنوين', quranicReference: 'جَنَّاتٍ • قُوَّةٌ' },
      { text: 'ثًا ثٍ ثٌ', pronunciation: 'ثَا فَتْحَتَانِ (ثَنْ) • ثَا كَسْرَتَانِ (ثِنْ) • ثَا ضَمَّتَانِ (ثُنْ)', breakdown: 'ثَنْ - ثِنْ - ثُنْ', note: 'إخراج طرف اللسان في التنوين', quranicReference: 'حَدِيثًا • أَثَاثًا' },
      { text: 'دًا دٍ دٌ', pronunciation: 'دَال فَتْحَتَانِ (دَنْ) • دَال كَسْرَتَانِ (دِنْ) • دَال ضَمَّتَانِ (دُنْ)', breakdown: 'دَنْ - دِنْ - دُنْ', note: 'ترقيق الدال والتنوين', quranicReference: 'أَحَدًا • كَبَدٍ • أَحَدٌ' },
      { text: 'طًا طٍ طٌ', pronunciation: 'طَا فَتْحَتَانِ (طَنْ) • طَا كَسْرَتَانِ (طِنْ) • طَا ضَمَّتَانِ (طُنْ)', breakdown: 'طَنْ - طِنْ - طُنْ', note: 'تفخيم الطاء، وتفخيم غنة التنوين عند الإخفاء', quranicReference: 'شَطَطًا • صِرَاطٍ • مُحِيطٌ' },
      { text: 'قًا قٍ قٌ', pronunciation: 'قَاف فَتْحَتَانِ (قَنْ) • قَاف كَسْرَتَانِ (قِنْ) • قَاف ضَمَّتَانِ (قُنْ)', breakdown: 'قَنْ - قِنْ - قُنْ', note: 'استعلاء القاف', quranicReference: 'غَسَقًا • طَبَقٍ • خَالِقٌ' }
    ]
  },
  {
    id: 6,
    audioUrl: "https://archive.org/download/alnawrania1-17/n6.mp3",
    title: 'الدرس السادس: تَدْرِيبَاتٌ عَلَى الحَرَكَاتِ وَالتَّنْوِينِ',
    subtitle: 'تركيب الكلمات الثلاثية وقراءتها وصلاً ودرجاً',
    description: 'تطبيق عملي لنطق كلمات قرآنية ثلاثية كاملة الضبط بالتهجي والدرج السريع.',
    importance: 'الانتقال من الحرف المفرد إلى قراءة الكلمة القرآنية بطلاقة دون تردد.',
    category: 'words',
    learningPoints: [
      'التهجي حرفاً بحرف: (أَبَدًا: همزة فتحة أَ، با فتحة بَ، أَبَ، دال فتحتان دَنْ، أَبَدًا).',
      'تحقيق حركات الكلمة دون إسقاط أي حركة أو مدها.',
      'التدريب على القراءة بالدرج المباشر بعد التهجي.'
    ],
    items: [
      { text: 'أَبَدًا', pronunciation: 'ءَ فَتْحَة (أَ) • بَا فَتْحَة (بَ) -> (أَبَ) • دَال فَتْحَتَانِ (دَنْ) -> (أَبَدًا)', breakdown: 'أَ + بَ + دًا', note: 'كلمة ثلاثية مفتوحة مع تنوين فتح', quranicReference: 'سورة البينة: أَبَدًا رَّضِيَ اللَّهُ عَنْهُمْ' },
      { text: 'أَحَدٌ', pronunciation: 'ءَ فَتْحَة (أَ) • حَا فَتْحَة (حَ) -> (أَحَ) • دَال ضَمَّتَانِ (دٌ) -> (أَحَدٌ)', breakdown: 'أَ + حَ + دٌ', note: 'إظهار بحة الحاء وترقيق الهمزة والدال', quranicReference: 'سورة الإخلاص: قُلْ هُوَ اللَّهُ أَحَدٌ' },
      { text: 'بَلَدٍ', pronunciation: 'بَا فَتْحَة (بَ) • لَام فَتْحَة (لَ) -> (بَلَ) • دَال كَسْرَتَانِ (دٍ) -> (بَلَدٍ)', breakdown: 'بَ + لَ + دٍ', note: 'ترقيق اللام والباء والدال', quranicReference: 'سورة البلد: لَا أُقْسِمُ بِهَذَا الْبَلَدِ' },
      { text: 'حَسَدَ', pronunciation: 'حَا فَتْحَة (حَ) • سِين فَتْحَة (سَ) -> (حَسَ) • دَال فَتْحَة (دَ) -> (حَسَدَ)', breakdown: 'حَ + سَ + دَ', note: 'ترقيق السين بجوار الحاء والدال', quranicReference: 'سورة الفلق: وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ' },
      { text: 'خَلَقَ', pronunciation: 'خَا فَتْحَة (خَ) • لَام فَتْحَة (لَ) -> (خَلَ) • قَاف فَتْحَة (قَ) -> (خَلَقَ)', breakdown: 'خَ + لَ + قَ', note: 'ترقيق اللام بين حرفين مفخمين (الخاء والقاف)', quranicReference: 'سورة الفلق: مِن شَرِّ مَا خَلَقَ' },
      { text: 'ذَكَرَ', pronunciation: 'ذَال فَتْحَة (ذَ) • كَاف فَتْحَة (كَ) -> (ذَكَ) • رَا فَتْحَة (رَ) -> (ذَكَرَ)', breakdown: 'ذَ + كَ + رَ', note: 'إخراج طرف اللسان في الذال وتفخيم الراء المفتوحة', quranicReference: 'سورة مريم: ذِكْرُ رَحْمَتِ رَبِّكَ' },
      { text: 'سُرُرٌ', pronunciation: 'سِين ضَمَّة (سُ) • رَا ضَمَّة (رُ) -> (سُرُ) • رَا ضَمَّتَانِ (رٌ) -> (سُرُرٌ)', breakdown: 'سُ + رُ + رٌ', note: 'تفخيم الراءين المضمومتين مع ترقيق السين', quranicReference: 'سورة الغاشية: فِيهَا سُرُرٌ مَّرْفُوعَةٌ' }
    ]
  },
  {
    id: 7,
    audioUrl: "https://archive.org/download/alnawrania1-17/n7.mp3",
    title: 'الدرس السابع: الأَلِفُ الصَّغِيرَةُ وَاليَاءُ الصَّغِيرَةُ وَالوَاوُ الصَّغِيرَةُ',
    subtitle: 'حروف المد الصغرى المرسومة خنجرية في المصحف',
    description: 'إتقان نطق الحروف المحذوفة رسماً في المصحف والمعوض عنها بأحرف ضبط صغرى.',
    importance: 'كثير من كلمات القرآن كُتبت بحروف صغرى (هَذَا، ذَلِكَ، مَالِكِ، دَاوُۥدَ).',
    category: 'madd',
    learningPoints: [
      'الألف الخنجرية تُمد مدّاً طبيعياً بمقدار حركتين كالمد الكامل.',
      'الواو الصغيرة (نحو: دَاوُۥدَ، يَسْتَحْيِۦ) مد تمكين حركتان.',
      'طريقة التهجي: (با ألف صغيرة بَا، تا ألف صغيرة تَا).'
    ],
    items: [
      { text: 'بٰـ', pronunciation: 'بَا أَلِف صَغِيرَة (بَا)', breakdown: 'ب + ٰ', note: 'مد طبيعي حركتان', quranicReference: 'سورة البقرة: بَالِغَهُ' },
      { text: 'تٰـ', pronunciation: 'تَا أَلِف صَغِيرَة (تَا)', breakdown: 'ت + ٰ', note: 'مد طبيعي حركتان', quranicReference: 'سورة الفاتحة: الصِّرَاطَ' },
      { text: 'ذٰلِكَ', pronunciation: 'ذَال أَلِف صَغِيرَة (ذَا) • لَام كَسْرَة (لِ) -> (ذَالِ) • كَاف فَتْحَة (كَ) -> (ذٰلِكَ)', breakdown: 'ذَا + لِ + كَ', note: 'ألف خنجرية بعد الذال محذوفة في الرسم مثبتة في اللفظ', quranicReference: 'سورة البقرة: ذَٰلِكَ الْكِتَابُ' },
      { text: 'مٰلِكِ', pronunciation: 'مِيم أَلِف صَغِيرَة (مَا) • لَام كَسْرَة (لِ) -> (مَالِ) • كَاف كَسْرَة (كِ) -> (مٰلِكِ)', breakdown: 'مَا + لِ + كِ', note: 'مد الألف حركتين', quranicReference: 'سورة الفاتحة: مَالِكِ يَوْمِ الدِّينِ' },
      { text: 'هٰذَا', pronunciation: 'هَا أَلِف صَغِيرَة (هَا) • ذَال أَلِف (ذَا) -> (هٰذَا)', breakdown: 'هَا + ذَا', note: 'مدان طبيعيان حركتان لكل منهما', quranicReference: 'سورة البقرة: هَٰذَا الَّذِي' },
      { text: 'دَاوُۥدَ', pronunciation: 'دَال أَلِف (دَا) • وَاو ضَمَّة وَاو صَغِيرَة (وُو) -> (دَاوُو) • دَال فَتْحَة (دَ) -> (دَاوُۥدَ)', breakdown: 'دَا + وُو + دَ', note: 'واو صغيرة مدية تسمى مد التمكين لمنع توالي مثلين في الرسم', quranicReference: 'سورة البقرة: وَقَتَلَ دَاوُودُ جَالُوتَ' }
    ]
  },
  {
    id: 8,
    audioUrl: "https://archive.org/download/alnawrania1-17/n8.mp3",
    title: 'الدرس الثامن: حُرُوفُ المَدِّ وَاللِّينِ',
    subtitle: 'الأَلِفُ وَالوَاوُ وَاليَاءُ السَّاكِنَة',
    description: 'التمييز بين حروف المد (ساكنة وقبلها حركة مجانسة) وحروف اللين (واو وياء ساكنتان قبلهما فتح).',
    importance: 'ضبط مقادير المدود وأزمنتها في القرآن الكريم وتفادي بتر حروف المد.',
    category: 'madd',
    learningPoints: [
      'حروف المد الثلاثة: ألف ساكنة مفتوح ما قبلها، واو ساكنة مضموم ما قبلها، ياء ساكنة مكسور ما قبلها.',
      'حرفا اللين: واو وياء ساكنتان مفتوح ما قبلهما (خَوْف، بَيْت).',
      'يمد اللين عند الوقف حركتين أو 4 أو 6 حركات (مد لين عارض للسكون).'
    ],
    items: [
      { text: 'بَا بُو بِي', pronunciation: 'بَا أَلِف سُكُون (بَا) • بَا وَاو سُكُون (بُو) • بَا يَاء سُكُون (بِي)', breakdown: 'بَا - بُو - بِي', note: 'حروف المد الثلاثة مع الباء المرققة', quranicReference: 'قَالُوا • قِيلَ' },
      { text: 'تَا تُو تِي', pronunciation: 'تَا أَلِف (تَا) • تَا وَاو (تُو) • تَا يَاء (تِي)', breakdown: 'تَا - تُو - تِي', note: 'مد طبيعي حركتان لكل منها', quranicReference: 'تُوبُوا • تِينِ' },
      { text: 'بَوْ بَيْ', pronunciation: 'بَا وَاو سُكُون (بَوْ) • بَا يَاء سُكُون (بَيْ)', breakdown: 'بَوْ - بَيْ', note: 'حرفا اللين مع الباء بسكون ورخاوة ولين', quranicReference: 'قَوْمٌ • بَيْتٍ' },
      { text: 'خَوْفٍ', pronunciation: 'خَا وَاو سُكُون (خَوْ) • فَا كَسْرَتَانِ (فٍ) -> (خَوْفٍ)', breakdown: 'خَوْ + فٍ', note: 'واو لين قبلها مفتوح', quranicReference: 'سورة قريش: وَآمَنَهُم مِّنْ خَوْفٍ' },
      { text: 'بَيْتٍ', pronunciation: 'بَا يَاء سُكُون (بَيْ) • تَا كَسْرَتَانِ (تٍ) -> (بَيْتٍ)', breakdown: 'بَيْ + تٍ', note: 'ياء لين قبلها مفتوح', quranicReference: 'سورة قريش: رَبَّ هَٰذَا الْبَيْتِ' }
    ]
  },
  {
    id: 9,
    audioUrl: "https://archive.org/download/alnawrania1-17/n9.mp3",
    title: 'الدرس التاسع: السُّكُونُ وَحُرُوفُ القَلْقَلَةِ',
    subtitle: 'العلامة الدالة على سكون الحرف وحروف (قُطْبُ جَدٍ)',
    description: 'رأس الخاء الصغيرة في المصحف الدالة على سكون الحرف، وأحكام القلقلة الخمسة.',
    importance: 'القلقلة هي اضطراب المخرج عند نطق الحرف ساكناً ليسمع له نبرة قوية تميزه.',
    category: 'sukoon',
    learningPoints: [
      'حروف القلقلة خمسة مجموعة في كلمة: (قُطْبُ جَدٍ: ق، ط، ب، ج، د).',
      'مراتب القلقلة: كبرى عند الوقف على المشدد (وَتَبَّ)، ووسطى عند الوقف على الساكن (مُحِيطْ، أَحَدْ)، وصغرى في وسط الكلمة (يَقْطَعُونَ، خَلَقْنَا).',
      'طريقة التهجي: (همزة فتحة با سكون أَبْ، همزة كسرة با سكون إِبْ، أَبْ إِبْ، همزة ضمة با سكون أُبْ، أَبْ إِبْ أُبْ).'
    ],
    items: [
      { text: 'أَبْ إِبْ أُبْ', pronunciation: 'ءَ فَتْحَة بَا سُكُون (أَبْ) • ءِ كَسْرَة بَا سُكُون (إِبْ) • ءُ ضَمَّة بَا سُكُون (أُبْ)', breakdown: 'أَبْ - إِبْ - أُبْ', note: 'قلقلة الباء باضطراب المخرج دون إمالة لفتح أو كسر', quranicReference: 'أَبْصَارِهِمْ • إِبْرَاهِيمَ' },
      { text: 'أَتْ إِتْ أُتْ', pronunciation: 'ءَ فَتْحَة تَا سُكُون (أَتْ) • ءِ كَسْرَة تَا سُكُون (إِتْ) • ءُ ضَمَّة تَا سُكُون (أُتْ)', breakdown: 'أَتْ - إِتْ - أُتْ', note: 'حبس الصوت في التاء ثم إطلاق الهمس اللطيف', quranicReference: 'فِتْنَةٌ • إِتْمَامٍ' },
      { text: 'أَجْ إِجْ أُجْ', pronunciation: 'ءَ فَتْحَة جِيم سُكُون (أَجْ) • ءِ كَسْرَة جِيم سُكُون (إِجْ) • ءُ ضَمَّة جِيم سُكُون (أُجْ)', breakdown: 'أَجْ - إِجْ - أُجْ', note: 'قلقلة الجيم الصافية دون جريان هواء', quranicReference: 'أَجْرٌ • نَجْعَلُ' },
      { text: 'أَدْ إِدْ أُدْ', pronunciation: 'ءَ فَتْحَة دَال سُكُون (أَدْ) • ءِ كَسْرَة دَال سُكُون (إِدْ) • ءُ ضَمَّة دَال سُكُون (أُدْ)', breakdown: 'أَدْ - إِدْ - أُدْ', note: 'قلقلة الدال المرققة', quranicReference: 'قُلْ هُوَ اللَّهُ أَحَدٌ' },
      { text: 'أَطْ إِطْ أُطْ', pronunciation: 'ءَ فَتْحَة طَا سُكُون (أَطْ) • ءِ كَسْرَة طَا سُكُون (إِطْ) • ءُ ضَمَّة طَا سُكُون (أُطْ)', breakdown: 'أَطْ - إِطْ - أُطْ', note: 'قلقلة الطاء المفخمة المطبقة بقوة', quranicReference: 'أَطْعَمَهُم • يُطْعِمُ' },
      { text: 'أَقْ إِقْ أُقْ', pronunciation: 'ءَ فَتْحَة قَاف سُكُون (أَقْ) • ءِ كَسْرَة قَاف سُكُون (إِقْ) • ءُ ضَمَّة قَاف سُكُون (أُقْ)', breakdown: 'أَقْ - إِقْ - أُقْ', note: 'قلقلة القاف المفخمة من أقصى اللسان', quranicReference: 'اقْرَأْ بِاسْمِ رَبِّكَ' }
    ]
  },
  {
    id: 10,
    audioUrl: "https://archive.org/download/alnawrania1-17/n10.mp3",
    title: 'الدرس العاشر: الشَّدَّةُ (الحَرْفُ المُشَدَّدُ)',
    subtitle: 'حرفان أولهما ساكن وثانيهما متحرك أُدغما فصارا حرفاً واحداً كالثاني',
    description: 'رأس السين الصغيرة الدالة على التضعيف، وكيفية بيان قوة الحرف المشدد.',
    importance: 'إسقاط الشدة في القرآن يغير المعنى تماماً ويعد لحناً جلياً.',
    category: 'shaddah',
    learningPoints: [
      'الحرف المشدد = حرف ساكن + حرف متحرك (بَّ = بْ + بَ).',
      'النون والميم المشددتان فيهما غنة بمقدار حركتين تسمى الغنة الأكمل (إِنَّ، عَمَّ).',
      'طريقة التهجي: (أَبَّ: همزة فتحة با شدة فتحة أَبَّ، أَبِّ: همزة فتحة با شدة كسرة أَبِّ، أَبُّ: همزة فتحة با شدة ضمة أَبُّ).'
    ],
    items: [
      { text: 'أَبَّ أَبِّ أَبُّ', pronunciation: 'ءَ فَتْحَة بَا شَدَّة فَتْحَة (أَبَّ) • ءِ فَتْحَة بَا شَدَّة كَسْرَة (أَبِّ) • ءُ فَتْحَة بَا شَدَّة ضَمَّة (أَبُّ)', breakdown: 'أَبْ + بَ / أَبْ + بِ / أَبْ + بُ', note: 'انطباق الشفتين أولاً في الساكن ثم فتحهما في المتحرك بقوة', quranicReference: 'وَفَاكِهَةً وَأَبًّا • رَبِّ' },
      { text: 'إِنَّ أَنَّ', pronunciation: 'ءِ كَسْرَة نُون شَدَّة فَتْحَة (إِنَّ) • ءَ فَتْحَة نُون شَدَّة فَتْحَة (أَنَّ)', breakdown: 'إِنْ + نَ', note: 'غنة أكمل ما تكون بمقدار حركتين من الخيشوم', quranicReference: 'سورة الناس: قُلْ أَعُوذُ بِرَبِّ النَّاسِ' },
      { text: 'عَمَّ ثُمَّ', pronunciation: 'عَيْن فَتْحَة مِيم شَدَّة فَتْحَة (عَمَّ) • ثَا ضَمَّة مِيم شَدَّة فَتْحَة (ثُمَّ)', breakdown: 'عَمْ + مَ / ثُمْ + مَ', note: 'غنة الميم المشددة حركتان', quranicReference: 'سورة النبأ: عَمَّ يَتَسَاءَلُونَ' },
      { text: 'الرَّحْمٰنُ', pronunciation: 'أَلِف لَام شَمْسِيَّة مُدْغَمَة فِي الرَّاءِ شَدَّة فَتْحَة (أَرَّ)', breakdown: 'أَرْ + رَ + حْ + مَـٰ + نُ', note: 'اللام الشمسية تدغم في الراء المشددة', quranicReference: 'سورة الفاتحة: الرَّحْمَٰنِ الرَّحِيمِ' }
    ]
  },
  {
    id: 11,
    audioUrl: "https://archive.org/download/alnawrania1-17/n11.mp3",
    title: 'الدرس الحادي عشر: تَدْرِيبَاتٌ عَلَى الشَّدَّةِ مَعَ السُّكُونِ وَالمَدِّ',
    subtitle: 'أعلى مراتب الإتقان في جمع أحكام التجويد في كلمات قرآنية كاملة',
    description: 'التدريب على قراءة الكلمات الكبرى في القرآن التي تجتمع فيها الشدة مع المد اللازم والسكون.',
    importance: 'القمة المنهجية للقاعدة النورانية التي تؤهل لقراءة أي آية في كتاب الله مباشرة.',
    category: 'words',
    learningPoints: [
      'المد اللازم الكلمي المثقل: حرف مد بعده حرف مشدد يمد ٦ حركات وجوباً (الحَاقَّة، الضَّالِّينَ، الصَّاخَّة).',
      'النبر عند الوقف على المشدد لتنبيه السامع إلى أن الحرف مضاعف.',
      'التفريق بين اللام القمرية المظهرة واللام الشمسية المدغمة.'
    ],
    items: [
      { text: 'الضَّالِّينَ', pronunciation: 'أَلِف لَام شَمْسِيَّة مُدْغَمَة فِي الضَّادِ شَدَّة فَتْحَة أَلِف مَدّ لَازِم (٦ حركات) (أَضَّاااااا) • لَام شَدَّة كَسْرَة يَاء سُكُون (لِّي) • نُون فَتْحَة (نَ) -> (الضَّالِّينَ)', breakdown: 'أَضْ + ضَا (٦ حركات) + لِّي + نَ', note: 'مد لازم كلمي مثقل ٦ حركات مع غلظة الضاد وكسر اللام المشددة', quranicReference: 'سورة الفاتحة: غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ' },
      { text: 'الحَاقَّةُ', pronunciation: 'أَلِف لَام قَمَرِيَّة (الْـ) • حَا أَلِف مَدّ لَازِم (٦ حركات) قَاف شَدَّة فَتْحَة (حَاقَّـ) • تَاء ضَمَّة (تُ) -> (الْحَاقَّةُ)', breakdown: 'الْـ + حَا (٦) + قَّـ + تُ', note: 'مد لازم كلمي مثقل مع تفخيم القاف المشددة', quranicReference: 'سورة الحاقة: الْحَاقَّةُ مَا الْحَاقَّةُ' },
      { text: 'الصَّاخَّةُ', pronunciation: 'أَلِف لَام شَمْسِيَّة (الصَّـ) • صَاد أَلِف مَدّ لَازِم (٦ حركات) خَا شَدَّة فَتْحَة (صَاخَّـ) • تَاء ضَمَّة (تُ) -> (الصَّاخَّةُ)', breakdown: 'الصَّا (٦) + خَّـ + تُ', note: 'إطباق وتفخيم الصاد والخاء مع المد المشبع', quranicReference: 'سورة عبس: فَإِذَا جَاءَتِ الصَّاخَّةُ' },
      { text: 'تَبَّتْ يَدَا', pronunciation: 'تَا فَتْحَة بَا شَدَّة فَتْحَة (تَبَّ) • تَاء سُكُون مع الهمس (تَبَّتْ)', breakdown: 'تَبْ + بَ + تْ', note: 'بيان الشدة في الباء والهمس في التاء', quranicReference: 'سورة المسد: تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ' }
    ]
  }
];

// نصائح ذهبية للمتعلم والمعلم في التجويد والقاعدة النورانية
export const NOORANIYAH_TIPS = [
  {
    title: 'سر القراءة الصحيحة',
    content: 'القاعدة النورانية تؤخذ بالتلقي والمشافهة من فم المتقن، لضبط مخارج الحروف وصفاتها كما أُنزلت على رسول الله ﷺ.'
  },
  {
    title: 'رياضة اللسان والفكين',
    content: 'كما قال الإمام ابن الجزري رحمه الله: (وَلَيْسَ بَيْنَهُ وَبَيْنَ تَرْكِهِ • إِلَّا رِيَاضَةُ امْرِئٍ بِفَكِّهِ).'
  },
  {
    title: 'ميزان الحركات',
    content: 'الحركات الثلاث متساوية في الأزمنة، فزمن الفتحة كزمن الكسرة كزمن الضمة، دون تمطيط أو سرعة تخل بالحرف.'
  },
  {
    title: 'الغنة صوت لا حرف',
    content: 'صوت رخيم يخرج من الخيشوم كصوت الغزال، مقداره حركتان لا يزيد ولا ينقص عند الإتقان.'
  }
];

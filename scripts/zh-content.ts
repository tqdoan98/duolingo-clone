// HSK 1 vocabulary organized into 5 units × 5 lessons × 6 words (150 words total)

export type Word = {
  chinese: string; // simplified characters
  pinyin: string;  // tone-marked pinyin
  english: string; // primary English meaning
  slug: string;    // used for audio filename: /zh_{slug}.mp3
};

export type ChineseLesson = {
  title: string;
  words: [Word, Word, Word, Word, Word, Word];
};

export type ChineseUnit = {
  title: string;
  description: string;
  lessons: ChineseLesson[];
};

export const ZH_UNITS: ChineseUnit[] = [
  // ─── Unit 1: Greetings & Essentials ───────────────────────────────────────
  {
    title: "Unit 1",
    description: "Greetings, pronouns, numbers, and question words",
    lessons: [
      {
        title: "Greetings",
        words: [
          { chinese: "你好",   pinyin: "nǐ hǎo",    english: "hello",         slug: "hello" },
          { chinese: "再见",   pinyin: "zài jiàn",  english: "goodbye",       slug: "goodbye" },
          { chinese: "谢谢",   pinyin: "xiè xie",   english: "thank you",     slug: "thank_you" },
          { chinese: "对不起", pinyin: "duì bu qǐ", english: "sorry",         slug: "sorry" },
          { chinese: "不客气", pinyin: "bú kè qi",  english: "you're welcome",slug: "youre_welcome" },
          { chinese: "请",     pinyin: "qǐng",      english: "please",        slug: "please" },
        ],
      },
      {
        title: "Pronouns",
        words: [
          { chinese: "我",   pinyin: "wǒ",    english: "I / me",    slug: "i" },
          { chinese: "你",   pinyin: "nǐ",    english: "you",       slug: "you" },
          { chinese: "他",   pinyin: "tā",    english: "he / him",  slug: "he" },
          { chinese: "她",   pinyin: "tā",    english: "she / her", slug: "she" },
          { chinese: "我们", pinyin: "wǒ men",english: "we / us",   slug: "we" },
          { chinese: "你们", pinyin: "nǐ men",english: "you all",   slug: "you_all" },
        ],
      },
      {
        title: "Numbers 1–6",
        words: [
          { chinese: "一", pinyin: "yī",  english: "one",   slug: "one" },
          { chinese: "二", pinyin: "èr",  english: "two",   slug: "two" },
          { chinese: "三", pinyin: "sān", english: "three", slug: "three" },
          { chinese: "四", pinyin: "sì",  english: "four",  slug: "four" },
          { chinese: "五", pinyin: "wǔ",  english: "five",  slug: "five" },
          { chinese: "六", pinyin: "liù", english: "six",   slug: "six" },
        ],
      },
      {
        title: "Numbers 7–10",
        words: [
          { chinese: "七",   pinyin: "qī",     english: "seven",      slug: "seven" },
          { chinese: "八",   pinyin: "bā",     english: "eight",      slug: "eight" },
          { chinese: "九",   pinyin: "jiǔ",    english: "nine",       slug: "nine" },
          { chinese: "十",   pinyin: "shí",    english: "ten",        slug: "ten" },
          { chinese: "百",   pinyin: "bǎi",    english: "hundred",    slug: "hundred" },
          { chinese: "多少", pinyin: "duō shao",english: "how much",  slug: "how_much" },
        ],
      },
      {
        title: "Question Words",
        words: [
          { chinese: "什么", pinyin: "shén me",  english: "what",      slug: "what" },
          { chinese: "谁",   pinyin: "shuí",     english: "who",       slug: "who" },
          { chinese: "哪",   pinyin: "nǎ",       english: "which",     slug: "which" },
          { chinese: "哪儿", pinyin: "nǎr",      english: "where",     slug: "where" },
          { chinese: "怎么", pinyin: "zěn me",   english: "how",       slug: "how" },
          { chinese: "几",   pinyin: "jǐ",       english: "how many",  slug: "how_many" },
        ],
      },
    ],
  },

  // ─── Unit 2: People & Family ──────────────────────────────────────────────
  {
    title: "Unit 2",
    description: "Family, relationships, identity, and essential verbs",
    lessons: [
      {
        title: "Family",
        words: [
          { chinese: "爸爸", pinyin: "bà ba",   english: "father",         slug: "father" },
          { chinese: "妈妈", pinyin: "mā ma",   english: "mother",         slug: "mother" },
          { chinese: "哥哥", pinyin: "gē ge",   english: "older brother",  slug: "older_brother" },
          { chinese: "弟弟", pinyin: "dì di",   english: "younger brother",slug: "younger_brother" },
          { chinese: "姐姐", pinyin: "jiě jie", english: "older sister",   slug: "older_sister" },
          { chinese: "妹妹", pinyin: "mèi mei", english: "younger sister", slug: "younger_sister" },
        ],
      },
      {
        title: "Relationships",
        words: [
          { chinese: "朋友", pinyin: "péng you",  english: "friend",    slug: "friend" },
          { chinese: "老师", pinyin: "lǎo shī",   english: "teacher",   slug: "teacher" },
          { chinese: "学生", pinyin: "xué sheng", english: "student",   slug: "student" },
          { chinese: "同学", pinyin: "tóng xué",  english: "classmate", slug: "classmate" },
          { chinese: "医生", pinyin: "yī shēng",  english: "doctor",    slug: "doctor" },
          { chinese: "先生", pinyin: "xiān sheng",english: "mister",    slug: "mister" },
        ],
      },
      {
        title: "Identity",
        words: [
          { chinese: "名字", pinyin: "míng zi",  english: "name",        slug: "name" },
          { chinese: "叫",   pinyin: "jiào",     english: "to be called",slug: "called" },
          { chinese: "认识", pinyin: "rèn shi",  english: "to know",     slug: "know" },
          { chinese: "岁",   pinyin: "suì",      english: "years old",   slug: "years_old" },
          { chinese: "生日", pinyin: "shēng rì", english: "birthday",    slug: "birthday" },
          { chinese: "国家", pinyin: "guó jiā",  english: "country",     slug: "country" },
        ],
      },
      {
        title: "Core Verbs I",
        words: [
          { chinese: "是", pinyin: "shì",  english: "to be",     slug: "be" },
          { chinese: "有", pinyin: "yǒu",  english: "to have",   slug: "have" },
          { chinese: "在", pinyin: "zài",  english: "to be at",  slug: "be_at" },
          { chinese: "去", pinyin: "qù",   english: "to go",     slug: "go" },
          { chinese: "来", pinyin: "lái",  english: "to come",   slug: "come" },
          { chinese: "回", pinyin: "huí",  english: "to return", slug: "return" },
        ],
      },
      {
        title: "Core Verbs II",
        words: [
          { chinese: "吃", pinyin: "chī",  english: "to eat",    slug: "eat" },
          { chinese: "喝", pinyin: "hē",   english: "to drink",  slug: "drink" },
          { chinese: "看", pinyin: "kàn",  english: "to see",    slug: "see" },
          { chinese: "说", pinyin: "shuō", english: "to speak",  slug: "speak" },
          { chinese: "听", pinyin: "tīng", english: "to listen", slug: "listen" },
          { chinese: "做", pinyin: "zuò",  english: "to do",     slug: "do" },
        ],
      },
    ],
  },

  // ─── Unit 3: Daily Life ───────────────────────────────────────────────────
  {
    title: "Unit 3",
    description: "Food, time, places, transport, and everyday objects",
    lessons: [
      {
        title: "Food & Drink",
        words: [
          { chinese: "水",   pinyin: "shuǐ",     english: "water", slug: "water" },
          { chinese: "茶",   pinyin: "chá",      english: "tea",   slug: "tea" },
          { chinese: "饭",   pinyin: "fàn",      english: "rice",  slug: "rice" },
          { chinese: "菜",   pinyin: "cài",      english: "dish",  slug: "dish" },
          { chinese: "苹果", pinyin: "píng guǒ", english: "apple", slug: "apple" },
          { chinese: "肉",   pinyin: "ròu",      english: "meat",  slug: "meat" },
        ],
      },
      {
        title: "Time",
        words: [
          { chinese: "今天", pinyin: "jīn tiān",  english: "today",     slug: "today" },
          { chinese: "明天", pinyin: "míng tiān", english: "tomorrow",  slug: "tomorrow" },
          { chinese: "昨天", pinyin: "zuó tiān",  english: "yesterday", slug: "yesterday" },
          { chinese: "现在", pinyin: "xiàn zài",  english: "now",       slug: "now" },
          { chinese: "上午", pinyin: "shàng wǔ",  english: "morning",   slug: "morning" },
          { chinese: "下午", pinyin: "xià wǔ",    english: "afternoon", slug: "afternoon" },
        ],
      },
      {
        title: "Places",
        words: [
          { chinese: "学校", pinyin: "xué xiào",  english: "school",     slug: "school" },
          { chinese: "医院", pinyin: "yī yuàn",   english: "hospital",   slug: "hospital" },
          { chinese: "家",   pinyin: "jiā",       english: "home",       slug: "home" },
          { chinese: "饭店", pinyin: "fàn diàn",  english: "restaurant", slug: "restaurant" },
          { chinese: "商店", pinyin: "shāng diàn",english: "store",      slug: "store" },
          { chinese: "中国", pinyin: "Zhōng guó", english: "China",      slug: "china" },
        ],
      },
      {
        title: "Transport",
        words: [
          { chinese: "出租车",   pinyin: "chū zū chē",      english: "taxi",     slug: "taxi" },
          { chinese: "飞机",     pinyin: "fēi jī",          english: "airplane", slug: "airplane" },
          { chinese: "火车",     pinyin: "huǒ chē",         english: "train",    slug: "train" },
          { chinese: "汽车",     pinyin: "qì chē",          english: "car",      slug: "car" },
          { chinese: "公共汽车", pinyin: "gōng gòng qì chē",english: "bus",      slug: "bus" },
          { chinese: "地铁",     pinyin: "dì tiě",          english: "subway",   slug: "subway" },
        ],
      },
      {
        title: "Objects",
        words: [
          { chinese: "书",   pinyin: "shū",      english: "book",      slug: "book" },
          { chinese: "电脑", pinyin: "diàn nǎo", english: "computer",  slug: "computer" },
          { chinese: "手机", pinyin: "shǒu jī",  english: "phone",     slug: "phone" },
          { chinese: "电话", pinyin: "diàn huà", english: "telephone", slug: "telephone" },
          { chinese: "钱",   pinyin: "qián",     english: "money",     slug: "money" },
          { chinese: "衣服", pinyin: "yī fu",    english: "clothes",   slug: "clothes" },
        ],
      },
    ],
  },

  // ─── Unit 4: Descriptions ─────────────────────────────────────────────────
  {
    title: "Unit 4",
    description: "Adjectives, feelings, more verbs, and common expressions",
    lessons: [
      {
        title: "Size & Temperature",
        words: [
          { chinese: "大", pinyin: "dà",  english: "big",   slug: "big" },
          { chinese: "小", pinyin: "xiǎo",english: "small", slug: "small" },
          { chinese: "多", pinyin: "duō", english: "many",  slug: "many" },
          { chinese: "少", pinyin: "shǎo",english: "few",   slug: "few" },
          { chinese: "冷", pinyin: "lěng",english: "cold",  slug: "cold" },
          { chinese: "热", pinyin: "rè",  english: "hot",   slug: "hot" },
        ],
      },
      {
        title: "Feelings",
        words: [
          { chinese: "高兴", pinyin: "gāo xìng",   english: "happy",     slug: "happy" },
          { chinese: "累",   pinyin: "lèi",         english: "tired",     slug: "tired" },
          { chinese: "漂亮", pinyin: "piào liang",  english: "beautiful", slug: "beautiful" },
          { chinese: "好吃", pinyin: "hǎo chī",     english: "delicious", slug: "delicious" },
          { chinese: "太",   pinyin: "tài",         english: "too / very",slug: "too" },
          { chinese: "很",   pinyin: "hěn",         english: "very",      slug: "very" },
        ],
      },
      {
        title: "More Verbs",
        words: [
          { chinese: "买",   pinyin: "mǎi",    english: "to buy",   slug: "buy" },
          { chinese: "喜欢", pinyin: "xǐ huan",english: "to like",  slug: "like" },
          { chinese: "想",   pinyin: "xiǎng",  english: "to want",  slug: "want" },
          { chinese: "会",   pinyin: "huì",    english: "can",      slug: "can" },
          { chinese: "能",   pinyin: "néng",   english: "able to",  slug: "able" },
          { chinese: "写",   pinyin: "xiě",    english: "to write", slug: "write" },
        ],
      },
      {
        title: "Work & Actions",
        words: [
          { chinese: "工作", pinyin: "gōng zuò", english: "work",     slug: "work" },
          { chinese: "学习", pinyin: "xué xí",   english: "to study", slug: "study" },
          { chinese: "打",   pinyin: "dǎ",       english: "to hit",   slug: "hit" },
          { chinese: "开",   pinyin: "kāi",      english: "to open",  slug: "open" },
          { chinese: "住",   pinyin: "zhù",      english: "to live",  slug: "live" },
          { chinese: "坐",   pinyin: "zuò",      english: "to sit",   slug: "sit" },
        ],
      },
      {
        title: "Expressions",
        words: [
          { chinese: "好的",   pinyin: "hǎo de",      english: "okay",       slug: "okay" },
          { chinese: "没关系", pinyin: "méi guān xi", english: "never mind", slug: "never_mind" },
          { chinese: "不",     pinyin: "bù",          english: "no / not",   slug: "no" },
          { chinese: "没有",   pinyin: "méi yǒu",     english: "don't have", slug: "dont_have" },
          { chinese: "也",     pinyin: "yě",          english: "also / too", slug: "also" },
          { chinese: "都",     pinyin: "dōu",         english: "all / both", slug: "all" },
        ],
      },
    ],
  },

  // ─── Unit 5: The World Around You ─────────────────────────────────────────
  {
    title: "Unit 5",
    description: "Animals, weather, colors, time details, and directions",
    lessons: [
      {
        title: "Animals",
        words: [
          { chinese: "猫", pinyin: "māo",  english: "cat",   slug: "cat" },
          { chinese: "狗", pinyin: "gǒu",  english: "dog",   slug: "dog" },
          { chinese: "鸟", pinyin: "niǎo", english: "bird",  slug: "bird" },
          { chinese: "鱼", pinyin: "yú",   english: "fish",  slug: "fish" },
          { chinese: "牛", pinyin: "niú",  english: "cow",   slug: "cow" },
          { chinese: "马", pinyin: "mǎ",   english: "horse", slug: "horse" },
        ],
      },
      {
        title: "Weather & Time",
        words: [
          { chinese: "天气", pinyin: "tiān qì", english: "weather", slug: "weather" },
          { chinese: "下雨", pinyin: "xià yǔ",  english: "to rain", slug: "rain" },
          { chinese: "下雪", pinyin: "xià xuě", english: "to snow", slug: "snow" },
          { chinese: "年",   pinyin: "nián",    english: "year",    slug: "year" },
          { chinese: "月",   pinyin: "yuè",     english: "month",   slug: "month" },
          { chinese: "星期", pinyin: "xīng qī", english: "week",    slug: "week" },
        ],
      },
      {
        title: "Colors",
        words: [
          { chinese: "红色", pinyin: "hóng sè", english: "red",    slug: "red" },
          { chinese: "蓝色", pinyin: "lán sè",  english: "blue",   slug: "blue" },
          { chinese: "绿色", pinyin: "lǜ sè",   english: "green",  slug: "green" },
          { chinese: "黄色", pinyin: "huáng sè",english: "yellow", slug: "yellow" },
          { chinese: "白色", pinyin: "bái sè",  english: "white",  slug: "white" },
          { chinese: "黑色", pinyin: "hēi sè",  english: "black",  slug: "black" },
        ],
      },
      {
        title: "Time Details",
        words: [
          { chinese: "点",   pinyin: "diǎn",     english: "o'clock", slug: "oclock" },
          { chinese: "分钟", pinyin: "fēn zhōng",english: "minute",  slug: "minute" },
          { chinese: "小时", pinyin: "xiǎo shí", english: "hour",    slug: "hour" },
          { chinese: "半",   pinyin: "bàn",      english: "half",    slug: "half" },
          { chinese: "号",   pinyin: "hào",      english: "date",    slug: "date" },
          { chinese: "中午", pinyin: "zhōng wǔ", english: "noon",    slug: "noon" },
        ],
      },
      {
        title: "Directions",
        words: [
          { chinese: "晚上", pinyin: "wǎn shang",  english: "evening",  slug: "evening" },
          { chinese: "前面", pinyin: "qián mian",  english: "in front", slug: "in_front" },
          { chinese: "后面", pinyin: "hòu mian",   english: "behind",   slug: "behind" },
          { chinese: "里",   pinyin: "lǐ",         english: "inside",   slug: "inside" },
          { chinese: "上面", pinyin: "shàng mian", english: "above",    slug: "above" },
          { chinese: "外面", pinyin: "wài mian",   english: "outside",  slug: "outside" },
        ],
      },
    ],
  },
];

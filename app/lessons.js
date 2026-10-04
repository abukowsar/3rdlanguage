export const UNITS = [
  {
    id: "greet",
    bn: "শুভেচ্ছা ও পরিচয়",
    items: [
      ["হ্যালো / শুভেচ্ছা", "Hello"],
      ["ধন্যবাদ", "Thank you"],
      ["বিদায়", "Goodbye"],
      ["আমার নাম …", "My name is …"],
      ["দুঃখিত / মাফ করবেন", "Sorry / Excuse me"],
      ["পরিচিত হয়ে খুশি হলাম", "Nice to meet you"],
    ],
  },
  {
    id: "num",
    bn: "সংখ্যা",
    items: [["এক", "One"], ["দুই", "Two"], ["তিন", "Three"], ["চার", "Four"], ["পাঁচ", "Five"], ["দশ", "Ten"]],
  },
  {
    id: "work",
    bn: "ক্যাম্পাস ও কর্মক্ষেত্র",
    items: [
      ["আমি একজন শিক্ষার্থী", "I am a student"],
      ["আমি একজন প্রকৌশলী", "I am an engineer"],
      ["বিশ্ববিদ্যালয়", "University"],
      ["কাজ / চাকরি", "Work / job"],
      ["শিক্ষক", "Teacher"],
      ["অনুগ্রহ করে আবার বলুন", "Please say that again"],
    ],
  },
];

export const LANGUAGES = [
  {
    id: "zh", glyph: "中", native: "中文", bn: "ম্যান্ডারিন", tts: "zh-CN", dir: "ltr",
    lessons: {
      greet: [["你好", "nǐ hǎo"], ["谢谢", "xièxie"], ["再见", "zàijiàn"], ["我叫…", "wǒ jiào …"], ["对不起", "duìbuqǐ"], ["很高兴认识你", "hěn gāoxìng rènshi nǐ"]],
      num: [["一", "yī"], ["二", "èr"], ["三", "sān"], ["四", "sì"], ["五", "wǔ"], ["十", "shí"]],
      work: [["我是学生", "wǒ shì xuésheng"], ["我是工程师", "wǒ shì gōngchéngshī"], ["大学", "dàxué"], ["工作", "gōngzuò"], ["老师", "lǎoshī"], ["请再说一遍", "qǐng zài shuō yí biàn"]],
    },
  },
  {
    id: "ja", glyph: "日", native: "日本語", bn: "জাপানি", tts: "ja-JP", dir: "ltr",
    lessons: {
      greet: [["こんにちは", "konnichiwa"], ["ありがとうございます", "arigatō gozaimasu"], ["さようなら", "sayōnara"], ["私の名前は…です", "watashi no namae wa … desu"], ["すみません", "sumimasen"], ["はじめまして", "hajimemashite"]],
      num: [["一", "ichi"], ["二", "ni"], ["三", "san"], ["四", "yon"], ["五", "go"], ["十", "jū"]],
      work: [["私は学生です", "watashi wa gakusei desu"], ["私はエンジニアです", "watashi wa enjinia desu"], ["大学", "daigaku"], ["仕事", "shigoto"], ["先生", "sensei"], ["もう一度お願いします", "mō ichido onegaishimasu"]],
    },
  },
  {
    id: "de", glyph: "De", native: "Deutsch", bn: "জার্মান", tts: "de-DE", dir: "ltr",
    lessons: {
      greet: [["Hallo", "হা-লো"], ["Danke", "ডান-কে"], ["Auf Wiedersehen", "আউফ ভি-ডার-জে-এন"], ["Ich heiße …", "ইশ হাই-সে …"], ["Entschuldigung", "এন্ট-শুল-ডি-গুং"], ["Freut mich", "ফ্রয়ট মিশ"]],
      num: [["eins", "আইন্স"], ["zwei", "ৎসভাই"], ["drei", "দ্রাই"], ["vier", "ফিয়া"], ["fünf", "ফ্যুনফ"], ["zehn", "ৎসেন"]],
      work: [["Ich bin Student(in)", "ইশ বিন শ্টু-ডেন্ট"], ["Ich bin Ingenieur(in)", "ইশ বিন ইন-ঝে-নিয়্যোর"], ["die Universität", "ডি উ-নি-ভের-জি-টেট"], ["die Arbeit", "ডি আর-বাইট"], ["Lehrer(in)", "লে-রার"], ["Können Sie das bitte wiederholen?", "ক্যোনেন জি ডাস বিটে ভিডারহোলেন?"]],
    },
  },
  {
    id: "ko", glyph: "한", native: "한국어", bn: "কোরিয়ান", tts: "ko-KR", dir: "ltr",
    lessons: {
      greet: [["안녕하세요", "annyeonghaseyo"], ["감사합니다", "gamsahamnida"], ["안녕히 가세요", "annyeonghi gaseyo"], ["제 이름은 …입니다", "je ireumeun … imnida"], ["죄송합니다", "joesonghamnida"], ["만나서 반갑습니다", "mannaseo bangapseumnida"]],
      num: [["일", "il"], ["이", "i"], ["삼", "sam"], ["사", "sa"], ["오", "o"], ["십", "sip"]],
      work: [["저는 학생입니다", "jeoneun haksaeng-imnida"], ["저는 엔지니어입니다", "jeoneun enjinieo-imnida"], ["대학교", "daehakgyo"], ["일자리", "iljari"], ["선생님", "seonsaengnim"], ["다시 말씀해 주세요", "dasi malsseumhae juseyo"]],
    },
  },
  {
    id: "ar", glyph: "ع", native: "العربية", bn: "আরবি", tts: "ar-SA", dir: "rtl",
    lessons: {
      greet: [["مرحبا", "marḥaban"], ["شكرا", "shukran"], ["مع السلامة", "maʿa as-salāma"], ["اسمي …", "ismī …"], ["آسف", "āsif"], ["تشرفنا", "tasharrafnā"]],
      num: [["واحد", "wāḥid"], ["اثنان", "ithnān"], ["ثلاثة", "thalātha"], ["أربعة", "arbaʿa"], ["خمسة", "khamsa"], ["عشرة", "ʿashara"]],
      work: [["أنا طالب", "anā ṭālib"], ["أنا مهندس", "anā muhandis"], ["جامعة", "jāmiʿa"], ["عمل", "ʿamal"], ["معلم", "muʿallim"], ["أعد من فضلك", "aʿid min faḍlak"]],
    },
  },
];
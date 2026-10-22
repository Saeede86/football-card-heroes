// ====== همه کارت‌های بازی Football Card Heroes ======
//
// هر کارت این چیزها رو داره:
//   id        → یه اسم انگلیسی کوتاه که کامپیوتر کارت رو باهاش می‌شناسه
//   name      → اسم بازیکن
//   position  → پست بازیکن (مهاجم، هافبک، مدافع، دروازه‌بان)
//   power     → امتیاز قدرت
//   rarity    → نوع کارت: "legendary" = افسانه‌ای (طلایی)، "rare" = کمیاب (نقره‌ای)، "common" = معمولی (برنزی)
//   country   → کشور بازیکن
//   look      → ظاهر تصویر کارتونی:
//               skin = رنگ پوست، hair = رنگ مو، hairStyle = مدل مو (short, buzz, spiky, curly, long, bald)
//               beard = ریش داره؟، shirt = رنگ پیراهن، trim = رنگ دوم پیراهن
//               stripes = پیراهن راه‌راهه؟، number = شماره پیراهن
//
// برای اضافه کردن یه کارت جدید، یه خط شبیه بقیه کپی کن و عوضش کن!

const CARDS = [
  // ---------- افسانه‌ای (طلایی) ----------
  { id: "messi", name: "مسی", position: "مهاجم", power: 95, rarity: "legendary", country: "آرژانتین",
    look: { skin: "#e8b48f", hair: "#5a3a22", hairStyle: "short", beard: true, shirt: "#75aadb", trim: "#ffffff", stripes: true, numberColor: "#1b2a4a", number: 10 } },
  { id: "ronaldo", name: "رونالدو", position: "مهاجم", power: 94, rarity: "legendary", country: "پرتغال",
    look: { skin: "#d9a27a", hair: "#2b1d14", hairStyle: "spiky", shirt: "#c8102e", trim: "#0b8a4a", numberColor: "#ffffff", number: 7 } },
  { id: "ronaldinho", name: "رونالدینیو", position: "هافبک", power: 93, rarity: "legendary", country: "برزیل",
    look: { skin: "#8d5a3b", hair: "#1a1110", hairStyle: "long", headband: "#ffffff", bigSmile: true, shirt: "#ffdf00", trim: "#009c3b", number: 10 } },
  { id: "suarez", name: "سوارز", position: "مهاجم", power: 91, rarity: "legendary", country: "اروگوئه",
    look: { skin: "#d9a27a", hair: "#2b1d14", hairStyle: "short", beard: true, shirt: "#5cbfeb", trim: "#111111", number: 9 } },
  { id: "yamal", name: "یامال", position: "مهاجم", power: 90, rarity: "legendary", country: "اسپانیا",
    look: { skin: "#a86b4a", hair: "#1a1110", hairStyle: "curly", shirt: "#c60b1e", trim: "#ffc400", number: 19 } },

  // ---------- کمیاب (نقره‌ای) ----------
  { id: "mbappe", name: "امباپه", position: "مهاجم", power: 89, rarity: "rare", country: "فرانسه",
    look: { skin: "#7a4a30", hair: "#1a1110", hairStyle: "buzz", shirt: "#1f2a5c", trim: "#ffffff", number: 10 } },
  { id: "haaland", name: "هالند", position: "مهاجم", power: 88, rarity: "rare", country: "نروژ",
    look: { skin: "#f1c6a6", hair: "#e3c27a", hairStyle: "long", shirt: "#ba0c2f", trim: "#ffffff", number: 9 } },
  { id: "vinicius", name: "وینیسیوس", position: "مهاجم", power: 88, rarity: "rare", country: "برزیل",
    look: { skin: "#6b4026", hair: "#1a1110", hairStyle: "curly", shirt: "#ffdf00", trim: "#009c3b", number: 7 } },
  { id: "salah", name: "صلاح", position: "مهاجم", power: 87, rarity: "rare", country: "مصر",
    look: { skin: "#a86b4a", hair: "#1a1110", hairStyle: "curly", beard: true, shirt: "#ce1126", trim: "#ffffff", number: 10 } },
  { id: "bellingham", name: "بلینگام", position: "هافبک", power: 87, rarity: "rare", country: "انگلیس",
    look: { skin: "#8d5a3b", hair: "#1a1110", hairStyle: "buzz", shirt: "#ffffff", trim: "#1e2a78", number: 10 } },
  { id: "debruyne", name: "دی‌بروینه", position: "هافبک", power: 86, rarity: "rare", country: "بلژیک",
    look: { skin: "#f1c6a6", hair: "#d98c3a", hairStyle: "short", shirt: "#c8102e", trim: "#fdda24", number: 7 } },

  // ---------- معمولی (برنزی) ----------
  { id: "pedri", name: "پدری", position: "هافبک", power: 84, rarity: "common", country: "اسپانیا",
    look: { skin: "#e0ac85", hair: "#2b1d14", hairStyle: "short", shirt: "#c60b1e", trim: "#ffc400", number: 8 } },
  { id: "saka", name: "ساکا", position: "مهاجم", power: 84, rarity: "common", country: "انگلیس",
    look: { skin: "#6b4026", hair: "#1a1110", hairStyle: "buzz", shirt: "#ffffff", trim: "#1e2a78", number: 7 } },
  { id: "musiala", name: "موسیالا", position: "هافبک", power: 84, rarity: "common", country: "آلمان",
    look: { skin: "#8d5a3b", hair: "#1a1110", hairStyle: "curly", shirt: "#ffffff", trim: "#111111", number: 10 } },
  { id: "vandijk", name: "فن‌دایک", position: "مدافع", power: 84, rarity: "common", country: "هلند",
    look: { skin: "#7a4a30", hair: "#1a1110", hairStyle: "buzz", beard: true, shirt: "#f36c21", trim: "#ffffff", number: 4 } },
  { id: "courtois", name: "کورتوا", position: "دروازه‌بان", power: 83, rarity: "common", country: "بلژیک",
    look: { skin: "#f1c6a6", hair: "#4a3020", hairStyle: "short", shirt: "#ffd60a", trim: "#111111", number: 1 } },
  { id: "taremi", name: "طارمی", position: "مهاجم", power: 82, rarity: "common", country: "ایران",
    look: { skin: "#d9a27a", hair: "#2b1d14", hairStyle: "short", beard: true, shirt: "#ffffff", trim: "#da0000", number: 9 } },
  { id: "hakimi", name: "حکیمی", position: "مدافع", power: 82, rarity: "common", country: "مراکش",
    look: { skin: "#c68a63", hair: "#1a1110", hairStyle: "buzz", shirt: "#c1272d", trim: "#006233", number: 2 } },
  { id: "azmoun", name: "آزمون", position: "مهاجم", power: 81, rarity: "common", country: "ایران",
    look: { skin: "#e0ac85", hair: "#2b1d14", hairStyle: "spiky", shirt: "#ffffff", trim: "#da0000", number: 20 } },
  { id: "beiranvand", name: "بیرانوند", position: "دروازه‌بان", power: 80, rarity: "common", country: "ایران",
    look: { skin: "#c68a63", hair: "#1a1110", hairStyle: "short", beard: true, shirt: "#2e7d32", trim: "#ffffff", number: 1 } },
];

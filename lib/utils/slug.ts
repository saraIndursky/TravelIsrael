const RESERVED_SLUGS = new Set(["create", "edit", "new", "search", "page", "admin"]);

const HEBREW_RE = /[\u0590-\u05FF]/;

/** Longest keys first. Israeli-English spellings — whole words, not letter-by-letter. */
const WORD_MAP: Record<string, string> = {
  "ים המלח": "dead-sea",
  "בים המלח": "at-dead-sea",
  "תל אביב": "tel-aviv",
  "בתל אביב": "in-tel-aviv",
  "מחנה יהודה": "machane-yehuda",
  "גן לאומי": "national-park",
  "סוף שבוע": "weekend",
  "ראש הנקרה": "rosh-hanikra",
  "מכתש רמון": "makhtesh-ramon",
  "בית גוברין": "beit-govrin",
  "בית שאן": "beit-shean",
  "עין גדי": "ein-gedi",
  "יום מלא": "full-day",
  "בן שמן": "ben-shemen",
  בירושלים: "in-jerusalem",
  ירושלים: "jerusalem",
  מצדה: "masada",
  חיפה: "haifa",
  אילת: "eilat",
  כנרת: "kinneret",
  גולן: "golan",
  נגב: "negev",
  גליל: "galilee",
  כרמל: "carmel",
  חרמון: "hermon",
  קיסריה: "caesarea",
  אשקלון: "ashkelon",
  ישראל: "israel",
  יפו: "jaffa",
  עכו: "acre",
  תמנע: "timna",
  מירון: "meron",
  רמון: "ramon",
  ארבל: "arbel",
  אכזיב: "achziv",
  געש: "gaash",
  איילון: "ayalon",
  אלכסנדר: "alexander",
  דוד: "david",
  בניאס: "banias",
  יהודייה: "yehudiya",
  כזיב: "kaziv",
  זויתן: "zavitan",
  בלומפילד: "bloomfield",
  עזריאלי: "azrieli",
  נמרוד: "nimrod",
  אופניים: "ophnayim",
  בשרון: "basharon",
  שרון: "sharon",
  שוק: "shuk",
  מחנה: "machane",
  יהודה: "yehuda",
  מוזיאון: "museum",
  לאומי: "leumi",
  שמורת: "reserve",
  שמורה: "reserve",
  מסלולי: "trails",
  מסלול: "trail",
  טיול: "trip",
  מקום: "place",
  ליום: "day",
  יום: "day",
  מדבר: "midbar",
  מכתשים: "makhteshim",
  מכתש: "makhtesh",
  מים: "mayim",
  יער: "yaar",
  שביל: "shvil",
  טיילת: "tayelet",
  משפחתי: "mishpachti",
  נגיש: "nagish",
  תרבות: "tarbut",
  מערבי: "maaravi",
  תיכון: "tikhon",
  היסטוריה: "historia",
  כוכבים: "kochavim",
  מורשת: "moreshet",
  אתגר: "etgar",
  לחובבי: "lechovevei",
  הליכה: "halicha",
  ערבה: "arava",
  צפון: "tzafon",
  ירוק: "yarok",
  עתיקה: "atika",
  העיר: "hair",
  נמל: "namal",
  קניון: "canyon",
  פארק: "park",
  מעיין: "maayan",
  מערת: "mearat",
  מערה: "meara",
  מצודת: "metzudat",
  מצודה: "metzuda",
  מצוק: "metzuk",
  מצפה: "mitzpe",
  עמק: "emek",
  ירדן: "jordan",
  דולפינים: "dolphins",
  ריף: "reef",
  פרסה: "parsa",
  קטע: "section",
  נחל: "nahal",
  חוף: "hof",
  עין: "ein",
  בית: "beit",
  כפר: "kfar",
  תל: "tel",
  הר: "har",
  מפל: "waterfall",
  גני: "ganei",
  גנות: "ganot",
  גן: "gan",
  בריכת: "breichat",
  בריכה: "breicha",
  טבע: "teva",
  מדע: "mada",
  ים: "yam",
  הבהאיים: "bahai",
  ערב: "erev",
  רגוע: "ragu",
  בערך: "baerech",
  הבונים: "habonim",
  הבשור: "habesor",
  השופט: "hashofet",
  עמוד: "amud",
  פרת: "prat",
  חצץ: "chatsats",
  מורש: "moresh",
  הנטיפים: "hantifim",
  ההעתקים: "haatakim",
  הסוסות: "hasusot",
  בצפון: "batsafon",
  שבוע: "shavua",
  סוף: "sof",
};

/** Attached Hebrew prefixes → English, then look up the stem in WORD_MAP. */
const PREFIXES: Array<[string, string]> = [
  ["וה", "veha"],
  ["ו", "ve"],
  ["ה", "ha"],
  ["ב", "ba"],
  ["ל", "le"],
  ["כ", "ke"],
  ["מ", "mi"],
];

const LETTER_MAP: Record<string, string> = {
  ב: "b",
  ג: "g",
  ד: "d",
  ה: "h",
  ז: "z",
  ח: "ch",
  ט: "t",
  כ: "k",
  ך: "k",
  ל: "l",
  מ: "m",
  ם: "m",
  נ: "n",
  ן: "n",
  ס: "s",
  פ: "p",
  ף: "p",
  צ: "tz",
  ץ: "tz",
  ק: "k",
  ר: "r",
  ש: "sh",
  ת: "t",
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

function applyPhrases(input: string): string {
  let text = input;
  const phrases = Object.entries(WORD_MAP)
    .filter(([hebrew]) => hebrew.includes(" "))
    .sort((a, b) => b[0].length - a[0].length);
  for (const [hebrew, english] of phrases) {
    text = text.split(hebrew).join(` ${english} `);
  }
  return text;
}

function mapHebrewToken(token: string): string {
  if (WORD_MAP[token]) return WORD_MAP[token];
  for (const [heb, eng] of PREFIXES) {
    if (token.startsWith(heb) && token.length > heb.length + 1) {
      const stem = token.slice(heb.length);
      if (WORD_MAP[stem]) return `${eng}-${WORD_MAP[stem]}`;
    }
  }
  return romanizeHebrewWord(token);
}

/** Whole tokens only — never replace letters inside a longer Hebrew word. */
function applyWordMap(input: string): string {
  return applyPhrases(input)
    .split(/([^\u0590-\u05FFa-zA-Z0-9]+)/)
    .map((part) => (HEBREW_RE.test(part) ? mapHebrewToken(part) : part))
    .join("");
}

/** Phonetic fallback: vav is a vowel (o), yud is i — not v/y. */
function romanizeHebrewWord(word: string): string {
  if (!HEBREW_RE.test(word)) return word;
  if (word === "ו") return "ve";

  let prefix = "";
  let stem = word;
  if (stem.startsWith("וה") && stem.length > 2) {
    prefix = "veha";
    stem = stem.slice(2);
  } else if (stem.startsWith("ו") && stem.length > 1) {
    prefix = "ve";
    stem = stem.slice(1);
  } else if (stem.startsWith("ה") && stem.length > 2) {
    prefix = "ha";
    stem = stem.slice(1);
  } else if (stem.startsWith("ב") && stem.length > 2) {
    prefix = "ba";
    stem = stem.slice(1);
  } else if (stem.startsWith("ל") && stem.length > 2) {
    prefix = "le";
    stem = stem.slice(1);
  }

  let out = "";
  let i = 0;
  const n = stem.length;
  while (i < n) {
    const ch = stem[i];
    const next = stem[i + 1];

    if (ch === "ו" && next === "ו") {
      out += "v";
      i += 2;
      continue;
    }
    if (ch === "י" && next === "י") {
      out += i === 0 ? "yi" : "ay";
      i += 2;
      continue;
    }
    if (ch === "י" && next === "ם" && i + 2 === n) {
      out += "im";
      i += 2;
      continue;
    }
    if (ch === "ו" && next === "ת" && i + 2 === n) {
      out += "ot";
      i += 2;
      continue;
    }
    if (ch === "א" && next === "ו") {
      out += "o";
      i += 2;
      continue;
    }
    if (ch === "ו") {
      out += "o";
      i += 1;
      continue;
    }
    if (ch === "י") {
      out += i === 0 ? "ye" : "i";
      i += 1;
      continue;
    }
    if ((ch === "א" || ch === "ע") && i === 0) {
      out += "a";
      i += 1;
      continue;
    }
    if (ch === "א" || ch === "ע") {
      i += 1;
      continue;
    }
    if (ch === "ה" && i === n - 1) {
      out += "a";
      i += 1;
      continue;
    }
    if (LETTER_MAP[ch]) {
      out += LETTER_MAP[ch];
      i += 1;
      continue;
    }
    out += ch;
    i += 1;
  }

  return `${prefix}${out}`;
}

function romanizeRemainingHebrew(input: string): string {
  return input
    .split(/(\s+)/)
    .map((part) => (HEBREW_RE.test(part) ? romanizeHebrewWord(part) : part))
    .join("");
}

/** Builds a URL-safe English slug from a Hebrew or Latin name. */
export function slugifyName(name: string): string {
  const withoutNiqqud = name.replace(/[\u0591-\u05C7]/g, "");
  const mapped = romanizeRemainingHebrew(applyWordMap(withoutNiqqud));
  const slug = mapped
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!slug || RESERVED_SLUGS.has(slug)) return slug ? `${slug}-item` : "item";
  return slug;
}

export function slugOrIdColumn(param: string): "id" | "slug" {
  return isUuid(param) ? "id" : "slug";
}

export function uniqueSlug(base: string, taken: Set<string>): string {
  const normalized = slugifyName(base);
  if (!taken.has(normalized)) return normalized;
  let n = 2;
  while (taken.has(`${normalized}-${n}`)) n += 1;
  return `${normalized}-${n}`;
}

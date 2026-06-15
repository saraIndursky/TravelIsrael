# TravelIsrael

פלטפורמת Web לתכנון, גילוי ושיתוף טיולים בישראל.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript (strict)
- Tailwind CSS + shadcn/ui
- Demo data (ללא Supabase)

## Getting Started

```bash
npm install
npm run dev
```

פתח [http://localhost:3000](http://localhost:3000)

## Demo Mode

- נתוני דמו ב-`data/seed/`
- שכבת נתונים ב-`lib/data/`
- בורר תפקידים בכותרת: אורח / משתמש / מנהל
- שינויים נשמרים ב-localStorage

## Routes

| Route | Description |
|-------|-------------|
| `/` | דף הבית |
| `/trips` | גילוי טיולים |
| `/trips/[id]` | דף טיול |
| `/trips/create` | יצירת טיול |
| `/wizard` | מנגנון התאמה |
| `/profile` | אזור אישי |
| `/admin` | פאנל ניהול |

## Build

```bash
npm run build
npm start
```

נבנה עם ❤️ לטיילי ישראל

import type { Trail } from "@/types";
import { DIFFICULTY_LABELS } from "@/types/enums";
import { formatDuration, formatPrice, getAccessibilityLabel } from "@/lib/utils";

export interface TrailEquipmentItem {
  icon: string;
  text: string;
}

export interface TrailTip {
  type: "warning" | "time" | "season" | "parking";
  text: string;
}

export interface TrailNatureItem {
  name: string;
  description: string;
}

export interface TrailNature {
  animals: TrailNatureItem[];
  plants: TrailNatureItem[];
  facts: string[];
}

export interface TrailWaypointDisplay {
  name: string;
  time: string;
  description: string;
}

const BASE_EQUIPMENT: TrailEquipmentItem[] = [
  { icon: "💧", text: "מים — לפחות 2 ליטר לאדם" },
  { icon: "🥾", text: "נעלי הליכה סגורות" },
  { icon: "🧢", text: "כובע להגנה מהשמש" },
  { icon: "🧴", text: "קרם הגנה" },
  { icon: "🎒", text: "תיק גב נוח" },
];

export function getTrailEquipment(trail: Trail): TrailEquipmentItem[] {
  const items = [...BASE_EQUIPMENT];

  if (trail.trail_type === "מים" || trail.tags.includes("מים")) {
    items.push({ icon: "👟", text: "נעלי מים או סנדלים סגורים" });
    items.push({ icon: "🩱", text: "בגד ים להחלפה" });
  }
  if (trail.difficulty === "hard" || trail.trail_type === "טיפוס") {
    items.push({ icon: "🧤", text: "כפפות לטיפוס בתלילות" });
  }
  if (trail.trail_type === "אופניים") {
    items.push({ icon: "🚴", text: "קסדה ואופניים תקינים" });
  }
  if (trail.estimated_price > 0) {
    items.push({ icon: "💳", text: `כרטיס כניסה — ${formatPrice(trail.estimated_price)}` });
  }

  items.push({ icon: "🍎", text: "חטיפים ואוכל קל" });
  return items;
}

export function getTrailTips(trail: Trail): TrailTip[] {
  const tips: TrailTip[] = [];

  if (trail.trail_type === "מים" || trail.tags.includes("מים")) {
    tips.push({ type: "warning", text: "המסלול כולל מעברי מים — יתכן שתרטבו" });
  }
  if (trail.difficulty === "hard") {
    tips.push({ type: "warning", text: "מסלול מאתגר — מומלץ למטיילים מנוסים בלבד" });
  }
  if (trail.trail_type === "טיפוס") {
    tips.push({ type: "time", text: "מומלץ להתחיל בשעות הבוקר המוקדמות (6–8)" });
  } else {
    tips.push({ type: "time", text: "מומלץ להגיע בשעות הבוקר המוקדמות (7–9)" });
  }
  if (trail.region === "גליל" || trail.region === "כרמל") {
    tips.push({ type: "season", text: "הכי יפה באביב (מרץ–מאי) ובסתיו (אוקטובר–נובמבר)" });
  }
  if (trail.region === "ים המלח" || trail.region === "נגב") {
    tips.push({ type: "season", text: "הימנעו מהליכה בשעות הצהריים בחום — קחו הרבה מים" });
  }
  if (trail.estimated_price > 0) {
    tips.push({ type: "parking", text: "חניה בתשלום בכניסה לשמורת הטבע" });
  } else if (trail.tags.includes("משפחות")) {
    tips.push({ type: "parking", text: "חניה מוגבלת בסופי שבוע — מומלץ להגיע מוקדם" });
  }

  return tips;
}

const REGION_NATURE: Partial<Record<Trail["region"], TrailNature>> = {
  גליל: {
    animals: [
      { name: "נחליאלי", description: "ניתן לפגוש בשעות הבוקר המוקדמות" },
      { name: "עיט חורף", description: "עף במעגלים מעל העמקים" },
      { name: "שועל", description: "פעיל בעיקר בשעות הערב" },
    ],
    plants: [
      { name: "אלון מצוי", description: "עצים עתיקים בני מאות שנים" },
      { name: "רקפת מצויה", description: "פורחת בחורף באדום עז" },
      { name: "לוטם קוצני", description: "שיח ריחני עם פרחים צהובים" },
    ],
    facts: ["האזור עשיר במעיינות טבעיים", "יערות הגליל נטעו על ידי קק\"ל", "המסלולים מחברים בין נחלים ורכסים"],
  },
  "ים המלח": {
    animals: [
      { name: "יען", description: "ניתן לראות במדבר יהודה" },
      { name: "עכבר חולות", description: "פעיל בשעות הלילה" },
    ],
    plants: [
      { name: "אטד מצוי", description: "שיח מדברי עמיד ביובש" },
      { name: "מרווה", description: "צמח ריחני המכסה את הנחלים" },
    ],
    facts: ["נקודה הנמוכה ביותר על פני כדור הארץ", "האקלים המדברי ייחודי לצמחייה מותאמת", "מסלולי המים פופולריים במיוחד בקיץ"],
  },
  כרמל: {
    animals: [
      { name: "חזיר בר", description: "נפוץ ביערות הכרמל" },
      { name: "נץ", description: "דורס קטן הנצפה מעל הרכס" },
    ],
    plants: [
      { name: "עץ אלון", description: "יער אלונים עתיק בלב הכרמל" },
      { name: "כליל החורש", description: "פורח באדום בחורף" },
    ],
    facts: ["הכרמל מוכר כ\"הר הקודש\"", "יער הכרמל הוא אחד מהגדולים בישראל", "נקודות תצפית על הים והעמק"],
  },
};

export function getTrailNature(trail: Trail): TrailNature {
  const regional = REGION_NATURE[trail.region];
  if (regional) return regional;

  return {
    animals: [{ name: "ציפורי שיר", description: "מגוון ציפורים לאורך המסלול" }],
    plants: [{ name: "צמחייה מקומית", description: "צמחים ייחודיים לאזור המסלול" }],
    facts: [
      `מסלול ${trail.trail_type} באזור ${trail.region}`,
      `רמת קושי: ${DIFFICULTY_LABELS[trail.difficulty]}`,
      `נגישות: ${getAccessibilityLabel(trail.accessibility)}`,
    ],
  };
}

function formatWaypointTime(minutesFromStart: number): string {
  const hours = Math.floor(minutesFromStart / 60);
  const mins = minutesFromStart % 60;
  return `${hours}:${mins.toString().padStart(2, "0")}`;
}

export function getTrailWaypoints(trail: Trail): TrailWaypointDisplay[] {
  const points =
    trail.waypoints.length > 0
      ? trail.waypoints
      : [
          { lat: trail.start_lat, lng: trail.start_lng, name: "נקודת התחלה" },
          { lat: trail.end_lat, lng: trail.end_lng, name: "נקודת סיום" },
        ];

  const step = points.length > 1 ? trail.duration_minutes / (points.length - 1) : 0;

  return points.map((point, index) => {
    const name = point.name ?? (index === 0 ? "התחלה" : index === points.length - 1 ? "סיום" : `תחנה ${index + 1}`);
    const description =
      index === 0
        ? "נקודת התחלה"
        : index === points.length - 1
          ? "סיום המסלול"
          : "תחנה במסלול";

    return {
      name,
      time: formatWaypointTime(Math.round(index * step)),
      description,
    };
  });
}

export function getTrailAudienceLabel(trail: Trail): string {
  if (trail.tags.includes("משפחות")) return "משפחות, זוגות";
  if (trail.difficulty === "hard") return "מטיילים מנוסים";
  if (trail.tags.includes("ספורט")) return "ספורטאים";
  return "כל המשפחה";
}

const REGION_GALLERY: Partial<Record<Trail["region"], string[]>> = {
  כרמל: [
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
  ],
  גליל: [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
    "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800",
  ],
  "ים המלח": [
    "https://images.unsplash.com/photo-1548013146-72479768bada?w=800",
    "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800",
    "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800",
  ],
  מרכז: [
    "https://images.unsplash.com/photo-1519331379776-fb884a27e562?w=800",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
  ],
};

export function getTrailGalleryImages(trail: Trail): string[] {
  const extras = REGION_GALLERY[trail.region] ?? [
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
  ];
  return Array.from(new Set([trail.image_url, ...extras].filter(Boolean)));
}

/** Google Maps directions to the trail start (trailhead). */
export function getTrailNavigationUrl(trail: Trail): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${trail.start_lat},${trail.start_lng}`;
}

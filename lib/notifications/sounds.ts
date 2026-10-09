import type { NotificationSoundId } from "@/types/notification-preferences";

export interface NotificationSoundOption {
  id: NotificationSoundId;
  label: string;
}

export const NOTIFICATION_SOUNDS: NotificationSoundOption[] = [
  { id: "chime-1", label: "מנגינה מתוקה" },
  { id: "chime-2", label: "פעמונים רכים" },
  { id: "chime-3", label: "בס עמוק" },
  { id: "chime-4", label: "זרימה עולה" },
  { id: "chime-5", label: "שקיעה רגועה" },
  { id: "chime-6", label: "נגינה קצרה" },
  { id: "chime-7", label: "מרימבה חמה" },
  { id: "chime-8", label: "לחישה בס" },
  { id: "chime-9", label: "הארפה קלה" },
  { id: "chime-10", label: "אקורד מלא" },
];

type MelodyNote = {
  frequency: number;
  bass?: number;
  duration: number;
  gap?: number;
  type?: OscillatorType;
};

const SOUND_MELODIES: Record<NotificationSoundId, MelodyNote[]> = {
  "chime-1": [
    { frequency: 523.25, bass: 130.81, duration: 0.16, type: "sine" },
    { frequency: 659.25, bass: 164.81, duration: 0.16, gap: 0.04, type: "sine" },
    { frequency: 783.99, bass: 196.0, duration: 0.22, gap: 0.04, type: "triangle" },
  ],
  "chime-2": [
    { frequency: 440, bass: 110, duration: 0.2, type: "triangle" },
    { frequency: 554.37, bass: 138.59, duration: 0.24, gap: 0.06, type: "sine" },
  ],
  "chime-3": [
    { frequency: 349.23, bass: 87.31, duration: 0.28, type: "sine" },
    { frequency: 261.63, bass: 65.41, duration: 0.32, gap: 0.05, type: "triangle" },
  ],
  "chime-4": [
    { frequency: 392, bass: 98, duration: 0.14, type: "sine" },
    { frequency: 493.88, bass: 123.47, duration: 0.14, gap: 0.03, type: "sine" },
    { frequency: 587.33, bass: 146.83, duration: 0.18, gap: 0.03, type: "triangle" },
    { frequency: 698.46, bass: 174.61, duration: 0.22, gap: 0.03, type: "sine" },
  ],
  "chime-5": [
    { frequency: 659.25, bass: 164.81, duration: 0.16, type: "triangle" },
    { frequency: 587.33, bass: 146.83, duration: 0.16, gap: 0.04, type: "sine" },
    { frequency: 523.25, bass: 130.81, duration: 0.2, gap: 0.04, type: "sine" },
    { frequency: 440, bass: 110, duration: 0.28, gap: 0.04, type: "triangle" },
  ],
  "chime-6": [
    { frequency: 880, bass: 220, duration: 0.1, type: "sine" },
    { frequency: 987.77, bass: 246.94, duration: 0.12, gap: 0.05, type: "triangle" },
    { frequency: 1174.66, bass: 293.66, duration: 0.16, gap: 0.05, type: "sine" },
  ],
  "chime-7": [
    { frequency: 392, bass: 98, duration: 0.12, type: "triangle" },
    { frequency: 440, bass: 110, duration: 0.12, gap: 0.03, type: "triangle" },
    { frequency: 493.88, bass: 123.47, duration: 0.12, gap: 0.03, type: "triangle" },
    { frequency: 523.25, bass: 130.81, duration: 0.16, gap: 0.03, type: "sine" },
  ],
  "chime-8": [
    { frequency: 220, bass: 55, duration: 0.35, type: "sine" },
    { frequency: 277.18, bass: 69.3, duration: 0.28, gap: 0.06, type: "triangle" },
  ],
  "chime-9": [
    { frequency: 1046.5, duration: 0.08, type: "sine" },
    { frequency: 1318.51, duration: 0.1, gap: 0.04, type: "triangle" },
    { frequency: 1567.98, duration: 0.12, gap: 0.04, type: "sine" },
    { frequency: 1318.51, duration: 0.14, gap: 0.04, type: "triangle" },
  ],
  "chime-10": [
    { frequency: 261.63, bass: 65.41, duration: 0.22, type: "sine" },
    { frequency: 329.63, bass: 82.41, duration: 0.22, gap: 0.02, type: "sine" },
    { frequency: 392, bass: 98, duration: 0.22, gap: 0.02, type: "triangle" },
    { frequency: 523.25, bass: 130.81, duration: 0.3, gap: 0.02, type: "sine" },
  ],
};

let audioContext: AudioContext | null = null;

function getAudioContextClass(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext ??
    null
  );
}

export async function unlockNotificationAudio(): Promise<AudioContext | null> {
  if (typeof window === "undefined") return null;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;

  const Ctx = getAudioContextClass();
  if (!Ctx) return null;

  if (!audioContext || audioContext.state === "closed") {
    audioContext = new Ctx();
  }

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  // Silent unlock blip — satisfies autoplay policy after user gesture
  const t = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start(t);
  osc.stop(t + 0.01);

  return audioContext;
}

function playNote(ctx: AudioContext, note: MelodyNote, startAt: number): number {
  const mainGain = ctx.createGain();
  mainGain.gain.setValueAtTime(0, startAt);
  mainGain.gain.linearRampToValueAtTime(0.28, startAt + 0.025);
  mainGain.gain.linearRampToValueAtTime(0, startAt + note.duration);
  mainGain.connect(ctx.destination);

  const main = ctx.createOscillator();
  main.type = note.type ?? "sine";
  main.frequency.setValueAtTime(note.frequency, startAt);
  main.connect(mainGain);
  main.start(startAt);
  main.stop(startAt + note.duration + 0.05);

  if (note.bass) {
    const bassGain = ctx.createGain();
    bassGain.gain.setValueAtTime(0, startAt);
    bassGain.gain.linearRampToValueAtTime(0.18, startAt + 0.03);
    bassGain.gain.linearRampToValueAtTime(0, startAt + note.duration + 0.05);
    bassGain.connect(ctx.destination);

    const bass = ctx.createOscillator();
    bass.type = "sine";
    bass.frequency.setValueAtTime(note.bass, startAt);
    bass.connect(bassGain);
    bass.start(startAt);
    bass.stop(startAt + note.duration + 0.08);
  }

  return note.duration + (note.gap ?? 0);
}

export async function playNotificationSound(id: NotificationSoundId): Promise<void> {
  const ctx = await unlockNotificationAudio();
  if (!ctx) return;

  try {
    const melody = SOUND_MELODIES[id];
    let cursor = ctx.currentTime + 0.02;
    for (const note of melody) {
      if (note.gap) cursor += note.gap;
      cursor += playNote(ctx, note, cursor);
    }
  } catch {
    // Browser blocked audio — ignore
  }
}

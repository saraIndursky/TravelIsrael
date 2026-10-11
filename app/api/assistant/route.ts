import { NextResponse } from "next/server";
import type { AssistantRequestBody, QuickActionId } from "@/types/assistant";
import { runDemoAssistant } from "@/lib/assistant/demo-assistant";
import { runGeminiAssistant } from "@/lib/assistant/gemini-assistant";
import { runOpenAIAssistant } from "@/lib/assistant/openai-assistant";
import { createClient } from "@/lib/supabase/server";
import { isRateLimited } from "@/lib/server/rate-limit";

// Gemini can take several seconds (and one retry); give the serverless function room on Vercel.
export const maxDuration = 30;

// Each request can cost money (the AI provider bills per call), so it is limited to signed-in
// users, to a modest number per user, and to a bounded input size.
const RATE_LIMIT = 40;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_MESSAGES = 30;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_SNAPSHOT_LENGTH = 40_000;

const VALID_ENTITIES = new Set(["place", "trail", "trip"]);
const VALID_CONTEXTS = new Set(["create", "detail"]);
const VALID_QUICK_ACTIONS = new Set<string>([
  "full_description",
  "short_description",
  "accessibility",
  "coordinates",
  "tags",
  "duration_price",
  "waypoints",
  "fill_missing",
  "stations_hint",
]);

function isValidBody(body: unknown): body is AssistantRequestBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    VALID_ENTITIES.has(String(b.entity)) &&
    VALID_CONTEXTS.has(String(b.context)) &&
    Array.isArray(b.messages) &&
    b.formSnapshot != null &&
    typeof b.formSnapshot === "object"
  );
}

function extractQuickAction(messages: AssistantRequestBody["messages"]): QuickActionId | undefined {
  const last = messages[messages.length - 1];
  if (!last || last.role !== "user" || !last.content.startsWith("__quick:")) {
    return undefined;
  }
  const id = last.content.replace("__quick:", "");
  return VALID_QUICK_ACTIONS.has(id) ? (id as QuickActionId) : undefined;
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "יש להתחבר כדי להשתמש בעוזר" }, { status: 401 });
    }
    if (isRateLimited(`assistant:${user.id}`, RATE_LIMIT, RATE_WINDOW_MS)) {
      return NextResponse.json({ message: "יותר מדי בקשות לעוזר. נסו שוב בעוד כמה דקות." }, { status: 429 });
    }

    const body: unknown = await request.json();
    if (!isValidBody(body)) {
      return NextResponse.json({ message: "בקשה לא תקינה" }, { status: 400 });
    }
    const tooLong =
      body.messages.length > MAX_MESSAGES ||
      body.messages.some((m) => typeof m?.content !== "string" || m.content.length > MAX_MESSAGE_LENGTH) ||
      JSON.stringify(body.formSnapshot).length > MAX_SNAPSHOT_LENGTH;
    if (tooLong) {
      return NextResponse.json({ message: "הבקשה גדולה מדי" }, { status: 413 });
    }

    const mode = process.env.ASSISTANT_MODE ?? "demo";
    const quickAction = extractQuickAction(body.messages);

    const input = {
      entity: body.entity,
      messages: body.messages,
      formSnapshot: body.formSnapshot,
      context: body.context,
      quickAction,
    };

    let result;
    if (mode === "gemini" && process.env.GEMINI_API_KEY) {
      result = await runGeminiAssistant(input);
    } else if (mode === "openai" && process.env.OPENAI_API_KEY) {
      result = await runOpenAIAssistant(input);
    } else {
      if (mode === "gemini") console.warn("[assistant] ASSISTANT_MODE=gemini but GEMINI_API_KEY is missing; using demo");
      result = runDemoAssistant(input);
    }

    return NextResponse.json({ ...result, provider: result.provider ?? "demo" });
  } catch {
    return NextResponse.json({ message: "שגיאה בעוזר — נסי שוב" }, { status: 500 });
  }
}

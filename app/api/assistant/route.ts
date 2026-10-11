import { NextResponse } from "next/server";
import type { AssistantRequestBody, QuickActionId } from "@/types/assistant";
import { runDemoAssistant } from "@/lib/assistant/demo-assistant";
import { runGeminiAssistant } from "@/lib/assistant/gemini-assistant";
import { runOpenAIAssistant } from "@/lib/assistant/openai-assistant";

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
    const body: unknown = await request.json();
    if (!isValidBody(body)) {
      return NextResponse.json({ message: "בקשה לא תקינה" }, { status: 400 });
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

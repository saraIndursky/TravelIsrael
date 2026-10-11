import type {
  AssistantContext,
  AssistantEntity,
  AssistantMessage,
  AssistantResponse,
} from "@/types/assistant";
import { runDemoAssistant } from "./demo-assistant";
import { buildSystemPrompt } from "./system-prompt";

// Lite answers in 1-2s and is reliable on the free tier; the full Flash can take 20s+ or
// hang, which exceeds the serverless time limit on Vercel. It stays as the fallback.
const DEFAULT_MODEL = "gemini-flash-lite-latest";
const FALLBACK_MODEL = "gemini-flash-latest";
// Per-call cap so one slow model can't eat the whole route budget (maxDuration = 30).
const REQUEST_TIMEOUT_MS = 12_000;
const RETRYABLE_STATUSES = new Set([429, 500, 503]);

type AssistantInput = {
  entity: AssistantEntity;
  messages: AssistantMessage[];
  formSnapshot: Record<string, unknown>;
  context: AssistantContext;
};

/** The chat panel renders plain text, so drop the markdown Gemini likes to add. */
function stripMarkdown(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/^\s*\*\s+/gm, "• ");
}

/** Calls one model; retries once on a transient error. Returns null if it can't answer. */
async function callModel(
  model: string,
  apiKey: string,
  input: AssistantInput,
): Promise<AssistantResponse | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const init: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: buildSystemPrompt(input.entity) }] },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: JSON.stringify({
                entity: input.entity,
                context: input.context,
                formSnapshot: input.formSnapshot,
                messages: input.messages,
              }),
            },
          ],
        },
      ],
      generationConfig: { temperature: 0.4, responseMimeType: "application/json" },
    }),
  };

  let response = await fetch(url, init);
  if (RETRYABLE_STATUSES.has(response.status)) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    response = await fetch(url, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  }

  if (!response.ok) {
    const detail = (await response.text().catch(() => "")).slice(0, 300);
    console.error(`[assistant] Gemini ${model} failed: HTTP ${response.status} ${detail}`);
    return null;
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) {
    console.error(`[assistant] Gemini ${model} returned no text`);
    return null;
  }

  const parsed = JSON.parse(content) as AssistantResponse;
  if (typeof parsed.message !== "string") {
    console.error(`[assistant] Gemini ${model} returned JSON without a message`);
    return null;
  }
  return { ...parsed, message: stripMarkdown(parsed.message), provider: "gemini" };
}

export async function runGeminiAssistant(input: AssistantInput): Promise<AssistantResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return runDemoAssistant(input);
  }

  const primary = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  const models = primary === FALLBACK_MODEL ? [primary] : [primary, FALLBACK_MODEL];

  for (const model of models) {
    try {
      const result = await callModel(model, apiKey, input);
      if (result) return result;
    } catch (error) {
      console.error(`[assistant] Gemini ${model} threw:`, error);
    }
  }
  return runDemoAssistant(input);
}

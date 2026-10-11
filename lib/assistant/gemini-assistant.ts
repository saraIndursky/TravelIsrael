import type {
  AssistantContext,
  AssistantEntity,
  AssistantMessage,
  AssistantResponse,
} from "@/types/assistant";
import { runDemoAssistant } from "./demo-assistant";
import { SYSTEM_PROMPT } from "./openai-assistant";

const DEFAULT_MODEL = "gemini-flash-latest";

/** The chat panel renders plain text, so drop the markdown Gemini likes to add. */
function stripMarkdown(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/^\s*\*\s+/gm, "• ");
}

export async function runGeminiAssistant(input: {
  entity: AssistantEntity;
  messages: AssistantMessage[];
  formSnapshot: Record<string, unknown>;
  context: AssistantContext;
}): Promise<AssistantResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return runDemoAssistant(input);
  }

  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
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
          generationConfig: {
            temperature: 0.4,
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (!response.ok) {
      const detail = (await response.text().catch(() => "")).slice(0, 300);
      console.error(`[assistant] Gemini ${model} failed: HTTP ${response.status} ${detail}`);
      return runDemoAssistant(input);
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      console.error(`[assistant] Gemini ${model} returned no text`);
      return runDemoAssistant(input);
    }

    const parsed = JSON.parse(content) as AssistantResponse;
    if (typeof parsed.message !== "string") {
      return runDemoAssistant(input);
    }
    return { ...parsed, message: stripMarkdown(parsed.message), provider: "gemini" };
  } catch (error) {
    console.error("[assistant] Gemini call threw:", error);
    return runDemoAssistant(input);
  }
}

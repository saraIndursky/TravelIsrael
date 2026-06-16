import type {
  AssistantContext,
  AssistantEntity,
  AssistantMessage,
  AssistantResponse,
} from "@/types/assistant";
import { runDemoAssistant } from "./demo-assistant";

const SYSTEM_PROMPT = `אתה עוזר TravelIsrael בעברית. עוזר רק ביצירה והשלמת מקומות, מסלולים וטיולים.
אסור לענות על נושאים מחוץ לדומיין.
החזר JSON עם: message (string), updates (array של { field, value, label }), offTopic (boolean אופציונלי).`;

export async function runOpenAIAssistant(input: {
  entity: AssistantEntity;
  messages: AssistantMessage[];
  formSnapshot: Record<string, unknown>;
  context: AssistantContext;
}): Promise<AssistantResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return runDemoAssistant(input);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: JSON.stringify({
              entity: input.entity,
              context: input.context,
              formSnapshot: input.formSnapshot,
              messages: input.messages,
            }),
          },
        ],
      }),
    });

    if (!response.ok) {
      return runDemoAssistant(input);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return runDemoAssistant(input);
    }

    const parsed = JSON.parse(content) as AssistantResponse;
    if (typeof parsed.message !== "string") {
      return runDemoAssistant(input);
    }
    return parsed;
  } catch {
    return runDemoAssistant(input);
  }
}

import { getPersonaConfig } from "./personas";

const TAVUS_BASE_URL = "https://tavusapi.com/v2";

function getHeaders(): HeadersInit {
  const apiKey = process.env.TAVUS_API_KEY;
  if (!apiKey) {
    throw new Error("TAVUS_API_KEY environment variable is not set");
  }
  return {
    "x-api-key": apiKey,
    "Content-Type": "application/json",
  };
}

/**
 * Resolve the replica ID for a given persona type.
 * Checks persona-specific env vars first, falls back to the default.
 * Env pattern: TAVUS_REPLICA_ID_FINANCIAL_ANALYST, TAVUS_REPLICA_ID_NEWS_ANCHOR, etc.
 */
function getReplicaId(personaType?: string): string | undefined {
  if (personaType) {
    const envKey = `TAVUS_REPLICA_ID_${personaType.toUpperCase().replace(/-/g, "_")}`;
    const specific = process.env[envKey];
    if (specific) return specific;
  }
  return process.env.TAVUS_REPLICA_ID;
}

/**
 * Create a Tavus persona using a persona type config.
 * Looks up the system prompt and tools from personas.ts.
 */
export async function createPersona(options: {
  personaType?: string;
  personaName?: string;
  systemPrompt?: string;
  systemPromptSuffix?: string;
  replicaId?: string;
}) {
  const config = options.personaType
    ? getPersonaConfig(options.personaType)
    : undefined;

  let systemPrompt = options.systemPrompt ?? config?.systemPrompt ?? "";
  if (options.systemPromptSuffix) {
    systemPrompt += `\n\n${options.systemPromptSuffix}`;
  }

  // All output is spoken aloud via TTS — never use markdown formatting
  systemPrompt += `\n\nCRITICAL OUTPUT FORMAT RULE: Your responses are converted directly to speech via text-to-speech. NEVER use markdown formatting of any kind — no headings (# ## ###), no bold (**text**), no italic (*text*), no bullet points (- or *), no numbered lists (1. 2. 3.), no code blocks, no links. Write in plain conversational sentences and paragraphs only. Use natural spoken transitions like "First," "Next," "Moving on to" instead of formatting. If you need to emphasize something, say "importantly" or "the key point here is" — do NOT use asterisks or hashes.`;

  const replicaId =
    options.replicaId ?? getReplicaId(options.personaType);

  const response = await fetch(`${TAVUS_BASE_URL}/personas`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      persona_name:
        options.personaName ?? config?.name ?? "AI Research Assistant",
      system_prompt: systemPrompt,
      default_replica_id: replicaId,
      layers: {
        llm: {
          model: "tavus-gpt-4o",
          tools: config?.tools ?? [],
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create persona: ${response.status} ${errorText}`
    );
  }
  return response.json();
}

export async function createConversation(options: {
  personaId: string;
  personaType?: string;
  replicaId?: string;
  conversationalContext?: string;
  customGreeting?: string;
}) {
  const replicaId =
    options.replicaId ?? getReplicaId(options.personaType);

  const body: Record<string, unknown> = {
    persona_id: options.personaId,
    replica_id: replicaId,
    properties: {
      max_call_duration: 600,
      participant_left_timeout: 30,
    },
  };

  if (options.conversationalContext) {
    body.conversational_context = options.conversationalContext;
  }

  if (options.customGreeting) {
    body.custom_greeting = options.customGreeting;
  }

  const response = await fetch(`${TAVUS_BASE_URL}/conversations`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create conversation: ${response.status} ${errorText}`
    );
  }
  return response.json();
}

/** Maximum number of concurrent Tavus streams allowed by the plan */
export const MAX_CONCURRENT_STREAMS = 3;

/**
 * Get the count of currently active conversations.
 * Uses GET /v2/conversations?status=active&limit=1 to minimize payload
 * and reads total_count from the response.
 */
export async function getActiveConversationCount(): Promise<number> {
  const response = await fetch(
    `${TAVUS_BASE_URL}/conversations?status=active&limit=1`,
    { method: "GET", headers: getHeaders() }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to list conversations: ${response.status} ${errorText}`
    );
  }

  const data = await response.json();
  return data.total_count ?? 0;
}

export async function endConversation(conversationId: string) {
  const response = await fetch(
    `${TAVUS_BASE_URL}/conversations/${conversationId}/end`,
    {
      method: "POST",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to end conversation: ${response.status} ${errorText}`
    );
  }

  const text = await response.text();
  return text ? JSON.parse(text) : { success: true };
}

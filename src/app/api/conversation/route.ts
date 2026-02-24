import { NextRequest, NextResponse } from "next/server";
import {
  createConversation,
  createPersona,
  endConversation,
} from "@/lib/tavus";
import {
  createConversationRequestSchema,
  conversationResponseSchema,
} from "@/lib/schemas";
import { getPersonaConfig, DIFFICULTY_PROMPTS } from "@/lib/personas";
import {
  fetchContext,
  fetchPaperContent,
  fetchWatchlistContext,
  type PrefetchedActivity,
} from "@/lib/valyu";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createConversationRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { topic, paper_url, watchlist, difficulty } = parsed.data;
    const config = getPersonaConfig(parsed.data.persona_type);

    // Build conversational context based on the mode
    let conversationalContext: string | undefined;
    let briefingSubject: string | undefined;
    let prefetchedActivities: PrefetchedActivity[] = [];

    if (paper_url) {
      // Paper walk-through mode
      const prefetch = await fetchPaperContent(paper_url);
      conversationalContext = prefetch.context;
      prefetchedActivities = prefetch.activities;
      briefingSubject = "this research paper";
    } else if (watchlist && watchlist.length > 0) {
      // Watchlist / portfolio briefing mode
      const prefetch = await fetchWatchlistContext(watchlist);
      conversationalContext = prefetch.context;
      prefetchedActivities = prefetch.activities;
      briefingSubject = `your portfolio: ${watchlist.join(", ")}`;
    } else if (topic) {
      // Standard topic briefing mode
      const searchType = config?.prefetchSearchType ?? "all";
      const prefetch = await fetchContext(topic, searchType);
      conversationalContext = prefetch.context;
      prefetchedActivities = prefetch.activities;
      briefingSubject = topic;
    }

    // Build system prompt suffix
    const suffixParts: string[] = [];

    if (briefingSubject) {
      suffixParts.push(
        `IMPORTANT: You have been given pre-fetched data about ${briefingSubject} in your conversational context. This data is ALREADY LOADED and up-to-date — do NOT use any search tools to re-fetch this information. Present it directly from your context. After your initial greeting, immediately begin your detailed briefing using this pre-loaded data. Do not wait for the user to ask — they are expecting you to lead the conversation and present the key findings. When you finish covering the material, deliver a smooth closing statement — summarize the key takeaway, mention what's worth watching next, and invite the user to ask follow-up questions or explore a new topic. Never end abruptly.`
      );
    }

    if (paper_url) {
      suffixParts.push(
        `CRITICAL OVERRIDE — DO NOT SEARCH: The full paper content has been pre-fetched and is in your conversational context. You MUST present this data directly — do NOT call search_academic or search_web to look up this paper. The content is already loaded. Using search tools would cause unnecessary delays.

You are walking the user through a specific paper. Structure your explanation as:
1. Start with the big picture — what problem does this paper tackle and why it matters
2. Key findings in plain language
3. Methodology overview
4. Implications and limitations
5. Ask if they want to dive deeper into any section.
If the user asks to "skip to results" or "explain the methodology", jump to that section. Only use search tools if the user asks about something NOT already covered in the paper context.`
      );
    }

    if (watchlist && watchlist.length > 0) {
      suffixParts.push(
        `CRITICAL OVERRIDE — DO NOT SEARCH: All financial data for ${watchlist.join(", ")} has been pre-fetched and is available in your conversational context right now. You MUST present this data directly — do NOT call search_financial, search_news, or search_web for any of these tickers. The data is already current and complete. Using search tools would cause unnecessary delays.

You are delivering a portfolio briefing. Cover each ticker in the watchlist: ${watchlist.join(", ")}. For each:
1. Current price and recent performance
2. Key news or catalysts
3. Your brief analysis
After covering all, give a portfolio-level summary with risks and opportunities.

Only use search tools if the user asks about a ticker or topic NOT already in your pre-loaded context.`
      );
    }

    if (difficulty && DIFFICULTY_PROMPTS[difficulty]) {
      suffixParts.push(
        `AUDIENCE LEVEL: ${DIFFICULTY_PROMPTS[difficulty]}`
      );
    }

    const systemPromptSuffix =
      suffixParts.length > 0 ? suffixParts.join("\n\n") : undefined;

    // Build custom greeting
    let customGreeting: string | undefined;
    if (paper_url) {
      customGreeting = `Welcome! I've read through the paper you shared. Let me break it down for you — starting with the big picture.`;
    } else if (watchlist && watchlist.length > 0) {
      customGreeting = `Good to see you! I've pulled the latest data on ${watchlist.join(", ")}. Let me walk you through your portfolio.`;
    } else if (topic) {
      customGreeting = `Welcome! I've just pulled together the latest information on ${topic}. Let me walk you through the key findings.`;
    }

    // Create persona and conversation
    const persona = await createPersona({
      personaType: parsed.data.persona_type,
      replicaId: parsed.data.replica_id,
      systemPromptSuffix,
    });

    const data = await createConversation({
      personaId: persona.persona_id,
      personaType: parsed.data.persona_type,
      replicaId: parsed.data.replica_id,
      conversationalContext,
      customGreeting,
    });

    const validated = conversationResponseSchema.parse({
      ...data,
      prefetched_activities: prefetchedActivities.length > 0 ? prefetchedActivities : undefined,
    });
    return NextResponse.json(validated);
  } catch (error) {
    console.error("Failed to create conversation:", error);

    const message =
      error instanceof Error ? error.message : "Failed to create conversation";

    // Detect Tavus credit errors (402)
    if (message.includes("402") || message.includes("out of conversational credits")) {
      return NextResponse.json(
        { error: "out_of_credits", message: "You've run out of Tavus conversational credits." },
        { status: 402 }
      );
    }

    // Detect Tavus auth errors (401/403)
    if (message.includes("401") || message.includes("403") || message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "invalid_api_key", message: "Your Tavus API key is invalid or expired." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "server_error", message: "Something went wrong creating your conversation. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("id");

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversation id is required" },
        { status: 400 }
      );
    }

    await endConversation(conversationId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to end conversation:", error);
    return NextResponse.json(
      { error: "Failed to end conversation" },
      { status: 500 }
    );
  }
}

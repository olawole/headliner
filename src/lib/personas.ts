export const PERSONA_TYPES = [
  "financial-analyst",
  "news-anchor",
  "research-explainer",
] as const;

export type PersonaType = (typeof PERSONA_TYPES)[number];

export type SetupMode = "topic" | "watchlist" | "paper";

export interface PersonaConfig {
  id: PersonaType;
  name: string;
  description: string;
  icon: string;
  accentColor: string;
  systemPrompt: string;
  tools: Tool[];
  prefetchSearchType: "web" | "proprietary" | "all" | "news";
  topicLabel: string;
  topicPlaceholder: string;
  /** Available input modes on the setup page */
  setupModes: SetupMode[];
  /** Whether the difficulty selector is shown */
  hasDifficulty: boolean;
}

export const DIFFICULTY_LABELS: Record<string, string> = {
  general: "General Public",
  undergraduate: "Undergraduate",
  graduate: "Grad Student",
  expert: "Domain Expert",
};

export const DIFFICULTY_PROMPTS: Record<string, string> = {
  general:
    "Explain everything as if speaking to a curious person with no technical background. Use everyday analogies, avoid jargon entirely, and focus on why it matters in the real world.",
  undergraduate:
    "Explain at an undergraduate level. You can use basic technical terms but define them. Include relevant context and build up from fundamentals.",
  graduate:
    "Explain at a graduate student level. Use technical terminology freely, discuss methodology in detail, and reference related work. Assume strong foundational knowledge.",
  expert:
    "Explain at an expert level. Dive deep into methodology, statistical approaches, limitations, and novel contributions. Be precise and technical — skip the basics.",
};

interface Tool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, { type: string; description: string }>;
      required: string[];
    };
  };
}

const searchWeb: Tool = {
  type: "function",
  function: {
    name: "search_web",
    description:
      "Search the web for current information on any topic. Use this for general questions, facts, and real-time information.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query" },
      },
      required: ["query"],
    },
  },
};

const searchFinancial: Tool = {
  type: "function",
  function: {
    name: "search_financial",
    description:
      "Search for financial data including stock prices, earnings reports, SEC filings, balance sheets, insider transactions, and market information.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "The financial search query" },
      },
      required: ["query"],
    },
  },
};

const searchNews: Tool = {
  type: "function",
  function: {
    name: "search_news",
    description:
      "Search for the latest news articles, breaking stories, and current events on any topic.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "The news search query" },
      },
      required: ["query"],
    },
  },
};

const searchAcademic: Tool = {
  type: "function",
  function: {
    name: "search_academic",
    description:
      "Search academic papers and research from arXiv, PubMed, bioRxiv, and other scholarly sources. Use this for scientific questions, research findings, and academic topics.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "The academic search query" },
      },
      required: ["query"],
    },
  },
};

export const PERSONAS: Record<PersonaType, PersonaConfig> = {
  "financial-analyst": {
    id: "financial-analyst",
    name: "Financial Analyst",
    description:
      "Real-time market data, earnings reports, stock analysis, and SEC filings. Your personal Wall Street analyst.",
    icon: "📈",
    accentColor: "emerald",
    systemPrompt: `You are an expert AI financial analyst with access to real-time market data and financial search tools. You speak with authority and clarity, like a senior analyst briefing a client.

Your capabilities:
- Live stock prices, earnings data, and market trends via search_financial
- Breaking financial news and market-moving events via search_news
- General market context and company backgrounds via search_web

When a user asks a question:
1. ALWAYS use search_financial for stock prices, earnings, SEC filings, balance sheets, or any market data.
2. Use search_news for market-moving events, analyst opinions, or financial headlines.
3. Use search_web for company backgrounds, industry context, or general information.
4. Present data clearly: use numbers, percentages, and comparisons.
5. Offer your analysis — don't just read back raw data. Explain what the numbers mean.
6. Flag risks and opportunities when relevant.
7. If asked about a stock, always try to get the current price and recent performance.

Speak confidently but note when data might be delayed. Be concise — analysts don't ramble.

When wrapping up a briefing, always close with a professional sign-off. Summarize the key takeaway in one sentence, mention any risks worth watching, and invite the user to ask follow-up questions or drill into a specific area. Example: "So that's the picture on [topic] right now. The main thing to watch is [key risk/catalyst]. Want me to dig deeper into any of these names, or is there another area you'd like me to look at?"`,
    tools: [searchFinancial, searchNews, searchWeb],
    prefetchSearchType: "all",
    topicLabel: "Market topic",
    topicPlaceholder: "e.g. NVIDIA earnings Q4 2024",
    setupModes: ["topic", "watchlist"],
    hasDifficulty: false,
  },

  "news-anchor": {
    id: "news-anchor",
    name: "News Anchor",
    description:
      "Personalized live news briefings on any topic. Drill into any story. Your own AI newsroom.",
    icon: "📰",
    accentColor: "red",
    systemPrompt: `You are a professional AI news anchor delivering personalized news briefings. You have a warm, authoritative delivery style — think of a trusted evening news anchor who makes complex stories accessible.

Your capabilities:
- Breaking news and current events via search_news
- Background context and deep dives via search_web

When a user asks for a briefing or asks about a topic:
1. ALWAYS use search_news first to get the latest stories.
2. Use search_web for background context, history, or explainers.
3. Structure your delivery like a news segment:
   - Lead with the most important headline
   - Give the key facts (who, what, when, where, why)
   - Add context that helps the viewer understand why it matters
4. If covering multiple stories, transition between them naturally.
5. When the user wants to drill into a story, search for more details.
6. Cite your sources naturally: "According to..." or "Reports indicate..."
7. Stay neutral and factual. Present multiple perspectives on controversial topics.
8. End segments by asking if they want to hear more or move to another topic.

Deliver news like a pro — clear, engaging, and informative.

When wrapping up a briefing, always deliver a polished sign-off like a real anchor closing a segment. Recap the top headline in one line, give a forward-looking note about what to watch next, and invite the viewer to continue. Example: "And that's your briefing on [topic]. The big story to keep an eye on is [developing angle]. If you'd like to dive deeper into any of these stories or switch to a different topic, just let me know — I'm here for you."`,
    tools: [searchNews, searchWeb],
    prefetchSearchType: "news",
    topicLabel: "News topic",
    topicPlaceholder: "e.g. Latest AI regulation news",
    setupModes: ["topic"],
    hasDifficulty: false,
  },

  "research-explainer": {
    id: "research-explainer",
    name: "Research Explainer",
    description:
      "Find and break down academic papers, explain complex research, and track the latest scientific discoveries.",
    icon: "🔬",
    accentColor: "violet",
    systemPrompt: `You are an AI research explainer — a brilliant professor who makes complex academic papers accessible to anyone. You combine deep expertise with a gift for clear explanation.

Your capabilities:
- Academic paper search across arXiv, PubMed, bioRxiv, and more via search_academic
- General context and supplementary information via search_web

When a user asks about a research topic:
1. ALWAYS use search_academic first to find relevant papers and studies.
2. Use search_web for supplementary context, simpler explanations, or related news.
3. When explaining a paper:
   - Start with the big picture: what problem does this solve and why does it matter?
   - Explain the key finding in plain language
   - Describe the methodology briefly
   - Discuss the implications and limitations
   - Mention related work if relevant
4. Use analogies and real-world examples to make abstract concepts concrete.
5. Always cite the paper: mention authors, institution, and where it was published.
6. If the user asks to go deeper, dive into the technical details.
7. If asked about a field broadly, search for recent survey papers or high-impact work.

Make research feel exciting and understandable, not intimidating.

When wrapping up an explanation, always close thoughtfully like a great professor ending a lecture. Summarize the key insight in plain language, explain why it matters for the bigger picture, and open the door for follow-up. Example: "So the bottom line here is [key takeaway], and what makes this exciting is [broader implication]. If you'd like me to go deeper into the methodology, explore related work, or break down a different paper, just say the word."`,
    tools: [searchAcademic, searchWeb],
    prefetchSearchType: "all",
    topicLabel: "Research area",
    topicPlaceholder: "e.g. CRISPR gene therapy breakthroughs",
    setupModes: ["topic", "paper"],
    hasDifficulty: true,
  },
};

export function getPersonaConfig(type: string): PersonaConfig | undefined {
  return PERSONAS[type as PersonaType];
}

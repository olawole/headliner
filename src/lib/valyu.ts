import { Valyu } from "valyu-js";
import type { SearchRequest, SearchResult } from "./schemas";

function getClient(): Valyu {
  return new Valyu(process.env.VALYU_API_KEY);
}

export type SearchType = "web" | "proprietary" | "all" | "news";

export interface PrefetchedActivity {
  tool_name: string;
  query: string;
  results: SearchResult[];
}

export interface PrefetchResult {
  context: string;
  activities: PrefetchedActivity[];
}

/** Strip markdown syntax so text reads naturally when spoken aloud. */
function stripMarkdown(text: unknown): string {
  const str = typeof text === "string" ? text : text ? JSON.stringify(text) : "";
  if (!str) return "";
  return str
    .replace(/#{1,6}\s+/g, "")           // headings
    .replace(/\*\*(.+?)\*\*/g, "$1")     // bold
    .replace(/\*(.+?)\*/g, "$1")         // italic
    .replace(/__(.+?)__/g, "$1")         // bold alt
    .replace(/_(.+?)_/g, "$1")           // italic alt
    .replace(/~~(.+?)~~/g, "$1")         // strikethrough
    .replace(/`(.+?)`/g, "$1")           // inline code
    .replace(/```[\s\S]*?```/g, "")      // code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links → keep text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1") // images → keep alt
    .replace(/^[-*+]\s+/gm, "")          // unordered list bullets
    .replace(/^\d+\.\s+/gm, "")          // ordered list numbers
    .replace(/^>\s+/gm, "")              // blockquotes
    .replace(/---+/g, "")                // horizontal rules
    .replace(/\|/g, " ")                 // table pipes
    .replace(/\n{3,}/g, "\n\n")          // collapse extra newlines
    .trim();
}

const SEARCH_TYPE_MAP: Record<string, SearchType> = {
  search_web: "web",
  search_academic: "all",
  search_financial: "all",
  search_news: "news",
};

export async function executeSearch(
  request: SearchRequest
): Promise<{ results: SearchResult[]; query: string }> {
  const valyu = getClient();
  const searchType = SEARCH_TYPE_MAP[request.tool_name] ?? "all";

  const response = await valyu.search(request.query, {
    searchType,
    maxNumResults: 5,
    relevanceThreshold: 0.4,
    responseLength: "short",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results: SearchResult[] = (response.results ?? []).map((r: any) => ({
    title: r.title ?? "",
    url: r.url ?? "",
    content: stripMarkdown(r.content ?? ""),
    relevance_score: r.relevance_score,
    source: r.source,
  }));

  return { results, query: request.query };
}

/**
 * Pre-fetch context from Valyu for a given topic.
 * Used to inject conversational context before starting a Tavus conversation.
 */
export async function fetchContext(
  topic: string,
  searchType: SearchType
): Promise<PrefetchResult> {
  const valyu = getClient();
  const toolName = searchType === "web" ? "search_web" : searchType === "news" ? "search_news" : "search_web";

  const response = await valyu.search(topic, {
    searchType,
    maxNumResults: 10,
    responseLength: "medium",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawResults = response.results ?? [];
  if (rawResults.length === 0) {
    return { context: `No results found for "${topic}".`, activities: [] };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const searchResults: SearchResult[] = rawResults.map((r: any) => ({
    title: r.title ?? "",
    url: r.url ?? "",
    content: stripMarkdown(r.content ?? ""),
    relevance_score: r.relevance_score,
    source: r.source,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatted = rawResults.map((r: any, i: number) => {
    const title = r.title ?? "Untitled";
    const content = stripMarkdown(r.content ?? "");
    const source = r.url ?? r.source ?? "";
    return `Source ${i + 1}: ${title}\n${content}${source ? `\nReference: ${source}` : ""}`;
  });

  return {
    context: `Here is the latest information on "${topic}":\n\n${formatted.join("\n\n")}`,
    activities: [{ tool_name: toolName, query: topic, results: searchResults }],
  };
}

/**
 * Fetch and extract content from a paper URL (arXiv, PubMed, etc.).
 * Uses Valyu contents extraction for clean markdown output.
 */
export async function fetchPaperContent(url: string): Promise<PrefetchResult> {
  const valyu = getClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await (valyu as any).contents([url]);
  const items = response?.results ?? response ?? [];

  if (!items.length || !items[0]?.content) {
    // Fallback: search for the paper by URL
    const searchResponse = await valyu.search(url, {
      searchType: "all",
      maxNumResults: 5,
      responseLength: "large",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = searchResponse.results ?? [];
    if (results.length === 0) {
      return {
        context: `Could not fetch content from "${url}". The paper may be behind a paywall or unavailable.`,
        activities: [],
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchResults: SearchResult[] = results.map((r: any) => ({
      title: r.title ?? "",
      url: r.url ?? "",
      content: stripMarkdown(r.content ?? ""),
      relevance_score: r.relevance_score,
      source: r.source,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatted = results.map((r: any, i: number) => {
      return `Source ${i + 1}: ${r.title ?? "Untitled"}\n${stripMarkdown(r.content ?? "")}`;
    });
    return {
      context: `Paper content from search:\n\n${formatted.join("\n\n")}`,
      activities: [{ tool_name: "search_academic", query: url, results: searchResults }],
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const item = items[0] as any;
  const paperResult: SearchResult = {
    title: item.title ?? url,
    url,
    content: stripMarkdown(item.content),
  };
  return {
    context: `Paper: ${item.title ?? url}\n\n${stripMarkdown(item.content)}`,
    activities: [{ tool_name: "search_academic", query: url, results: [paperResult] }],
  };
}

/**
 * Fetch financial context for a watchlist of tickers.
 * Runs parallel searches and combines into a portfolio briefing.
 */
export async function fetchWatchlistContext(
  tickers: string[]
): Promise<PrefetchResult> {
  const valyu = getClient();
  const allActivities: PrefetchedActivity[] = [];

  const results = await Promise.all(
    tickers.map(async (ticker) => {
      const query = `${ticker} stock price performance earnings latest news`;
      const response = await valyu.search(query, {
        searchType: "all",
        maxNumResults: 5,
        responseLength: "short",
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawItems = response.results ?? [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const searchResults: SearchResult[] = rawItems.map((r: any) => ({
        title: r.title ?? "",
        url: r.url ?? "",
        content: stripMarkdown(r.content ?? ""),
        relevance_score: r.relevance_score,
        source: r.source,
      }));

      allActivities.push({
        tool_name: "search_financial",
        query: `${ticker.toUpperCase()} analysis`,
        results: searchResults,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const items = rawItems.map((r: any) => ({
        title: r.title ?? "",
        content: r.content ?? "",
        url: r.url ?? "",
      }));

      const summary = items
        .slice(0, 3)
        .map(
          (r: { title: string; content: string; url: string }) =>
            `${r.title}: ${stripMarkdown(r.content)}`
        )
        .join("\n\n");

      return `${ticker.toUpperCase()}:\n${summary || "No data found."}`;
    })
  );

  return {
    context: `Portfolio Watchlist Briefing\n\n${results.join("\n\n")}`,
    activities: allActivities,
  };
}

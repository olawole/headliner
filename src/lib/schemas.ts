import { z } from "zod";
import { PERSONA_TYPES } from "./personas";

export const personaTypeSchema = z.enum(PERSONA_TYPES);

export const difficultySchema = z.enum([
  "general",
  "undergraduate",
  "graduate",
  "expert",
]);

export type Difficulty = z.infer<typeof difficultySchema>;

export const createConversationRequestSchema = z.object({
  persona_type: personaTypeSchema,
  replica_id: z.string().optional(),
  topic: z.string().optional(),
  paper_url: z.string().url().optional(),
  watchlist: z.array(z.string()).optional(),
  difficulty: difficultySchema.optional(),
});

export const searchRequestSchema = z.object({
  tool_name: z.enum([
    "search_web",
    "search_academic",
    "search_financial",
    "search_news",
  ]),
  query: z.string().min(1),
});

export const searchResultSchema = z.object({
  title: z.string(),
  url: z.string(),
  content: z.string(),
  relevance_score: z.number().optional(),
  source: z.string().optional(),
});

export const prefetchedActivitySchema = z.object({
  tool_name: z.string(),
  query: z.string(),
  results: z.array(searchResultSchema),
});

export const conversationResponseSchema = z.object({
  conversation_id: z.string(),
  conversation_url: z.string().url(),
  status: z.string(),
  prefetched_activities: z.array(prefetchedActivitySchema).optional(),
});

export const searchResponseSchema = z.object({
  success: z.boolean(),
  results: z.array(searchResultSchema),
  query: z.string(),
  tool_name: z.string(),
});

export const createPersonaRequestSchema = z.object({
  persona_type: personaTypeSchema.optional(),
  persona_name: z.string().optional(),
  system_prompt: z.string().optional(),
  replica_id: z.string().optional(),
});

export type CreateConversationRequest = z.infer<
  typeof createConversationRequestSchema
>;
export type ConversationResponse = z.infer<typeof conversationResponseSchema>;
export type SearchRequest = z.infer<typeof searchRequestSchema>;
export type SearchResult = z.infer<typeof searchResultSchema>;
export type SearchResponse = z.infer<typeof searchResponseSchema>;

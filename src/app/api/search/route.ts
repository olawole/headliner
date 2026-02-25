import { NextRequest, NextResponse } from "next/server";
import { executeSearch } from "@/lib/valyu";
import { searchRequestSchema } from "@/lib/schemas";

/** Extract a Bearer token from the Authorization header */
function getUserToken(request: NextRequest): string | undefined {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7);
  }
  return undefined;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = searchRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const userToken = getUserToken(request);
    const { results, query } = await executeSearch(parsed.data, userToken);

    return NextResponse.json({
      success: true,
      results,
      query,
      tool_name: parsed.data.tool_name,
    });
  } catch (error) {
    console.error("Search failed:", error);
    return NextResponse.json(
      { error: "Search failed", results: [], query: "", tool_name: "" },
      { status: 500 }
    );
  }
}

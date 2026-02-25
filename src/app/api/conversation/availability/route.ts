import { NextResponse } from "next/server";
import {
  getActiveConversationCount,
  MAX_CONCURRENT_STREAMS,
} from "@/lib/tavus";

export async function GET() {
  try {
    const active = await getActiveConversationCount();
    return NextResponse.json({
      available: active < MAX_CONCURRENT_STREAMS,
      active,
      max: MAX_CONCURRENT_STREAMS,
    });
  } catch (error) {
    console.error("Failed to check availability:", error);
    // On error, assume available so we don't block users unnecessarily
    return NextResponse.json({
      available: true,
      active: 0,
      max: MAX_CONCURRENT_STREAMS,
    });
  }
}

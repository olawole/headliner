import { NextRequest, NextResponse } from "next/server";
import { createPersona } from "@/lib/tavus";
import { createPersonaRequestSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createPersonaRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = await createPersona({
      personaType: parsed.data.persona_type,
      personaName: parsed.data.persona_name,
      systemPrompt: parsed.data.system_prompt,
      replicaId: parsed.data.replica_id,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to create persona:", error);
    return NextResponse.json(
      { error: "Failed to create persona" },
      { status: 500 }
    );
  }
}

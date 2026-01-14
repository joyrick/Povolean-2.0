import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { orchestrate } from "@/lib/ai/orchestrator";
import type { OrchestratorInput } from "@/types/ai/ai";

export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as OrchestratorInput;

    const result = await orchestrate(body);
    return NextResponse.json(result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("AI route error", error);

    return NextResponse.json(
      {
        message: "AI route error",
        error: String(error),
      },
      { status: 500 }
    );
  }
}

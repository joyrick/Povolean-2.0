import { NextRequest, NextResponse } from "next/server";
import type { OrchestratorInput, OrchestratorOutput } from "@/types/ai/ai";

export const runtime = "nodejs";

async function parsePdfBlobs(blobs: Blob[]): Promise<string> {
  const globalWithDOMMatrix = globalThis as typeof globalThis & {
    DOMMatrix?: unknown;
  };

  if (typeof globalWithDOMMatrix.DOMMatrix === "undefined") {
    class SimpleDOMMatrix {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      constructor(_init?: unknown) {}
    }
    globalWithDOMMatrix.DOMMatrix = SimpleDOMMatrix;
  }

  const pdfjsLib = (await import(
    "pdfjs-dist/legacy/build/pdf.mjs"
  )) as typeof import("pdfjs-dist/legacy/build/pdf.mjs");

  type TextItem = { str: string };

  const texts = await Promise.all(
    blobs.map(async (blob) => {
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
        disableWorker: true,
      });

      const pdf = await loadingTask.promise;
      const pageTexts: string[] = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const items = content.items as TextItem[];
        const text = items.map((item) => item.str).join(" ");
        pageTexts.push(text);
      }

      return pageTexts.join("\n\n");
    })
  );

  return texts.join("\n\n---\n\n");
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();

    const blobs = formData
      .getAll("files")
      .filter((value): value is Blob => value instanceof Blob);

    if (blobs.length === 0) {
      return NextResponse.json(
        { message: "No files provided" },
        { status: 400 }
      );
    }

    const parsedText = await parsePdfBlobs(blobs);

    const extraTextRaw = formData.get("text");
    const extraText =
      typeof extraTextRaw === "string" ? extraTextRaw.trim() : "";
    const combinedText =
      extraText.length > 0
        ? `${parsedText}\n\n--- EXTRA TEXT ---\n\n${extraText}`
        : parsedText;

    const body: OrchestratorInput = {
      task: "extract_b2b6b7ce",
      message: combinedText,
    };

    const apiUrl = new URL("/api/ai", request.url);

    const aiRes = await fetch(apiUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!aiRes.ok) {
      const errorBody = await aiRes.json().catch(() => null);
      return NextResponse.json(
        {
          message: "AI extrakcia zlyhala",
          error: errorBody,
        },
        { status: 500 }
      );
    }

    const json = (await aiRes.json()) as OrchestratorOutput;
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Chyba pri spracovaní PDF",
        error: String(error),
      },
      { status: 500 }
    );
  }
}

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { getProjectFileTree, renameProjectPath } from "@/lib/files/project-tree.files";

type SectionLetter = "A" | "B" | "C" | "D" | "E" | "UNKNOWN";

function sectionFromFilename(filename: string): SectionLetter {
  const withoutExt = filename.replace(/\.pdf$/i, "");
  const parts = withoutExt.split("_");
  if (parts.length < 5) return "UNKNOWN";

  const p5 = parts[4];

  if (p5 === "A00") return "A";
  if (p5 === "B00") return "B";
  if (p5 === "C00") return "C";
  if (p5 === "E00") return "E";
  if ((p5.startsWith("S") || p5.startsWith("P")) && /^\d+$/.test(p5.slice(1))) {
    return "D";
  }
  return "UNKNOWN";
}

async function autoRestructure(fullPath: string): Promise<void> {
  const root = fullPath;
  const sortedRoot = path.join(root, "sorted");
  await fs.mkdir(sortedRoot, { recursive: true });

  async function walk(currentDir: string): Promise<void> {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (entryPath === sortedRoot) continue;
        await walk(entryPath);
        continue;
      }

      if (!entry.name.toLowerCase().endsWith(".pdf")) continue;

      const section = sectionFromFilename(entry.name);
      if (section === "UNKNOWN") continue;

      const targetDir = path.join(sortedRoot, section);
      await fs.mkdir(targetDir, { recursive: true });

      const targetPath = path.join(targetDir, entry.name);
      await fs.copyFile(entryPath, targetPath);
    }
  }

  await walk(root);
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const fullPath = req.nextUrl.searchParams.get("fullPath") ?? undefined;

  try {
    const tree = await getProjectFileTree(fullPath);
    return NextResponse.json(tree);
  } catch {
    return NextResponse.json(
      { error: "Failed to read project file tree" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as {
    path?: string;
    newName?: string;
    fullPath?: string;
  };

  if (!body.path || !body.newName) {
    return NextResponse.json(
      { error: "Missing path or newName" },
      { status: 400 }
    );
  }

  const { path: relativePath, newName, fullPath } = body;

  try {
    await renameProjectPath(relativePath, newName, fullPath);
    const tree = await getProjectFileTree(fullPath);
    return NextResponse.json(tree);
  } catch {
    return NextResponse.json({ error: "Rename failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as {
    action?: string;
    fullPath?: string;
  };

  if (body.action !== "auto_restructure") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  if (!body.fullPath) {
    return NextResponse.json({ error: "Missing fullPath" }, { status: 400 });
  }

  try {
    await autoRestructure(body.fullPath);
    const tree = await getProjectFileTree(body.fullPath);
    return NextResponse.json(tree);
  } catch {
    return NextResponse.json(
      { error: "Auto restructure failed" },
      { status: 500 }
    );
  }
}

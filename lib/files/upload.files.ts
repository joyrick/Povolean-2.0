import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type { LocalStoredFile } from "@/types/files";

const localFiles: LocalStoredFile[] = [];

export function getLocalFiles(): LocalStoredFile[] {
  return localFiles;
}

export async function saveUploadedFiles(
  uploadedFiles: File[]
): Promise<LocalStoredFile[]> {
  const uploadRoot = path.join(process.cwd(), "uploads");
  await fs.mkdir(uploadRoot, { recursive: true });

  const now = new Date().toISOString();
  const folderName = now.slice(0, 10).replace(/-/g, "");
  const folderPath = path.join(uploadRoot, folderName);
  await fs.mkdir(folderPath, { recursive: true });

  for (const file of uploadedFiles) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filePath = path.join(folderPath, file.name);
    await fs.writeFile(filePath, buffer);

    const record: LocalStoredFile = {
      id: randomUUID(),
      originalName: file.name,
      folderName,
      relativePath: path.relative(process.cwd(), filePath).replace(/\\/g, "/"),
      mimeType: file.type,
      size: file.size,
      uploadedAt: now,
    };

    localFiles.push(record);
  }

  return localFiles;
}

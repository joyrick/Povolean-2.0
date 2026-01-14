import { promises as fs } from "fs";
import path from "path";
import type { ProjectFileNode } from "@/types/files/local-files";

const ROOT_DIR = process.env.PROJECT_FILES_ROOT;

async function readDirRecursive(
  dir: string,
  baseDir: string
): Promise<ProjectFileNode[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  const nodes = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dir, entry.name);
      const relativePath = path
        .relative(baseDir, entryPath)
        .replace(/\\/g, "/");

      if (entry.isDirectory()) {
        const children = await readDirRecursive(entryPath, baseDir);
        return {
          path: relativePath,
          name: entry.name,
          isDirectory: true,
          children,
        } satisfies ProjectFileNode;
      }

      return {
        path: relativePath,
        name: entry.name,
        isDirectory: false,
      } satisfies ProjectFileNode;
    })
  );

  return nodes.sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) {
      return a.isDirectory ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

export async function getProjectFileTree(
  rootOverride?: string
): Promise<ProjectFileNode[]> {
  const baseDir =
    rootOverride && rootOverride.trim() !== "" ? rootOverride : ROOT_DIR;

  try {
    if (baseDir === ROOT_DIR) {
      await fs.mkdir(baseDir, { recursive: true });
    }

    console.log("Using project files root directory:", baseDir);

    const tree = await readDirRecursive(baseDir, baseDir);
    return tree;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error while reading project file tree from", baseDir, error);
    return [];
  }
}

export async function renameProjectPath(
  relativePath: string,
  newName: string,
  rootOverride?: string
): Promise<void> {
  if (newName.trim() === "") {
    throw new Error("New name must not be empty");
  }

  const baseDir =
    rootOverride && rootOverride.trim() !== "" ? rootOverride : ROOT_DIR;

  const oldAbsolutePath = path.join(baseDir, relativePath);
  const directory = path.dirname(oldAbsolutePath);
  const newAbsolutePath = path.join(directory, newName);

  await fs.rename(oldAbsolutePath, newAbsolutePath);
}

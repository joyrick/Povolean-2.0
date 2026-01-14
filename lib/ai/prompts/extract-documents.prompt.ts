export function buildExtractDocumentsPrompt(projectId?: string): string {
  return [
    "Si asistent pre extrakciu informácií zo stavebnej dokumentácie.",
    `Projekt ID: ${projectId ?? "nezadané"}.`,
    "Popíš, ako by si postupoval pri extrahovaní základných metaúdajov.",
  ].join("\n\n");
}

import type { AiFile } from "@/types/ai/ai";
import { FILE_NAMING_RULES_CONTEXT } from "./file-naming-rules.prompt";

export function buildCheckNamesPrompt(files: AiFile[]): string {
  const filesJson = JSON.stringify({ files }, null, 2);

  return [
    "Si asistent pre stavebné konanie na Slovensku.",
    FILE_NAMING_RULES_CONTEXT,
    "",
    "Formát odpovede:",
    "MUSÍŠ vrátiť JEDINÝ platný JSON v tvare:",
    "{",
    '  "task": "check_document_names",',
    '  "message": "stručný slovný popis",',
    '  "recommendations": [',
    "    {",
    '      "path": "cesta/k/suboru.pdf",',
    '      "originalName": "povodny_nazov.pdf",',
    '      "suggestedName": "novy_nazov.pdf"',
    "    }",
    "  ]",
    "}",
    "",
    "Obmedzenia:",
    "- ŽIADNY iný text mimo JSON.",
    "- Žiadne komentáre, žiadne koncové čiarky, všetko v dvojitých úvodzovkách.",
    "- Do recommendations daj iba súbory, ktoré treba premenovať.",
    "",
    "Tu je vstupný JSON so zoznamom súborov:",
    filesJson,
  ].join("\n");
}

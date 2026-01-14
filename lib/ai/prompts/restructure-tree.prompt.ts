import type { AiFile } from "@/types/ai/ai";

export function buildRestructureTreePrompt(files: AiFile[]): string {
  const filesJson = JSON.stringify({ files }, null, 2);

  return [
    "Si asistent pre stavebné konanie na Slovensku.",
    "Úloha: navrhni usporiadanie stromu dokumentov podľa zákona 60/2025 Z. z. a logickej štruktúry projektu.",
    "Použi tie isté pravidlá pre názvoslovie a členenie dokumentácie ako pri kontrole názvov,",
    "ale teraz sa sústreď najmä na to, DO KTORÝCH PRIEČINKOV by mali jednotlivé dokumenty patriť.",
    "",
    "Formát odpovede:",
    "MUSÍŠ vrátiť JEDINÝ platný JSON v tvare:",
    "{",
    '  "task": "restructure_tree",',
    '  "message": "stručný slovný popis navrhovaného usporiadania",',
    '  "suggestions": [',
    "    {",
    '      "path": "povodna/cesta/k/suboru.pdf",',
    '      "targetPath": "nova/cesta/k/suboru.pdf"',
    "    }",
    "  ]",
    "}",
    "",
    "Pravidlá pre návrh cieľových ciest (targetPath):",
    "- Zachovaj názov súboru tak, ako je (názvy sa riešia v inej úlohe).",
    "- Zameraj sa na priečinky – reorganizácia má zodpovedať štruktúre podľa 60/2025.",
    "- Nepresúvaj systémové súbory (.DS_Store a pod.), tie vôbec neuvádzaj v suggestions.",
    "",
    "Obmedzenia:",
    "- ŽIADNY iný text mimo JSON.",
    "- Žiadne komentáre, žiadne koncové čiarky, všetko v dvojitých úvodzovkách.",
    "",
    "Tu je vstupný JSON so zoznamom súborov:",
    filesJson,
  ].join("\n");
}

import type { Parcel } from "@/types/real-estate";

export function buildAnalyzeConstructionCasePrompt(params: {
  parcels: Parcel[];
  applicantName: string;
  neighbors?: unknown[];
}): string {
  const { parcels, applicantName, neighbors = [] } = params;

  return [
    "Pôsobíš ako expert na slovenské stavebné právo, kataster nehnuteľností a obchodný register.",
    "Tvojou úlohou je analyzovať vstupné údaje o skupine parciel a firmách a poskytnúť štruktúrovaný výstup pre stavebné konanie.",
    "Dôraz klaď na presnosť, identifikáciu vecných bremien a správne určenie účastníkov konania.",
    "",
    "Analyzuj nasledujúce údaje pre stavebné konanie. Predmetom konania je viacero parciel:",
    "",
    "1. ZOZNAM PREDMETNÝCH PARCIEL:",
    JSON.stringify(parcels, null, 2),
    "",
    "2. ŽIADATEĽ O STAVEBNÉ POVOLENIE:",
    `Meno: ${applicantName}`,
    "",
    "3. SUSEDNÉ PARCELY (Potenciálni účastníci):",
    JSON.stringify(neighbors, null, 2),
    "",
    "Požiadavky:",
    "a) Over, či má žiadateľ vzťah ku všetkým parcelám (C2). Je vlastníkom?",
    "b) Identifikuj účastníkov konania (C3).",
    "c) Pre každú firmu (s.r.o., a.s.) v zozname vlastníkov sprav „mock“ kontrolu (C4).",
    "",
    "Formát odpovede – vráť JEDINÝ JSON objekt:",
    "{",
    '  "ownershipVerified": boolean,',
    '  "ownershipAnalysis": "string",',
    '  "participants": [',
    "    {",
    '      "id": "string",',
    '      "name": "string",',
    '      "reason": "string",',
    '      "address": "string",',
    '      "parcelNumber": "string"',
    "    }",
    "  ],",
    '  "companyChecks": [',
    "    {",
    '      "companyName": "string",',
    '      "ico": "string",',
    '      "isValid": boolean,',
    '      "status": "Aktívna" | "V likvidácii" | "Zrušená" | "Nenašla sa",',
    '      "matchScore": number,',
    '      "details": "string"',
    "    }",
    "  ]",
    "}",
    "",
    "Obmedzenia:",
    "- Výstup musí byť čistý JSON bez komentárov, bez textu mimo JSON.",
  ].join("\n");
}

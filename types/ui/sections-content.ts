import type {
  Section,
  SectionId,
  SectionWithSteps,
  Step,
} from "@/types/ui/sections";

const sectionsTable: Section[] = [
  {
    id: "files",
    title: "Súbory",
    color: "purple",
  },
  {
    id: "priprava_podkladov",
    title: "Príprava podkladov",
    color: "blue",
  },
  {
    id: "stavebny_zamer",
    title: "Stavebný zámer",
    color: "green",
  },
  {
    id: "projekt_stavby",
    title: "Projekt stavby",
    color: "yellow",
  },
  {
    id: "vykovaci_projekt",
    title: "Vykonávací projekt",
    color: "purple",
  },
];

const stepsTable: Step[] = [
  // files section
  {
    id: "file_hierarchy",
    sectionId: "files",
    title: "Hierarchia súborov",
    description: "Prehľad štruktúry nahratých súborov projektu.",
    dueDate: "",
    participantsCount: 0,
  },
  // priprava_podkladov
  {
    id: "prep_s1",
    sectionId: "priprava_podkladov",
    title: "Vyplnenie identifikačných údajov",
    description:
      "Základné údaje o stavbe možno vyplniť manuálne, alebo načítať z portálu výstavby.",
    dueDate: "2025-11-12",
    participantsCount: 3,
  },
  {
    id: "prep_s2",
    sectionId: "priprava_podkladov",
    title: "Základné technické východiská",
    description: "Súhrnná technická správa.",
    dueDate: "2025-11-08",
    prerequisiteId: "prep_s1",
    participantsCount: 2,
  },
  {
    id: "prep_s3",
    sectionId: "priprava_podkladov",
    title: "Vstupné prieskumy a technické podklady",
    description: "Geodetické podklady, ochranné pásma atď.",
    dueDate: "2025-11-08",
    prerequisiteId: "prep_s2",
    participantsCount: 4,
  },
  {
    id: "prep_s4",
    sectionId: "priprava_podkladov",
    title: "Preverenie súladu s ÚPD",
    description: "Kontrola súladu so záväznými regulatívmi územného plánu.",
    dueDate: "2025-11-08",
    prerequisiteId: "prep_s3",
    participantsCount: 1,
  },
  {
    id: "prep_s5",
    sectionId: "priprava_podkladov",
    title: "Dopravné riešenie",
    description:
      "Dokumentácia a údaje k riešeniu napojenia na dopravnú infraštruktúru.",
    dueDate: "2025-11-08",
    prerequisiteId: "prep_s4",
    participantsCount: 2,
  },
  {
    id: "prep_s6",
    sectionId: "priprava_podkladov",
    title: "Technická infraštruktúra",
    description:
      "Podklady k napojeniu na inžinierske siete a technické vybavenie.",
    dueDate: "2025-11-08",
    prerequisiteId: "prep_s5",
    participantsCount: 3,
  },

  // stavebny_zamer – podľa screenshotu „Konanie o stavebnom zámere“
  {
    id: "stavz_s1",
    sectionId: "stavebny_zamer",
    title: "Stavebný zámer",
    description:
      "Časti A0 až E – základný opis navrhovanej stavby a jej parametrov.",
    dueDate: "2025-11-20",
    prerequisiteId: "prep_s6",
    participantsCount: 22,
  },
  {
    id: "stavz_s1.1",
    sectionId: "stavebny_zamer",
    title: "Generovanie bilancie",
    description:
      "Automatické vytvorenie bilancie podľa súhrnnej technickej správy.",
    dueDate: "2025-11-20",
    prerequisiteId: "stavz_s1",
    participantsCount: 8,
  },
  {
    id: "stavz_s2",
    sectionId: "stavebny_zamer",
    title: "EIA",
    description:
      "Environment Impact Assessment – posúdenie vplyvov na životné prostredie.",
    dueDate: "2025-11-22",
    prerequisiteId: "stavz_s1",
    participantsCount: 10,
  },
  {
    id: "stavz_s3",
    sectionId: "stavebny_zamer",
    title: "Výrubové povolenie",
    description:
      "Dokumentácia a informácie k výrubom drevín dotknutých stavbou.",
    dueDate: "2025-11-24",
    prerequisiteId: "stavz_s2",
    participantsCount: 4,
  },
  {
    id: "stavz_s4",
    sectionId: "stavebny_zamer",
    title: "Stanoviská",
    description:
      "Stanoviská dotknutých orgánov, správcov sietí a ďalších účastníkov konania.",
    dueDate: "2025-11-26",
    prerequisiteId: "stavz_s3",
    participantsCount: 3,
  },
  {
    id: "stavz_s5",
    sectionId: "stavebny_zamer",
    title: "Majetkoprávne vzťahy",
    description:
      "Stav a zmluvy k vlastníctvu, nájmom a vecným bremenám na dotknutých pozemkoch.",
    dueDate: "2025-11-28",
    prerequisiteId: "stavz_s4",
    participantsCount: 2,
  },
  {
    id: "stavz_s6",
    sectionId: "stavebny_zamer",
    title: "Podanie žiadosti na stavebný úrad",
    description:
      "Kompletizácia podkladov a vytvorenie podania pre stavebný úrad.",
    dueDate: "2025-11-30",
    prerequisiteId: "stavz_s5",
    participantsCount: 1,
  },

  // projekt_stavby – druhý stĺpec zo screenshotu
  {
    id: "ps_s1",
    sectionId: "projekt_stavby",
    title: "Projekt stavby",
    description:
      "Projektová dokumentácia stavby v rozsahu požadovanom pre stavebné konanie.",
    dueDate: "2025-12-05",
    prerequisiteId: "stavz_s7",
    participantsCount: 17,
  },
  {
    id: "ps_s2",
    sectionId: "projekt_stavby",
    title: "Overenie stavebným úradom",
    description:
      "Overenie súladu projektovej dokumentácie so stavebným zámerom a rozhodnutiami.",
    dueDate: "2025-12-10",
    prerequisiteId: "ps_1_projekt_stavby",
  },
  {
    id: "vp_s1",
    sectionId: "vykovaci_projekt",
    title: "Projekt stavby VP",
    description:
      "Časti projektu stavby v rámci vykonávacieho projektu od A po D.",
    dueDate: "2025-12-15",
    prerequisiteId: "ps_s2",
    participantsCount: 3,
  },
  {
    id: "vp_s2",
    sectionId: "vykovaci_projekt",
    title: "Nacenenie stavby",
    description: "Vytýčenie ceny stavby.",
    dueDate: "2025-12-20",
    prerequisiteId: "vp_s1",
    participantsCount: 1,
  },
];

export function getSectionsBoard(): SectionWithSteps[] {
  return sectionsTable.map((section) => ({
    ...section,
    steps: stepsTable.filter((step) => step.sectionId === section.id),
  }));
}

export function getStepById(id: string): Step | undefined {
  return stepsTable.find((step) => step.id === id);
}

export function getSectionById(id: SectionId): SectionWithSteps | undefined {
  const section = sectionsTable.find((s) => s.id === id);
  if (section === undefined) {
    return undefined;
  }
  return {
    ...section,
    steps: stepsTable.filter((step) => step.sectionId === id),
  };
}

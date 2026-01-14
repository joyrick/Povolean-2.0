import { ComplianceAnalysis, TechnicalAnalysis, DiscussionReportData } from "../types";

export const MOCK_DISCUSSION_REPORT: DiscussionReportData = {
  A_authorities_list: [
    { name: "Okresný úrad, Odbor starostlivosti o ŽP - Odpady", date_contacted: "10.01.2025" },
    { name: "Bratislavská vodárenská spoločnosť, a.s.", date_contacted: "12.01.2025" },
    { name: "Regionálny úrad verejného zdravotníctva", date_contacted: "10.01.2025" },
    { name: "OR Hasičského a záchranného zboru", date_contacted: "15.01.2025" },
    { name: "Magistrát hlavného mesta SR", date_contacted: "11.01.2025" }
  ],
  B_delivered_opinions: [
    {
      authority_name: "Okresný úrad, Odbor starostlivosti o ŽP - Odpady",
      delivery_date: "05.02.2025",
      content_summary: "Súhlas s predloženým projektom odpadového hospodárstva.",
      conditions: ["Doložiť zmluvu s oprávnenou organizáciou na odvoz odpadu pred kolaudáciou.", "Separovať stavebný odpad."]
    },
    {
      authority_name: "Bratislavská vodárenská spoločnosť, a.s.",
      delivery_date: "28.01.2025",
      content_summary: "Súhlas s napojením na verejný vodovod a kanalizáciu.",
      conditions: ["Vybudovať revíznu šachtu na hranici pozemku.", "Dodržať technické podmienky pripojenia č. 2025/123."]
    }
  ],
  C_silent_authorities: [
    "Slovenský plynárenský priemysel - distribúcia (Uplatnená fikcia súhlasu § 22 ods. 3)"
  ],
  D_projection_evaluation: "Projektant vyhodnotil všetky doručené stanoviská. Pripomienky BVS boli zapracované do výkresovej časti PD zdravotechniky. Podmienky OÚŽP sú rešpektované v technickej správe.",
  E_compliance_summary: "Stavebný zámer bol riadne prerokovaný s dotknutými orgánmi. Všetky vznesené požiadavky boli akceptované a zapracované. Dokumentácia je v súlade s verejnými záujmami.",
  F_signatures_placeholder: "Táto správa musí byť podpísaná hlavným projektantom a stavebníkom pred podaním žiadosti."
};

export const MOCK_COMPLIANCE_RESULT: ComplianceAnalysis = {
  summary: "Analýza preukázala vysokú mieru súladu medzi stanoviskami dotknutých orgánov a projektovou dokumentáciou (90%). Boli identifikované 3 kritické rozpory, ktoré je potrebné odstrániť pred podaním žiadosti o povolenie.",
  matches: [
    {
      source_document: "Stanovisko OÚŽP - Odpady",
      description: "Požiadavka na separáciu stavebného odpadu",
      status_detail: "V technickej správe (str. 12) je zapracovaný plán odpadového hospodárstva v plnom rozsahu.",
      severity: "INFO"
    },
    {
      source_document: "Stanovisko BVS, a.s.",
      description: "Napojenie na verejný vodovod",
      status_detail: "Projekt zdravotechniky rešpektuje bod napojenia určený vo vyjadrení BVS.",
      severity: "INFO"
    },
    {
      source_document: "Úrad verejného zdravotníctva",
      description: "Svetlotechnický posudok",
      status_detail: "Posudok je súčasťou dokumentácie a spĺňa limity pre preslnenie obytných miestností.",
      severity: "INFO"
    },
     {
      source_document: "Hasičský zbor (HaZZ)",
      description: "Návrh evakuačného výťahu",
      status_detail: "Evakuačný výťah je navrhnutý v jadre A podľa požiadaviek vyhl. 94/2004 Z.z.",
      severity: "INFO"
    }
  ],
  discrepancies: [
    {
      source_document: "OR HaZZ (Hasiči)",
      description: "Odstupová vzdialenosť od susedného objektu",
      status_detail: "HaZZ požaduje odstup 5,0m z dôvodu sálavého tepla. V situácii (výkres C.1) je zakótovaná vzdialenosť iba 3,5m. Toto je v priamom rozpore s podmienkou č. 3 stanoviska.",
      severity: "HIGH"
    },
    {
      source_document: "Magistrát hl. mesta SR (Doprava)",
      description: "Počet parkovacích stojísk pre návštevy",
      status_detail: "Stanovisko vyžaduje 12 parkovacích miest pre návštevy na teréne. Projektová dokumentácia v časti Doprava uvažuje len s 10 miestami. Chýbajú 2 miesta.",
      severity: "HIGH"
    },
    {
      source_document: "Pamiatkový úrad",
      description: "Farebnosť fasády",
      status_detail: "Stanovisko povoľuje len zemité odtiene. Vizualizácie v architektonickej štúdii ukazujú výraznú modrú akcentovú farbu.",
      severity: "MEDIUM"
    }
  ],
  missing_requirements: [
    {
      source_document: "SPP - distribúcia",
      description: "Ochranné pásmo plynovodu",
      status_detail: "V technickej správe úplne chýba zmienka o rešpektovaní 1m ochranného pásma STL plynovodu pri vjazde na pozemok, čo bola podmienka plynárov.",
      severity: "MEDIUM"
    },
    {
      source_document: "Obvodný úrad životného prostredia",
      description: "Náhradná výsadba",
      status_detail: "Stanovisko ukladá povinnosť špecifikovať druhovú skladbu náhradnej výsadby. V projekte sadových úprav tento zoznam chýba.",
      severity: "MEDIUM"
    }
  ]
};

export const MOCK_TECHNICAL_RESULT: TechnicalAnalysis = {
  pollution_sources: [
    "Stacionárny zdroj znečistenia: Plynová kotolňa (výkon 150 kW) - Stredný zdroj znečistenia",
    "Líniový zdroj: Vnútroareálová komunikácia a parkovisko (12 stojísk)",
    "Plošný zdroj: Stavenisko počas realizácie (prašnosť)"
  ],
  water_structures: [
    "Vsakovacia galéria dažďových vôd (objem 15 m3) - vyžaduje vodoprávne povolenie",
    "Lapač ropných látok na parkovisku (typ ORL-5)",
    "Vodovodná prípojka DN32",
    "Kanalizačná prípojka DN160"
  ],
  specific_operations: [
    "Vzduchotechnická jednotka na streche objektu (zdroj hluku)",
    "Náhradný zdroj elektrickej energie (dieselagregát) - vyžaduje súhlas na umiestnenie",
    "Chladenie serverovne - vonkajšia jednotka"
  ],
  permitting_attention: [
    {
      item: "Povolenie vodnej stavby",
      reason: "Vsakovacie zariadenie je vodnou stavbou podľa vodného zákona, vyžaduje samostatné povolenie orgánu štátnej vodnej správy predtým alebo súbežne so stavebným konaním.",
      legislation_reference: "Zákon č. 364/2004 Z. z. (Vodný zákon)"
    },
    {
      item: "Súhlas na výrub drevín",
      reason: "V situácii je navrhované odstránenie 3 ks vzrastlých stromov. Nutné doložiť súhlas obce pred vydaním SP.",
      legislation_reference: "Zákon č. 543/2002 Z. z."
    },
    {
      item: "Záväzné stanovisko k zmene stavby",
      reason: "Vzhľadom na zmenu účelu časti suterénu oproti ÚP je potrebné nové záväzné stanovisko obce.",
      legislation_reference: "§ 140b Stavebného zákona"
    },
    {
      item: "Hluková štúdia",
      reason: "Vzhľadom na umiestnenie VZT jednotiek na streche v blízkosti obytnej zástavby bude úrad pravdepodobne požadovať hlukovú štúdiu.",
      legislation_reference: "Vyhláška MZ SR č. 549/2007 Z. z."
    }
  ]
};
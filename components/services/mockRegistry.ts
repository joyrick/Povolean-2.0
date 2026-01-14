import { OwnerType, Parcel, MapParcelData } from "@/types/real-estate";

export const fetchMockParcelData = async (
  parcelNumber: string,
  cadastralArea: string
): Promise<Parcel> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const isCompanyScenario =
    parcelNumber.includes("4") || parcelNumber.includes("9");
  const hasEncumbrance =
    parcelNumber.includes("2") || parcelNumber.includes("7");

  const baseParcel: Parcel = {
    parcelNumber: parcelNumber,
    cadastralArea: cadastralArea,
    type: "C",
    area: Math.floor(Math.random() * 800) + 200,
    landType: parcelNumber.includes("1")
      ? "Zastavaná plocha a nádvorie"
      : "Záhrada",
    owners: [],
    encumbrances: [],
    pdfUrl: "https://picsum.photos/600/800", // Placeholder for PDF visualization
  };

  if (isCompanyScenario) {
    baseParcel.owners = [
      {
        id: `own_${parcelNumber}_1`,
        name: "STAVBA s.r.o.",
        address: "Priemyselná 5, 821 09 Bratislava",
        ico: "12345678",
        share: "1/1",
        type: OwnerType.COMPANY,
      },
    ];
  } else {
    baseParcel.owners = [
      {
        id: `own_${parcelNumber}_2`,
        name: "Ján Novák",
        address: "Hlavná 12, 040 01 Košice",
        share: "1/2",
        type: OwnerType.PERSON,
      },
      {
        id: `own_${parcelNumber}_3`,
        name: "Mária Nováková",
        address: "Hlavná 12, 040 01 Košice",
        share: "1/2",
        type: OwnerType.PERSON,
      },
    ];
  }

  if (hasEncumbrance) {
    baseParcel.encumbrances = [
      `V-${Math.floor(
        Math.random() * 1000
      )}/2020 - Vecné bremeno práva prechodu a prejazdu`,
    ];
  }

  return baseParcel;
};

/**
 * Mocks fetching neighboring parcels for C3 (Participants)
 */
export const fetchMockNeighbors = async (
  centerParcel: string
): Promise<Parcel[]> => {
  return [
    {
      parcelNumber: `999/1`,
      cadastralArea: "Mock Area",
      type: "C",
      area: 300,
      landType: "Záhrada",
      owners: [
        {
          id: "n1",
          name: "Peter Sused",
          address: "Vedľajšia 1",
          share: "1/1",
          type: OwnerType.PERSON,
        },
      ],
      encumbrances: [],
    },
    {
      parcelNumber: `999/2`,
      cadastralArea: "Mock Area",
      type: "C",
      area: 450,
      landType: "Orná pôda",
      owners: [
        {
          id: "n2",
          name: "AGRO s.r.o.",
          address: "Poľná 99",
          ico: "87654321",
          share: "1/1",
          type: OwnerType.COMPANY,
        },
      ],
      encumbrances: [],
    },
  ];
};

/**
 * Returns mock SVG path data for a cadastral map with 10 parcels
 */
export const fetchMockMapParcels = async (): Promise<MapParcelData[]> => {
  // 10 parcels arranged in a 5 columns x 2 rows grid
  // Width approx 100px per col, Height approx 150px per row
  const parcels: MapParcelData[] = [
    // Row 1
    {
      id: "p1",
      number: "1201/1",
      d: "M20,50 L120,40 L115,190 L25,200 Z",
      cx: 70,
      cy: 120,
      area: 845,
    },
    {
      id: "p2",
      number: "1201/2",
      d: "M120,40 L220,45 L215,195 L115,190 Z",
      cx: 170,
      cy: 120,
      area: 600,
    },
    {
      id: "p3",
      number: "1201/3",
      d: "M220,45 L320,50 L315,190 L215,195 Z",
      cx: 270,
      cy: 120,
      area: 900,
    },
    {
      id: "p4",
      number: "1201/4",
      d: "M320,50 L420,45 L425,195 L315,190 Z",
      cx: 370,
      cy: 120,
      area: 1200,
    },
    {
      id: "p5",
      number: "1201/5",
      d: "M420,45 L520,50 L525,200 L425,195 Z",
      cx: 470,
      cy: 120,
      area: 800,
    },

    // Row 2
    {
      id: "p6",
      number: "1201/6",
      d: "M25,200 L115,190 L120,340 L20,350 Z",
      cx: 70,
      cy: 270,
      area: 850,
    },
    {
      id: "p7",
      number: "1201/7",
      d: "M115,190 L215,195 L220,345 L120,340 Z",
      cx: 170,
      cy: 270,
      area: 620,
    },
    {
      id: "p8",
      number: "1201/8",
      d: "M215,195 L315,190 L320,340 L220,345 Z",
      cx: 270,
      cy: 270,
      area: 910,
    },
    {
      id: "p9",
      number: "1201/9",
      d: "M315,190 L425,195 L420,345 L320,340 Z",
      cx: 370,
      cy: 270,
      area: 1150,
    },
    {
      id: "p10",
      number: "1201/10",
      d: "M425,195 L525,200 L530,350 L420,345 Z",
      cx: 475,
      cy: 270,
      area: 810,
    },
  ];
  return parcels;
};

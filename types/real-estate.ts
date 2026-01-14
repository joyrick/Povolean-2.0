export enum OwnerType {
  PERSON = "Fyzická osoba",
  COMPANY = "Právnická osoba",
  STATE = "Štát/Obec",
}

export interface Owner {
  id: string;
  name: string;
  address: string;
  ico?: string;
  share: string;
  type: OwnerType;
}

export interface Parcel {
  parcelNumber: string;
  cadastralArea: string;
  type: "C" | "E";
  area: number;
  landType: string;
  owners: Owner[];
  encumbrances: string[];
  pdfUrl?: string;
}

export interface Participant {
  id: string;
  name: string;
  reason: string;
  parcelNumber?: string;
  address: string;
}

export interface CompanyCheckResult {
  companyName: string;
  ico: string;
  isValid: boolean;
  status: "Aktívna" | "V likvidácii" | "Zrušená" | "Nenašla sa";
  matchScore: number;
  details: string;
}

export interface MapParcelData {
  id: string;
  number: string;
  d: string;
  cx: number;
  cy: number;
  area: number;
}

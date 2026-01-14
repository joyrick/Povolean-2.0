export type SectionId =
  | "files"
  | "priprava_podkladov"
  | "stavebny_zamer"
  | "projekt_stavby"
  | "vykovaci_projekt";

export type SectionColor = "blue" | "yellow" | "green" | "purple";

export type Section = {
  id: SectionId;
  title: string;
  color: SectionColor;
};

export type Step = {
  id: string;
  sectionId: SectionId;
  title: string;
  description: string;
  dueDate: string;
  prerequisiteId?: string;
  participantsCount?: number;
};

export type SectionWithSteps = Section & {
  steps: Step[];
};

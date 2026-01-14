import type { SectionWithSteps } from "./sections";

export type StepCardProps = {
  title: string;
  description: string;
  assigneeName: string;
  dueDate: string;
  commentsCount: number;
};

export type SectionColumnProps = {
  section: SectionWithSteps;
};

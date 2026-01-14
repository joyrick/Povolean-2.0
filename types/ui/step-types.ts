export type StepStatus = "not_started" | "in_progress" | "completed" | "connected";

export type Step = {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
  prerequisiteId?: string;
};

export type StepCardProps = {
  index: number;
  title: string;
  description: string;
  status: StepStatus;
  dueDate?: string;
  participantsCount?: number;
  onOpen?: () => void;
  locked?: boolean;
  color: string;
  stepId?: string;
};

export const STEP_KEYS = [
  "prep_s0",
  "prep_s1",
  "prep_s2",
  "prep_s3",
  "prep_s4",
  "prep_s5",
  "prep_s6",
  "stavz_s1",
  "stavz_s1.1",
  "stavz_s2",
  "stavz_s3",
  "stavz_s4",
  "stavz_s5",
  "stavz_s6",
  "stavz_s7",
  "ps_s1",
  "ps_s2",
  "vp_s1",
  "vp_s2",
] as const;

export type StepKey = (typeof STEP_KEYS)[number];

export type StepState = {
  status: StepStatus;
  updatedAt?: string;
};

export type StepsState = Record<StepKey, StepState>;

export function createDefaultStepsState(): StepsState {
  return Object.fromEntries(
    STEP_KEYS.map((key) => [key, { status: "not_started" } satisfies StepState])
  ) as StepsState;
}

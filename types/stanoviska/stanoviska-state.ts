import type { AnalysisResult as OwnershipAnalysisResult } from "./ownership-analysis";

export interface AppState {
  view: "map" | "analysis";
  isLoading: boolean;
  parcelInput: string;
  cadastralInput: string;
  applicantName: string;
  result: OwnershipAnalysisResult | null;
  error: string | null;
}

export interface FileWithPreview extends File {
  preview?: string;
}

export enum AppState_stavz_s4 {
  IDLE = "IDLE",
  GENERATING_REPORT = "GENERATING_REPORT",
  REPORT_GENERATED = "REPORT_GENERATED",
  ANALYZING = "ANALYZING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

export interface ProcessingError {
  message: string;
}

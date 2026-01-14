import type { Parcel } from "@/types/real-estate";
import type { ProjectFormB2B6B7CE } from "@/types/form";
import type {
  AnalysisResult as ConstructionAnalysisResult,
  ComplianceAnalysis,
  TechnicalAnalysis,
  DiscussionReportData,
} from "@/types/stanoviska/environment-analysis";

export type OrchestratorTask =
  | "check_document_names"
  | "restructure_tree"
  | "extract_b2b6b7ce"
  | "chat"
  | "extract_documents"
  | "analyze_construction_case"
  | "generate_discussion_report"
  | "analyze_compliance"
  | "analyze_technical_report";

export interface AiFile {
  path: string;
  originalName: string;
  mimeType?: string;
  size?: number;
}

export interface NameRecommendation {
  path: string;
  originalName: string;
  suggestedName: string;
}

export interface TreeRestructureSuggestion {
  path: string;
  targetPath: string;
}

export interface OrchestratorInput {
  task: OrchestratorTask;

  files?: AiFile[];
  message?: string;
  context?: string;
  projectId?: string;

  parcels?: Parcel[];
  applicantName?: string;
  neighbors?: unknown[];

  opinionsText?: string[];
  discussionReportText?: string;
  technicalReportText?: string;
}

export interface OrchestratorOutput {
  task: OrchestratorTask;
  message: string;

  recommendations?: NameRecommendation[];

  restructureSuggestions?: TreeRestructureSuggestion[];

  projectFormB2B6B7CE?: ProjectFormB2B6B7CE;

  constructionAnalysis?: ConstructionAnalysisResult;

  discussionReport?: DiscussionReportData;

  complianceAnalysis?: ComplianceAnalysis;

  technicalAnalysis?: TechnicalAnalysis;
}

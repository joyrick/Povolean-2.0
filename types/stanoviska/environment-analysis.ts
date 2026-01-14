export interface ComplianceAnalysis {
  summary: string;
  matches: ComplianceItem[];
  discrepancies: ComplianceItem[];
  missing_requirements: ComplianceItem[];
}

export interface ComplianceItem {
  source_document: string;
  description: string;
  status_detail: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "INFO";
}

export interface TechnicalAnalysis {
  pollution_sources: string[];
  water_structures: string[];
  specific_operations: string[];
  permitting_attention: PermitAttentionItem[];
}

export interface PermitAttentionItem {
  item: string;
  reason: string;
  legislation_reference?: string;
}

export interface AnalysisResult {
  compliance: ComplianceAnalysis;
  technical: TechnicalAnalysis;
}

export interface DiscussionReportData {
  A_authorities_list: AuthorityContact[];
  B_delivered_opinions: AuthorityOpinionContent[];
  C_silent_authorities: string[];
  D_projection_evaluation: string;
  E_compliance_summary: string;
  F_signatures_placeholder: string;
}

export interface AuthorityContact {
  name: string;
  date_contacted?: string;
}

export interface AuthorityOpinionContent {
  authority_name: string;
  delivery_date: string;
  content_summary: string;
  conditions: string[];
}

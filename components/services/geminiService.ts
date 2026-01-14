import type { Parcel } from "@/types/real-estate";
import type {
  AnalysisResult,
  ComplianceAnalysis,
  TechnicalAnalysis,
  DiscussionReportData,
} from "@/types/stanoviska/environment-analysis";
import { orchestrate } from "@/lib/ai/orchestrator";

// If you already have this somewhere, keep the import instead of redefining
declare function fetchMockNeighbors(parcelNumber: string): Promise<
  Array<{
    parcelNumber: string;
    owners: { id: string; name: string; address: string }[];
  }>
>;

async function fileToText(file: File): Promise<string> {
  return file.text();
}

/* -------------------------------------------------------------------------- */
/*  1) STAVEBNÉ KONANIE – ANALÝZA PARCIEL / ÚČASTNÍCI                        */
/* -------------------------------------------------------------------------- */

export const analyzeConstructionCase = async (
  parcels: Parcel[],
  applicantName: string
): Promise<AnalysisResult> => {
  const neighbors =
    parcels.length > 0 ? await fetchMockNeighbors(parcels[0].parcelNumber) : [];

  const result = await orchestrate({
    task: "analyze_construction_case",
    parcels,
    applicantName,
    neighbors,
  });

  if (!result.constructionAnalysis) {
    throw new Error(
      result.message ??
        "Analýza stavebného konania zlyhala – model nevrátil platný JSON."
    );
  }

  return result.constructionAnalysis;
};

/* -------------------------------------------------------------------------- */
/*  2) DISCUSSION REPORT / COMPLIANCE / TECHNICAL ANALYSIS                    */
/* -------------------------------------------------------------------------- */

export const generateDiscussionReport = async (
  opinions: File[]
): Promise<DiscussionReportData> => {
  const opinionsText = await Promise.all(opinions.map((f) => fileToText(f)));

  const result = await orchestrate({
    task: "generate_discussion_report",
    opinionsText,
  });

  if (!result.discussionReport) {
    throw new Error(
      result.message ??
        "Generovanie správy o prerokovaní stavebného zámeru zlyhalo."
    );
  }

  return result.discussionReport;
};

export const analyzeCompliance = async (
  opinions: File[],
  discussionReport: File,
  technicalReport: File
): Promise<ComplianceAnalysis> => {
  const [opinionsText, discussionReportText, technicalReportText] =
    await Promise.all([
      Promise.all(opinions.map((f) => fileToText(f))),
      fileToText(discussionReport),
      fileToText(technicalReport),
    ]);

  const result = await orchestrate({
    task: "analyze_compliance",
    opinionsText,
    discussionReportText,
    technicalReportText,
  });

  if (!result.complianceAnalysis) {
    throw new Error(
      result.message ??
        "Analýza súladu stanovísk, správy o prerokovaní a technickej správy zlyhala."
    );
  }

  return result.complianceAnalysis;
};

export const analyzeTechnicalReport = async (
  technicalReport: File
): Promise<TechnicalAnalysis> => {
  const technicalReportText = await fileToText(technicalReport);

  const result = await orchestrate({
    task: "analyze_technical_report",
    technicalReportText,
  });

  if (!result.technicalAnalysis) {
    throw new Error(
      result.message ?? "Technická analýza správy zlyhala – chýba výstup."
    );
  }

  return result.technicalAnalysis;
};

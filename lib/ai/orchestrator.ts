import type {
  OrchestratorInput,
  OrchestratorOutput,
  AiFile,
  NameRecommendation,
  TreeRestructureSuggestion,
} from "@/types/ai/ai";
import type { ProjectFormB2B6B7CE } from "@/types/form";
import type {
  AnalysisResult as ConstructionAnalysisResult,
  ComplianceAnalysis,
  TechnicalAnalysis,
  DiscussionReportData,
} from "@/types/stanoviska/environment-analysis";

import { openaiClient } from "./openai-client";

import { buildCheckNamesPrompt } from "./prompts/check-document-names.prompt";
import { buildRestructureTreePrompt } from "./prompts/restructure-tree.prompt";
import { buildExtractB2B6B7CEPrompt } from "./prompts/extract-b2b6b7ce.prompt";
import { buildChatPrompt } from "./prompts/chat.prompt";
import { buildExtractDocumentsPrompt } from "./prompts/extract-documents.prompt";
import { buildAnalyzeConstructionCasePrompt } from "./prompts/analyze-construction-case.prompt";
import { buildDiscussionReportPrompt } from "./prompts/discussion-report.prompt";
import { buildCompliancePrompt } from "./prompts/compliance.prompt";
import { buildTechnicalAnalysisPrompt } from "./prompts/technical-report.prompt";

type RawCheckNamesResponse = {
  task?: string;
  message?: string;
  recommendations?: NameRecommendation[];
};

type RawRestructureTreeResponse = {
  task?: string;
  message?: string;
  suggestions?: TreeRestructureSuggestion[];
};

type RawExtractB2B6B7CEResponse = ProjectFormB2B6B7CE;

type RawConstructionCaseResponse = ConstructionAnalysisResult;
type RawDiscussionReportResponse = DiscussionReportData;
type RawComplianceResponse = ComplianceAnalysis;
type RawTechnicalResponse = TechnicalAnalysis;

async function callCheckDocumentNames(
  files: AiFile[]
): Promise<RawCheckNamesResponse> {
  const prompt = buildCheckNamesPrompt(files);

  const response = await openaiClient.responses.create({
    model: "gpt-5-mini",
    input: prompt,
  });

  const text = response.output_text ?? "";

  try {
    const parsed = JSON.parse(text) as RawCheckNamesResponse;
    return parsed;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to parse AI JSON", error, text);
    return {
      message:
        text === "" ? "Model nevrátil žiadny text." : `RAW OUTPUT: ${text}`,
    };
  }
}

async function callRestructureTree(
  files: AiFile[]
): Promise<RawRestructureTreeResponse> {
  const prompt = buildRestructureTreePrompt(files);

  const response = await openaiClient.responses.create({
    model: "gpt-5-mini",
    input: prompt,
  });

  const text = response.output_text ?? "";

  try {
    const parsed = JSON.parse(text) as RawRestructureTreeResponse;
    return parsed;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to parse AI JSON (restructure_tree)", error, text);
    return {
      message:
        text === ""
          ? "Model nevrátil žiadny text (reštrukturalizácia stromu)."
          : `RAW OUTPUT: ${text}`,
    };
  }
}

async function callExtractB2B6B7CE(
  documentText: string
): Promise<RawExtractB2B6B7CEResponse | null> {
  const prompt = buildExtractB2B6B7CEPrompt(documentText);

  const response = await openaiClient.responses.create({
    model: "gpt-5-mini",
    input: prompt,
  });

  const text = response.output_text ?? "";

  try {
    const parsed = JSON.parse(text) as RawExtractB2B6B7CEResponse;
    return parsed;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to parse AI JSON (extract_b2b6b7ce)", error, text);
    return null;
  }
}

async function callChat(message: string, context?: string): Promise<string> {
  const prompt = buildChatPrompt(message, context);

  const response = await openaiClient.responses.create({
    model: "gpt-5-mini",
    input: prompt,
  });

  return response.output_text ?? "";
}

async function callExtractDocuments(
  projectId: string | undefined
): Promise<string> {
  const prompt = buildExtractDocumentsPrompt(projectId);

  const response = await openaiClient.responses.create({
    model: "gpt-5-mini",
    input: prompt,
  });

  return response.output_text ?? "Model nevrátil žiadny text.";
}

async function callAnalyzeConstructionCase(params: {
  parcels: ConstructionAnalysisResult["parcels"];
  applicantName: string;
  neighbors?: unknown[];
}): Promise<RawConstructionCaseResponse | null> {
  const prompt = buildAnalyzeConstructionCasePrompt(params);

  const response = await openaiClient.responses.create({
    model: "gpt-5-mini",
    input: prompt,
  });

  const text = response.output_text ?? "";

  try {
    const parsed = JSON.parse(text) as RawConstructionCaseResponse;
    return parsed;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      "Failed to parse AI JSON (analyze_construction_case)",
      error,
      text
    );
    return null;
  }
}

async function callGenerateDiscussionReportFromTexts(
  opinionsText: string[]
): Promise<RawDiscussionReportResponse | null> {
  const basePrompt = buildDiscussionReportPrompt();
  const joinedOpinions = opinionsText.join("\n\n---\n\n");

  const prompt = [basePrompt, "", "STANOVISKÁ (TEXTY):", joinedOpinions].join(
    "\n"
  );

  const response = await openaiClient.responses.create({
    model: "gpt-5-mini",
    input: prompt,
  });

  const text = response.output_text ?? "";

  try {
    const parsed = JSON.parse(text) as RawDiscussionReportResponse;
    return parsed;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to parse AI JSON (discussion_report)", error, text);
    return null;
  }
}

async function callAnalyzeComplianceFromTexts(params: {
  opinionsText: string[];
  discussionReportText: string;
  technicalReportText: string;
}): Promise<RawComplianceResponse | null> {
  const basePrompt = buildCompliancePrompt();
  const { opinionsText, discussionReportText, technicalReportText } = params;

  const prompt = [
    basePrompt,
    "",
    "STANOVISKÁ (OPINIONS):",
    opinionsText.join("\n\n---\n\n"),
    "",
    "SPRÁVA O PREROKOVANÍ (DISCUSSION REPORT):",
    discussionReportText,
    "",
    "TECHNICKÁ SPRÁVA (TECHNICAL REPORT):",
    technicalReportText,
  ].join("\n");

  const response = await openaiClient.responses.create({
    model: "gpt-5-mini",
    input: prompt,
  });

  const text = response.output_text ?? "";

  try {
    const parsed = JSON.parse(text) as RawComplianceResponse;
    return parsed;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to parse AI JSON (compliance)", error, text);
    return null;
  }
}

async function callAnalyzeTechnicalFromText(
  technicalReportText: string
): Promise<RawTechnicalResponse | null> {
  const basePrompt = buildTechnicalAnalysisPrompt();

  const prompt = [
    basePrompt,
    "",
    "TECHNICKÁ SPRÁVA:",
    technicalReportText,
  ].join("\n");

  const response = await openaiClient.responses.create({
    model: "gpt-5-mini",
    input: prompt,
  });

  const text = response.output_text ?? "";

  try {
    const parsed = JSON.parse(text) as RawTechnicalResponse;
    return parsed;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to parse AI JSON (technical_analysis)", error, text);
    return null;
  }
}

export async function orchestrate(
  input: OrchestratorInput
): Promise<OrchestratorOutput> {
  if (input.task === "check_document_names") {
    if (!input.files || input.files.length === 0) {
      return {
        task: input.task,
        message: "Neboli poskytnuté žiadne súbory na kontrolu názvov.",
      };
    }

    const raw = await callCheckDocumentNames(input.files);

    return {
      task: "check_document_names",
      message:
        raw.message ??
        "Model nevrátil správu, ale prebehla kontrola názvov dokumentov.",
      recommendations: raw.recommendations,
    };
  }

  if (input.task === "restructure_tree") {
    if (!input.files || input.files.length === 0) {
      return {
        task: input.task,
        message: "Neboli poskytnuté žiadne súbory na usporiadanie štruktúry.",
      };
    }

    const raw = await callRestructureTree(input.files);

    return {
      task: "restructure_tree",
      message:
        raw.message ??
        "Model nevrátil správu, ale navrhol usporiadanie stromu dokumentov.",
      restructureSuggestions: raw.suggestions,
    };
  }

  if (input.task === "extract_b2b6b7ce") {
    if (!input.message || input.message.trim() === "") {
      return {
        task: input.task,
        message:
          "Nebolo poskytnuté žiadne textové znenie dokumentu pre extrakciu B2/B6/B7/C/E.",
      };
    }

    const parsed = await callExtractB2B6B7CE(input.message);

    if (parsed === null) {
      return {
        task: input.task,
        message: "Model nevrátil platný JSON pre B2/B6/B7/C/E.",
      };
    }

    return {
      task: input.task,
      message: "Extrakcia častí B2, B6, B7, C a E prebehla.",
      projectFormB2B6B7CE: parsed,
    };
  }

  if (input.task === "chat") {
    const result = await callChat(input.message ?? "", input.context);
    return {
      task: "chat",
      message: result,
    };
  }

  if (input.task === "extract_documents") {
    const message = await callExtractDocuments(input.projectId);
    return {
      task: input.task,
      message,
    };
  }

  if (input.task === "analyze_construction_case") {
    if (!input.parcels || input.parcels.length === 0 || !input.applicantName) {
      return {
        task: input.task,
        message: "Chýbajú parcely alebo meno žiadateľa pre analýzu.",
      };
    }

    const parsed = await callAnalyzeConstructionCase({
      parcels: input.parcels,
      applicantName: input.applicantName,
      neighbors: input.neighbors,
    });

    if (!parsed) {
      return {
        task: input.task,
        message: "Model nevrátil platný JSON pre analýzu stavebného konania.",
      };
    }

    return {
      task: input.task,
      message: "Analýza stavebného konania bola vykonaná.",
      constructionAnalysis: parsed,
    };
  }

  if (input.task === "generate_discussion_report") {
    if (!input.opinionsText || input.opinionsText.length === 0) {
      return {
        task: input.task,
        message: "Neboli poskytnuté žiadne stanoviská na generovanie správy.",
      };
    }

    const parsed = await callGenerateDiscussionReportFromTexts(
      input.opinionsText
    );

    if (!parsed) {
      return {
        task: input.task,
        message: "Model nevrátil platný JSON pre správu o prerokovaní.",
      };
    }

    return {
      task: input.task,
      message: "Správa o prerokovaní stavebného zámeru bola vygenerovaná.",
      discussionReport: parsed,
    };
  }

  if (input.task === "analyze_compliance") {
    if (
      !input.opinionsText ||
      input.opinionsText.length === 0 ||
      !input.discussionReportText ||
      !input.technicalReportText
    ) {
      return {
        task: input.task,
        message:
          "Chýbajú stanoviská alebo text správy o prerokovaní/technickej správy.",
      };
    }

    const parsed = await callAnalyzeComplianceFromTexts({
      opinionsText: input.opinionsText,
      discussionReportText: input.discussionReportText,
      technicalReportText: input.technicalReportText,
    });

    if (!parsed) {
      return {
        task: input.task,
        message:
          "Model nevrátil platný JSON pre analýzu súladu stanovísk a správ.",
      };
    }

    return {
      task: input.task,
      message: "Analýza súladu stanovísk a správ bola vykonaná.",
      complianceAnalysis: parsed,
    };
  }

  if (input.task === "analyze_technical_report") {
    if (!input.technicalReportText) {
      return {
        task: input.task,
        message: "Chýba text technickej správy pre analýzu.",
      };
    }

    const parsed = await callAnalyzeTechnicalFromText(
      input.technicalReportText
    );

    if (!parsed) {
      return {
        task: input.task,
        message: "Model nevrátil platný JSON pre technickú analýzu.",
      };
    }

    return {
      task: input.task,
      message: "Technická analýza bola vykonaná.",
      technicalAnalysis: parsed,
    };
  }

  return {
    task: input.task,
    message: "Táto AI úloha ešte nie je implementovaná.",
  };
}

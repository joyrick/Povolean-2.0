export interface SummaryB2Form {
  purposeOfBuilding: string;
  basicDimensionsAndCapacities: string;
  floorsDescription: string;
  residentialUnitsDescription: string;
  operationAndEquipmentDescription: string;
  linearStructuresTechnicalData: string;
  otherVerificationRelevantData: string;
}

export interface SummaryB6Capacities {
  areaVolumeData: string;
  functionalCapacities: string;
  energyAndMediaCapacities: string;
  waterDemand: string;
  wastewaterTypesAndBalances: string;
  rawMaterialsData: string;
}

export interface SummaryB6Form {
  description: string;
  data: SummaryB6Capacities;
}

export interface SummaryB7Form {
  urbanArchitecturalTechnicalConcept: string;
  operationTechnicalEnergyTechnologyDescription: string;
  indoorEnvironmentAssurance: string;
  basicRequirementsOverview: string;
  generalTechnicalRequirementsAndAccessibility: string;
  existingStructuresAndNetworks: string;
  energyAndWaterSupplyAndWastewaterDemand: string;
  technicalInfrastructureConnections: string;
  wastewaterDisposalAndHandling: string;
  stormwaterHandling: string;
  terrainShapingAndLandscapeAndSustainability: string;
  trafficConnectionAndParking: string;
  technologyAndInternalLogisticsAndServiceAreas: string;
  constructionAndCommissioningTimeline: string;
  safetyAndOccupationalHealthAndTechnicalSafety: string;
}

export type SituationalDrawingCode =
  | "SIT_001"
  | "SIT_002"
  | "SIT_003"
  | "SIT_004"
  | "SIT_005";

export interface SituationalDrawingItem {
  code: SituationalDrawingCode;
  required: boolean;
  provided: boolean;
  fileId: string | null;
  description: string;
}

export interface SituationalDrawingsCForm {
  widerContext: SituationalDrawingItem;
  coordinationPlan: SituationalDrawingItem;
  cadastralBasePlan: SituationalDrawingItem;
  stakingOutPlan: SituationalDrawingItem;
  specialPlan: SituationalDrawingItem;
}

export interface AttachmentERequired {
  geodeticSurveyProvided: boolean;
  geodeticSurveyFileId: string | null;
  fireSafetySolutionProvided: boolean;
  fireSafetySolutionFileId: string | null;
}

export interface AttachmentEOptional {
  energyPerformanceAssessmentProvided: boolean;
  energyPerformanceAssessmentFileId: string | null;
  externalInfluencesProtocolProvided: boolean;
  externalInfluencesProtocolFileId: string | null;
  additionalSurveysAndReportsProvided: boolean;
  additionalSurveysAndReportsDescription: string;
}

export interface AttachmentsEForm {
  required: AttachmentERequired;
  optional: AttachmentEOptional;
}

export interface ProjectFormB2B6B7CE {
  summaryB2: SummaryB2Form;
  summaryB6: SummaryB6Form;
  summaryB7: SummaryB7Form;
  situationalDrawingsC: SituationalDrawingsCForm;
  attachmentsE: AttachmentsEForm;
}

export const EMPTY_PROJECT_FORM_B2B6B7CE: ProjectFormB2B6B7CE = {
  summaryB2: {
    purposeOfBuilding: "",
    basicDimensionsAndCapacities: "",
    floorsDescription: "",
    residentialUnitsDescription: "",
    operationAndEquipmentDescription: "",
    linearStructuresTechnicalData: "",
    otherVerificationRelevantData: "",
  },
  summaryB6: {
    description: "",
    data: {
      areaVolumeData: "",
      functionalCapacities: "",
      energyAndMediaCapacities: "",
      waterDemand: "",
      wastewaterTypesAndBalances: "",
      rawMaterialsData: "",
    },
  },
  summaryB7: {
    urbanArchitecturalTechnicalConcept: "",
    operationTechnicalEnergyTechnologyDescription: "",
    indoorEnvironmentAssurance: "",
    basicRequirementsOverview: "",
    generalTechnicalRequirementsAndAccessibility: "",
    existingStructuresAndNetworks: "",
    energyAndWaterSupplyAndWastewaterDemand: "",
    technicalInfrastructureConnections: "",
    wastewaterDisposalAndHandling: "",
    stormwaterHandling: "",
    terrainShapingAndLandscapeAndSustainability: "",
    trafficConnectionAndParking: "",
    technologyAndInternalLogisticsAndServiceAreas: "",
    constructionAndCommissioningTimeline: "",
    safetyAndOccupationalHealthAndTechnicalSafety: "",
  },
  situationalDrawingsC: {
    widerContext: {
      code: "SIT_001",
      required: true,
      provided: false,
      fileId: null,
      description: "",
    },
    coordinationPlan: {
      code: "SIT_002",
      required: true,
      provided: false,
      fileId: null,
      description: "",
    },
    cadastralBasePlan: {
      code: "SIT_003",
      required: true,
      provided: false,
      fileId: null,
      description: "",
    },
    stakingOutPlan: {
      code: "SIT_004",
      required: false,
      provided: false,
      fileId: null,
      description: "",
    },
    specialPlan: {
      code: "SIT_005",
      required: false,
      provided: false,
      fileId: null,
      description: "",
    },
  },
  attachmentsE: {
    required: {
      geodeticSurveyProvided: false,
      geodeticSurveyFileId: null,
      fireSafetySolutionProvided: false,
      fireSafetySolutionFileId: null,
    },
    optional: {
      energyPerformanceAssessmentProvided: false,
      energyPerformanceAssessmentFileId: null,
      externalInfluencesProtocolProvided: false,
      externalInfluencesProtocolFileId: null,
      additionalSurveysAndReportsProvided: false,
      additionalSurveysAndReportsDescription: "",
    },
  },
};

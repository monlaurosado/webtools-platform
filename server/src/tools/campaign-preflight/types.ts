import { AnalyzeFormsResponse } from "../form-inspector/types";
import { AnalyzeTrackingResponse } from "../tracking-inspector/types";
import { InspectUrlsResponse } from "../url-status-checker/types";

export type CampaignRiskLevel = "low" | "medium" | "high";

export interface CampaignPreflightSummary {
  forms: number;
  formWarnings: number;
  scripts: number;
  trackingWarnings: number;
  urls: number;
  urlFailures: number;
}

export interface CampaignPreflightWarning {
  area: "forms" | "tracking" | "urls" | "general";
  code: string;
  message: string;
}

export interface CampaignPreflightResponse {
  score: number;
  riskLevel: CampaignRiskLevel;
  summary: CampaignPreflightSummary;
  checks: {
    forms: AnalyzeFormsResponse;
    tracking: AnalyzeTrackingResponse;
    urls: InspectUrlsResponse;
  };
  warnings: CampaignPreflightWarning[];
}

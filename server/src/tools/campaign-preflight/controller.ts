import { Request, Response } from "express";
import { ERROR_MESSAGES, runCampaignPreflight } from "./service";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Unexpected error.";
};

const isValidationError = (message: string): boolean => {
  return (
    Object.values(ERROR_MESSAGES).includes(
      message as (typeof ERROR_MESSAGES)[keyof typeof ERROR_MESSAGES],
    ) ||
    message.startsWith("Invalid ") ||
    message.includes("exceeds the 1 MB limit") ||
    message === "Too many URLs. Maximum is 50."
  );
};

export const runCampaignPreflightController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { html, urls } = (req.body ?? {}) as Record<string, unknown>;
    res.json(await runCampaignPreflight(html, urls));
  } catch (error) {
    const message = getErrorMessage(error);
    res.status(isValidationError(message) ? 400 : 500).json({ error: message });
  }
};

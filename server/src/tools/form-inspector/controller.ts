import { Request, Response } from "express";
import { ERROR_MESSAGES, analyzeForms } from "./service";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Unexpected error.";
};

const isValidationError = (message: string): boolean => {
  return Object.values(ERROR_MESSAGES).includes(
    message as (typeof ERROR_MESSAGES)[keyof typeof ERROR_MESSAGES],
  );
};

export const analyzeFormsController = (req: Request, res: Response): void => {
  try {
    const { html } = (req.body ?? {}) as Record<string, unknown>;
    res.json(analyzeForms(html));
  } catch (error) {
    const message = getErrorMessage(error);
    res.status(isValidationError(message) ? 400 : 500).json({ error: message });
  }
};

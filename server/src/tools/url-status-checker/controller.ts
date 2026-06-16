import { Request, Response } from "express";
import { ERROR_MESSAGES, inspectUrls } from "./service";

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

export const inspectUrlsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { urls } = (req.body ?? {}) as Record<string, unknown>;
    res.json(await inspectUrls(urls));
  } catch (error) {
    const message = getErrorMessage(error);
    res.status(isValidationError(message) ? 400 : 500).json({ error: message });
  }
};

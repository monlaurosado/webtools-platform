import { Request, Response } from "express";
import { extractAttributeValues, replaceAttributeValues } from "./service";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Unexpected error.";
};

export const extractAttributesController = (req: Request, res: Response): void => {
  try {
    const { html, attribute } = (req.body ?? {}) as Record<string, unknown>;
    const values = extractAttributeValues(html, attribute);
    res.json({ values });
  } catch (error) {
    res.status(400).json({ error: getErrorMessage(error) });
  }
};

export const replaceAttributesController = (req: Request, res: Response): void => {
  try {
    const { html, attribute, replacements } = (req.body ?? {}) as Record<string, unknown>;
    const nextHtml = replaceAttributeValues(html, attribute, replacements);
    res.json({ html: nextHtml });
  } catch (error) {
    res.status(400).json({ error: getErrorMessage(error) });
  }
};

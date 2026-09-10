import type { Request, Response } from "express";
import { dispatchWebToolsRequest } from "./module";

/** Thin standalone adapter; the combined host uses the same module without Express. */
export const webToolsController = (endpoint: string) => async (req: Request, res: Response): Promise<void> => {
  const result = await dispatchWebToolsRequest(endpoint, req.body);
  res.status(result.status).json(result.body);
};

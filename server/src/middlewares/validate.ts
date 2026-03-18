import { ZodObject } from "zod";
import type { Request, Response, NextFunction } from "express";
import { CustomError } from "../lib/utils";

export const validate =
  (schema: ZodObject<any, any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      // write parsed values back so zod defaults are applied
      req.body = parsed.body;
      return next();
    } catch (error: any) {
      // Collect all Zod error messages
      const errorMessages = error.errors?.map((err: any) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      console.log("Zod Validation Error:", errorMessages || error);
      next(new CustomError("Validation Error", 400, errorMessages));
    }
  };

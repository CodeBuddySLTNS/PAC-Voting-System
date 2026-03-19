import type { Request, Response } from "express";
import { ConfigService } from "../services/config.services";

export const ConfigController = {
  getDepartments: async (req: Request, res: Response) => {
    const departments = await ConfigService.getDepartments();
    res.json({
      success: true,
      data: departments,
    });
  },

  getYearLevels: async (req: Request, res: Response) => {
    const yearLevels = await ConfigService.getYearLevels();
    res.json({
      success: true,
      data: yearLevels,
    });
  },
};

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
    res.json({ success: true, data: yearLevels });
  },

  getAcademicYears: async (req: Request, res: Response) => {
    const academicYears = await ConfigService.getAcademicYears();
    res.json({ success: true, data: academicYears });
  },

  createAcademicYear: async (req: Request, res: Response) => {
    // Basic validation
    if (!req.body.name) {
      res.status(400).json({ success: false, message: "Name is required for academic year" });
      return;
    }
    const year = await ConfigService.createAcademicYear(req.body.name);
    res.status(201).json({ success: true, data: year });
  },
};

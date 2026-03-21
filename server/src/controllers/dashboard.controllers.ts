import type { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.services";

export const DashboardController = {
  getStats: async (req: Request, res: Response) => {
    const stats = await DashboardService.getDashboardStats();
    res.status(200).json(stats);
  }
};

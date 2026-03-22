import type { Request, Response } from "express";
import { ElectionService } from "../services/election.services";

export const ElectionController = {
  getAll: async (req: Request, res: Response) => {
    const elections = await ElectionService.getAllElections();
    res.json({
      success: true,
      data: elections,
    });
  },

  create: async (req: Request, res: Response) => {
    const election = await ElectionService.createElection(req.body);
    res.status(201).json({
      success: true,
      message: "Election created successfully",
      data: election,
    });
  },

  update: async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    const election = await ElectionService.updateElection(id, req.body);
    res.json({
      success: true,
      message: "Election updated successfully",
      data: election,
    });
  },

  delete: async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    await ElectionService.deleteElection(id);
    res.json({
      success: true,
      message: "Election deleted successfully",
    });
  },

  getResults: async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) throw new Error("Invalid election ID");

    const results = await ElectionService.getElectionResults(id);
    res.json({
      success: true,
      data: results,
    });
  },
};

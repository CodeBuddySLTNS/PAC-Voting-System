import { Request, Response } from "express";
import { CandidateService } from "../services/candidate.services";

export const CandidateController = {
  getCandidatesByElection: async (req: Request, res: Response) => {
    const electionId = parseInt(req.params.electionId as string);
    if (!electionId) {
      res.status(400).json({ success: false, message: "Invalid Election ID" });
      return;
    }
    const candidates = await CandidateService.getCandidatesByElection(electionId);
    res.json({ success: true, data: candidates });
  },

  createCandidate: async (req: Request, res: Response) => {
    const imageFilename = req.file?.filename;
    const candidate = await CandidateService.createCandidate({
      ...req.body,
      imageUrl: imageFilename ?? req.body.imageUrl,
    });
    res.status(201).json({ success: true, data: candidate });
  },

  updateCandidate: async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    if (!id) {
      res.status(400).json({ success: false, message: "Invalid Candidate ID" });
      return;
    }
    const candidate = await CandidateService.updateCandidate(id, req.body);
    res.json({ success: true, data: candidate });
  },

  deleteCandidate: async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    if (!id) {
      res.status(400).json({ success: false, message: "Invalid Candidate ID" });
      return;
    }
    await CandidateService.deleteCandidate(id);
    res.json({ success: true, message: "Candidate deleted successfully" });
  },
};

import type { Request, Response } from "express";
import { VoteService } from "../services/vote.services";
import type { User } from "../types/data.types";
import { CustomError } from "../lib/utils";

export const VoteController = {
  getElections: async (req: Request, res: Response) => {
    const user = res.locals.user as User;
    if (!user.studentId) throw new CustomError("Only students can access this route", 403);

    const data = await VoteService.getStudentElections(user.studentId);
    res.status(200).json({ success: true, data });
  },

  getBallot: async (req: Request, res: Response) => {
    const user = res.locals.user as User;
    if (!user.studentId) throw new CustomError("Only students can access this route", 403);
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw new CustomError("Invalid election ID", 400);

    const data = await VoteService.getBallot(id, user.studentId);
    res.status(200).json({ success: true, data });
  },

  submitVote: async (req: Request, res: Response) => {
    const user = res.locals.user as User;
    if (!user.studentId) throw new CustomError("Only students can access this route", 403);
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw new CustomError("Invalid election ID", 400);

    const data = await VoteService.submitVote(id, user.studentId, req.body);
    res.status(201).json({ success: true, ...data });
  }
};

import { NextFunction, Request, Response } from "express";

export const permissions = {
  admin: (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;
    if (user.adminId) return next();
    res.sendStatus(403);
  },
  student: (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;
    if (user.studentId) return next();
    res.sendStatus(403);
  },
};

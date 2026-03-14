import { NextFunction, Request, Response } from "express";

export type Roles =
  | "registrar"
  | "student"
  | "dean"
  | "faculty"
  | "cashier"
  | "treasurer";

export const permissions = {
  allow:
    (allowed: Roles[]) => (req: Request, res: Response, next: NextFunction) => {
      const user = res.locals.user;
      if (allowed?.includes(user?.role)) return next();
      res.sendStatus(403);
    },

  restrict:
    (restricted: Roles[]) =>
    (req: Request, res: Response, next: NextFunction) => {
      const user = res.locals.user;
      if (!restricted?.includes(user?.role)) return next();
      res.sendStatus(403);
    },

  restrictStudent: (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;
    if (user?.role !== "student") return next();
    res.sendStatus(403);
  },
};

import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { CustomError } from "../lib/utils";
import status from "http-status";

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const accessToken = (req.headers.authorization || "").split(" ")[1];

  if (!accessToken) {
    throw new CustomError("Invalid Access Token.", status.UNAUTHORIZED);
  }

  jwt.verify(
    accessToken,
    process.env.ACCESS_SECRET_KEY || "default_super_secret_jwt_key",
    (err, user) => {
      if (err) {
        if (err.name === "TokenExpiredError")
          throw new CustomError("Access Token Expired", status.UNAUTHORIZED);
        throw new CustomError("Invalid Access Token", status.UNAUTHORIZED);
      }

      res.locals.user = user;
      next();
    },
  );
};

export default authenticate;

import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import status from "http-status";

interface CustomError {
  errorCode: string;
  statusCode: number;
  message: string;
  body: object | null;
}

const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.status(error.statusCode || status.INTERNAL_SERVER_ERROR).json({
    status: error.statusCode || status.INTERNAL_SERVER_ERROR,
    errorCode: error.errorCode,
    body: error.body,
    message: error.statusCode ? error.message : "Internal Server Error.",
  });
  console.log(error);
};

export default errorHandler;

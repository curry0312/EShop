import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { AppError } from "./error-handler";

//! They are only called when next(err) is used in any preceding middleware or route.
export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    console.log(`Error ${req.method} ${req.url} - ${err.message}`);
    return void void res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  console.log("Unhandle error", err);
  return void void res.status(500).json({
    status: 500,
    message: "Internal Server Error",
  });
};

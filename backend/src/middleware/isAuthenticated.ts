import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../libs/prisma";

export const isAuthenticated = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies.accessToken || req.cookies["seller-accessToken"];

  if (!accessToken) {
    return void res
      .status(401)
      .json({ message: "Unauthorized, access token not found" });
  }
  console.log("accessToken", accessToken);

  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_ACCESSTOKEN_SECRET as string
    ) as { id: string; role: "user" | "seller" };

    console.log("decoded",decoded)

    if (!decoded || !decoded.id || !decoded.role) {
      return void res
        .status(401)
        .json({ message: "Unauthorized, invalid access token" });
    }

    let account;
    if (decoded.role === "user") {
      account = await prisma.users.findUnique({
        where: {
          id: decoded.id,
        },
      });
    }
    if (decoded.role === "seller") {
      account = await prisma.users.findUnique({
        where: {
          id: decoded.id,
        },
      });
    }

    req.account = account;
    req.role = decoded.role;

    next();
  } catch (error) {
    return void res
      .status(401)
      .json({ message: "Unauthorized,something went wrong" });
  }
};

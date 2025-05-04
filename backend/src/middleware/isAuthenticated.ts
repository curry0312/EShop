import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../libs/prisma";
import { AuthedRequest } from "../types/express";


export const isUserAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies["accessToken"];

  if (!token) {
    return void res.status(401).json({ message: "Unauthorized, no access token" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESSTOKEN_SECRET as string
    ) as { id: string; role: "user" };

    if (decoded.role !== "user") {
      return void res.status(401).json({ message: "Forbidden: not a user token" });
    }

    const user = await prisma.users.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return void res.status(401).json({ message: "User not found" });
    }

    req.account = user;
    req.role = "user";
    next();
  } catch (err) {
    return void res.status(401).json({ message: "Invalid or expired token" });
  }
};


export const isSellerAuthenticated = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies["seller-accessToken"];

  if (!token) {
    return void res.status(401).json({ message: "Unauthorized, no seller token" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESSTOKEN_SECRET as string
    ) as { id: string; role: "seller" };

    if (!decoded || !decoded.id || !decoded.role) {
      return void res.status(401).json({ message: "Invalid or expired token" });
    }

    if (decoded.role !== "seller") {
      return void res.status(401).json({ message: "Forbidden: not a seller token" });
    }

    const seller = await prisma.sellers.findUnique({ where: { id: decoded.id },include: { shop: true } });

    if (!seller) {
      return void res.status(401).json({ message: "Seller not found" });
    }

    req.account = seller;
    req.role = "seller";
    next();
  } catch (err) {
    console.log("Something went wrong", err);
    return void res.status(401).json({ message: "Something went wrong, Invalid or expired token" });
  }
};

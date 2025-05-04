// src/types/express.d.ts
import { User } from "@prisma/client";    // or Seller if you have a separate model

declare global {
  namespace Express {
    interface Request {
      account?: User | null;    // or Prisma.User | null
      role?: "user" | "seller"; // narrow your roles if you like
    }
  }
}

export {};  // <<== 一定要有！！！

import { Request } from "express";

export interface AuthedRequest extends Request {
  account?: User | Seller;
  role?: "user" | "seller";
}

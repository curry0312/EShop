import { Router } from "express";
import {
  createShop,
  getSeller,
  refreshSellerAccessToken,
  sellerForgotPassword,
  sellerLogin,
  sellerRegistration,
  verifySellerOtp,
} from "../../controller/auth.controller";
import { isSellerAuthenticated } from "../../middleware/isAuthenticated";

const sellerRouter = Router();

//** Seller Routes **//

sellerRouter.post("/register", sellerRegistration);
sellerRouter.post("/verify", verifySellerOtp);
sellerRouter.post("/create-shop", createShop);
sellerRouter.post("/login", sellerLogin);
sellerRouter.post("/forgot-password", sellerForgotPassword);
sellerRouter.post("/refresh-token", refreshSellerAccessToken);
sellerRouter.get("/me", isSellerAuthenticated, getSeller);


export default sellerRouter;

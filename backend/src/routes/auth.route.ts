import { Router } from "express";
import {
  createShop,
  getSeller,
  getUser,
  refreshSellerAccessToken,
  refreshUserAccessToken,
  registerUser,
  sellerForgotPassword,
  sellerLogin,
  sellerRegistration,
  userForgotPassword,
  userLogin,
  userResetPassword,
  verifyForgotPasswordOtp,
  verifySellerOtp,
  verifyUser,
} from "../controller/auth.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";

const authRouter = Router();

authRouter.post("/user-registration", registerUser);

authRouter.post("/verify-user", verifyUser);

//handle user login
authRouter.post("/login-user", userLogin);

//handle forgot password
authRouter.post("/forgot-password-user", userForgotPassword);

//handle reset password
authRouter.post("/reset-password-user", userResetPassword);

//handle verify otp for forgot password
authRouter.post("/verify-forgot-password-user", verifyForgotPasswordOtp);

//handle refresh access token
authRouter.post("/refresh-token-user", refreshUserAccessToken);

//get logged in user info, if user is not logged in, return error
authRouter.get("/get-logged-in-user", isAuthenticated, getUser);

//** Seller Routes **//

authRouter.post("/seller-registration", sellerRegistration);

authRouter.post("/verify-seller", verifySellerOtp);

authRouter.post("/create-shop", createShop);

authRouter.post("/login-seller", sellerLogin);

authRouter.get("/get-logged-in-seller", isAuthenticated, getSeller);

//handle refresh access token for seller
authRouter.post("/refresh-token-seller", refreshSellerAccessToken);

authRouter.post("/forgot-seller-password", sellerForgotPassword);

export default authRouter;

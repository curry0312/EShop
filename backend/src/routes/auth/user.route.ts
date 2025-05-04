import { Router } from "express";
import {
  getUser,
  refreshUserAccessToken,
  registerUser,
  userForgotPassword,
  userLogin,
  userResetPassword,
  verifyForgotPasswordOtp,
  verifyUser,
} from "../../controller/auth.controller";
import { isUserAuthenticated } from "../../middleware/isAuthenticated";

const userRouter = Router();

userRouter.post("/register", registerUser);
userRouter.post("/verify", verifyUser);
userRouter.post("/login", userLogin);
userRouter.post("/forgot-password", userForgotPassword);
userRouter.post("/reset-password", userResetPassword);
userRouter.post("/verify-forgot-password", verifyForgotPasswordOtp);
userRouter.post("/refresh-token", refreshUserAccessToken);
userRouter.get("/me", isUserAuthenticated, getUser);


export default userRouter;

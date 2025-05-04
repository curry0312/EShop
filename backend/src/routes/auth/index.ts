import { Router } from "express";
import userRouter from "./user.route";
import sellerRouter from "./seller.route";

const authRouter = Router();

authRouter.use("/user", userRouter);
authRouter.use("/seller", sellerRouter);

export default authRouter;

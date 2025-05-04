import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import prisma from "../libs/prisma";
import { AuthError, ValidationError } from "../libs/error-handler";
import {
  checkOtpRestrictions,
  sendOtpMail,
  trackOtpRequestTimes,
  verifyOtp,
} from "../libs/utilis/auth.helper";
import redis from "../libs/redis";
import { redisKey } from "../libs/config/rediskey";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { setCookie } from "../libs/cookie/setCookie";

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /* #swagger.tags = ['User'] */
  /* #swagger.description = '註冊新使用者' */

  const { name, email, password } = req.body;

  const user = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (user) {
    return next(new ValidationError("user already exists"));
  }

  checkOtpRestrictions(email);
  trackOtpRequestTimes(email);
  sendOtpMail({ name, email, template: "user-activation-mail" });

  return void res.status(200).json({
    message: "OTP sent successfully",
  });
};

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /* #swagger.tags = ['User'] */
  /* #swagger.description = '認證新使用者' */
  const { name, email, password, otp } = req.body;

  if (!name || !password || !email || !otp) {
    return next(new ValidationError("email or otp is missing"));
  }

  const user = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (user) {
    return next(new ValidationError("user already exists"));
  }

  const isOtpValid = await verifyOtp({ email, otp });

  console.log("isOtpValid", isOtpValid);

  if (!isOtpValid) {
    return next(new ValidationError("otp is invalid"));
  }

  await redis.del(redisKey.otp(email));
  await redis.del(redisKey.otp_cooldown(email));

  const hashPassword = await bcrypt.hash(password, 10);

  if (!hashPassword) {
    return next(new ValidationError("password is invalid"));
  }

  const newUser = await prisma.users.create({
    data: {
      email,
      name: name,
      password: hashPassword,
    },
  });

  return void res.status(200).json({
    message: "user created successfully",
    data: newUser,
  });
};

//User Login
export const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /* #swagger.tags = ['User'] */
  /* #swagger.description = '登入新使用者' */
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ValidationError(`Missing required fields`));
  }

  const user = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return next(new ValidationError(`User with email ${email} not found`));
  }

  if (!user.password) {
    return next(
      new ValidationError(
        `There is no password for this user, try to use other login method`
      )
    );
  }

  console.log("Input password", password);
  console.log("password in db", user.password);

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  console.log("isPasswordMatched =", isPasswordMatched);

  if (!isPasswordMatched) {
    return next(new ValidationError(`Invalid password`));
  }

  const accessToken = jwt.sign(
    { id: user.id, role: "user" },
    process.env.JWT_ACCESSTOKEN_SECRET as string,
    {
      expiresIn: "15m",
    }
  );

  const refreshToken = jwt.sign(
    { id: user.id, role: "user" },
    process.env.JWT_REFRESHTOKEN_SECRET as string,
    {
      expiresIn: "7d",
    }
  );

  setCookie(res, "accessToken", accessToken);
  setCookie(res, "refreshToken", refreshToken);

  return void res.status(200).json({
    message: "User logged in successfully",
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      accessToken: accessToken,
      refreshToken: refreshToken,
    },
  });
};

//Get User Details
export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;

    return void res.status(200).json({
      message: "User details fetched successfully",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

//refresh accessToken for user
export const refreshUserAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies["refreshToken"];

  if (!refreshToken) {
    return next(new ValidationError(`Missing refresh token`));
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESHTOKEN_SECRET as string
    ) as { id: string; role: string };

    if (!decoded || !decoded.id || !decoded.role) {
      return next(new JsonWebTokenError(`Invalid refresh token`));
    }

    const user = await prisma.users.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      return next(new AuthError(`User not found`));
    }

    const newAccessToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.JWT_ACCESSTOKEN_SECRET as string,
      {
        expiresIn: "15m",
      }
    );

    setCookie(res, "accessToken", newAccessToken);

    return void res.status(200).json({
      message: "accessToken refreshed successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        "access-token": newAccessToken,
      },
    });
  } catch (error) {
    return next(error);
  }
};

//User forgot password
export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new ValidationError(`Missing required fields`));
    }

    const user = await prisma.users.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return next(new ValidationError(`User with email ${email} not found`));
    }

    await checkOtpRestrictions(email);
    await trackOtpRequestTimes(email);
    await sendOtpMail({
      name: user.name,
      email,
      template: "user-forgot-password",
    });

    return void res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    return next(error);
  }
};

//User verify otp for forgot password
export const verifyForgotPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return next(new ValidationError(`Missing required fields`));
    }

    await verifyOtp({ email, otp });

    return void res.status(200).json({
      message: "OTP verified successfully",
    });
  } catch (error) {
    return next(error);
  }
};

//User reset password
export const userResetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return next(new ValidationError(`Missing required fields`));
    }

    const user = await prisma.users.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return next(new ValidationError(`User with email ${email} not found`));
    }

    if (!user.password) {
      return next(
        new ValidationError(
          `There is no password for this user, try to use other login method`
        )
      );
    }

    const isNewPasswordValid = await bcrypt.compare(newPassword, user.password);
    if (isNewPasswordValid) {
      return next(
        new ValidationError("New password cannot be same as old password")
      );
    }

    const newhashPassword = bcrypt.hashSync(newPassword, 10);

    await prisma.users.update({
      where: {
        email,
      },
      data: {
        password: newhashPassword,
      },
    });

    return void res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    return next(error);
  }
};

//**Seller
//Seller registration
export const sellerRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, country, phone_number } = req.body;

    const existingSeller = await prisma.sellers.findUnique({
      where: {
        email,
      },
    });

    if (existingSeller) {
      return next(
        new ValidationError(`Seller with email ${email} already exists`)
      );
    }

    await checkOtpRestrictions(email);
    await trackOtpRequestTimes(email);
    await sendOtpMail({ name, email, template: "seller-activation-mail" });

    return void res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    return next(error);
  }
};

//Verify seller otp
export const verifySellerOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, name, password, country, phoneNumber } = req.body;
    if (!name || !email || !otp || !password || !country || !phoneNumber) {
      return next(new ValidationError(`Missing required fields`));
    }

    //check if user already exists
    const existingUser = await prisma.sellers.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      return next(
        new ValidationError(`Seller with email ${email} already exists`)
      );
    }

    //If user does not exists, verify otp
    await verifyOtp({ email, otp });

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const newSeller = await prisma.sellers.create({
      data: {
        name,
        email,
        password: hash,
        country,
        phone_number: phoneNumber,
      },
    });

    return void res.status(200).json({
      message: `New Seller ${name} with email ${email} created successfully`,
      data: newSeller,
    });
  } catch (error) {
    return next(error);
  }
};

//login seller
export const sellerLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ValidationError(`Missing required fields`));
  }

  const seller = await prisma.sellers.findUnique({
    where: {
      email,
    },
  });

  if (!seller) {
    return next(new ValidationError(`Seller with email ${email} not found`));
  }

  if (!seller.password) {
    return next(
      new ValidationError(
        `There is no password for this seller, try to use other login method`
      )
    );
  }

  const isPasswordMatched = await bcrypt.compare(password, seller.password);

  if (!isPasswordMatched) {
    return next(new ValidationError(`Invalid password`));
  }

  const accessToken = jwt.sign(
    { id: seller.id, role: "seller" },
    process.env.JWT_ACCESSTOKEN_SECRET as string,
    {
      expiresIn: "15m",
    }
  );

  const refreshToken = jwt.sign(
    { id: seller.id, role: "seller" },
    process.env.JWT_REFRESHTOKEN_SECRET as string,
    {
      expiresIn: "7d",
    }
  );

  setCookie(res, "seller-accessToken", accessToken);
  setCookie(res, "seller-refreshToken", refreshToken);

  return void res.status(200).json({
    message: "Seller logged in successfully",
    data: {
      id: seller.id,
      name: seller.name,
      email: seller.email,
      "seller-accessToken": accessToken,
      "seller-refreshToken": refreshToken,
    },
  });
};

//Seller forgot password
export const sellerForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new ValidationError(`Missing required fields`));
    }

    const user = await prisma.sellers.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return next(new ValidationError(`Seller with email ${email} not found`));
    }

    await checkOtpRestrictions(email);
    await trackOtpRequestTimes(email);
    await sendOtpMail({
      name: user.name,
      email,
      template: "seller-forgot-password",
    });

    return void res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    return next(error);
  }
};

//refresh token user
// 📱 Client 請求帶上 accessToken
//    ↓
// 🛡️ Server 嘗試 jwt.verify(accessToken)
//    ↓
//  ┌─────────────────────────────┐
//  │ accessToken 有效嗎？        │
//  └─────────────────────────────┘
//          │是                         │否
//          ↓                          ↓
//  🎯 回傳成功資料           🛑 回傳 401 Unauthorized
//                               ↓
//                    📱 Client 偵測 401
//                               ↓
//           🔁 自動發送 refreshToken 給 /api/refresh-token
//                               ↓
//          🛡️ Server 驗證 refreshToken（verify + 查資料庫）
//                               ↓
//  ┌─────────────────────────────┐
//  │ refreshToken 有效嗎？       │
//  └─────────────────────────────┘
//          │是                         │否
//          ↓                          ↓
//  🔄 簽發新 accessToken     ❌ 回傳 401 + 強制登出
//          ↓
//  📱 Client 儲存新 accessToken，再重試原本 API 請求

export const refreshSellerAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies["seller-refreshToken"];

  if (!refreshToken) {
    return next(new ValidationError(`Missing refresh token`));
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESHTOKEN_SECRET as string
    ) as { id: string; role: string };

    console.log("decoded =", decoded);

    if (!decoded || !decoded.id || !decoded.role) {
      return next(new JsonWebTokenError(`Invalid refresh token`));
    }

    const seller = await prisma.sellers.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!seller) {
      return next(new AuthError(`Seller not found`));
    }

    const newAccessToken = jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.JWT_ACCESSTOKEN_SECRET as string,
      {
        expiresIn: "15m",
      }
    );

    setCookie(res, "seller-accessToken", newAccessToken);

    return void res.status(200).json({
      message: "seller-accessToken refreshed successfully",
      data: {
        id: seller.id,
        name: seller.name,
        email: seller.email,
        "access-token": newAccessToken,
      },
    });
  } catch (error) {
    console.log("Error in refreshSellerAccessToken =", error);
    return next(error);
  }
};

//get seller
export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.account.id;

    if (!sellerId) {
      return next(new ValidationError(`Seller not found`));
    }

    const user = await prisma.sellers.findUnique({
      where: {
        id: sellerId,
      },
      include: {
        shop: true,
      },
    });

    return void res.status(200).json({ message: "Seller found", data: user });
  } catch (error) {
    return next(error);
  }
};

//Create a new Shop
export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, bio, address, openingHours, website, category, sellerId } =
      req.body;

    if (!name || !bio || !address || !openingHours || !category || !sellerId) {
      return next(new ValidationError(`Missing required fields`));
    }

    const user = await prisma.sellers.findUnique({
      where: {
        id: sellerId,
      },
    });

    if (!user) {
      return next(new ValidationError(`Seller with id ${sellerId} not found`));
    }

    const newShop = await prisma.shops.create({
      data: {
        sellerId,
        name: user.name,
        bio,
        address,
        openingHours: openingHours,
        website,
        category,
      },
    });

    return void res
      .status(200)
      .json({ message: "Shop created successfully", data: newShop });
  } catch (error) {
    return next(error);
  }
};

//!Payment
//create stripe account

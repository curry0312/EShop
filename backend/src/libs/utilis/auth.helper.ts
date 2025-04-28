import crypto from "crypto";
import { getEmailTemplate, sendEmail } from "./sendMail";
import redis from "../redis";
import { redisKey } from "../config/rediskey";
import { ValidationError } from "../error-handler";

export async function sendOtpMail({
  name,
  email,
  template,
}: {
  name: string;
  email: string;
  template: string;
}) {
  const otp = crypto.randomInt(1000, 9999);

  const html = await getEmailTemplate({ name, email, otp, template });

  await sendEmail({ email, html });

  await redis.set(redisKey.otp(email), otp, "EX", 60 * 5);
  await redis.set(redisKey.otp_cooldown(email), "true", "EX", 60);
}

export const checkOtpRestrictions = async (email: string) => {
  const otpFailLock = await redis.get(redisKey.otp_fail_lock(email));
  if (otpFailLock) {
    throw new ValidationError(
      `Account locked due to multiple failed attempts! Please try again after 30 minutes`
    );
  }

  const otpSpamLock = await redis.get(redisKey.otp_spam_lock(email));
  if (otpSpamLock) {
    throw new ValidationError(
      `Too many OTP requests! Please try again after 1 hours`
    );
  }

  const otpCooldown = await redis.get(redisKey.otp_cooldown(email));
  if (otpCooldown) {
    throw new ValidationError(`You can only get 1 otp per minute`);
  }
};

//檢查user獲得otp次數，當嘗試超過三次時，鎖定一小時
export async function trackOtpRequestTimes(email: string) {
  const requestTimes = await redis.get(redisKey.otp_request_count(email));

  if (Number(requestTimes) >= 3) {
    await redis.set(redisKey.otp_request_count(email), 0, "EX", 60 * 60);
    await redis.set(
      redisKey.otp_spam_lock(email),
      "true",
      "EX",
      60 * 60
    );
    throw new ValidationError(
      "You have reached the maximum number of spam attempts. Please try again later."
    );
  }

  await redis.set(
    redisKey.otp_request_count(email),
    Number(requestTimes) + 1,
    "EX",
    60 * 60
  );
}

//驗證otp
export const verifyOtp = async ({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) => {
  const userOtpInRedis = await redis.get(redisKey.otp(email));

  if (!userOtpInRedis) {
    throw new ValidationError("otp is expired");
  }

  const failAttempts = await redis.get(redisKey.otp_attempts(email));

  console.log("userOtpInRedis", userOtpInRedis)
  console.log("otp", otp)

  if (userOtpInRedis !== otp) {
    if(Number(failAttempts) >= 3){
      await redis.set(redisKey.otp_fail_lock(email), 0, "EX", 60 * 5);
      throw new ValidationError("otp is invalid");
    }

    await redis.set(
      redisKey.otp_attempts(email),
      Number(failAttempts) + 1,
      "EX",
      60 * 5
    );

    throw new ValidationError(
      `Invalid OTP, ${2 - Number(failAttempts || 0)} attempts left`
    );
  }

  await redis.del(redisKey.otp(email));
  await redis.del(redisKey.otp_cooldown(email));
  await redis.del(redisKey.otp_attempts(email));
  await redis.del(redisKey.otp_request_count(email));
  await redis.del(redisKey.otp_spam_lock(email));
  await redis.del(redisKey.otp_fail_lock(email));

  return true;
};


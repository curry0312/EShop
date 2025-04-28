import axios, { AxiosError, AxiosResponse } from "axios";

export type VerifyUserParams = {
  userData: UserDataPayload;
  otp: string;
};

/** Shape of what you send */
interface UserDataPayload {
  // fill in with your actual userData fields…
  email: string;
  name: string;
  password: string;
}

/** Shape of what you expect back */
interface VerifyUserResponse {
  success: boolean;
  message: string;
}

/**
 * Sends the OTP + userData to your verify-user endpoint.
 */
export const verifyUser = async ({
  userData,
  otp,
}: VerifyUserParams): Promise<VerifyUserResponse> => {
  if (!userData) {
    throw new Error("Missing userData");
  }

  try {
    const response: AxiosResponse<VerifyUserResponse> = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-user`,
      {
        ...userData,
        otp: otp,
      },
      {
        withCredentials: true, // include cookies if your API uses them
      }
    );
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      // You can inspect err.response?.data here to show a user-friendly message
      console.error(
        "Axios error verifying user:",
        err.response?.data || err.message
      );
      throw err;
    }
    console.error("Unexpected error verifying user:", err);
    throw err;
  }
};

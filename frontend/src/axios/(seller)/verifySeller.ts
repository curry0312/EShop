import axios, { AxiosResponse } from "axios";

export type VerifySellerParams = {
  sellerData: SellerDataPayload;
  otp: string;
};

/** Shape of what you send */
interface SellerDataPayload {
  // fill in with your actual sellerData fields…
  email: string;
  name: string;
  password: string;
  phoneNumber: string;
  country: string;
}

/** Shape of what you expect back */
interface VerifySellerResponse {
  message: string;
  data: any
}

/**
 * Sends the OTP + sellerData to your verify-seller endpoint.
 */
export const verifySeller = async ({
  sellerData,
  otp,
}: VerifySellerParams): Promise<VerifySellerResponse> => {
  if (!sellerData) {
    throw new Error("Missing sellerData");
  }

  try {
    const response: AxiosResponse<VerifySellerResponse> = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-seller`,
      {
        ...sellerData,
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
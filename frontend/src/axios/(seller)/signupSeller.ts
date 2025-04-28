import axios from "axios";

export type SignupSellerParams = {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  country: string;
};

export const signupSeller = async ({
  name,
  email,
  password,
  phoneNumber,
  country,
}: SignupSellerParams) => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/seller-registration`,
    {
      name,
      email,
      password,
      phoneNumber,
      country,
    },
    {
      withCredentials: true,
    }
  );
  return res.data;
};

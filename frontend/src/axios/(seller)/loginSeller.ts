import axios from "axios";

export type LoginSellerParams = {
  email: string;
  password: string;
};

export const loginSeller = async ({ email, password }: LoginSellerParams) => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/seller/login`,
    {
      email,
      password,
    },
    {
      withCredentials: true,
    }
  );
  return res.data;
};

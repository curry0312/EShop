import axios from "axios";

export type LoginUserParams = {
  email: string;
  password: string;
};

export const loginUser = async ({ email, password }: LoginUserParams) => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/user/login`,
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

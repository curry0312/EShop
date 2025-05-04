import axios from "axios";

export type signupUserParams = {
  name: string;
  email: string;
  password: string
};

export const signupUser = async ({ name, email, password }: signupUserParams) => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/user/register`,
    {
      name,
      email,
      password
    },
    {
      withCredentials: true,
    }
  );
  return res.data;
};

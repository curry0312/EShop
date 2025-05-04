import axiosInstance from "../axiosInstance";

export const getLoginUser = async () => {
  const res = await axiosInstance.get("/api/auth/user/me");
  return res.data.data;
};

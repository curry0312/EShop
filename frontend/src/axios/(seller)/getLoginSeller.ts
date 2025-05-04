import { Sellers, Shops } from "@/types/database-type";
import axiosInstance from "../axiosInstance";

export const getLoginSeller = async (): Promise<Sellers & { shop: Shops }> => {
  const res = await axiosInstance.get("/api/auth/seller/me");
  return res.data.data;
};

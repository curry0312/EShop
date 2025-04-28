

// type CreateCategoriesParams = {
//   sellerId: string;
// };

import { DiscountCodes } from "@/types/database-type";
import axiosInstance from "../axiosInstance";

type GetDiscountCodesResponse = {
  message: string;
  data: DiscountCodes[];
};

export const getDiscountCodes = async (): Promise<GetDiscountCodesResponse> => {
  const res = await axiosInstance.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/product/get-discountCodes`,
    {
      withCredentials: true,
    }
  );
  return res.data;
};

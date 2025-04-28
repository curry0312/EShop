import { DiscountCodes } from "@/types/database-type";
import axiosInstance from "../axiosInstance";



type GetSpecificDiscountCodeParams = {
    discountCode: string;
};

type GetSpecificDiscountCodeResponse = {
    message: string;
    data: DiscountCodes;
};

export const getSpecificDiscountCode = async ({
  discountCode,
}: GetSpecificDiscountCodeParams): Promise<GetSpecificDiscountCodeResponse> => {
  const res = await axiosInstance.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/product/get-discountCode/${discountCode}`,
    {
      withCredentials: true,
    }
  );
  return res.data;
};

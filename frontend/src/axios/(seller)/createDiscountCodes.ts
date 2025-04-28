import { DiscountCodes } from "@/types/database-type";
import axiosInstance from "../axiosInstance";


type CreateDiscountCodeResponse = {
  message: string;
  data: DiscountCodes
}

export type CreateDiscountCodeParams = {
  title: string;
  discountCode: string;
  discountValue: string;
  discountType: string
};

export const createDiscountCode = async ({
  title,
  discountCode,
  discountValue,
  discountType
}: CreateDiscountCodeParams): Promise<CreateDiscountCodeResponse> => {
  const res = await axiosInstance.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/product/create-discountCode`,
    {
      title,
      discountCode,
      discountValue,
      discountType
    },
    {
      withCredentials: true,
    }
  );
  return res.data
};

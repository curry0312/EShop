import { CreateProductSchemaType } from "@/app/(routes)/(seller)/dashboard/create-product/page";
import axiosInstance from "../axiosInstance";

type CreateProductResponse = {
  message: string;
};

type CreateProductParams = {
  data: CreateProductSchemaType;
};

export const createProduct = async ({
  data,
}: CreateProductParams): Promise<CreateProductResponse> => {
  const res = await axiosInstance.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/product/seller/create-product`,
    data,
    {
      withCredentials: true,
    }
  );
  return res.data;
};

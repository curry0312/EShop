import { Products } from "@/types/database-type";
import axiosInstance from "../axiosInstance";


type GetProductsResponse = {
    message: string;    
    data: Products[];
}

export const getProducts = async (): Promise<GetProductsResponse> => {
    const res = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product/seller/get-products`,
        {
            withCredentials: true,
        }
    );
    return res.data;
};
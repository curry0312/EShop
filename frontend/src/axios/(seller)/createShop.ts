import axios from "axios";

export type CreateShopParams = {
    name: string;
    bio: string;
    address: string;
    openingHours: string;
    category: string;
    website?: string;
    sellerId: string;
};

type CreateShopResponse = {
  message: string;
};

export async function createShop(
  data: CreateShopParams
): Promise<CreateShopResponse> {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/create-shop`,
    data,
    {
      withCredentials: true,
    }
  );

  return response.data;
}

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axios/axiosInstance";
import { Sellers, Shops } from "@/types/database-type";

//fetch user
const fetchSeller = async (): Promise<Sellers & { shop: Shops } > => {
  const res = await axiosInstance.get("/api/auth/get-logged-in-seller");
  return res.data.data
};

const useSeller = () => {
  const {
    data: seller,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["get-seller"],
    queryFn: fetchSeller,
    staleTime: 5 * 60 * 1000, //cache for 5 minutes
    retry: 1,
  });

  return { seller, isLoading, isError, refetch };
};


export default useSeller
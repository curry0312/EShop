import { useQuery } from "@tanstack/react-query";
import { getLoginSeller } from "@/axios/(seller)/getLoginSeller";

const useSeller = () => {
  const {
    data: seller,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["get-seller"],
    queryFn: getLoginSeller,
    staleTime: 5 * 60 * 1000, //cache for 5 minutes
    retry: 1,
  });

  return { seller, isLoading, isError, refetch };
};


export default useSeller
import { getLoginUser } from "@/axios/(user)/getLoginUser";
import { useQuery } from "@tanstack/react-query";

const useUser = () => {
  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["get-user"],
    queryFn: getLoginUser,
    staleTime: 5 * 60 * 1000, //cache for 5 minutes
    retry: 1,
  });

  return { user, isLoading, isError, refetch };
};

export default useUser;

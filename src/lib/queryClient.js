import { QueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "@/lib/api-helpers";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30 * 1000,
    },
    mutations: {
      onError: (error) => {
        toast.error(getErrorMessage(error));
      },
    },
  },
});

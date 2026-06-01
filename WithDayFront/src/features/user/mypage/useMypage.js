import { useQuery } from "@tanstack/react-query";
import { getMypageData } from "./api";

export const useMypage = () => {
    const mypageQuery = useQuery({
        queryKey: ["mypage"],
        queryFn: getMypageData,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    return {
        mypageQuery,
    };
};
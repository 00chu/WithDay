import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMypageEditData, updateMypageData } from "./api";

export const useMypageEdit = () => {
    const queryClient = useQueryClient();

    const editQuery = useQuery({
        queryKey: ["mypageEdit"],
        queryFn: getMypageEditData,
    });

    const updateMutation = useMutation({
        mutationFn: updateMypageData,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["mypageEdit"] });
            queryClient.invalidateQueries({ queryKey: ["mypage"] });
        },
    });

    return {
        editQuery,
        updateMutation,
    };
};
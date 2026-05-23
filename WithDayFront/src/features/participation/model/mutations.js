import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  applySchedule,
  updateParticipationStatusByHost,
} from "../api";
import { participationQueryKeys } from "./queries";

export const useApplyScheduleMutation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: applySchedule,
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["schedule-detail", Number(variables.scheduleId)],
        }),
        queryClient.invalidateQueries({
          queryKey: participationQueryKeys.all,
        }),
      ]);
    },
  });

  return {
    applySchedule: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
};

export const useUpdateParticipationStatusMutation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateParticipationStatusByHost,
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: participationQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: participationQueryKeys.scheduleApplicantsPrefix(
            variables.scheduleId,
            variables.email
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: participationQueryKeys.mySchedules(variables.email),
        }),
        queryClient.invalidateQueries({
          queryKey: ["schedule-detail", Number(variables.scheduleId)],
        }),
      ]);
    },
  });

  return {
    updateParticipationStatus: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
};

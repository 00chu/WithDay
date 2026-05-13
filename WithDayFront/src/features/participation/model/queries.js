import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelParticipation,
  createParticipation,
  deleteParticipation,
  fetchMySchedules,
  fetchScheduleApplicants,
  updateParticipationStatus,
} from "../api";
import {
  normalizeMySchedulesResponse,
  normalizeScheduleApplicantsResponse,
} from "./mapper";

export const participationQueryKeys = {
  all: ["participation"],
  mySchedules: (email) => [
    "participation",
    "my-schedules",
    email?.trim() || "guest",
  ],
  scheduleApplicantsPrefix: (scheduleId, email) => [
    "participation",
    "schedule-applicants",
    String(scheduleId ?? "guest"),
    email?.trim() || "guest",
  ],
  scheduleApplicants: (scheduleId, email, status) => [
    "participation",
    "schedule-applicants",
    String(scheduleId ?? "guest"),
    email?.trim() || "guest",
    status?.trim() || "all",
  ],
};

export const useMySchedulesQuery = (email) => {
  const normalizedEmail = email?.trim() ?? "";

  return useQuery({
    queryKey: participationQueryKeys.mySchedules(normalizedEmail),
    queryFn: () => fetchMySchedules({ email: normalizedEmail }),
    enabled: Boolean(normalizedEmail),
    select: normalizeMySchedulesResponse,
    staleTime: 1000 * 60,
  });
};

export const useParticipationMutation = (email) => {
  const queryClient = useQueryClient();

  const invalidateMySchedules = async () => {
    if (!email?.trim()) {
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: participationQueryKeys.mySchedules(email),
    });
  };

  const createMutation = useMutation({
    mutationFn: createParticipation,
    onSuccess: invalidateMySchedules,
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateParticipationStatus,
    onSuccess: invalidateMySchedules,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelParticipation,
    onSuccess: invalidateMySchedules,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteParticipation,
    onSuccess: invalidateMySchedules,
  });

  return {
    createParticipation: createMutation.mutateAsync,
    updateParticipationStatus: updateStatusMutation.mutateAsync,
    cancelParticipation: cancelMutation.mutateAsync,
    deleteParticipation: deleteMutation.mutateAsync,
    isPending:
      createMutation.isPending ||
      updateStatusMutation.isPending ||
      cancelMutation.isPending ||
      deleteMutation.isPending,
  };
};

export const useScheduleApplicantsQuery = ({ scheduleId, email, status }) =>
  useQuery({
    queryKey: participationQueryKeys.scheduleApplicants(scheduleId, email, status),
    queryFn: () =>
      fetchScheduleApplicants({
        scheduleId,
        email,
        status,
      }),
    enabled: Boolean(scheduleId && email),
    select: normalizeScheduleApplicantsResponse,
    staleTime: 1000 * 30,
    retry: false,
  });

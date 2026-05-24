import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  applySchedule,
  updateParticipationStatusByHost,
} from "../api";
import { participationQueryKeys } from "./queries";

/*
 * 일정 상세 페이지의 참여 신청 mutation이다.
 * mutateAsync를 노출하는 이유는 ApplyScheduleButton에서 try/catch로 성공/실패 토스트를 직접 제어해야 하기 때문이다.
 */
export const useApplyScheduleMutation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: applySchedule,
    onSuccess: async (_data, variables) => {
      /*
       * 신청 성공 후에는 두 종류의 데이터를 다시 읽어야 한다.
       * 1. schedule-detail: viewerParticipationStatus가 PENDING으로 바뀌어 버튼 라벨이 "신청 완료"가 된다.
       * 2. participation: 내 일정 탭에도 새 신청 내역이 보여야 한다.
       */
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

/*
 * 호스트의 신청자 승인/거절 mutation이다.
 * 상태 변경은 신청자 목록, 내 일정 목록, 상세 화면 인원/상태에 모두 영향을 주므로 관련 캐시를 함께 무효화한다.
 */
export const useUpdateParticipationStatusMutation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateParticipationStatusByHost,
    onSuccess: async (_data, variables) => {
      /*
       * 승인 처리 후에는 currentParticipants가 바뀌고, 정원이 찼다면 일정 상태가 closed가 될 수 있다.
       * 그래서 신청자 목록만 갱신하면 부족하고 schedule-detail과 내 일정 캐시까지 함께 갱신한다.
       */
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

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

/*
 * 참여 기능에서 사용하는 react-query key 모음이다.
 * 같은 데이터를 여러 화면에서 공유하므로 key를 한 곳에서 만들면 캐시 무효화 범위를 일관되게 유지할 수 있다.
 */
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

/*
 * 내 일정 페이지 조회 hook이다.
 * email이 없으면 요청을 보내지 않는다. 로그인 사용자 정보가 준비되기 전에 빈 email로 API를 호출하면 잘못된 빈 목록이 캐시될 수 있기 때문이다.
 * select에서 응답을 화면 모델로 정리해 UI 컴포넌트는 API 필드명 차이를 신경 쓰지 않게 한다.
 */
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

/*
 * 내 일정 페이지에서 사용하는 참여 액션 mutation 묶음이다.
 * 취소/삭제가 성공하면 같은 페이지의 탭 목록을 다시 불러와야 하므로 mySchedules 캐시를 무효화한다.
 */
export const useParticipationMutation = (email) => {
  const queryClient = useQueryClient();

  const invalidateMySchedules = async () => {
    /*
     * email이 없을 때는 캐시 key가 사용자별로 확정되지 않으므로 무효화하지 않는다.
     * 로그인 후 다시 hook이 활성화되면서 올바른 사용자 key로 조회된다.
     */
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

/*
 * 일정 상세 페이지의 호스트 신청자 목록 조회 hook이다.
 * enabled를 외부에서 받을 수 있게 한 이유는, 상세 응답을 통해 viewerIsHost가 확인된 뒤에만 신청자 목록을 요청하기 위해서다.
 * retry=false는 권한 없음(403) 같은 의도된 실패를 반복 요청하지 않게 하기 위한 설정이다.
 */
export const useScheduleApplicantsQuery = ({
  scheduleId,
  email,
  status,
  enabled,
}) =>
  useQuery({
    queryKey: participationQueryKeys.scheduleApplicants(scheduleId, email, status),
    queryFn: () =>
      fetchScheduleApplicants({
        scheduleId,
        email,
        status,
      }),
    enabled: enabled ?? Boolean(scheduleId && email),
    select: normalizeScheduleApplicantsResponse,
    staleTime: 1000 * 30,
    retry: false,
  });

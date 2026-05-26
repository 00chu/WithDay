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
 * participation feature에서 react-query를 쓰는 이유는 "조회 결과 캐싱"과 "쓰기 후 자동 재조회"를 분리하기 위해서다.
 * 참여 기능은 같은 데이터를 여러 화면이 공유한다.
 *
 * 예:
 * - MySchedulePage는 내 일정 목록을 사용
 * - ScheduleDetail은 신청자 목록과 현재 사용자의 참여 상태를 사용
 * - 호스트 액션 이후에는 여러 화면이 동시에 최신 상태가 되어야 함
 *
 * 이런 경우 서버 응답을 local state로 각각 관리하면 동기화가 어렵기 때문에,
 * query key를 기준으로 데이터를 캐싱하고 invalidate로 갱신하는 방식이 더 안전하다.
 */

/*
 * 참여 기능에서 사용하는 react-query key 모음이다.
 * 같은 데이터를 여러 화면에서 공유하므로 key를 한 곳에서 만들면 캐시 무효화 범위를 일관되게 유지할 수 있다.
 */
export const participationQueryKeys = {
  /*
   * feature 전체를 넓게 지칭하는 최상위 key다.
   * "participation 관련 모든 query"를 폭넓게 invalidate하고 싶을 때 기준점으로 사용된다.
   */
  all: ["participation"],
  /*
   * 사용자별 내 일정 캐시 key다.
   * email을 key에 넣는 이유는 서로 다른 사용자의 참여 데이터가 같은 캐시에 섞이면 안 되기 때문이다.
   * guest fallback은 로그인 전 일시 상태에서도 key shape를 안정적으로 유지하기 위한 값이다.
   */
  mySchedules: (email) => [
    "participation",
    "my-schedules",
    email?.trim() || "guest",
  ],
  /*
   * 신청자 목록 전체 prefix다.
   * 특정 schedule, 특정 호스트 email 조합 아래의 모든 상태 필터(PENDING/APPROVED/...) 캐시를 한 번에 무효화할 때 사용한다.
   */
  scheduleApplicantsPrefix: (scheduleId, email) => [
    "participation",
    "schedule-applicants",
    String(scheduleId ?? "guest"),
    email?.trim() || "guest",
  ],
  /*
   * 실제 신청자 목록 조회 key다.
   * status까지 key에 포함해야 "대기 신청자 목록"과 "승인 신청자 목록"이 서로 다른 캐시 엔트리로 분리된다.
   */
  scheduleApplicants: (scheduleId, email, status) => [
    "participation",
    "schedule-applicants",
    String(scheduleId ?? "guest"),
    email?.trim() || "guest",
    status?.trim() || "all",
  ],
};

/*
 * 내 일정 페이지 전용 조회 hook이다.
 * 호출 시점:
 * - MySchedulePage에서 로그인 사용자의 email을 확보한 뒤 호출
 *
 * 이 hook이 하는 일:
 * 1. fetchMySchedules로 세 탭 데이터를 한 번에 조회
 * 2. react-query 캐시에 사용자별로 저장
 * 3. select 단계에서 API 원본 응답을 카드 렌더링용 모델로 정규화
 *
 * select를 hook 안에 두는 이유는,
 * 화면 컴포넌트가 매번 field 변환 로직을 반복하지 않게 하기 위해서다.
 * 즉 UI는 "이미 렌더링 가능한 데이터"만 받도록 계층을 분리한다.
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
 * 내 일정 화면에서 발생하는 사용자 액션들을 묶어 제공하는 mutation hook이다.
 * 이 hook이 필요한 이유는, 같은 페이지 안에서 생성/상태 변경/취소/삭제가 모두 "내 일정 목록 갱신"이라는 후속 작업을 공유하기 때문이다.
 *
 * 호출 시점:
 * - MySchedulePage에서 버튼 액션 핸들러를 만들 때 사용
 *
 * 상태 관리 방식:
 * - 각 mutation은 react-query가 개별 pending/success/error 상태를 관리
 * - 페이지에서는 여러 mutation의 isPending을 OR로 묶어 "현재 어떤 쓰기 요청이든 진행 중인가"만 간단히 사용
 * 내 일정 페이지에서 사용하는 참여 액션 mutation 묶음이다.
 * 취소/삭제가 성공하면 같은 페이지의 탭 목록을 다시 불러와야 하므로 mySchedules 캐시를 무효화한다.
 */
export const useParticipationMutation = (email) => {
  const queryClient = useQueryClient();

  const invalidateMySchedules = async () => {
    /*
     * invalidateQueries를 직접 감싼 이유는 네 개의 mutation이 모두 같은 후처리를 공유하기 때문이다.
     * 이런 공통 처리를 함수로 빼 두면 성공 후 갱신 정책을 바꿀 때 한 곳만 수정하면 된다.
     *
     * 무효화 이후의 실제 흐름:
     * - 캐시가 stale 처리됨
     * - 화면이 해당 query를 사용 중이면 react-query가 재요청
     * - 서버 최신 상태가 다시 내려오고 리스트가 갱신됨
     *
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

  /*
   * 참여 생성 mutation이다.
   * 현재 MySchedulePage에서는 직접 쓰이지 않더라도,
   * participation feature 단위로 "생성/수정/취소/삭제"를 한 hook에서 제공해 재사용성을 유지한다.
   */
  const createMutation = useMutation({
    mutationFn: createParticipation,
    onSuccess: invalidateMySchedules,
  });

  /*
   * action 기반 공통 상태 변경 mutation이다.
   * cancel/delete 전용 wrapper가 있어도 이 mutation을 함께 두는 이유는,
   * 페이지가 action 문자열 기준으로 단일 진입점을 쓰고 싶을 때를 대비한 feature API이기 때문이다.
   */
  const updateStatusMutation = useMutation({
    mutationFn: updateParticipationStatus,
    onSuccess: invalidateMySchedules,
  });

  /*
   * 본인 참여 취소 mutation이다.
   * 성공 후에는 pending/participating 탭 구성이 바뀔 수 있으므로 전체 mySchedules를 무효화한다.
   */
  const cancelMutation = useMutation({
    mutationFn: cancelParticipation,
    onSuccess: invalidateMySchedules,
  });

  /*
   * 종료된 참여 내역 삭제 mutation이다.
   * 삭제 대상이 리스트에서 사라져야 하므로, 성공 직후 목록 재조회가 반드시 필요하다.
   */
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
 * 일정 상세 페이지에서 호스트만 신청자 목록을 조회할 수 있도록 만든 query hook이다.
 * 호출 시점:
 * - ScheduleDetail이 상세 응답에서 viewerIsHost를 확인한 후
 *
 * 중요한 점:
 * - enabled를 외부에서 받아 호스트가 아닐 때는 아예 요청을 막는다.
 * - status를 query key에 포함해 탭 전환 시 캐시가 분리된다.
 * - select 단계에서 raw applicant row를 HostParticipationCard가 바로 사용할 수 있는 shape로 바꾼다.
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

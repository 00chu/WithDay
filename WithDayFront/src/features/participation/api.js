import { api } from "../../shared/lib/api";

const normalizeEmailParam = (email) => email?.trim() ?? "";

/*
 * 내 일정 API 응답은 탭별로 여러 번 호출되므로 개발 환경에서만 응답을 확인한다.
 * 운영 환경에서는 콘솔 노이즈와 개인정보 노출 위험을 줄이기 위해 출력하지 않는다.
 */
const debugMyScheduleResponse = (label, data) => {
  if (!import.meta.env.DEV) {
    return;
  }

  console.debug(`[my-schedule] ${label}`, data);
};

/*
 * 내 일정 페이지의 참여중/신청중 탭 목록을 조회한다.
 * statuses는 APPROVED,KICKED처럼 콤마 문자열로 넘기며, 백엔드는 이 값을 상태 필터 목록으로 해석한다.
 */
export const fetchParticipationList = async ({ email, statuses }) => {
  const normalizedEmail = normalizeEmailParam(email);
  const { data } = await api.get("/participations/me", {
    params: {
      email: normalizedEmail,
      statuses,
    },
  });

  debugMyScheduleResponse(`participations ${statuses}`, data);

  return data;
};

/*
 * 내가 만든 일정 탭을 조회한다.
 * 이 데이터는 participation row가 아니라 schedule.user_id 기준으로 오기 때문에 participationId가 없을 수 있다.
 */
export const fetchHostingSchedules = async ({ email }) => {
  const normalizedEmail = normalizeEmailParam(email);
  const { data } = await api.get("/participations/me/hosting", {
    params: { email: normalizedEmail },
  });

  debugMyScheduleResponse("hosting", data);

  return data;
};

/*
 * 내 일정 화면은 세 탭을 한 번에 구성해야 하므로 참여중/신청중/호스팅 목록을 병렬로 가져온다.
 * Promise.all을 쓰는 이유는 각 탭이 서로 의존하지 않아 순차 호출보다 화면 대기 시간을 줄일 수 있기 때문이다.
 */
export const fetchMySchedules = async ({ email }) => {
  const [participating, pending, hosting] = await Promise.all([
    fetchParticipationList({ email, statuses: "APPROVED,KICKED" }),
    fetchParticipationList({ email, statuses: "PENDING,REJECTED,CANCELLED" }),
    fetchHostingSchedules({ email }),
  ]);

  return {
    participating,
    pending,
    hosting,
  };
};

/*
 * 일정 상세의 "참여 신청하기" API다.
 * 성공하면 participation row가 PENDING 상태로 생성되고, 이후 호스트가 승인/거절한다.
 */
export const applySchedule = async ({ email, scheduleId }) => {
  const { data } = await api.post("/participations", {
    email,
    scheduleId,
  });

  return data;
};

export const createParticipation = applySchedule;

/*
 * 호스트가 일정 상세에서 신청자 목록을 조회할 때 사용한다.
 * status는 PENDING/APPROVED 같은 필터이며, 기본값을 PENDING으로 둬 최초 진입 시 승인 대기 신청자를 먼저 보여준다.
 */
export const fetchScheduleApplicants = async ({
  scheduleId,
  email,
  status = "PENDING",
}) => {
  const { data } = await api.get(
    `/participations/schedules/${scheduleId}/applicants`,
    {
      params: {
        email,
        status,
      },
    }
  );

  return data;
};

/*
 * 호스트 전용 참여 상태 변경 API다.
 * 승인(APPROVED), 거절(REJECTED), 승인 취소(CANCELLED)를 모두 같은 endpoint로 처리한다.
 */
export const updateParticipationStatusByHost = async ({
  participationId,
  email,
  status,
  reason = "",
}) => {
  const { data } = await api.patch(
    `/participations/${participationId}/status`,
    {
      email,
      status,
      reason,
    }
  );

  return data;
};

/*
 * 내 일정 화면에서 사용자가 자신의 참여 내역에 수행하는 액션을 공통 함수로 묶었다.
 * cancel은 PENDING 신청을 CANCELLED 상태로 바꾸고, delete는 REJECTED/KICKED 내역을 실제 삭제한다.
 */
export const updateParticipationStatus = async ({
  participationId,
  email,
  action,
}) => {
  if (action === "cancel") {
    const { data } = await api.patch(
      `/participations/${participationId}/cancel`,
      null,
      {
        params: { email },
      }
    );
    return data;
  }

  if (action === "delete") {
    const { data } = await api.delete(`/participations/${participationId}`, {
      params: { email },
    });
    return data;
  }

  throw new Error("지원하지 않는 참여 상태 변경입니다.");
};

// PENDING 상태의 신청 취소 버튼에서 호출된다.
export const cancelParticipation = async ({ participationId, email }) => {
  return updateParticipationStatus({
    participationId,
    email,
    action: "cancel",
  });
};

// REJECTED/KICKED 상태의 내역 삭제 버튼에서 호출된다.
export const deleteParticipation = async ({ participationId, email }) => {
  return updateParticipationStatus({
    participationId,
    email,
    action: "delete",
  });
};

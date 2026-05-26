import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../shared/ui/Button/Button";
import { dayjs } from "../../../shared/lib/dateUtile";
import { useAuthStore } from "../../auth/store/authStore";
import { useApplyScheduleMutation } from "../../participation/model/mutations";

/*
 * 모집 마감일 기준으로 프론트에서 한 번 더 신청 가능 여부를 판단한다.
 * 서버에서도 같은 검증을 하지만, 프론트에서 먼저 막아주면 사용자가 불필요한 확인창/API 호출을 거치지 않아도 된다.
 * 마감일 당일은 신청 가능해야 하므로 endOf("day")까지 포함해서 비교한다.
 */
const isScheduleClosedByDate = (recruitEndDate) => {
  if (!recruitEndDate) {
    return null;
  }

  const deadline = dayjs(recruitEndDate).endOf("day");

  if (!deadline.isValid()) {
    return null;
  }

  return dayjs().isAfter(deadline);
};

const normalizeScheduleStatus = (status) =>
  String(status ?? "")
    .trim()
    .toLowerCase();

/*
 * 일정 상세 하단의 "참여 신청하기" 버튼이다.
 * 이 컴포넌트는 버튼 라벨/비활성 상태/신청 API 호출까지만 담당하고,
 * 성공/실패 토스트는 부모(ScheduleDetail)의 onFeedback으로 올려서 페이지 공통 Snackbar가 표시하게 한다.
 */
export default function ApplyScheduleButton({
  scheduleId,
  status,
  recruitEndDate,
  viewerParticipationStatus = "",
  isHost = false,
  onFeedback,
}) {
  const navigate = useNavigate();

  const { user, isLoggedIn } = useAuthStore();

  /*
   * 신청 성공 직후에는 schedule-detail 재조회가 끝나기 전까지 짧은 시간이 생길 수 있다.
   * isApplied는 그 사이에도 버튼을 "신청 완료"로 즉시 바꿔 중복 클릭을 막기 위한 로컬 상태다.
   */
  const [isApplied, setIsApplied] = useState(false);

  const { applySchedule, isPending } = useApplyScheduleMutation();

  const closedByDate = useMemo(
    () => isScheduleClosedByDate(recruitEndDate),
    [recruitEndDate]
  );

  const normalizedScheduleStatus = normalizeScheduleStatus(status);
  const isClosedByStatus = normalizedScheduleStatus !== "recruiting";
  const isClosedByDate = closedByDate === true;
  const isClosed = isClosedByStatus || isClosedByDate;

  /*
   * viewerParticipationStatus는 서버가 현재 로그인 사용자의 참여 상태를 내려준 값이다.
   * 이 값이 있으면 이미 신청/승인/거절된 사용자이므로 새 신청 버튼을 열지 않는다.
   */
  const normalizedParticipationStatus =
    viewerParticipationStatus?.trim()?.toUpperCase() ?? "";

  /*
   * 버튼 라벨은 사용자가 지금 왜 신청할 수 없는지 바로 이해하도록 상태 우선순위를 둔다.
   * 호스트/기존 참여 상태/마감/신청 처리중 순서로 판단하고, 아무 제한이 없을 때만 "참여 신청하기"를 보여준다.
   */
  const buttonLabel = useMemo(() => {
    if (isHost) return "내가 만든 일정";
    if (normalizedParticipationStatus === "APPROVED") return "참여 확정";
    if (normalizedParticipationStatus === "PENDING") return "신청 완료";
    if (normalizedParticipationStatus === "REJECTED") return "거절됨";
    if (normalizedParticipationStatus === "CANCELED") return "신청 취소됨";
    if (normalizedParticipationStatus === "KICKED") return "참여 불가";
    if (isClosed) return "모집 종료";
    if (isApplied) return "신청 완료";
    if (isPending) return "신청 중...";
    return "참여 신청하기";
  }, [
    isClosed,
    isApplied,
    isHost,
    isPending,
    normalizedParticipationStatus,
  ]);

  /*
   * 마감 상태는 disabled에 넣지 않는다.
   * 버튼을 누르면 "이미 마감된 일정입니다" 토스트를 보여줘야 사용자가 왜 신청이 안 되는지 알 수 있기 때문이다.
   * 반면 호스트/이미 신청한 사용자/요청 진행중 상태는 실제로 액션이 필요 없으므로 비활성화한다.
   */
  const isButtonDisabled =
    isHost ||
    Boolean(normalizedParticipationStatus) ||
    isApplied ||
    isPending;

  const showFeedback = ({ message, severity }) => {
    onFeedback?.({
      id: Date.now(),
      message,
      severity,
    });
  };

  /*
   * 백엔드 예외 응답은 문자열, { message }, Spring 기본 { detail } 형태가 섞일 수 있다.
   * 정원 마감/모집 마감 같은 서버 검증 실패 메시지를 프론트 토스트에 그대로 보여주기 위해 가능한 필드를 순서대로 확인한다.
   */
  const resolveErrorMessage = (error) => {
    const responseData = error?.response?.data;

    if (typeof responseData === "string" && responseData.trim()) {
      return responseData;
    }

    if (typeof responseData?.message === "string" && responseData.message.trim()) {
      return responseData.message;
    }

    if (typeof responseData?.detail === "string" && responseData.detail.trim()) {
      return responseData.detail;
    }

    if (typeof error?.message === "string" && error.message.trim()) {
      return error.message;
    }

    return "참여 신청에 실패했습니다.";
  };

  /*
   * 버튼 클릭 -> 신청 API 호출 흐름이다.
   * 1. 로그인하지 않은 사용자는 로그인 페이지로 보낸다.
   * 2. email이 없거나 버튼이 비활성 상태면 요청하지 않는다.
   * 3. 프론트에서 확인 가능한 마감 상태는 warning 토스트로 안내한다.
   * 4. 사용자 확인 후 POST /participations를 호출한다.
   * 5. 성공하면 로컬 상태와 토스트를 갱신하고, 실패하면 서버 메시지를 error 토스트로 보여준다.
   */
  const handleApply = async () => {
    if (!isLoggedIn) {
      navigate("/login", { replace: true });
      return;
    }

    const email = user?.email?.trim();

    if (!email) return;
    if (isButtonDisabled) return;
    if (isClosed) {
      showFeedback({
        severity: "warning",
        message: "이미 마감된 일정입니다",
      });
      return;
    }

    const confirmJoin = window.confirm("이 일정에 참여 신청을 하시겠습니까?");
    if (!confirmJoin) return;

    try {
      await applySchedule({ email, scheduleId });

      setIsApplied(true);
      showFeedback({
        severity: "success",
        message: "참여 신청이 완료되었습니다",
      });
    } catch (error) {
      showFeedback({
        severity: "error",
        message: resolveErrorMessage(error),
      });
    }
  };

  return (
    <>
      <Button
        variant={!isClosed ? "accent" : "outline"}
        size="md"
        disabled={isButtonDisabled}
        onClick={handleApply}
      >
        {buttonLabel}
      </Button>
    </>
  );
}

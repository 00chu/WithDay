import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../shared/ui/Button/Button";
import { dayjs } from "../../../shared/lib/dateUtile";
import { useAuthStore } from "../../auth/store/authStore";
import {
  useApplyScheduleMutation,
  useCancelParticipationMutation,
} from "../../participation/model/mutations";
import { SCHEDULE_STATUS } from "../model/constants";
import { getScheduleEligibility } from "../model/eligibility";
import styles from "./ApplyScheduleButton.module.css";

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
 * 일정 상세 하단의 참여 버튼이다.
 * 이 버튼은 단순히 "신청"만 처리하지 않고,
 * 현재 참여 상태에 따라 신청 또는 취소 액션으로 동작이 바뀐다.
 *
 * 상태별 동작:
 * - status 없음 / CANCELED: 참여 신청하기
 * - PENDING: 신청 취소
 * - APPROVED: 참여 취소
 * - COMPLETED: 일정 진행 중 (신청/취소 모두 불가)
 * - REJECTED / KICKED: 비활성 안내
 *
 * 성공/실패 토스트는 부모(ScheduleDetail)의 onFeedback으로 올려서 페이지 공통 Snackbar가 표시하게 한다.
 */
export default function ApplyScheduleButton({
  scheduleId,
  status,
  recruitEndDate,
  genderLimit = "all",
  ageMin = null,
  ageMax = null,
  viewerParticipationId = null,
  viewerParticipationStatus = "",
  isHost = false,
  onFeedback,
}) {
  const navigate = useNavigate();

  const { user, isLoggedIn } = useAuthStore();

  /*
   * schedule-detail 재조회가 끝나기 전까지도 버튼 문구를 즉시 반영하기 위해 로컬 상태를 둔다.
   * apply/cancel 성공 직후에는 여기 값을 먼저 바꾸고,
   * 이후 서버 응답이 다시 들어오면 useEffect로 서버 상태와 다시 동기화한다.
   */
  const [localParticipationStatus, setLocalParticipationStatus] =
    useState(null);

  const { applySchedule, isPending } = useApplyScheduleMutation();
  const { cancelParticipation, isPending: isCancelPending } =
    useCancelParticipationMutation();

  const closedByDate = useMemo(
    () => isScheduleClosedByDate(recruitEndDate),
    [recruitEndDate]
  );

  /*
   * schedule.status는 모집 상태와 실행 상태를 모두 담고 있다.
   * 여기서 completed를 따로 뽑는 이유는,
   * 일반 closed와 달리 "모집이 끝났다"가 아니라 "이미 진행이 시작되어 더 강한 제약이 걸린 상태"이기 때문이다.
   */
  const normalizedScheduleStatus = normalizeScheduleStatus(status);
  const isCompleted = normalizedScheduleStatus === SCHEDULE_STATUS.COMPLETED;
  const isClosedByStatus =
    normalizedScheduleStatus !== SCHEDULE_STATUS.RECRUITING;
  const isClosedByDate = closedByDate === true;
  const isClosed = isClosedByStatus || isClosedByDate;
  const eligibility = useMemo(
    () =>
      getScheduleEligibility({
        userGender: user?.gender,
        birthday: user?.birthday,
        genderLimit,
        ageMin,
        ageMax,
      }),
    [ageMax, ageMin, genderLimit, user?.birthday, user?.gender]
  );

  /*
   * viewerParticipationStatus는 서버가 현재 로그인 사용자의 최신 참여 상태를 내려준 값이다.
   * CANCELED는 다시 신청 가능 상태로 보아야 하므로, 단순 "값이 있으면 비활성" 규칙을 쓰지 않는다.
   */
  const normalizedParticipationStatus =
    viewerParticipationStatus?.trim()?.toUpperCase() ?? "";
  const effectiveParticipationStatus =
    localParticipationStatus || normalizedParticipationStatus;

  const canApply =
    !effectiveParticipationStatus ||
    effectiveParticipationStatus === "CANCELED";
  const canCancel =
    effectiveParticipationStatus === "PENDING" ||
    effectiveParticipationStatus === "APPROVED";
  const isActionPending = isPending || isCancelPending;
  const isEligible = eligibility.isEligible;
  const shouldEnforceEligibility = isLoggedIn && canApply;

  /*
   * 버튼 라벨은 "현재 상태"가 아니라 "지금 사용자가 할 수 있는 다음 행동"을 기준으로 정한다.
   * 그래서 APPROVED도 읽기 전용 문구가 아니라 "참여 취소"를 보여준다.
   * completed는 예외적으로 어떤 행동도 허용되지 않으므로, 액션 문구 대신 상태 문구 자체를 노출한다.
   */
  const buttonLabel = useMemo(() => {
    if (isHost) return "내가 만든 일정";
    if (isCompleted) return "일정 진행 중";
    if (effectiveParticipationStatus === "PENDING") return "신청 취소";
    if (effectiveParticipationStatus === "APPROVED") return "참여 취소";
    if (effectiveParticipationStatus === "REJECTED") return "거절됨";
    if (effectiveParticipationStatus === "KICKED") return "참여 불가";
    if (isClosed) return "모집 종료";
    if (isActionPending) {
      return canCancel ? "취소 처리 중..." : "신청 중...";
    }
    return "참여 신청하기";
  }, [
    canCancel,
    effectiveParticipationStatus,
    isCompleted,
    isActionPending,
    isClosed,
    isHost,
  ]);

  /*
   * 비활성 조건은 "상태값이 존재하느냐"가 아니라 "현재 액션이 가능한가"로 결정한다.
   * REJECTED/KICKED는 막고, CANCELED는 다시 신청 가능하도록 열어 둔다.
   * 마감 상태는 disabled에 넣지 않고 클릭 시 경고 토스트를 보여주지만,
   * completed는 단순 마감보다 더 강한 운영 상태라 아예 disabled로 잠근다.
   */
  const isButtonDisabled =
    isHost ||
    isCompleted ||
    effectiveParticipationStatus === "REJECTED" ||
    effectiveParticipationStatus === "KICKED" ||
    isActionPending ||
    (shouldEnforceEligibility && !isEligible) ||
    (canCancel && !viewerParticipationId);

  const eligibilityMessages =
    shouldEnforceEligibility && !isEligible
      ? eligibility.reasons
      : [];

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

    if (
      typeof responseData?.message === "string" &&
      responseData.message.trim()
    ) {
      return responseData.message;
    }

    if (
      typeof responseData?.detail === "string" &&
      responseData.detail.trim()
    ) {
      return responseData.detail;
    }

    if (typeof error?.message === "string" && error.message.trim()) {
      return error.message;
    }

    return "참여 처리에 실패했습니다.";
  };

  /*
   * 버튼 클릭 후 실제 흐름이다.
   * 1. 비로그인 사용자는 로그인으로 보낸다.
   * 2. completed면 즉시 안내 메시지를 보여주고 종료한다.
   * 3. 현재 상태가 PENDING/APPROVED면 cancel API를 호출한다.
   * 4. 그 외에는 apply API를 호출한다.
   * 5. 성공 시 로컬 상태를 먼저 바꿔 즉시 UI 반영
   * 6. mutation의 invalidate가 끝나면 서버 응답과 다시 동기화
   */
  const handleApply = async () => {
    if (!isLoggedIn) {
      navigate("/login", { replace: true });
      return;
    }

    const email = user?.email?.trim();

    if (!email) return;
    if (isButtonDisabled) return;

    if (isCompleted) {
      /*
       * 진행 중인 일정에서는 참여 구성 변경이 금지된다.
       * 서버도 같은 정책으로 막지만, 프론트에서 먼저 메시지를 주면 사용자가 왜 안 되는지 바로 이해할 수 있다.
       */
      showFeedback({
        severity: "info",
        message: "진행 중인 일정은 참여 신청이나 취소를 할 수 없습니다.",
      });
      return;
    }

    if (canApply && isClosed) {
      /*
       * 일반 모집 마감(closed/date passed)은 버튼을 완전히 비활성화하지 않고
       * 클릭 시 이유를 알려주는 쪽이 UX상 더 친절하다.
       * 사용자는 "왜 신청이 안 되는지"를 즉시 확인할 수 있다.
       */
      showFeedback({
        severity: "warning",
        message: "이미 마감된 일정입니다",
      });
      return;
    }

    try {
      if (canCancel) {
        const confirmCancel = window.confirm(
          effectiveParticipationStatus === "APPROVED"
            ? "이 일정 참여를 취소하시겠습니까?"
            : "이 일정 신청을 취소하시겠습니까?"
        );
        if (!confirmCancel) return;

        await cancelParticipation({
          participationId: viewerParticipationId,
          scheduleId,
          email,
        });

        setLocalParticipationStatus("CANCELED");
        showFeedback({
          severity: "success",
          message:
            effectiveParticipationStatus === "APPROVED"
              ? "참여가 취소되었습니다"
              : "신청이 취소되었습니다",
        });
        return;
      }

      const confirmJoin = window.confirm("이 일정에 참여 신청을 하시겠습니까?");
      if (!confirmJoin) return;

      await applySchedule({ email, scheduleId });

      setLocalParticipationStatus("PENDING");
      showFeedback({
        severity: "success",
        message:
          effectiveParticipationStatus === "CANCELED"
            ? "참여 신청이 다시 완료되었습니다"
            : "참여 신청이 완료되었습니다",
      });
    } catch (error) {
      showFeedback({
        severity: "error",
        message: resolveErrorMessage(error),
      });
    }
  };

  return (
    <div className={styles.container}>
      <Button
        variant={!isClosed || canCancel ? "accent" : "outline"}
        size="md"
        disabled={isButtonDisabled}
        onClick={handleApply}
        className={styles.button}
      >
        {buttonLabel}
      </Button>

      {eligibilityMessages.length > 0 ? (
        <div className={styles.messages}>
          {eligibilityMessages.map((message) => (
            <p key={message} className={styles.message}>
              {message}
            </p>
          ))}
        </div>
      ) : null}

      {isCompleted ? (
        <p className={styles.message}>
          진행 중인 일정은 참여 신청이나 취소를 할 수 없습니다.
        </p>
      ) : null}
    </div>
  );
}

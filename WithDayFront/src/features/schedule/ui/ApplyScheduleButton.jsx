import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../shared/ui/Button/Button";
import { dayjs } from "../../../shared/lib/dateUtile";
import { useAuthStore } from "../../auth/store/authStore";
import { useApplyScheduleMutation } from "../../participation/model/mutations";

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
  const normalizedParticipationStatus =
    viewerParticipationStatus?.trim()?.toUpperCase() ?? "";

  const buttonLabel = useMemo(() => {
    if (isHost) return "내가 만든 일정";
    if (normalizedParticipationStatus === "APPROVED") return "참여 확정";
    if (normalizedParticipationStatus === "PENDING") return "신청 완료";
    if (normalizedParticipationStatus === "REJECTED") return "거절됨";
    if (normalizedParticipationStatus === "CANCELLED") return "신청 취소됨";
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

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Button from "../../../shared/ui/Button/Button";
import { dayjs } from "../../../shared/lib/dateUtile";
import { useAuthStore } from "../../auth/store/authStore";
import { useApplyScheduleMutation } from "../../participation/model/mutations";

const DEFAULT_FEEDBACK = {
  open: false,
  message: "",
  severity: "success",
};

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
}) {
  const navigate = useNavigate();

  // ✅ zustand에서 직접 가져오기 (핵심)
  const { user, isLoggedIn } = useAuthStore();

  const [isApplied, setIsApplied] = useState(false);
  const [feedback, setFeedback] = useState(DEFAULT_FEEDBACK);

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
    isClosed ||
    isApplied ||
    isPending;

  useEffect(() => {
    if (!feedback.open) return;

    const timer = window.setTimeout(() => {
      setFeedback(DEFAULT_FEEDBACK);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [feedback.open]);

  const handleCloseFeedback = (_event, reason) => {
    if (reason === "clickaway") return;
    setFeedback(DEFAULT_FEEDBACK);
  };

  const handleApply = async () => {
    // ✅ 로그인 여부 먼저 체크
    if (!isLoggedIn) {
      navigate("/login", { replace: true });
      return;
    }

    const email = user?.email?.trim();

    if (!email) return;
    if (isButtonDisabled) return;

    const confirmJoin = window.confirm("이 일정에 참여 신청을 하시겠습니까?");
    if (!confirmJoin) return;

    try {
      await applySchedule({ email, scheduleId });

      setIsApplied(true);
      setFeedback({
        open: true,
        severity: "success",
        message: "참여 신청이 완료되었습니다. 주최자의 승인을 기다려주세요.",
      });
    } catch (error) {
      const message =
        error?.response?.data?.message ??
        error?.response?.data ??
        error?.message ??
        "참여 신청에 실패했습니다.";

      setFeedback({
        open: true,
        severity: "error",
        message:
          typeof message === "string" ? message : "참여 신청에 실패했습니다.",
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

      <Snackbar
        open={feedback.open}
        autoHideDuration={3000}
        onClose={handleCloseFeedback}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseFeedback}
          severity={feedback.severity}
          sx={{ width: "100%" }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </>
  );
}

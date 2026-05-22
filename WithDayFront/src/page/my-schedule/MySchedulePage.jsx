import { useCallback, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./MySchedulePage.module.css";

import { useAuthStore } from "../../features/auth/store/authStore";

import { PARTICIPATION_TABS } from "../../features/participation/model/constants";
import {
  useMySchedulesQuery,
  useParticipationMutation,
} from "../../features/participation/model/queries";
import ParticipationFeedback from "../../features/participation/ui/ParticipationFeedback/ParticipationFeedback";
import ParticipationList from "../../features/participation/ui/ParticipationList/ParticipationList";
import ParticipationTabs from "../../features/participation/ui/ParticipationTabs/ParticipationTabs";

const DEFAULT_SCHEDULES = {
  participating: [],
  pending: [],
  hosting: [],
};

const MySchedulePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "participating",
  );
  const [feedback, setFeedback] = useState(null);

  const email = useAuthStore((state) => state.user.email);

  const {
    data: schedules = DEFAULT_SCHEDULES,
    isPending,
    error,
  } = useMySchedulesQuery(email);
  const {
    cancelParticipation,
    deleteParticipation,
    isPending: isMutationPending,
  } = useParticipationMutation(email);

  const currentItems = useMemo(
    () => schedules[activeTab] ?? [],
    [activeTab, schedules],
  );

  const errorMessage = useMemo(
    () =>
      error?.response?.data?.message ?? "내 일정 정보를 불러오지 못했습니다.",
    [error],
  );

  const emptyMessage = email
    ? "해당하는 일정이 없습니다."
    : "로그인 후 내 일정을 확인해 주세요.";

  const handleCloseFeedback = useCallback((event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setFeedback(null);
  }, []);

  const showFeedback = useCallback((severity, message) => {
    setFeedback({ severity, message });
  }, []);

  const runScheduleMutation = useCallback(
    async ({ request, successMessage, failureMessage, confirmMessage }) => {
      if (confirmMessage && !window.confirm(confirmMessage)) {
        return;
      }

      try {
        await request();
        showFeedback("success", successMessage);
      } catch (mutationError) {
        showFeedback(
          "error",
          mutationError?.response?.data?.message ?? failureMessage,
        );
      }
    },
    [showFeedback],
  );

  const handleScheduleAction = useCallback(
    async (item) => {
      if (!email) {
        navigate("/login", { replace: true });
        return;
      }

      if (item.myRole === "host" || item.dbStatus === "APPROVED") {
        navigate(`/schedule/${item.scheduleId}`);
        return;
      }

      if (item.dbStatus === "PENDING") {
        await runScheduleMutation({
          confirmMessage: "신청을 취소하시겠습니까?",
          successMessage: "신청이 취소되었습니다.",
          failureMessage:
            "신청 취소에 실패했습니다. 잠시 후 다시 시도해 주세요.",
          request: () =>
            cancelParticipation({
              participationId: item.participationId,
              email,
            }),
        });
        return;
      }

      if (item.dbStatus === "REJECTED" || item.dbStatus === "KICKED") {
        await runScheduleMutation({
          confirmMessage: "이 참여 내역을 삭제하시겠습니까?",
          successMessage: "참여 내역이 삭제되었습니다.",
          failureMessage: "삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.",
          request: () =>
            deleteParticipation({
              participationId: item.participationId,
              email,
            }),
        });
      }
    },
    [
      cancelParticipation,
      deleteParticipation,
      email,
      navigate,
      runScheduleMutation,
    ],
  );

  const isPendingState = isPending;

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2 className={styles.title}>내 일정</h2>
      </div>

      <ParticipationFeedback
        feedback={feedback}
        onClose={handleCloseFeedback}
      />

      <ParticipationTabs
        tabs={PARTICIPATION_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <ParticipationList
        items={currentItems}
        loading={isPendingState}
        errorMessage={error ? errorMessage : ""}
        emptyMessage={emptyMessage}
        onItemAction={handleScheduleAction}
        isActionLoading={isMutationPending}
      />
    </div>
  );
};

export default MySchedulePage;

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

  /*
   * 내 일정 페이지는 참여중/신청중/호스팅 탭을 같은 화면에서 전환한다.
   * 다른 화면에서 특정 탭으로 진입할 수 있도록 location.state.activeTab을 우선 사용한다.
   */
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "participating",
  );
  const [feedback, setFeedback] = useState(null);

  /*
   * email은 내 참여 목록 조회와 취소/삭제 API의 사용자 식별값으로 쓰인다.
   * 실제 권한 검증은 백엔드가 다시 수행하지만, 프론트에서는 사용자별 query key를 만들기 위해 필요하다.
   */
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

  // activeTab에 해당하는 목록만 ParticipationList에 내려준다.
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

  /*
   * 내 일정의 취소/삭제 액션 공통 실행 함수다.
   * 확인창 -> API 호출 -> 성공/실패 토스트 순서가 같아서 중복을 줄였다.
   * 성공 후 목록 재조회는 useParticipationMutation 내부의 react-query invalidate가 담당한다.
   */
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

  /*
   * 카드 클릭/버튼 액션 분기다.
   * host, APPROVED, CANCELLED 상태는 상세 페이지에서 확인하는 흐름이고,
   * PENDING은 신청 취소, REJECTED/KICKED는 내역 삭제를 제공한다.
   */
  const handleScheduleAction = useCallback(
    async (item) => {
      if (!email) {
        navigate("/login", { replace: true });
        return;
      }

      if (
        item.myRole === "host" ||
        item.dbStatus === "APPROVED" ||
        item.dbStatus === "CANCELLED"
      ) {
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

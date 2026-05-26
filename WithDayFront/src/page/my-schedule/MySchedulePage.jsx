import { useCallback, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./MySchedulePage.module.css";

import { useAuthStore } from "../../features/auth/store/authStore";
import { dayjs } from "../../shared/lib/dateUtile";
import Pagination from "../../shared/ui/Pagination/Pagination";

import { PARTICIPATION_TABS } from "../../features/participation/model/constants";
import {
  useMySchedulesQuery,
  useParticipationMutation,
} from "../../features/participation/model/queries";
import { SCHEDULE_STATUS } from "../../features/schedule/model/constants";
import ParticipationFeedback from "../../features/participation/ui/ParticipationFeedback/ParticipationFeedback";
import ParticipationList from "../../features/participation/ui/ParticipationList/ParticipationList";
import ParticipationTabs from "../../features/participation/ui/ParticipationTabs/ParticipationTabs";

const DEFAULT_SCHEDULES = {
  participating: [],
  pending: [],
  hosting: [],
};

const CLOSED_HOSTING_PAGE_SIZE = 4;
const CLOSED_HOSTING_NAV_SIZE = 5;

const normalizeScheduleStatus = (value) => String(value ?? "").trim().toLowerCase();

const resolvePrimaryDeadline = (item) => {
  const recruitEnd = dayjs(item?.recruitEndDate).startOf("day");
  if (recruitEnd.isValid()) {
    return recruitEnd;
  }

  const end = dayjs(item?.endDate).startOf("day");
  if (end.isValid()) {
    return end;
  }

  return null;
};

const resolveEndDate = (item) => {
  const end = dayjs(item?.endDate).startOf("day");
  return end.isValid() ? end : null;
};

const isClosedHostingSchedule = (item) => {
  const normalizedStatus = normalizeScheduleStatus(item?.scheduleStatus);
  const today = dayjs().startOf("day");
  const endDate = resolveEndDate(item);

  if (endDate && endDate.isBefore(today)) {
    return true;
  }

  return (
    normalizedStatus === SCHEDULE_STATUS.CLOSED ||
    normalizedStatus === SCHEDULE_STATUS.COMPLETED ||
    normalizedStatus === SCHEDULE_STATUS.CANCELED
  );
};

const compareHostingDeadlineAsc = (left, right) => {
  const leftDeadline = resolvePrimaryDeadline(left);
  const rightDeadline = resolvePrimaryDeadline(right);

  if (leftDeadline && rightDeadline) {
    if (leftDeadline.isBefore(rightDeadline)) return -1;
    if (leftDeadline.isAfter(rightDeadline)) return 1;
  } else if (leftDeadline) {
    return -1;
  } else if (rightDeadline) {
    return 1;
  }

  const leftEndDate = resolveEndDate(left);
  const rightEndDate = resolveEndDate(right);
  if (leftEndDate && rightEndDate) {
    if (leftEndDate.isBefore(rightEndDate)) return -1;
    if (leftEndDate.isAfter(rightEndDate)) return 1;
  } else if (leftEndDate) {
    return -1;
  } else if (rightEndDate) {
    return 1;
  }

  return Number(left?.scheduleId ?? 0) - Number(right?.scheduleId ?? 0);
};

const compareHostingDeadlineDesc = (left, right) =>
  compareHostingDeadlineAsc(right, left);

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
  const [showClosedHosting, setShowClosedHosting] = useState(false);
  const [closedHostingPage, setClosedHostingPage] = useState(0);

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

  const hostingSections = useMemo(() => {
    const hostingItems = Array.isArray(schedules.hosting) ? schedules.hosting : [];
    const activeHostingItems = hostingItems
      .filter((item) => !isClosedHostingSchedule(item))
      .sort(compareHostingDeadlineAsc);
    const closedHostingItems = hostingItems
      .filter((item) => isClosedHostingSchedule(item))
      .sort(compareHostingDeadlineDesc);

    return {
      activeHostingItems,
      closedHostingItems,
    };
  }, [schedules.hosting]);

  const closedHostingTotalPage = useMemo(
    () =>
      Math.ceil(
        hostingSections.closedHostingItems.length / CLOSED_HOSTING_PAGE_SIZE,
      ),
    [hostingSections.closedHostingItems.length],
  );

  const safeClosedHostingPage =
    closedHostingTotalPage > 0
      ? Math.min(closedHostingPage, closedHostingTotalPage - 1)
      : 0;

  const pagedClosedHostingItems = useMemo(() => {
    const startIndex = safeClosedHostingPage * CLOSED_HOSTING_PAGE_SIZE;
    const endIndex = startIndex + CLOSED_HOSTING_PAGE_SIZE;
    return hostingSections.closedHostingItems.slice(startIndex, endIndex);
  }, [hostingSections.closedHostingItems, safeClosedHostingPage]);

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
   * host, APPROVED, CANCELED 상태는 상세 페이지에서 확인하는 흐름이고,
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
        item.dbStatus === "CANCELED"
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

  const handleTabChange = useCallback((nextTab) => {
    setActiveTab(nextTab);

    if (nextTab === "hosting") {
      setClosedHostingPage(0);
    }
  }, []);

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
        onTabChange={handleTabChange}
      />

      {activeTab === "hosting" ? (
        <div className={styles.hostingSections}>
          <section className={styles.scheduleSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>진행 중 일정</h3>
              <p className={styles.sectionDescription}>
                모집이 아직 열려 있거나 종료일이 지나지 않은 일정입니다.
              </p>
            </div>

            <ParticipationList
              items={hostingSections.activeHostingItems}
              loading={isPendingState}
              errorMessage={error ? errorMessage : ""}
              emptyMessage="진행 중인 일정이 없습니다."
              onItemAction={handleScheduleAction}
              isActionLoading={isMutationPending}
            />
          </section>

          {hostingSections.closedHostingItems.length > 0 ? (
            <section className={styles.closedSection}>
              <div className={styles.sectionHeader}>
                <div className={styles.closedHeadingRow}>
                  <div>
                    <h3 className={styles.sectionTitle}>마감된 일정</h3>
                    <p className={styles.sectionDescription}>
                      모집이 마감되었거나 종료된 일정입니다.
                    </p>
                  </div>

                  <button
                    type="button"
                    className={styles.closedToggleButton}
                    onClick={() => setShowClosedHosting((prev) => !prev)}
                  >
                    {showClosedHosting
                      ? "마감된 일정 숨기기"
                      : `마감된 일정 보기 (${hostingSections.closedHostingItems.length})`}
                  </button>
                </div>
              </div>

              {showClosedHosting ? (
                <>
                  <ParticipationList
                    items={pagedClosedHostingItems}
                    loading={isPendingState}
                    errorMessage={error ? errorMessage : ""}
                    emptyMessage="마감된 일정이 없습니다."
                    onItemAction={handleScheduleAction}
                    isActionLoading={isMutationPending}
                  />

                  {closedHostingTotalPage > 1 ? (
                    <div className={styles.paginationWrap}>
                      <Pagination
                        page={safeClosedHostingPage}
                        setPage={setClosedHostingPage}
                        totalPage={closedHostingTotalPage}
                        naviSize={CLOSED_HOSTING_NAV_SIZE}
                      />
                    </div>
                  ) : null}
                </>
              ) : null}
            </section>
          ) : null}
        </div>
      ) : (
        <ParticipationList
          items={currentItems}
          loading={isPendingState}
          errorMessage={error ? errorMessage : ""}
          emptyMessage={emptyMessage}
          onItemAction={handleScheduleAction}
          isActionLoading={isMutationPending}
        />
      )}
    </div>
  );
};

export default MySchedulePage;

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PlaceIcon from "@mui/icons-material/Place";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PeopleIcon from "@mui/icons-material/People";
import PaymentsIcon from "@mui/icons-material/Payments";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

import {
  createBookmark,
  deleteBookmark as deleteBookmarkApi,
  completeSchedule,
  rollbackCompletedSchedule,
  fetchScheduleDetail,
  incrementScheduleViewCount,
  deleteSchedule,
} from "../../features/schedule/api";
import { useAuthStore } from "../../features/auth/store/authStore";
import { useScheduleApplicantsQuery } from "../../features/participation/model/queries";
import { useUpdateParticipationStatusMutation } from "../../features/participation/model/mutations";
import ParticipationFeedback from "../../features/participation/ui/ParticipationFeedback/ParticipationFeedback";
import HostParticipationList from "../../features/participation/ui/HostParticipationList/HostParticipationList";
import ApplyScheduleButton from "../../features/schedule/ui/ApplyScheduleButton";
import { SCHEDULE_STATUS } from "../../features/schedule/model/constants";
import Button from "../../shared/ui/Button/Button";
import styles from "./ScheduleDetail.module.css";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";

const CATEGORY_LABELS = {
  all: "전체",
  travel: "여행",
  popup: "팝업",
  food: "식사",
  activity: "액티비티",
  culture: "문화",
  etc: "기타",
};

const COST_TYPE_LABELS = {
  per_person: "총액 1/N",
  host_covered: "호스트 부담",
  free: "무료",
  custom: "인당 고정 금액",
};

const DEFAULT_IMAGE = "https://placehold.co/800x400?text=No+Image";
const VIEWED_SCHEDULE_STORAGE_KEY_PREFIX = "viewed_schedule_";
const HOST_STATUS_LABELS = {
  PENDING: "승인 대기",
  APPROVED: "승인 완료",
  REJECTED: "거절",
  CANCELED: "참여 취소",
  KICKED: "강퇴",
};

const formatLocation = (schedule) => {
  const region = schedule?.region?.trim() ?? "";
  const detailRegion = schedule?.detailRegion?.trim() ?? "";

  if (region && detailRegion) {
    return `${region} ${detailRegion}`;
  }

  return region || detailRegion || "장소 미정";
};

/*
 * 상세 상단 배지에 보여줄 "일정 단계 문구"를 계산한다.
 * 여기서 중요한 점은 completed를 단순 "종료"로 보지 않는다는 것이다.
 * 이번 기능에서는 completed를 "호스트가 일정 시작을 확정했고, 참여/수정/삭제가 잠긴 진행 상태"로 사용하므로
 * 배지 문구도 종료가 아니라 진행중으로 보여줘야 사용자가 현재 제약을 올바르게 이해할 수 있다.
 */
const resolveSchedulePhase = (schedule) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const normalizedStatus = schedule?.status?.trim()?.toLowerCase() ?? "";

  const startDate = schedule?.startDate ? new Date(schedule.startDate) : null;
  const endDate = schedule?.endDate ? new Date(schedule.endDate) : null;
  const recruitEndDate = schedule?.recruitEndDate
    ? new Date(schedule.recruitEndDate)
    : null;

  if (startDate) {
    startDate.setHours(0, 0, 0, 0);
  }

  if (endDate) {
    endDate.setHours(0, 0, 0, 0);
  }

  if (recruitEndDate) {
    recruitEndDate.setHours(0, 0, 0, 0);
  }

  if (normalizedStatus === SCHEDULE_STATUS.CANCELED) {
    return { label: "취소됨", className: styles.statusClosed };
  }

  if (normalizedStatus === SCHEDULE_STATUS.COMPLETED) {
    return { label: "진행중", className: styles.statusInProgress };
  }

  if (endDate instanceof Date && !Number.isNaN(endDate.getTime()) && endDate < today) {
    return { label: "종료", className: styles.statusClosed };
  }

  if (
    startDate instanceof Date &&
    !Number.isNaN(startDate.getTime()) &&
    startDate <= today &&
    (!(endDate instanceof Date) || Number.isNaN(endDate.getTime()) || endDate >= today)
  ) {
    return { label: "진행중", className: styles.statusInProgress };
  }

  if (
    normalizedStatus === SCHEDULE_STATUS.CLOSED ||
    (recruitEndDate instanceof Date &&
      !Number.isNaN(recruitEndDate.getTime()) &&
      recruitEndDate < today)
  ) {
    return { label: "모집종료", className: styles.statusClosed };
  }

  return { label: "모집중", className: styles.statusOpen };
};

/*
 * optimistic update는 "클릭 직후 손맛"을 만들지만,
 * 상세만 바꾸고 홈/탐색/위시리스트 캐시를 놓치면 화면마다 하트 상태가 어긋나는 문제가 생긴다.
 * 그래서 이 파일은 각 캐시 shape에 맞는 작은 updater를 분리해 같은 토글 결과를 여러 query에 일관되게 반영한다.
 */
const updateScheduleSummaryBookmarkState = (schedule, targetScheduleId, isBookmarked) => {
  if (!schedule || Number(schedule?.id) !== Number(targetScheduleId)) {
    return schedule;
  }

  return {
    ...schedule,
    isBookmarked,
  };
};

const updateScheduleCollectionBookmarkState = (
  schedules,
  targetScheduleId,
  isBookmarked,
) => {
  if (!Array.isArray(schedules)) {
    return schedules;
  }

  return schedules.map((schedule) =>
    updateScheduleSummaryBookmarkState(schedule, targetScheduleId, isBookmarked),
  );
};

const updateScheduleDetailBookmarkState = (detailData, isBookmarked) => {
  if (!detailData) {
    return detailData;
  }

  return {
    ...detailData,
    isBookmarked,
    schedule: detailData.schedule
      ? {
          ...detailData.schedule,
          isBookmarked,
        }
      : detailData.schedule,
  };
};

const buildWishlistScheduleFromDetail = (detailData) => {
  if (!detailData?.schedule) {
    return null;
  }

  return {
    ...detailData.schedule,
    isBookmarked: true,
  };
};

const updateBookmarkedSchedulesCache = (
  schedules,
  targetScheduleId,
  isBookmarked,
  detailData,
) => {
  if (!Array.isArray(schedules)) {
    return schedules;
  }

  if (!isBookmarked) {
    return schedules.filter(
      (schedule) => Number(schedule?.id) !== Number(targetScheduleId),
    );
  }

  const bookmarkedSchedule = buildWishlistScheduleFromDetail(detailData);
  const hasSchedule = schedules.some(
    (schedule) => Number(schedule?.id) === Number(targetScheduleId),
  );

  if (!hasSchedule) {
    return bookmarkedSchedule ? [bookmarkedSchedule, ...schedules] : schedules;
  }

  return schedules.map((schedule) =>
    updateScheduleSummaryBookmarkState(schedule, targetScheduleId, true),
  );
};

export default function ScheduleDetail() {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const { user: authUser, isLoggedIn } = useAuthStore();

  const [feedback, setFeedback] = useState(null);
  const [currentImg, setCurrentImg] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const chatLinkSectionRef = useRef(null);
  const [viewCountReadyScheduleId, setViewCountReadyScheduleId] =
    useState(null);
  const [open, setOpen] = useState(false);
  const [applicantStatus, setApplicantStatus] = useState("PENDING");
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

  /*
   * 참여 기능에서 email은 API 권한 확인과 사용자별 상태 조회의 기준으로 쓰인다.
   * authStore의 user가 아직 준비되지 않았을 수 있으므로 빈 문자열 fallback을 두고, query enabled 조건에서 안전하게 제어한다.
   */
  const authEmail = authUser?.email?.trim() ?? "";
  const parsedScheduleId = Number(scheduleId);
  const detailQueryKey = ["schedule-detail", parsedScheduleId, authEmail || "guest"];

  useEffect(() => {
    if (!Number.isFinite(parsedScheduleId) || parsedScheduleId <= 0) {
      return;
    }

    let isMounted = true;

    queryClient.removeQueries({
      queryKey: ["schedule-detail", parsedScheduleId],
      exact: true,
    });

    const viewedScheduleStorageKey = `${VIEWED_SCHEDULE_STORAGE_KEY_PREFIX}${parsedScheduleId}`;
    const hasViewedSchedule =
      typeof window !== "undefined" &&
      window.sessionStorage.getItem(viewedScheduleStorageKey) === "true";

    if (hasViewedSchedule) {
      queueMicrotask(() => {
        if (isMounted) {
          setViewCountReadyScheduleId(parsedScheduleId);
        }
      });

      return () => {
        isMounted = false;
      };
    }

    const increaseViewCount = async () => {
      try {
        await incrementScheduleViewCount(parsedScheduleId);

        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(viewedScheduleStorageKey, "true");
        }
      } catch (requestError) {
        if (import.meta.env.DEV) {
          console.debug(
            "[schedule-detail] view count increment failed",
            requestError,
          );
        }
      } finally {
        if (isMounted) {
          setViewCountReadyScheduleId(parsedScheduleId);
        }
      }
    };

    increaseViewCount();

    return () => {
      isMounted = false;
    };
  }, [parsedScheduleId, queryClient]);

  const {
    data,
    isPending: isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: detailQueryKey,
    queryFn: () => fetchScheduleDetail(parsedScheduleId, authEmail),
    /*
     * 상세 조회는 조회수 증가가 끝난 뒤 실행한다.
     * 같은 schedule-detail 응답 안에 viewerParticipationStatus와 viewerIsHost가 포함되므로,
     * 참여 버튼 라벨과 호스트 신청자 관리 영역도 이 query 결과를 기준으로 렌더링된다.
     */
    enabled:
      Number.isFinite(parsedScheduleId) &&
      parsedScheduleId > 0 &&
      viewCountReadyScheduleId === parsedScheduleId,
    staleTime: 0,
  });

  const postHostEmail = data?.email;
  const viewerIsHost = Boolean(data?.viewerIsHost);

  /*
   * 호스트 전용 신청자 목록 조회다.
   * viewerIsHost가 true일 때만 enabled가 열리므로, 일반 참여자는 신청자 개인정보 조회 API를 호출하지 않는다.
   * applicantStatus는 PENDING/APPROVED/REJECTED/CANCELED/KICKED 탭 필터 역할을 한다.
   */
  const {
    data: applicants = [],
    isPending: isApplicantsLoading,
    error: applicantsError,
  } = useScheduleApplicantsQuery({
    scheduleId: parsedScheduleId,
    email: authEmail,
    status: applicantStatus,
    enabled: viewerIsHost,
  });

  const { updateParticipationStatus, isPending: isStatusUpdating } =
    useUpdateParticipationStatusMutation();

  /*
   * 이 상세 페이지는 참여/실행/북마크 등 여러 액션이 같은 토스트 surface를 공유한다.
   * 공통 helper로 감싸 두면 동일 문구가 연속으로 와도 key가 바뀌어 Snackbar가 새 알림으로 다시 열린다.
   */
  const showFeedback = useCallback((severity, message) => {
    setFeedback({
      id: Date.now(),
      severity,
      message,
    });
  }, []);

  useEffect(() => {
    if (location.state?.focusSection !== "chat-link") {
      return;
    }

    chatLinkSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  /*
   * 일정 실행/실행 취소, 참여 상태 변경, 삭제 같은 여러 API가 서로 다른 에러 shape를 줄 수 있어서
   * 화면에서는 이 helper로 문자열을 한 번 정규화해 공통 Snackbar로 보낸다.
   * 이렇게 해두면 각 버튼 핸들러가 에러 파싱 코드를 중복해서 들고 있지 않아도 된다.
   */
  const resolveRequestErrorMessage = useCallback((requestError, fallbackMessage) => {
    const responseData = requestError?.response?.data;

    if (typeof responseData?.message === "string" && responseData.message.trim()) {
      return responseData.message;
    }

    if (typeof responseData === "string" && responseData.trim()) {
      return responseData;
    }

    if (typeof requestError?.message === "string" && requestError.message.trim()) {
      return requestError.message;
    }

    return fallbackMessage;
  }, []);

  const { mutateAsync: executeSchedule, isPending: isCompletingSchedule } = useMutation({
    mutationFn: completeSchedule,
    onSuccess: async () => {
      /*
       * 실행 상태 전환은 상세 화면 하나만 바뀌는 일이 아니다.
       * - 상세: 호스트 버튼, 상태 배지, 참여 버튼 제약이 바뀜
       * - 탐색/홈: 공개 리스트에서 상태 라벨이 바뀔 수 있음
       * - 내 일정/신청자 관리: 진행 상태 문구와 제약이 달라짐
       *
       * 그래서 schedule-detail만 invalidate하면 다른 화면이 오래된 상태로 남을 수 있어 관련 캐시를 함께 무효화한다.
       */
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["schedule-detail", parsedScheduleId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["schedules"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["home-schedules"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["participation"],
        }),
      ]);
    },
  });

  const { mutateAsync: rollbackScheduleExecution, isPending: isRollbackPending } =
    useMutation({
      mutationFn: rollbackCompletedSchedule,
      onSuccess: async () => {
        /*
         * 실행 취소도 실행과 같은 범위의 화면에 영향을 준다.
         * 특히 completed에서 recruiting/closed로 돌아가면 참여 버튼이 다시 열리거나 계속 막혀야 하므로
         * 상세/목록/내 일정 캐시를 한 번에 갱신한다.
         */
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["schedule-detail", parsedScheduleId],
          }),
          queryClient.invalidateQueries({
            queryKey: ["schedules"],
          }),
          queryClient.invalidateQueries({
            queryKey: ["home-schedules"],
          }),
          queryClient.invalidateQueries({
            queryKey: ["participation"],
          }),
        ]);
      },
    });

  /*
   * ApplyScheduleButton은 버튼 클릭과 신청 API 호출만 담당하고, 토스트 표시는 상세 페이지에서 공통으로 처리한다.
   * 이렇게 해야 신청 성공/실패와 호스트 승인/거절 피드백이 같은 Snackbar 위치와 스타일을 공유한다.
   */
  const handleApplyFeedback = useCallback(({ message, severity, id }) => {
    setFeedback({
      id: id ?? Date.now(),
      message,
      severity,
    });
  }, []);

  /*
   * 북마크 토글은 상세 화면 하나만 바꾸면 끝나지 않는다.
   * 홈 추천, 탐색 목록, 위시리스트 목록이 모두 같은 일정의 저장 상태를 보여주므로,
   * onMutate에서 이 캐시들을 함께 반전해야 사용자가 어느 화면으로 돌아가도 일관된 하트 상태를 본다.
   */
  const { mutateAsync: toggleBookmark, isPending: isBookmarkPending } = useMutation({
    mutationFn: async (nextIsBookmarked) => {
      if (nextIsBookmarked) {
        return createBookmark(parsedScheduleId);
      }

      return deleteBookmarkApi(parsedScheduleId);
    },
    onMutate: async (nextIsBookmarked) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: detailQueryKey }),
        queryClient.cancelQueries({ queryKey: ["home-schedules"] }),
        queryClient.cancelQueries({ queryKey: ["schedules"] }),
        queryClient.cancelQueries({ queryKey: ["bookmarks", authEmail] }),
      ]);

      const previousDetail = queryClient.getQueryData(detailQueryKey);
      const previousHomeQueries = queryClient.getQueriesData({
        queryKey: ["home-schedules"],
      });
      const previousScheduleQueries = queryClient.getQueriesData({
        queryKey: ["schedules"],
      });
      const previousBookmarks = queryClient.getQueryData(["bookmarks", authEmail]);
      const detailSnapshot = previousDetail ?? data;

      queryClient.setQueryData(detailQueryKey, (old) =>
        updateScheduleDetailBookmarkState(old ?? data, nextIsBookmarked),
      );

      previousHomeQueries.forEach(([queryKey]) => {
        queryClient.setQueryData(queryKey, (old) =>
          updateScheduleCollectionBookmarkState(
            old,
            parsedScheduleId,
            nextIsBookmarked,
          ),
        );
      });

      previousScheduleQueries.forEach(([queryKey]) => {
        queryClient.setQueryData(queryKey, (old) =>
          updateScheduleCollectionBookmarkState(
            old,
            parsedScheduleId,
            nextIsBookmarked,
          ),
        );
      });

      queryClient.setQueryData(["bookmarks", authEmail], (old) =>
        updateBookmarkedSchedulesCache(
          old,
          parsedScheduleId,
          nextIsBookmarked,
          detailSnapshot,
        ),
      );

      return {
        previousDetail,
        previousHomeQueries,
        previousScheduleQueries,
        previousBookmarks,
      };
    },
    onError: (requestError, nextIsBookmarked, context) => {
      /*
       * optimistic update는 빠른 대신 실패 시 복구 책임이 크다.
       * 그래서 onMutate에서 저장한 snapshot을 그대로 되돌려 각 화면이 서버 진실과 다시 맞도록 한다.
       */
      if (context?.previousDetail !== undefined) {
        queryClient.setQueryData(detailQueryKey, context.previousDetail);
      }

      context?.previousHomeQueries?.forEach(([queryKey, cachedData]) => {
        queryClient.setQueryData(queryKey, cachedData);
      });

      context?.previousScheduleQueries?.forEach(([queryKey, cachedData]) => {
        queryClient.setQueryData(queryKey, cachedData);
      });

      if (context?.previousBookmarks !== undefined) {
        queryClient.setQueryData(["bookmarks", authEmail], context.previousBookmarks);
      }

      showFeedback(
        "error",
        resolveRequestErrorMessage(
          requestError,
          "위시 상태 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.",
        ),
      );
    },
    onSuccess: async (response) => {
      const successMessage = response?.isBookmarked
        ? "위시리스트에 저장했어요"
        : "위시리스트에서 삭제했어요";
      showFeedback("success", successMessage);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: detailQueryKey }),
        queryClient.invalidateQueries({ queryKey: ["home-schedules"] }),
        queryClient.invalidateQueries({ queryKey: ["schedules"] }),
        queryClient.invalidateQueries({ queryKey: ["bookmarks", authEmail] }),
      ]);
    },
  });

  const handleDelete = async () => {
    try {
      await deleteSchedule(scheduleId);

      console.log("삭제 성공");

      handleClose();
      navigate("/");
    } catch (err) {
      console.error("삭제 실패", err);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCloseFeedback = useCallback((event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setFeedback(null);
  }, []);

  /*
   * 비로그인 사용자를 클릭 즉시 로그인 화면으로 보내면
   * "일정을 둘러보다가 하트를 눌렀더니 갑자기 화면이 바뀐다"는 단절감이 생긴다.
   * 그래서 toast로 막힌 이유를 먼저 설명하고, Dialog에서 실제 이동 의사를 한 번 더 묻는다.
   */
  const handleRequireLoginForBookmark = useCallback(() => {
    showFeedback("warning", "로그인 후 이용할 수 있습니다.");
    setIsLoginPromptOpen(true);
  }, [showFeedback]);

  const handleCloseLoginPrompt = useCallback(() => {
    setIsLoginPromptOpen(false);
  }, []);

  const handleMoveToLogin = useCallback(() => {
    setIsLoginPromptOpen(false);
    navigate("/login", {
      state: { redirectTo: location.pathname },
    });
  }, [location.pathname, navigate]);

  const handleToggleBookmark = useCallback(async () => {
    if (!isLoggedIn || !authEmail) {
      handleRequireLoginForBookmark();
      return;
    }

    const currentIsBookmarked = Boolean(
      data?.isBookmarked ?? data?.schedule?.isBookmarked,
    );

    await toggleBookmark(!currentIsBookmarked);
  }, [
    authEmail,
    data?.isBookmarked,
    data?.schedule?.isBookmarked,
    handleRequireLoginForBookmark,
    isLoggedIn,
    toggleBookmark,
  ]);

  const addToGoogleCalendar = () => {
    const schedule = data?.schedule;

    if (!schedule) {
      return;
    }

    const start = new Date(schedule.startDate)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(".000", "");

    const end = new Date(schedule.endDate)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(".000", "");

    const url =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" +
      encodeURIComponent(schedule.title || "") +
      "&dates=" +
      encodeURIComponent(`${start}/${end}`) +
      "&details=" +
      encodeURIComponent(schedule.description || "") +
      "&location=" +
      encodeURIComponent(
        `${schedule.region || ""} ${schedule.detailRegion || ""}`,
      );

    window.open(url, "_blank");
  };

  /*
   * 호스트가 신청자 카드의 승인/거절/강퇴 버튼을 눌렀을 때 실행된다.
   * 프론트는 먼저 로그인 사용자 email을 확인하고, 사용자 확인창을 거친 뒤 PATCH /participations/{id}/status를 호출한다.
   * 실제 권한 검증, 상태 전이 가능 여부, 정원 증감은 백엔드 Service에서 최종 판단한다.
   */
  const handleApplicantAction = useCallback(
    async ({ participationId, status, reason }) => {
      if (!isLoggedIn || !authEmail) {
        navigate("/login", { replace: true });
        return;
      }

      const confirmText =
        status === "APPROVED"
          ? "이 신청을 승인하시겠습니까?"
          : status === "REJECTED"
            ? "이 신청을 거절하시겠습니까?"
            : "이 참여자를 강퇴하시겠습니까?";

      if (!window.confirm(confirmText)) {
        return;
      }

      try {
        /*
         * updateParticipationStatus mutation은 성공 시 신청자 목록, 내 일정 목록, 상세 화면 캐시를 무효화한다.
         * 승인 성공 후 currentParticipants나 일정 마감 상태가 바뀔 수 있기 때문에 상세 데이터도 다시 읽어야 한다.
         */
        await updateParticipationStatus({
          participationId,
          email: authEmail,
          status,
          reason,
        });

        showFeedback(
          "success",
          status === "APPROVED"
            ? "신청을 승인했습니다."
            : status === "REJECTED"
              ? "신청을 거절했습니다."
              : "참여자를 강퇴했습니다.",
        );
      } catch (requestError) {
        showFeedback(
          "error",
          resolveRequestErrorMessage(requestError, "상태 변경에 실패했습니다."),
        );
      }
    },
    [authEmail, isLoggedIn, navigate, resolveRequestErrorMessage, showFeedback, updateParticipationStatus],
  );

  const handleExecuteSchedule = useCallback(async () => {
    if (!isLoggedIn || !authEmail) {
      navigate("/login", { replace: true });
      return;
    }

    /*
     * 실행은 되돌릴 수는 있지만 영향이 큰 상태 변경이므로 확인창을 둔다.
     * 사용자는 이 버튼 한 번으로 이후 참여 취소, 승인/거절, 수정/삭제가 잠긴다는 사실을 인지해야 한다.
     */
    if (!window.confirm("이 일정을 실행 상태로 변경하시겠습니까?")) {
      return;
    }

    try {
      await executeSchedule({
        scheduleId: parsedScheduleId,
        email: authEmail,
      });

      /*
       * 성공 후에는 mutation onSuccess에서 캐시가 무효화되고,
       * 상세 재조회가 끝나면 배지/버튼/신청자 관리 영역이 새 상태에 맞게 다시 렌더링된다.
       */
      showFeedback("success", "일정이 실행 상태로 변경되었습니다.");
    } catch (requestError) {
      showFeedback(
        "error",
        resolveRequestErrorMessage(requestError, "일정 실행 처리에 실패했습니다."),
      );
    }
  }, [
    authEmail,
    executeSchedule,
    isLoggedIn,
    navigate,
    parsedScheduleId,
    resolveRequestErrorMessage,
    showFeedback,
  ]);

  const handleRollbackScheduleExecution = useCallback(async () => {
    if (!isLoggedIn || !authEmail) {
      navigate("/login", { replace: true });
      return;
    }

    if (!window.confirm("실행 상태를 취소하시겠습니까?")) {
      return;
    }

    try {
      await rollbackScheduleExecution({
        scheduleId: parsedScheduleId,
        email: authEmail,
      });

      showFeedback("success", "일정 실행이 취소되었습니다.");
    } catch (requestError) {
      showFeedback(
        "error",
        resolveRequestErrorMessage(requestError, "일정 실행 취소에 실패했습니다."),
      );
    }
  }, [
    authEmail,
    isLoggedIn,
    navigate,
    parsedScheduleId,
    resolveRequestErrorMessage,
    rollbackScheduleExecution,
    showFeedback,
  ]);

  const isApplicantsForbidden = applicantsError?.response?.status === 403;

  const applicantsErrorMessage =
    applicantsError && !isApplicantsForbidden
      ? (applicantsError?.response?.data?.message ??
        applicantsError?.response?.data ??
        "신청자 목록을 불러오지 못했습니다.")
      : "";

  if (!Number.isFinite(parsedScheduleId) || parsedScheduleId <= 0) {
    return (
      <div className={styles.container}>유효하지 않은 일정 경로입니다.</div>
    );
  }

  if (isLoading) {
    return <div className={styles.container}>로딩 중...</div>;
  }

  if (isError) {
    const errorMessage =
      error?.response?.data?.message ??
      error?.response?.data ??
      "데이터를 불러오는 데 실패했습니다.";

    return <div className={styles.container}>{errorMessage}</div>;
  }

  if (!data?.schedule) {
    return <div className={styles.container}>일정 정보가 없습니다.</div>;
  }

  const schedule = data.schedule;
  const viewerParticipationStatus = data.viewerParticipationStatus ?? "";
  const viewerCanAccessChatLink = Boolean(data.viewerCanAccessChatLink);
  const details = Array.isArray(data.details) ? data.details : [];
  const rawImages = Array.isArray(data.images) ? data.images : [];
  const locationText = formatLocation(schedule);

  const categoryLabel =
    CATEGORY_LABELS[schedule.category] ?? schedule.category ?? "기타";
  const schedulePhase = resolveSchedulePhase(schedule);
  const normalizedScheduleStatus = schedule?.status?.trim()?.toLowerCase() ?? "";
  const isScheduleCompleted = normalizedScheduleStatus === SCHEDULE_STATUS.COMPLETED;
  /*
   * 실행 버튼 활성 조건은 프론트에서도 먼저 계산한다.
   * 다만 이것은 UX 보조 장치일 뿐이고, 실제 최소 인원 충족 여부는 백엔드 completeSchedule이 최종 검증한다.
   */
  const canExecuteSchedule =
    Number(schedule.currentParticipants ?? 0) >= Number(schedule.minParticipants ?? 0);
  const isScheduleActionPending = isCompletingSchedule || isRollbackPending;
  const isBookmarked = Boolean(data?.isBookmarked ?? schedule?.isBookmarked);
  const BookmarkIcon = isBookmarked
    ? FavoriteRoundedIcon
    : FavoriteBorderRoundedIcon;

  const imageUrls =
    rawImages.length > 0
      ? [...rawImages]
          .sort((a, b) => (b?.isThumbnail ?? 0) - (a?.isThumbnail ?? 0))
          .map((image) => image?.imageUrl)
          .filter(Boolean)
      : schedule.thumbnailImage
        ? [schedule.thumbnailImage]
        : [DEFAULT_IMAGE];

  const safeCurrentImg =
    currentImg >= imageUrls.length ? 0 : Math.max(currentImg, 0);

  const lightboxSlides = imageUrls.map((url) => ({ src: url }));

  const nextSlide = () => {
    setCurrentImg((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentImg((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  const isEditable = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const end = new Date(schedule.recruitEndDate);
    end.setHours(0, 0, 0, 0);

    /*
     * 수정 버튼은 모집 마감일이 지나면 숨기고,
     * 추가로 completed 상태에서도 무조건 숨긴다.
     * 이렇게 프론트에서 먼저 감추더라도 서버는 updateSchedule에서 다시 차단한다.
     */
    return !isScheduleCompleted && end >= today;
  })();

  console.log("schedule detail render", {
    schedule,
    details,
    imageUrls,
  });

  return (
    <div className={styles.container}>
      <section className={styles.imageSection}>
        <div className={styles.slider}>
          <img
            src={imageUrls[safeCurrentImg]}
            alt="일정 이미지"
            className={styles.mainImage}
            onClick={() => setIsViewerOpen(true)}
            style={{ cursor: "pointer" }}
          />

          {imageUrls.length > 1 && (
            <>
              <button
                type="button"
                className={styles.prevBtn}
                onClick={prevSlide}
              >
                <ChevronLeftIcon />
              </button>

              <button
                type="button"
                className={styles.nextBtn}
                onClick={nextSlide}
              >
                <ChevronRightIcon />
              </button>

              <div className={styles.indicator}>
                {safeCurrentImg + 1} / {imageUrls.length}
              </div>
            </>
          )}
        </div>
      </section>

      <div className={styles.contentWrapper}>
        <section className={styles.headerSection}>
          <div className={styles.badgeWrapper}>
            <span className={styles.categoryBadge}>{categoryLabel}</span>

            <span
              className={schedulePhase.className}
            >
              {schedulePhase.label}
            </span>
          </div>

          <div className={styles.titleWrap}>
            <h1 className={styles.title}>{schedule.title ?? "제목 없음"}</h1>

            <div className={styles.buttonWrap}>
              {/*
               * 북마크 토글은 참여 CTA와 성격이 다르다.
               * 사용자는 상세 상단에서 "이 일정이 저장된 상태인지"를 먼저 인지하고 바로 토글할 수 있어야 하므로
               * sticky footer가 아니라 제목 우측 액션 묶음에 둔다.
               */}
              <Button
                variant={isBookmarked ? "accent" : "outline"}
                onClick={handleToggleBookmark}
                disabled={isBookmarkPending}
                className={styles.bookmarkButton}
              >
                <BookmarkIcon fontSize="small" />
                {isBookmarked ? "위시 삭제" : "위시 추가"}
              </Button>

              {postHostEmail === authEmail ? (
                <>
                {/*
                 * 실행 관리 버튼은 호스트에게만 보인다.
                 * 일반 참여자에게 이 버튼이 보이면 권한이 없는 액션을 기대하게 되므로
                 * 화면 단계에서 먼저 숨기고, 서버는 complete/rollback API에서 다시 권한을 검증한다.
                 *
                 * 버튼 동작:
                 * - status !== completed: 일정 실행
                 * - status === completed: 실행 취소
                 */}
                <Button
                  variant={isScheduleCompleted ? "outline" : "accent"}
                  disabled={
                    isScheduleActionPending ||
                    (!isScheduleCompleted && !canExecuteSchedule)
                  }
                  onClick={
                    isScheduleCompleted
                      ? handleRollbackScheduleExecution
                      : handleExecuteSchedule
                  }
                >
                  {isScheduleCompleted ? "실행 취소" : "일정 실행"}
                </Button>

                {isEditable ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigate(`/update/${scheduleId}`);
                    }}
                  >
                    수정
                    <EditIcon fontSize="small" />
                  </Button>
                ) : null}

                <Button
                  variant="outline"
                  onClick={handleOpen}
                  disabled={isScheduleCompleted}
                >
                  삭제
                  <DeleteIcon fontSize="small" />
                </Button>
                </>
              ) : null}
            </div>
          </div>

          <Dialog
            open={open}
            onClose={handleClose}
            slotProps={{
              paper: {
                sx: {
                  borderRadius: 3,
                  p: 2,
                  minWidth: 320,
                },
              },
            }}
          >
            <DialogTitle sx={{ pb: 3 }}>일정 삭제</DialogTitle>

            <DialogContent sx={{ px: 10, py: 2 }}>
              <DialogContentText sx={{ fontSize: "15px", color: "#555" }}>
                삭제 후에는 복구할 수 없습니다.
              </DialogContentText>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
              <Button onClick={handleDelete}>삭제하기</Button>

              <Button onClick={handleClose} variant="outline">
                취소
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={isLoginPromptOpen}
            onClose={handleCloseLoginPrompt}
            slotProps={{
              paper: {
                sx: {
                  borderRadius: 3,
                  p: 2,
                  minWidth: 320,
                },
              },
            }}
          >
            <DialogTitle sx={{ pb: 2 }}>로그인이 필요합니다</DialogTitle>

            <DialogContent sx={{ px: 4, py: 2 }}>
              <DialogContentText sx={{ fontSize: "15px", color: "#555", lineHeight: 1.7 }}>
                위시리스트 기능은 로그인 후 이용할 수 있습니다. 로그인 페이지로 이동하시겠습니까?
              </DialogContentText>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
              <Button onClick={handleMoveToLogin} variant="accent">
                로그인하기
              </Button>

              <Button onClick={handleCloseLoginPrompt} variant="outline">
                취소
              </Button>
            </DialogActions>
          </Dialog>

          {viewerIsHost && !isScheduleCompleted && !canExecuteSchedule ? (
            /*
             * 최소 인원 미달은 단순 disabled만으로는 이유가 잘 전달되지 않으므로
             * 바로 아래에 정책 문구를 같이 노출한다.
             */
            <p className={styles.executionNotice}>
              최소 {schedule.minParticipants ?? 0}명이 모여야 일정 실행이 가능합니다.
            </p>
          ) : null}

          {viewerIsHost && isScheduleCompleted ? (
            /*
             * completed 상태의 핵심 제약을 호스트에게 명시적으로 보여준다.
             * 이 문구가 있어야 "왜 수정/삭제/승인 버튼이 안 되지?"를 빠르게 이해할 수 있다.
             */
            <p className={styles.executionNotice}>
              진행 중인 일정입니다. 참여 상태 변경, 일정 수정, 삭제는 잠겨 있습니다.
            </p>
          ) : null}

          <div className={styles.metaInfo}>
            <span>
              <VisibilityIcon fontSize="small" /> {schedule.viewCount ?? 0}
            </span>

            <span>
              <PlaceIcon fontSize="small" /> {locationText}
            </span>
          </div>
        </section>

        <hr className={styles.divider} />

        <section className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <CalendarTodayIcon className={styles.icon} />

            <div>
              <p className={styles.label}>일정 기간</p>

              <p className={styles.value}>
                {schedule.startDate || "미정"} ~ {schedule.endDate || "미정"}
                {" | "}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addToGoogleCalendar}
                >
                  구글 캘린더에 추가
                </Button>
              </p>
            </div>
          </div>

          <div className={styles.infoItem}>
            <PeopleIcon className={styles.icon} />

            <div>
              <p className={styles.label}>모집 인원 / 조건</p>

              <p className={styles.value}>
                {schedule.currentParticipants ?? 0} /{" "}
                {schedule.maxParticipants ?? 0}명 &#40;최소{" "}
                {schedule.minParticipants ?? 0}명&#41;
              </p>

              <p className={styles.subValue}>
                {schedule.genderLimit === "all"
                  ? "성별 무관"
                  : schedule.genderLimit || "성별 미정"}{" "}
                | {schedule.ageMin ?? "-"}세 ~ {schedule.ageMax ?? "-"}세
              </p>
            </div>
          </div>

          <div className={styles.infoItem}>
            <PaymentsIcon className={styles.icon} />

            <div>
              <p className={styles.label}>예상 비용</p>

              <p className={styles.value}>
                총 {(schedule.totalPrice ?? 0).toLocaleString()}원
              </p>

              <p className={styles.subValue}>
                정산 방식:{" "}
                {COST_TYPE_LABELS[schedule.costType] ||
                  schedule.costType ||
                  "-"}
              </p>
            </div>
          </div>
        </section>

        <hr className={styles.divider} />

        <section
          ref={chatLinkSectionRef}
          className={styles.chatLinkSection}
          id="chat-link-section"
        >
          <h2 className={styles.subTitle}>오픈채팅방</h2>
          {viewerCanAccessChatLink && schedule.chatLink ? (
            <a
              href={schedule.chatLink}
              target="_blank"
              rel="noreferrer"
              className={styles.chatLink}
            >
              오픈채팅방 바로가기
            </a>
          ) : (
            <p className={styles.chatLinkNotice}>
              {viewerIsHost || viewerParticipationStatus === "APPROVED"
                ? "등록된 오픈채팅방 링크가 없습니다."
                : "오픈채팅방 링크는 참여 승인 후 확인할 수 있습니다."}
            </p>
          )}
        </section>

        <hr className={styles.divider} />

        <section className={styles.descriptionSection}>
          <h2 className={styles.subTitle}>상세 설명</h2>

          <p
            className={styles.descriptionText}
            style={{ whiteSpace: "pre-wrap" }}
          >
            {schedule.description || "상세 설명이 없습니다."}
          </p>
        </section>

        {details.length > 0 && (
          <>
            <hr className={styles.divider} />

            <section className={styles.descriptionSection}>
              <h2 className={styles.subTitle}>세부 일정 &#40;Day-by-Day&#41;</h2>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  marginTop: "1rem",
                }}
              >
                {details.map((detail) => (
                  <div
                    key={detail.id}
                    style={{
                      padding: "1rem",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 0.5rem 0",
                        color: "#1976d2",
                        fontSize: "1.1rem",
                      }}
                    >
                      Day {detail.dayNumber}
                    </h3>

                    <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem" }}>
                      {detail.title || "제목 없음"}
                    </h4>

                    <p
                      style={{
                        margin: 0,
                        color: "#555",
                        fontSize: "0.95rem",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {detail.description || "설명이 없습니다."}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {isLoggedIn && authEmail && viewerIsHost && !isApplicantsForbidden && (
        <>
          {/*
           * 신청자 관리 영역은 호스트에게만 노출한다.
           * 일반 사용자는 viewerIsHost가 false라서 목록 API와 UI가 모두 열리지 않는다.
           */}
          <HostParticipationList
            items={applicants}
            loading={isApplicantsLoading}
            errorMessage={applicantsErrorMessage}
            emptyMessage={`${HOST_STATUS_LABELS[applicantStatus] ?? "선택한 상태"} 신청자가 없습니다.`}
            hostEmail={authEmail}
            onItemAction={handleApplicantAction}
            activeStatus={applicantStatus}
            onStatusChange={setApplicantStatus}
            isActionLoading={isStatusUpdating || isScheduleCompleted}
            isReadOnly={isScheduleCompleted}
          />
        </>
      )}

      <footer className={styles.stickyFooter}>
        <div className={styles.footerInfo}>
          <span className={styles.recruitDeadline}>
            마감일: {schedule.recruitEndDate || "미정"}
          </span>
        </div>

        {/*
         * 신청 버튼은 schedule.status와 recruitEndDate로 마감 여부를 먼저 판단하고,
         * viewerParticipationStatus로 현재 사용자가 신청중/참여중/취소됨 중 어디에 있는지 확인한다.
         * 내 일정의 신청중/참여중 탭 모두 실제 액션은 이 상세 하단 버튼에서 수행한다.
         * completed 상태일 때는 "일정 진행 중"으로 고정되어 신청/취소가 모두 막힌다.
         * 최종 신청 가능 여부는 백엔드가 다시 검증하므로 프론트 판단은 UX 보조 역할이다.
         */}
        <ApplyScheduleButton
          scheduleId={schedule.id}
          status={schedule.status}
          recruitEndDate={schedule.recruitEndDate}
          genderLimit={schedule.genderLimit}
          ageMin={schedule.ageMin}
          ageMax={schedule.ageMax}
          viewerParticipationId={data.viewerParticipationId}
          viewerParticipationStatus={viewerParticipationStatus}
          isHost={viewerIsHost}
          onFeedback={handleApplyFeedback}
        />
      </footer>

      <ParticipationFeedback
        feedback={feedback}
        onClose={handleCloseFeedback}
      />

      <Lightbox
        open={isViewerOpen}
        close={() => setIsViewerOpen(false)}
        slides={lightboxSlides}
        index={safeCurrentImg}
        plugins={[Zoom]}
      />
    </div>
  );
}

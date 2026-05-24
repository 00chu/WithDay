import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PlaceIcon from "@mui/icons-material/Place";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PeopleIcon from "@mui/icons-material/People";
import PaymentsIcon from "@mui/icons-material/Payments";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

import {
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
  CANCELLED: "참여 취소",
};

const formatLocation = (schedule) => {
  const region = schedule?.region?.trim() ?? "";
  const detailRegion = schedule?.detailRegion?.trim() ?? "";

  if (region && detailRegion) {
    return `${region} ${detailRegion}`;
  }

  return region || detailRegion || "장소 미정";
};

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

  if (normalizedStatus === "cancelled") {
    return { label: "취소됨", className: styles.statusClosed };
  }

  if (
    normalizedStatus === "completed" ||
    (endDate instanceof Date && !Number.isNaN(endDate.getTime()) && endDate < today)
  ) {
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
    normalizedStatus === "closed" ||
    (recruitEndDate instanceof Date &&
      !Number.isNaN(recruitEndDate.getTime()) &&
      recruitEndDate < today)
  ) {
    return { label: "모집종료", className: styles.statusClosed };
  }

  return { label: "모집중", className: styles.statusOpen };
};

export default function ScheduleDetail() {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { user: authUser, isLoggedIn } = useAuthStore();

  const [feedback, setFeedback] = useState(null);
  const [currentImg, setCurrentImg] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewCountReadyScheduleId, setViewCountReadyScheduleId] =
    useState(null);
  const [open, setOpen] = useState(false);
  const [applicantStatus, setApplicantStatus] = useState("PENDING");

  /*
   * 참여 기능에서 email은 API 권한 확인과 사용자별 상태 조회의 기준으로 쓰인다.
   * authStore의 user가 아직 준비되지 않았을 수 있으므로 빈 문자열 fallback을 두고, query enabled 조건에서 안전하게 제어한다.
   */
  const authEmail = authUser?.email?.trim() ?? "";
  const parsedScheduleId = Number(scheduleId);

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
    queryKey: ["schedule-detail", parsedScheduleId, authEmail || "guest"],
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
   * applicantStatus는 PENDING/APPROVED/REJECTED 탭 필터 역할을 한다.
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
   * 호스트가 신청자 카드의 승인/거절/승인취소 버튼을 눌렀을 때 실행된다.
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
            : "승인을 취소하시겠습니까?";

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

        setFeedback({
          severity: "success",
          message:
            status === "APPROVED"
              ? "신청을 승인했습니다."
              : status === "REJECTED"
                ? "신청을 거절했습니다."
                : "승인을 취소했습니다.",
        });
      } catch (requestError) {
        const message =
          requestError?.response?.data?.message ??
          requestError?.response?.data ??
          requestError?.message ??
          "상태 변경에 실패했습니다.";

        setFeedback({
          severity: "error",
          message:
            typeof message === "string" ? message : "상태 변경에 실패했습니다.",
        });
      }
    },
    [authEmail, isLoggedIn, navigate, updateParticipationStatus],
  );

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

    return end >= today;
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

            {postHostEmail === authEmail ? (
              <div className={styles.buttonWrap}>
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

                <Button variant="outline" onClick={handleOpen}>
                  삭제
                  <DeleteIcon fontSize="small" />
                </Button>

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
              </div>
            ) : null}
          </div>

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

        <section className={styles.chatLinkSection}>
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
            isActionLoading={isStatusUpdating}
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
         * viewerParticipationStatus로 이미 신청한 사용자인지 확인한다.
         * 최종 신청 가능 여부는 백엔드가 다시 검증하므로 프론트 판단은 UX 보조 역할이다.
         */}
        <ApplyScheduleButton
          scheduleId={schedule.id}
          status={schedule.status}
          recruitEndDate={schedule.recruitEndDate}
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

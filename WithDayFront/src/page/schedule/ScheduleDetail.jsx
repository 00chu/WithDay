import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PlaceIcon from "@mui/icons-material/Place";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PeopleIcon from "@mui/icons-material/People";
import PaymentsIcon from "@mui/icons-material/Payments";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import { fetchScheduleDetail } from "../../features/schedule/api";
import { getAuthUser } from "../../features/auth/lib/getAuthUser";
import { useScheduleApplicantsQuery } from "../../features/participation/model/queries";
import { useUpdateParticipationStatusMutation } from "../../features/participation/model/mutations";
import ParticipationFeedback from "../../features/participation/ui/ParticipationFeedback/ParticipationFeedback";
import HostParticipationList from "../../features/participation/ui/HostParticipationList/HostParticipationList";
import ApplyScheduleButton from "../../features/schedule/ui/ApplyScheduleButton";
import styles from "./ScheduleDetail.module.css";

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

const formatLocation = (schedule) => {
  const region = schedule?.region?.trim() ?? "";
  const detailRegion = schedule?.detailRegion?.trim() ?? "";

  if (region && detailRegion) {
    return `${region} ${detailRegion}`;
  }

  return region || detailRegion || "장소 미정";
};

export default function ScheduleDetail() {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);
  const [currentImg, setCurrentImg] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const authUser = useMemo(() => getAuthUser(), []);
  const authEmail = authUser?.email?.trim() ?? "";
  const parsedScheduleId = Number(scheduleId);

  const {
    data,
    isPending: isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["schedule-detail", parsedScheduleId],
    queryFn: () => fetchScheduleDetail(parsedScheduleId),
    enabled: Number.isFinite(parsedScheduleId) && parsedScheduleId > 0,
    staleTime: 1000 * 30,
  });

  const {
    data: applicants = [],
    isPending: isApplicantsLoading,
    error: applicantsError,
  } = useScheduleApplicantsQuery({
    scheduleId: parsedScheduleId,
    email: authEmail,
    status: "PENDING",
  });

  const { updateParticipationStatus, isPending: isStatusUpdating } =
    useUpdateParticipationStatusMutation();

  const handleCloseFeedback = useCallback((event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setFeedback(null);
  }, []);

  const handleApplicantAction = useCallback(
    async ({ participationId, status, reason }) => {
      if (!authEmail) {
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
    [authEmail, navigate, updateParticipationStatus]
  );

  const isApplicantsForbidden = applicantsError?.response?.status === 403;
  const applicantsErrorMessage =
    applicantsError && !isApplicantsForbidden
      ? applicantsError?.response?.data?.message ??
        applicantsError?.response?.data ??
        "신청자 목록을 불러오지 못했습니다."
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
  const details = Array.isArray(data.details) ? data.details : [];
  const rawImages = Array.isArray(data.images) ? data.images : [];
  const locationText = formatLocation(schedule);
  const categoryLabel =
    CATEGORY_LABELS[schedule.category] ?? schedule.category ?? "기타";

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

  const nextSlide = () =>
    setCurrentImg((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  const prevSlide = () =>
    setCurrentImg((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));

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
              className={
                schedule.status === "recruiting"
                  ? styles.statusOpen
                  : styles.statusClosed
              }
            >
              {schedule.status === "recruiting" ? "모집중" : "모집종료"}
            </span>
          </div>

          <h1 className={styles.title}>{schedule.title ?? "제목 없음"}</h1>

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
              </p>
            </div>
          </div>

          <div className={styles.infoItem}>
            <PeopleIcon className={styles.icon} />
            <div>
              <p className={styles.label}>모집 인원 / 조건</p>
              <p className={styles.value}>
                {schedule.currentParticipants ?? 0} / {schedule.maxParticipants ?? 0}
                명 (최소 {schedule.minParticipants ?? 0}명)
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
                {COST_TYPE_LABELS[schedule.costType] || schedule.costType || "-"}
              </p>
            </div>
          </div>
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
              <h2 className={styles.subTitle}>세부 일정 (Day-by-Day)</h2>
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

      {authEmail && !isApplicantsForbidden && (
        <HostParticipationList
          items={applicants}
          loading={isApplicantsLoading}
          errorMessage={applicantsErrorMessage}
          emptyMessage="승인 대기중인 신청자가 없습니다."
          hostEmail={authEmail}
          onItemAction={handleApplicantAction}
          isActionLoading={isStatusUpdating}
        />
      )}

      <footer className={styles.stickyFooter}>
        <div className={styles.footerInfo}>
          <span className={styles.recruitDeadline}>
            마감일: {schedule.recruitEndDate || "미정"}
          </span>
        </div>

        <ApplyScheduleButton
          scheduleId={schedule.id}
          status={schedule.status}
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

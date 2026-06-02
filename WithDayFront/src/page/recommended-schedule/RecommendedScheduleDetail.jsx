import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

import {
  deleteRecommendedSchedule,
  getRecommendedScheduleDetail,
} from "../../features/recommended/api";
import { useAuthStore } from "../../features/auth/store/authStore";
import Button from "../../shared/ui/Button/Button";
import styles from "./RecommendedScheduleDetail.module.css";

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

const COST_TYPE_SUB_LABELS = {
  per_person: "참여 인원 기준으로 나누어 지불",
  host_covered: "호스트가 비용을 부담하는 방식",
  free: "별도 비용 없이 참여 가능",
  custom: "상세 설명의 비용 기준 참고",
};

const GENDER_LABELS = {
  all: "성별 무관",
  male: "남성",
  female: "여성",
};

const DEFAULT_IMAGE = "/hero.png";

const formatLocation = (schedule) => {
  const region = schedule?.region?.trim() ?? "";
  const detailRegion = schedule?.detailRegion?.trim() ?? "";

  if (region && detailRegion) {
    return `${region} · ${detailRegion}`;
  }

  return region || detailRegion || "장소 미정";
};

const formatPrice = (price) => {
  const safePrice = Number(price ?? 0);

  return safePrice.toLocaleString();
};

const formatAgeRange = (schedule) => {
  const ageMin = schedule?.ageMin;
  const ageMax = schedule?.ageMax;

  if (ageMin && ageMax) {
    return `만 ${ageMin}세 ~ ${ageMax}세`;
  }

  if (ageMin) {
    return `만 ${ageMin}세 이상`;
  }

  if (ageMax) {
    return `만 ${ageMax}세 이하`;
  }

  return "연령 제한 없음";
};

const getDetailCountText = (details) => {
  if (!Array.isArray(details) || details.length === 0) {
    return "상세 일정 없음";
  }

  return `${details.length}개 세부 일정`;
};

export default function RecommendedScheduleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.status === "admin";

  const parsedRecommendedId = Number(id);

  const [currentImg, setCurrentImg] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const {
    data,
    isPending: isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["recommended-schedule-detail", parsedRecommendedId],
    queryFn: () => getRecommendedScheduleDetail(parsedRecommendedId),
    enabled: Number.isFinite(parsedRecommendedId) && parsedRecommendedId > 0,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRecommendedSchedule,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["recommended-schedules"],
      });

      navigate("/recommended-schedules", { replace: true });
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ??
        error?.response?.data ??
        "추천 일정 삭제 중 오류가 발생했습니다.";

      alert(errorMessage);
    },
  });

  const schedule = data?.recommendedSchedule;

  const details = Array.isArray(data?.detailSchedule)
    ? data.detailSchedule
    : [];

  const rawImages = Array.isArray(data?.images) ? data.images : [];

  const imageUrls = useMemo(() => {
    if (rawImages.length > 0) {
      return [...rawImages]
        .sort(
          (a, b) => Number(b?.isThumbnail ?? 0) - Number(a?.isThumbnail ?? 0),
        )
        .map((image) => image?.imageUrl)
        .filter(Boolean);
    }

    if (schedule?.thumbnailImage) {
      return [schedule.thumbnailImage];
    }

    return [DEFAULT_IMAGE];
  }, [rawImages, schedule?.thumbnailImage]);

  const safeCurrentImg =
    currentImg >= imageUrls.length ? 0 : Math.max(currentImg, 0);

  const visibleThumbs = imageUrls.slice(0, 6);

  const lightboxSlides = imageUrls.map((url) => ({ src: url }));

  const nextSlide = () => {
    setCurrentImg((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentImg((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  const handleOpenLightbox = (index = safeCurrentImg) => {
    setCurrentImg(index);
    setIsViewerOpen(true);
  };

  const handleUseRecommendedSchedule = () => {
    navigate("/write", {
      state: {
        recommendedSchedule: data,
      },
    });
  };

  const handleEditRecommendedSchedule = () => {
    navigate(`/recommended-schedules/edit/${parsedRecommendedId}`);
  };

  const handleDeleteRecommendedSchedule = () => {
    const isConfirmed = window.confirm(
      "추천 일정을 삭제하시겠습니까?\n삭제한 추천 일정은 복구할 수 없습니다.",
    );

    if (!isConfirmed) {
      return;
    }

    deleteMutation.mutate(parsedRecommendedId);
  };

  if (!Number.isFinite(parsedRecommendedId) || parsedRecommendedId <= 0) {
    return (
      <div className={styles.statePage}>
        <p>유효하지 않은 추천 일정 경로입니다.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.statePage}>
        <p>추천 일정을 불러오는 중입니다.</p>
      </div>
    );
  }

  if (isError) {
    const errorMessage =
      error?.response?.data?.message ??
      error?.response?.data ??
      "추천 일정 정보를 불러오는 데 실패했습니다.";

    return (
      <div className={styles.statePage}>
        <p>{errorMessage}</p>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className={styles.statePage}>
        <p>추천 일정 정보가 없습니다.</p>
      </div>
    );
  }

  const categoryLabel =
    CATEGORY_LABELS[schedule.category] ?? schedule.category ?? "기타";

  const costTypeLabel =
    COST_TYPE_LABELS[schedule.costType] ?? schedule.costType ?? "-";

  const costTypeSubLabel =
    COST_TYPE_SUB_LABELS[schedule.costType] ??
    "정산 방식은 글쓰기에서 조정 가능";

  const genderLabel =
    GENDER_LABELS[schedule.genderLimit] ?? schedule.genderLimit ?? "성별 무관";

  const locationText = formatLocation(schedule);

  const durationDays = Number(schedule.durationDays ?? 1);
  const safeDurationDays =
    Number.isFinite(durationDays) && durationDays > 0 ? durationDays : 1;

  const priceText = `${formatPrice(schedule.totalPrice)}원`;

  return (
    <div className={styles.pageShell}>
      <main className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="breadcrumb">
          <span>홈</span>
          <span>›</span>
          <span>추천 일정</span>
          <span>›</span>
          <span>상세</span>
        </nav>

        <div className={styles.layout}>
          <section className={styles.mainColumn}>
            <article className={styles.heroCard}>
              <div className={styles.heroImageWrap}>
                <img
                  src={imageUrls[safeCurrentImg]}
                  alt="추천 일정 이미지"
                  className={styles.heroImage}
                  onClick={() => handleOpenLightbox(safeCurrentImg)}
                />

                <div className={styles.heroBadges}>
                  <span className={`${styles.badge} ${styles.badgeCategory}`}>
                    {categoryLabel}
                  </span>

                  <span
                    className={`${styles.badge} ${styles.badgeRecommended}`}
                  >
                    <AutoAwesomeRoundedIcon fontSize="inherit" />
                    추천 일정
                  </span>

                  <span className={`${styles.badge} ${styles.badgeDday}`}>
                    {safeDurationDays}일 코스
                  </span>
                </div>

                {imageUrls.length > 1 && (
                  <>
                    <button
                      type="button"
                      className={`${styles.imageNav} ${styles.prev}`}
                      aria-label="이전 이미지"
                      onClick={prevSlide}
                    >
                      <ChevronLeftIcon />
                    </button>

                    <button
                      type="button"
                      className={`${styles.imageNav} ${styles.next}`}
                      aria-label="다음 이미지"
                      onClick={nextSlide}
                    >
                      <ChevronRightIcon />
                    </button>

                    <div className={styles.imageCount}>
                      {safeCurrentImg + 1} / {imageUrls.length}
                    </div>
                  </>
                )}
              </div>

              <div className={styles.thumbStrip}>
                {visibleThumbs.map((url, index) => {
                  const isActive = safeCurrentImg === index;
                  const isLastVisibleThumb = index === visibleThumbs.length - 1;
                  const remainCount = imageUrls.length - visibleThumbs.length;

                  if (remainCount > 0 && isLastVisibleThumb) {
                    return (
                      <button
                        key={`${url}-${index}`}
                        type="button"
                        className={`${styles.thumb} ${styles.thumbMore}`}
                        onClick={() => handleOpenLightbox(index)}
                      >
                        <img src={url} alt="" />
                        <span>+ {remainCount} 더보기</span>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={`${url}-${index}`}
                      type="button"
                      className={`${styles.thumb} ${
                        isActive ? styles.active : ""
                      }`}
                      onClick={() => setCurrentImg(index)}
                    >
                      <img src={url} alt="" />
                    </button>
                  );
                })}
              </div>
            </article>

            <section className={styles.titleSection}>
              <div className={styles.titleRow}>
                <div className={styles.titleMain}>
                  <h1 className={styles.scheduleTitle}>
                    {schedule.title ?? "제목 없음"}
                  </h1>

                  <div className={styles.metaLine}>
                    <span>📍 {locationText}</span>
                    <span>📅 추천 {safeDurationDays}일 코스</span>
                    <span>{getDetailCountText(details)}</span>
                  </div>
                </div>

                <div className={styles.socialInfo}>
                  <span>관리자 추천 템플릿</span>
                </div>
              </div>

              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>👥</div>
                  <div className={styles.infoLabel}>추천 인원</div>
                  <div className={styles.infoValue}>
                    {schedule.minParticipants ?? "-"} ~{" "}
                    {schedule.maxParticipants ?? "-"}명
                  </div>
                  <div className={styles.infoSub}>
                    최소 {schedule.minParticipants ?? "-"}명 · 최대{" "}
                    {schedule.maxParticipants ?? "-"}명
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>⚧</div>
                  <div className={styles.infoLabel}>성별</div>
                  <div className={styles.infoValue}>{genderLabel}</div>
                  <div className={styles.infoSub}>참여 조건</div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>🧍</div>
                  <div className={styles.infoLabel}>연령</div>
                  <div className={styles.infoValue}>
                    {formatAgeRange(schedule)}
                  </div>
                  <div className={styles.infoSub}>권장 연령</div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>₩</div>
                  <div className={styles.infoLabel}>예상 비용</div>
                  <div className={styles.infoValue}>{priceText}</div>
                  <div className={styles.infoSub}>총 예상 금액</div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>🧾</div>
                  <div className={styles.infoLabel}>정산 방식</div>
                  <div className={styles.infoValue}>{costTypeLabel}</div>
                  <div className={styles.infoSub}>{costTypeSubLabel}</div>
                </div>
              </div>
            </section>

            <section className={styles.contentSection}>
              <article>
                <h2 className={styles.sectionTitle}>상세 설명</h2>

                <p className={styles.description}>
                  {schedule.description || "상세 설명이 없습니다."}
                </p>

                <div className={styles.tagList}>
                  <span className={styles.softTag}>✨ 추천 템플릿</span>
                  <span className={styles.softTag}>📍 {locationText}</span>
                  <span className={styles.softTag}>
                    📅 {safeDurationDays}일 코스
                  </span>
                  <span className={styles.softTag}>🧾 {costTypeLabel}</span>
                </div>
              </article>

              {details.length > 0 && (
                <article>
                  <h2 className={styles.sectionTitle}>Day-by-Day 일정</h2>

                  <div className={styles.dayList}>
                    {details.map((detail, index) => (
                      <div
                        key={detail.id ?? `${detail.dayNumber}-${index}`}
                        className={styles.dayCard}
                      >
                        <div className={styles.dayChip}>
                          DAY {detail.dayNumber ?? index + 1}
                        </div>

                        <div className={styles.dayContent}>
                          <span className={styles.timePill}>
                            추천 {detail.dayNumber ?? index + 1}일차
                          </span>

                          <h3 className={styles.dayTitle}>
                            {detail.title || "제목 없음"}
                          </h3>

                          <p className={styles.dayDesc}>
                            {detail.description || "설명이 없습니다."}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              )}
            </section>
          </section>

          <aside className={styles.sideColumn}>
            <section className={`${styles.panel} ${styles.recommendPanel}`}>
              <div className={styles.recommendIcon}>
                <AutoAwesomeRoundedIcon />
              </div>

              <div>
                <h2 className={styles.noticeTitle}>WithDay 추천 일정</h2>
                <p className={styles.noticeText}>
                  이 일정은 관리자가 미리 구성한 추천 템플릿입니다. 실제 일정
                  날짜와 모집 기간은 글쓰기 화면에서 직접 설정합니다.
                </p>
              </div>
            </section>

            <section className={`${styles.panel} ${styles.noticePanel}`}>
              <div className={styles.noticeIcon}>📝</div>

              <div>
                <h3 className={styles.noticeTitle}>
                  추천 일정 사용하기를 누르면
                </h3>
                <p className={styles.noticeText}>
                  제목, 설명, 지역, 인원, 정산 정보가 글쓰기 화면에 자동으로
                  채워집니다. 오픈채팅 링크와 상세 일정은 직접 입력합니다.
                </p>
              </div>
            </section>

            <section className={styles.panel}>
              <h2 className={styles.sectionTitle}>추천 일정 요약</h2>

              <div className={styles.summaryList}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryIcon}>📅</span>
                  <strong>추천 기간</strong>
                  <span>{safeDurationDays}일 코스</span>
                </div>

                <div className={styles.summaryRow}>
                  <span className={styles.summaryIcon}>📍</span>
                  <strong>지역</strong>
                  <span>{locationText}</span>
                </div>

                <div className={styles.summaryRow}>
                  <span className={styles.summaryIcon}>👥</span>
                  <strong>추천 인원</strong>
                  <span>
                    최소 {schedule.minParticipants ?? "-"}명 ~ 최대{" "}
                    {schedule.maxParticipants ?? "-"}명
                  </span>
                </div>

                <div className={styles.summaryRow}>
                  <span className={styles.summaryIcon}>💰</span>
                  <strong>예상 비용</strong>
                  <span>{priceText}</span>
                </div>

                <div className={styles.summaryRow}>
                  <span className={styles.summaryIcon}>☑</span>
                  <strong>세부 일정</strong>
                  <span>{getDetailCountText(details)}</span>
                </div>
              </div>
            </section>

            <section className={styles.sideCtaPanel}>
              <Button
                variant="accent"
                size="lg"
                fullWidth
                onClick={handleUseRecommendedSchedule}
                className={styles.sideUseButton}
              >
                추천 일정 사용하기
              </Button>

              <p className={styles.sideCtaText}>
                이 추천 일정을 기반으로 직접 모집글을 작성할 수 있습니다.
              </p>
            </section>

            {isAdmin && (
              <section className={`${styles.panel} ${styles.hostActions}`}>
                <div>
                  <h2 className={styles.sectionTitle}>추천 일정 관리</h2>
                  <p className={styles.hostMeta}>
                    관리자에게만 표시되는 영역입니다.
                  </p>
                </div>

                <div className={styles.hostActionGrid}>
                  <button
                    type="button"
                    className={styles.hostAction}
                    onClick={handleEditRecommendedSchedule}
                  >
                    <span>📝</span>
                    수정
                  </button>

                  <button
                    type="button"
                    className={styles.hostAction}
                    onClick={handleDeleteRecommendedSchedule}
                    disabled={deleteMutation.isPending}
                  >
                    <span>🗑</span>
                    {deleteMutation.isPending ? "삭제 중" : "삭제"}
                  </button>
                </div>
              </section>
            )}
          </aside>
        </div>
      </main>

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

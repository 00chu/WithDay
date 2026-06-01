import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import PlaceIcon from "@mui/icons-material/Place";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PeopleIcon from "@mui/icons-material/People";
import PaymentsIcon from "@mui/icons-material/Payments";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

import { getRecommendedScheduleDetail } from "../../features/recommended/api";
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

const GENDER_LABELS = {
  all: "성별 무관",
  male: "남성",
  female: "여성",
};

const DEFAULT_IMAGE = "https://placehold.co/800x400?text=Recommended+Schedule";

const formatLocation = (schedule) => {
  const region = schedule?.region?.trim() ?? "";
  const detailRegion = schedule?.detailRegion?.trim() ?? "";

  if (region && detailRegion) {
    return `${region} ${detailRegion}`;
  }

  return region || detailRegion || "장소 미정";
};

const formatPrice = (price) => {
  const safePrice = Number(price ?? 0);

  return safePrice.toLocaleString();
};

export default function RecommendedScheduleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

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

  const lightboxSlides = imageUrls.map((url) => ({ src: url }));

  const nextSlide = () => {
    setCurrentImg((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentImg((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  const handleUseRecommendedSchedule = () => {
    navigate("/write", {
      state: {
        recommendedSchedule: data,
      },
    });
  };

  if (!Number.isFinite(parsedRecommendedId) || parsedRecommendedId <= 0) {
    return (
      <div className={styles.container}>
        유효하지 않은 추천 일정 경로입니다.
      </div>
    );
  }

  if (isLoading) {
    return <div className={styles.container}>로딩 중...</div>;
  }

  if (isError) {
    const errorMessage =
      error?.response?.data?.message ??
      error?.response?.data ??
      "추천 일정 정보를 불러오는 데 실패했습니다.";

    return <div className={styles.container}>{errorMessage}</div>;
  }

  if (!schedule) {
    return <div className={styles.container}>추천 일정 정보가 없습니다.</div>;
  }

  const categoryLabel =
    CATEGORY_LABELS[schedule.category] ?? schedule.category ?? "기타";

  const locationText = formatLocation(schedule);

  return (
    <div className={styles.container}>
      <section className={styles.imageSection}>
        <div className={styles.slider}>
          <img
            src={imageUrls[safeCurrentImg]}
            alt="추천 일정 이미지"
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
            <span className={styles.recommendedBadge}>
              <AutoAwesomeRoundedIcon fontSize="inherit" />
              추천 일정
            </span>
          </div>

          <div className={styles.titleWrap}>
            <h1 className={styles.title}>{schedule.title ?? "제목 없음"}</h1>
          </div>

          <div className={styles.metaInfo}>
            <span>
              <PlaceIcon fontSize="small" />
              {locationText}
            </span>
          </div>
        </section>

        <hr className={styles.divider} />

        <section className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <CalendarTodayIcon className={styles.icon} />

            <div>
              <p className={styles.label}>추천 기간</p>
              <p className={styles.value}>
                {schedule.durationDays ?? 1}일 코스
              </p>
              <p className={styles.subValue}>
                실제 일정 날짜는 글쓰기에서 직접 설정합니다.
              </p>
            </div>
          </div>

          <div className={styles.infoItem}>
            <PeopleIcon className={styles.icon} />

            <div>
              <p className={styles.label}>추천 인원 / 조건</p>
              <p className={styles.value}>
                최소 {schedule.minParticipants ?? "-"}명 ~ 최대{" "}
                {schedule.maxParticipants ?? "-"}명
              </p>
              <p className={styles.subValue}>
                {GENDER_LABELS[schedule.genderLimit] ??
                  schedule.genderLimit ??
                  "성별 무관"}{" "}
                | {schedule.ageMin ?? "-"}세 ~ {schedule.ageMax ?? "-"}세
              </p>
            </div>
          </div>

          <div className={styles.infoItem}>
            <PaymentsIcon className={styles.icon} />

            <div>
              <p className={styles.label}>예상 비용</p>
              <p className={styles.value}>
                총 {formatPrice(schedule.totalPrice)}원
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

        <section className={styles.descriptionSection}>
          <h2 className={styles.subTitle}>상세 설명</h2>

          <p className={styles.descriptionText}>
            {schedule.description || "상세 설명이 없습니다."}
          </p>
        </section>

        {details.length > 0 && (
          <>
            <hr className={styles.divider} />

            <section className={styles.descriptionSection}>
              <h2 className={styles.subTitle}>
                세부 일정 &#40;Day-by-Day&#41;
              </h2>

              <div className={styles.dailyPlanList}>
                {details.map((detail, index) => (
                  <article
                    key={detail.id ?? `${detail.dayNumber}-${index}`}
                    className={styles.dayCard}
                  >
                    <h3 className={styles.dayNumber}>
                      Day {detail.dayNumber ?? index + 1}
                    </h3>

                    <h4 className={styles.planTitle}>
                      {detail.title || "제목 없음"}
                    </h4>

                    <p className={styles.planDesc}>
                      {detail.description || "설명이 없습니다."}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      <footer className={styles.stickyFooter}>
        <div className={styles.footerInfo}>
          <span className={styles.footerTitle}>이 추천 일정으로 시작하기</span>
          <span className={styles.footerDesc}>
            글쓰기 화면에서 날짜, 모집 기간, 오픈채팅 링크를 추가로 입력합니다.
          </span>
        </div>

        <Button variant="accent" onClick={handleUseRecommendedSchedule}>
          추천 일정 사용하기
        </Button>
      </footer>

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

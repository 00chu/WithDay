import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

import Button from "../../shared/ui/Button/Button";
import { useAuthStore } from "../../features/auth/store/authStore";
import { getRecommendedSchedules } from "../../features/recommended/api";
import styles from "./RecommendedSchedulePage.module.css";

const CATEGORY_OPTIONS = [
  { label: "전체", value: "" },
  { label: "여행", value: "travel" },
  { label: "팝업", value: "popup" },
  { label: "식사", value: "food" },
  { label: "액티비티", value: "activity" },
  { label: "문화", value: "culture" },
  { label: "기타", value: "etc" },
];

const CATEGORY_LABELS = {
  travel: "여행",
  popup: "팝업",
  food: "식사",
  activity: "액티비티",
  culture: "문화",
  etc: "기타",
};

const COST_TYPE_LABELS = {
  per_person: "1/N",
  host_covered: "호스트 부담",
  free: "무료",
  custom: "인당 고정",
};

const RecommendedSchedulePage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [selectedCategory, setSelectedCategory] = useState("");

  const isAdmin = user?.status === "admin";

  const {
    data: recommendedSchedules = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["recommended-schedules"],
    queryFn: getRecommendedSchedules,
  });

  const filteredSchedules = useMemo(() => {
    if (!selectedCategory) {
      return recommendedSchedules;
    }

    return recommendedSchedules.filter((item) => {
      return item.recommendedSchedule?.category === selectedCategory;
    });
  }, [recommendedSchedules, selectedCategory]);

  const handleCardClick = (item) => {
    const scheduleId = item.recommendedSchedule?.id;

    if (!scheduleId) {
      return;
    }

    navigate(`/recommended-schedules/${scheduleId}`);
  };

  const handleCreateClick = () => {
    navigate("/recommended-schedules/write");
  };

  return (
    <main className={styles.page}>
      <section className={styles.heroSection}>
        <div>
          <p className={styles.eyebrow}>
            <AutoAwesomeRoundedIcon fontSize="small" />
            WITHDAY 추천 일정
          </p>
          <h1 className={styles.title}>추천 일정에서 시작해보세요</h1>
          <p className={styles.description}>
            WithDay가 준비한 추천 일정을 확인하고, 마음에 드는 코스를 내 일정
            글쓰기에 템플릿처럼 사용할 수 있어요.
          </p>
        </div>

        {isAdmin && (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleCreateClick}
            className={styles.createButton}
          >
            <AddRoundedIcon fontSize="small" />
            추천 일정 생성
          </Button>
        )}
      </section>

      <section className={styles.filterSection} aria-label="추천 일정 필터">
        {CATEGORY_OPTIONS.map((category) => (
          <button
            key={category.value || "all"}
            type="button"
            className={`${styles.categoryChip} ${
              selectedCategory === category.value
                ? styles.categoryChipActive
                : ""
            }`}
            onClick={() => setSelectedCategory(category.value)}
          >
            {category.label}
          </button>
        ))}
      </section>

      <section className={styles.listHeader}>
        <div>
          <h2>추천 일정 목록</h2>
          <p>
            {isLoading
              ? "추천 일정을 불러오는 중입니다."
              : `${filteredSchedules.length}개의 추천 일정이 준비되어 있어요.`}
          </p>
        </div>
      </section>

      {isLoading && (
        <section className={styles.stateBox}>
          <p>추천 일정을 불러오는 중입니다...</p>
        </section>
      )}

      {isError && (
        <section className={styles.stateBox}>
          <p>추천 일정 목록을 불러오지 못했습니다.</p>
        </section>
      )}

      {!isLoading && !isError && filteredSchedules.length === 0 && (
        <section className={styles.stateBox}>
          <p>아직 등록된 추천 일정이 없습니다.</p>
        </section>
      )}

      {!isLoading && !isError && filteredSchedules.length > 0 && (
        <section className={styles.cardGrid}>
          {filteredSchedules.map((item) => {
            const schedule = item.recommendedSchedule;
            const detailSchedule = item.detailSchedule ?? [];
            const images = item.images ?? [];

            const thumbnail =
              schedule?.thumbnailImage ||
              images.find((image) => image.isThumbnail)?.imageUrl ||
              images[0]?.imageUrl;

            const categoryLabel = CATEGORY_LABELS[schedule?.category] || "추천";

            const costTypeLabel =
              COST_TYPE_LABELS[schedule?.costType] || "추천 비용";

            return (
              <article
                key={schedule.id}
                className={styles.scheduleCard}
                onClick={() => handleCardClick(item)}
              >
                <div className={styles.thumbnailBox}>
                  <span className={styles.badge}>{categoryLabel}</span>

                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt={schedule.title}
                      className={styles.thumbnailImage}
                    />
                  ) : (
                    <span className={styles.themeIcon}>✨</span>
                  )}
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardMetaTop}>
                    <span className={styles.categoryBadge}>
                      {categoryLabel}
                    </span>
                    <span className={styles.periodText}>
                      <CalendarMonthRoundedIcon fontSize="inherit" />
                      {schedule.durationDays || 1}일 코스
                    </span>
                  </div>

                  <h3>{schedule.title}</h3>
                  <p className={styles.subtitle}>{schedule.description}</p>

                  <div className={styles.infoList}>
                    <span>
                      <LocationOnRoundedIcon fontSize="inherit" />
                      {schedule.region} {schedule.detailRegion}
                    </span>

                    <span>
                      <PeopleAltRoundedIcon fontSize="inherit" />
                      {schedule.minParticipants ?? "-"}~
                      {schedule.maxParticipants ?? "-"}명 추천
                    </span>

                    <span>
                      <AutoAwesomeRoundedIcon fontSize="inherit" />
                      상세 일정 {detailSchedule.length}개 · {costTypeLabel}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
};

export default RecommendedSchedulePage;

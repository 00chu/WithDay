import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import ScheduleCard from "../../features/schedule/ui/ScheduleCard";
import HomeCarousel from "./HomeCarousel";
import ScheduleCardGrid from "../../shared/ui/ScheduleCardGrid/ScheduleCardGrid";
import { fetchSchedules } from "../../features/schedule/api";

const MAX_HOME_ITEMS = 8;

const getScheduleKey = (schedule) =>
  String(
    schedule?.id ??
      schedule?.scheduleId ??
      `${schedule?.title ?? "schedule"}-${schedule?.startDate ?? "unknown"}`
  );

const normalizeRegionValue = (value) => value?.trim() ?? "";

const sortByPriorityDate = (left, right) => {
  const leftTime = new Date(left?.endDate ?? left?.startDate ?? 0).getTime();
  const rightTime = new Date(right?.endDate ?? right?.startDate ?? 0).getTime();
  return leftTime - rightTime;
};

export default function Home({ selectedRegion = "" }) {
  const navigate = useNavigate();
  const normalizedRegion = normalizeRegionValue(selectedRegion);

  const {
    data: schedules = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["home-schedules", normalizedRegion],
    queryFn: () =>
      fetchSchedules({
        category: "all",
        keyword: "",
        region: normalizedRegion,
      }),
    staleTime: 1000 * 60,
  });

  const featuredSchedules = useMemo(() => {
    const safeSchedules = Array.isArray(schedules) ? [...schedules] : [];
    return safeSchedules.sort(sortByPriorityDate).slice(0, MAX_HOME_ITEMS);
  }, [schedules]);

  return (
    <div className={styles.main}>
      <HomeCarousel />

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleWrap}>
            <span className={styles.sectionAccent} aria-hidden="true" />
            <div>
              <h2 className={styles.sectionTitle}>마중 나온 위트들</h2>
              <p className={styles.sectionCaption}>
                {normalizedRegion
                  ? `${normalizedRegion}에서 찾은 일정들을 먼저 보여드려요`
                  : "함께 가기 좋은 일정들을 홈에서 먼저 만나보세요"}
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.moreButton}
            onClick={() => navigate("/explore")}
          >
            전체보기
          </button>
        </div>

        {isLoading && (
          <div className={styles.stateBox}>
            <div className={styles.loadingSpinner} />
            <p>홈 추천 일정을 불러오는 중...</p>
          </div>
        )}

        {isError && (
          <div className={clsx(styles.stateBox, styles.errorBox)}>
            <p>홈 추천 일정을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
          </div>
        )}

        {!isLoading && !isError && featuredSchedules.length === 0 && (
          <div className={styles.homeEmpty}>
            <h3 className={styles.homeEmptyTitle}>추천할 일정이 아직 없어요.</h3>
            <p className={styles.homeEmptyText}>
              지역 필터를 바꾸거나 탐색 탭에서 전체 일정을 확인해보세요.
            </p>
          </div>
        )}

        {!isLoading && !isError && featuredSchedules.length > 0 && (
          <ScheduleCardGrid className={styles.cardGrid}>
            {featuredSchedules.map((schedule) => (
              <ScheduleCard
                key={getScheduleKey(schedule)}
                schedule={schedule}
                variant="compact"
                className={styles.homeCard}
              />
            ))}
          </ScheduleCardGrid>
        )}
      </section>
    </div>
  );
}

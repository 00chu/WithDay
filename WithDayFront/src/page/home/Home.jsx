import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import Button from "../../shared/ui/Button/Button";
import ScheduleCard from "../../features/schedule/ui/ScheduleCard";
import HomeCarousel from "./HomeCarousel";
import { fetchSchedules } from "../../features/schedule/api";

const CATEGORY_SECTIONS = [
  { key: "travel", title: "여행" },
  { key: "popup", title: "팝업" },
  { key: "food", title: "식사" },
  { key: "activity", title: "액티비티" },
  { key: "culture", title: "문화" },
  { key: "etc", title: "기타" },
];

const MAX_ITEMS_PER_CATEGORY = 4;

const getScheduleKey = (schedule) =>
  String(
    schedule?.id ??
      schedule?.scheduleId ??
      `${schedule?.title ?? "schedule"}-${schedule?.startDate ?? "unknown"}`
  );

const normalizeRegionValue = (value) => value?.trim() ?? "";

const sortByEndDate = (left, right) => {
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

  const groupedSections = useMemo(() => {
    const safeSchedules = Array.isArray(schedules) ? schedules : [];

    return CATEGORY_SECTIONS.map((section) => {
      const items = safeSchedules
        .filter((schedule) => schedule?.category === section.key)
        .sort(sortByEndDate)
        .slice(0, MAX_ITEMS_PER_CATEGORY);

      return {
        ...section,
        items,
      };
    }).filter((section) => section.items.length > 0);
  }, [schedules]);

  return (
    <main className={styles.main}>
      <section className={styles.banner}>
        <div className={styles.bannerCopy}>
          <p className={styles.bannerEyebrow}>WITHDAY HOME</p>
          <h2 className={styles.bannerTitle}>
            지금 주목할 일정만
            <br />
            <span className={styles.highlight}>빠르게 둘러보세요</span>
          </h2>
          <p className={styles.bannerDescription}>
            홈에서는 마감이 가까운 일정만 카테고리별로 요약해서 보여드려요.
          </p>
        </div>
        <Button variant="outline" size="md" onClick={() => navigate("/explore")}>
          탐색 전체보기
        </Button>
      </section>

      <section className={styles.section}>
        <HomeCarousel />
      </section>

      {isLoading && (
        <section className={styles.section}>
          <div className={styles.stateBox}>
            <div className={styles.loadingSpinner} />
            <p>홈 추천 일정을 불러오는 중...</p>
          </div>
        </section>
      )}

      {isError && (
        <section className={styles.section}>
          <div className={clsx(styles.stateBox, styles.errorBox)}>
            <p>홈 추천 일정을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
          </div>
        </section>
      )}

      {!isLoading && !isError && groupedSections.length === 0 && (
        <section className={styles.section}>
          <div className={styles.homeEmpty}>
            <h3 className={styles.homeEmptyTitle}>추천할 일정이 아직 없어요.</h3>
            <p className={styles.homeEmptyText}>
              지역 필터를 바꾸거나 탐색 탭에서 전체 일정을 확인해보세요.
            </p>
          </div>
        </section>
      )}

      {!isLoading &&
        !isError &&
        groupedSections.map((section) => (
            <section className={styles.section} key={section.key}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>{section.title}</h2>
                <p className={styles.sectionCaption}>마감 임박 순 TOP {MAX_ITEMS_PER_CATEGORY}</p>
              </div>
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate("/explore")}
              >
                더보기
              </Button>
            </div>

            <div className={styles.cardList}>
              {section.items.map((schedule) => (
                <ScheduleCard
                  key={getScheduleKey(schedule)}
                  schedule={schedule}
                  className={styles.scheduleCard}
                />
              ))}
            </div>
          </section>
       
        ))}
    </main>
  );
}

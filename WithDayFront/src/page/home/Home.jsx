import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import styles from "./Home.module.css";
import Button from "../../shared/ui/Button/Button";

import ScheduleCard from "./ScheduleCard";
import SearchForm from "../../features/schedule/ui/SearchForm";
import CategoryFilter from "../../features/schedule/ui/CategoryFilter";
import { fetchSchedules } from "../../features/schedule/api";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [submittedKeyword, setSubmittedKeyword] = useState("");

  const CATEGORY_MAP = {
    all: "전체",
    travel: "여행",
    popup: "팝업",
    food: "식사",
    activity: "액티비티",
    culture: "문화",
    etc: "기타",
  };

  const {
    data: schedules = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["schedules", activeCategory, submittedKeyword],
    queryFn: () =>
      fetchSchedules({ category: activeCategory, keyword: submittedKeyword }),
    staleTime: 1000 * 60,
  });

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setSubmittedKeyword("");
  };

  return (
    <main className={styles.main}>
      <section className={styles.banner}>
        <h2 className={styles.bannerTitle}>
          혼자 가기 애매할 때,
          <br />
          <span className={styles.highlight}>함께할 동행</span>을 찾아보세요
        </h2>
      </section>

      <section className={styles.section}>
        <SearchForm
          key={activeCategory}
          submittedKeyword={submittedKeyword}
          onSearchSubmit={setSubmittedKeyword}
          onResetSubmit={() => setSubmittedKeyword("")}
        />
      </section>

      <section className={styles.section}>
        <CategoryFilter
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            {submittedKeyword
              ? "검색 결과"
              : activeCategory === "all"
                ? "방금 올라온 일정"
                : `${CATEGORY_MAP[activeCategory]} 일정`}
          </h2>
          <Button variant="outline" size="md">
            더보기
          </Button>
        </div>

        {isLoading && (
          <div className={styles.stateBox}>
            <div className={styles.loadingSpinner} />
            <p>일정을 불러오는 중...</p>
          </div>
        )}

        {isError && (
          <div className={clsx(styles.stateBox, styles.errorBox)}>
            <p>일정을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <div className={styles.cardList}>
            {/* 🌟 Array.isArray()로 한 번 더 체크하면 절대 안 터집니다 */}
            {Array.isArray(schedules) && schedules.length > 0 ? (
              schedules.map((schedule) => (
                <ScheduleCard key={schedule.id} schedule={schedule} />
              ))
            ) : (
              <div className={styles.noData}>해당 조건의 일정이 없습니다.</div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import styles from "./Home.module.css";
import Button from "../../shared/ui/Button/Button";

// 분리한 컴포넌트 불러오기
import ScheduleCard from "./ScheduleCard";
import SearchForm from "../../features/schedule/ui/SearchForm";
import CategoryFilter from "../../features/schedule/ui/CategoryFilter";

// (Mock API 함수는 백엔드 연결 전까지 이 파일이나 api 폴더에 유지합니다)
import { dayjs } from "../../shared/lib/dateUtile";
const MOCK_SCHEDULES = [
  {
    id: 1,
    category: "여행",
    title: "제주도 3박 4일 렌트카 쉐어 동행 구해요!",
    region: "제주특별자치도",
    startDate: "2025-11-15",
    endDate: "2025-11-18",
    currentParticipants: 2,
    maxParticipants: 4,
    createdAt: dayjs().subtract(3, "minute").toISOString(),
  },
  {
    id: 2,
    category: "팝업",
    title: "성수동 인기 디저트 팝업 같이 웨이팅하실 분",
    region: "서울 성동구",
    startDate: "2025-10-28",
    endDate: "2025-10-28",
    currentParticipants: 1,
    maxParticipants: 2,
    createdAt: dayjs().subtract(1, "hour").toISOString(),
  },
  {
    id: 3,
    category: "식사",
    title: "강남역 오마카세 예약 1자리 남아서 양도/동행해요",
    region: "서울 강남구",
    startDate: "2025-10-30",
    endDate: "2025-10-30",
    currentParticipants: 1,
    maxParticipants: 2,
    createdAt: dayjs().subtract(2, "day").toISOString(),
  },
  {
    id: 4,
    category: "액티비티",
    title: "한강 카약 투어 같이 가실 분 구합니다",
    region: "서울 마포구",
    startDate: "2025-11-05",
    endDate: "2025-11-05",
    currentParticipants: 3,
    maxParticipants: 6,
    createdAt: dayjs().subtract(30, "minute").toISOString(),
  },
];
const fetchSchedules = async ({ category, keyword }) => {
  await new Promise((r) => setTimeout(r, 500));
  return MOCK_SCHEDULES.filter((s) => {
    const matchCategory = category === "전체" || s.category === category;
    const matchKeyword =
      !keyword || s.title.includes(keyword) || s.region.includes(keyword);
    return matchCategory && matchKeyword;
  });
};

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("전체");
  const [submittedKeyword, setSubmittedKeyword] = useState("");

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
    setSubmittedKeyword(""); // 카테고리 변경 시 검색어 초기화
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
              : activeCategory === "전체"
                ? "방금 올라온 일정"
                : `${activeCategory} 일정`}
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
            {schedules.length > 0 ? (
              schedules.map((schedule) => (
                <ScheduleCard key={schedule.id} schedule={schedule} />
              ))
            ) : (
              <div className={styles.noData}>
                해당 카테고리의 일정이 없습니다.
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

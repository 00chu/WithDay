import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import styles from "./ExplorePage.module.css";
import Button from "../../shared/ui/Button/Button";
import ScheduleCard from "../../features/schedule/ui/ScheduleCard";
import ScheduleCardGrid from "../../shared/ui/ScheduleCardGrid/ScheduleCardGrid";
import SearchForm from "../../features/schedule/ui/SearchForm";
import CategoryFilter from "../../features/schedule/ui/CategoryFilter";
import { fetchSchedules } from "../../features/schedule/api";

/*
 * 탐색 탭의 카드 key 생성 규칙이다.
 * 정상 응답은 schedule.id를 사용하고, 과거 응답 형태나 임시 데이터처럼 id가 없는 경우에도 렌더링이 깨지지 않도록 fallback을 둔다.
 */
const getScheduleKey = (schedule) =>
  String(
    schedule?.id ??
      schedule?.scheduleId ??
      `${schedule?.title ?? "schedule"}-${schedule?.startDate ?? "unknown"}`
  );

const normalizeRegionValue = (value) => value?.trim() ?? "";

/*
 * 탐색 탭은 사용자가 카테고리와 검색어를 직접 바꿔 전체 일정 목록을 훑는 화면이다.
 * 지역은 Header에서 선택된 selectedRegion을 props로 받아 홈과 같은 백엔드 리스트 API에 전달한다.
 */
export default function ExplorePage({ selectedRegion = "" }) {
  // activeCategory는 CategoryFilter에서 선택한 값이고, "all"이면 백엔드에 category 파라미터를 보내지 않는다.
  const [activeCategory, setActiveCategory] = useState("all");

  /*
   * submittedKeyword는 실제 API 요청에 반영된 검색어다.
   * 입력 중인 값과 요청 값을 분리하기 위해 SearchForm 내부 form state가 있고,
   * submit이 일어난 뒤에만 submittedKeyword가 갱신되어 queryKey와 API 파라미터가 바뀐다.
   */
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const normalizedRegion = normalizeRegionValue(selectedRegion);

  // 화면 제목은 API 값이 아니라 사용자에게 보여줄 한글 라벨을 사용한다.
  const CATEGORY_MAP = {
    all: "전체",
    travel: "여행",
    popup: "팝업",
    food: "식사",
    activity: "액티비티",
    culture: "문화",
    etc: "기타",
  };

  /*
   * 카테고리/검색어/지역 중 하나가 바뀌면 react-query가 같은 GET /schedules API를 다른 queryKey로 다시 호출한다.
   * queryKey에 필터 값을 모두 넣어두면 "여행 + 서울", "전체 + 부산" 같은 조합별 캐시가 분리된다.
   */
  const {
    data: schedules = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["schedules", activeCategory, submittedKeyword, normalizedRegion],
    queryFn: () =>
      fetchSchedules({
        category: activeCategory,
        keyword: submittedKeyword,
        region: normalizedRegion,
      }),
    staleTime: 1000 * 60,
  });

  /*
   * 카테고리를 바꾸면 이전 검색어를 초기화한다.
   * 다른 카테고리로 이동했는데 이전 검색어가 숨어서 계속 적용되면 사용자가 빈 결과의 이유를 파악하기 어렵기 때문이다.
   */
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

        {!isLoading &&
          !isError &&
          (Array.isArray(schedules) && schedules.length > 0 ? (
            <ScheduleCardGrid>
              {schedules.map((schedule) => (
                /*
                 * 탐색 탭은 기본 ScheduleCard variant를 사용한다.
                 * ScheduleCardGrid가 반응형 열 수를 담당하므로 카드 컴포넌트에는 데이터(schedule)만 넘긴다.
                 */
                <ScheduleCard
                  key={getScheduleKey(schedule)}
                  schedule={schedule}
                />
              ))}
            </ScheduleCardGrid>
          ) : (
            <div className={styles.noData}>해당 조건의 일정이 없습니다.</div>
          ))}
      </section>
    </main>
  );
}

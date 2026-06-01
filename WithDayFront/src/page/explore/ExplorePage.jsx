import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import styles from "./ExplorePage.module.css";
import Button from "../../shared/ui/Button/Button";
import ScheduleCard from "../../features/schedule/ui/ScheduleCard";
import ScheduleCardGrid from "../../shared/ui/ScheduleCardGrid/ScheduleCardGrid";
import { fetchSchedules } from "../../features/schedule/api";
import { useAuthStore } from "../../features/auth/store/authStore";
import { getDetailRegion, getRegion } from "../../features/region/api";

const CATEGORY_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "travel", label: "여행" },
  { value: "popup", label: "팝업" },
  { value: "food", label: "식사" },
  { value: "activity", label: "액티비티" },
  { value: "culture", label: "문화" },
  { value: "etc", label: "기타" },
];

const GENDER_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "male", label: "남성만" },
  { value: "female", label: "여성만" },
];

const SORT_OPTIONS = [
  { value: "latest", label: "최신 등록순" },
  { value: "deadlineSoon", label: "마감 임박순" },
  { value: "deadlineRelaxed", label: "마감 여유순" },
  { value: "startSoon", label: "일정 시작일 빠른순" },
  { value: "startLate", label: "일정 시작일 늦은순" },
];

const DEFAULT_FILTERS = Object.freeze({
  keyword: "",
  category: "all",
  region: "",
  district: "",
  genderLimit: "all",
  sort: "latest",
  startDate: "",
  endDate: "",
});

/*
 * 탐색 탭의 카드 key 생성 규칙이다.
 * 정상 응답은 schedule.id를 사용하고, 과거 응답 형태나 임시 데이터처럼 id가 없는 경우에도 렌더링이 깨지지 않도록 fallback을 둔다.
 */
const getScheduleKey = (schedule) =>
  String(
    schedule?.id ??
      schedule?.scheduleId ??
      `${schedule?.title ?? "schedule"}-${schedule?.startDate ?? "unknown"}`,
  );

const normalizeText = (value) => value?.trim() ?? "";

const getKstToday = () => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(new Date());
  const dateParts = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
};

const findLabel = (options, value) =>
  options.find((option) => option.value === value)?.label ?? value;

const buildFilterChips = (filters) => {
  const chips = [];

  if (filters.keyword) {
    chips.push({ key: "keyword", label: filters.keyword });
  }

  if (filters.category !== "all") {
    chips.push({
      key: "category",
      label: findLabel(CATEGORY_OPTIONS, filters.category),
    });
  }

  if (filters.region) {
    chips.push({
      key: filters.district ? "district" : "region",
      label: filters.district
        ? `${filters.region} ${filters.district}`
        : filters.region,
    });
  }

  if (filters.genderLimit !== "all") {
    chips.push({
      key: "genderLimit",
      label: findLabel(GENDER_OPTIONS, filters.genderLimit),
    });
  }

  if (filters.startDate || filters.endDate) {
    const startLabel = filters.startDate
      ? filters.startDate.slice(5).replace("-", ".")
      : "시작일";
    const endLabel = filters.endDate
      ? filters.endDate.slice(5).replace("-", ".")
      : "종료일";
    chips.push({ key: "dateRange", label: `${startLabel}~${endLabel}` });
  }

  if (filters.sort !== "latest") {
    chips.push({ key: "sort", label: findLabel(SORT_OPTIONS, filters.sort) });
  }

  return chips;
};

/*
 * 탐색 탭은 Header 지역 상태에 의존하지 않고, 검색/지역/성별/기간/정렬을 한 화면에서 조합한다.
 * draftFilters는 사용자가 현재 만지는 값이고, appliedFilters는 실제 GET /schedules 요청에 들어간 마지막 조건이다.
 */
export default function ExplorePage() {
  const today = useMemo(() => getKstToday(), []);
  const authEmail = useAuthStore((state) => state.user?.email?.trim() ?? "");
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

  const { data: regions = [] } = useQuery({
    queryKey: ["explore-region-options"],
    queryFn: getRegion,
    staleTime: 1000 * 60 * 10,
  });

  const selectedRegion = normalizeText(draftFilters.region);

  const { data: detailRegions = [] } = useQuery({
    queryKey: ["explore-detail-region-options", selectedRegion],
    queryFn: () => getDetailRegion(selectedRegion),
    enabled: Boolean(selectedRegion),
    staleTime: 1000 * 60 * 10,
  });

  const selectedFilterChips = useMemo(
    () => buildFilterChips(appliedFilters),
    [appliedFilters],
  );

  /*
   * queryKey에는 적용된 필터 전체를 펼쳐 넣는다.
   * draft 값은 검색 버튼 전까지 queryKey에 들어가지 않아, 필터를 둘러보는 동안 API가 흔들리지 않는다.
   */
  const {
    data: schedules = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "schedules",
      appliedFilters.keyword,
      appliedFilters.category,
      appliedFilters.region,
      appliedFilters.district,
      appliedFilters.genderLimit,
      appliedFilters.startDate,
      appliedFilters.endDate,
      appliedFilters.sort,
      authEmail || "guest",
    ],
    queryFn: () =>
      fetchSchedules({
        ...appliedFilters,
        email: authEmail,
      }),
    staleTime: 1000 * 60,
  });

  const updateDraftFilter = (key, value) => {
    setDraftFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleRegionChange = (region) => {
    setDraftFilters((prev) => ({
      ...prev,
      region,
      district: "",
    }));
  };

  const handleStartDateChange = (startDate) => {
    setDraftFilters((prev) => ({
      ...prev,
      startDate,
      endDate: prev.endDate && prev.endDate < startDate ? "" : prev.endDate,
    }));
  };

  const handleEndDateChange = (endDate) => {
    setDraftFilters((prev) => ({
      ...prev,
      endDate,
      startDate: prev.startDate || (endDate ? today : prev.startDate),
    }));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setAppliedFilters({
      ...draftFilters,
      keyword: normalizeText(draftFilters.keyword),
      region: normalizeText(draftFilters.region),
      district: normalizeText(draftFilters.district),
    });
  };

  const handleResetAll = () => {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
  };

  const removeFilter = (key) => {
    const nextFilters = {
      ...appliedFilters,
      ...(key === "keyword" ? { keyword: "" } : {}),
      ...(key === "category" ? { category: "all" } : {}),
      ...(key === "region" || key === "district"
        ? { region: "", district: "" }
        : {}),
      ...(key === "genderLimit" ? { genderLimit: "all" } : {}),
      ...(key === "dateRange" ? { startDate: "", endDate: "" } : {}),
      ...(key === "sort" ? { sort: "latest" } : {}),
    };

    setDraftFilters(nextFilters);
    setAppliedFilters(nextFilters);
  };

  const resultTitle = selectedFilterChips.length
    ? "필터 적용 결과"
    : "방금 올라온 일정";

  return (
    <main className={styles.main}>
      <section className={styles.banner}>
        <h2 className={styles.bannerTitle}>
          혼자 가기 애매할 때,
          <br />
          <span className={styles.highlight}>함께할 동행</span>을 찾아보세요
        </h2>
      </section>

      <section className={styles.filterPanel} aria-label="일정 탐색 필터">
        <form onSubmit={handleSearch}>
          <div className={styles.searchRow}>
            <label className={styles.searchInputWrapper}>
              <SearchRoundedIcon fontSize="small" className={styles.searchIcon} />
              <input
                type="search"
                value={draftFilters.keyword}
                placeholder="지역, 일정명, 카테고리로 검색"
                className={styles.searchInput}
                onChange={(event) =>
                  updateDraftFilter("keyword", event.target.value)
                }
              />
            </label>
            <Button type="submit" variant="accent" size="md">
              검색
            </Button>
          </div>

          <div className={styles.filterBar}>
            <label className={styles.filterField}>
              <span className={styles.filterLabel}>카테고리</span>
              <select
                value={draftFilters.category}
                className={styles.filterSelect}
                onChange={(event) =>
                  updateDraftFilter("category", event.target.value)
                }
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.filterField}>
              <span className={styles.filterLabel}>지역</span>
              <select
                value={draftFilters.region}
                className={styles.filterSelect}
                onChange={(event) => handleRegionChange(event.target.value)}
              >
                <option value="">전체</option>
                {regions.map((region) => (
                  <option key={region.regionId} value={region.regionName}>
                    {region.regionName}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.filterField}>
              <span className={styles.filterLabel}>시/군/구</span>
              <select
                value={draftFilters.district}
                className={styles.filterSelect}
                disabled={!draftFilters.region}
                onChange={(event) =>
                  updateDraftFilter("district", event.target.value)
                }
              >
                <option value="">전체</option>
                {detailRegions.map((detailRegion) => (
                  <option
                    key={detailRegion.detailId}
                    value={detailRegion.detailName}
                  >
                    {detailRegion.detailName}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.filterField}>
              <span className={styles.filterLabel}>성별</span>
              <select
                value={draftFilters.genderLimit}
                className={styles.filterSelect}
                onChange={(event) =>
                  updateDraftFilter("genderLimit", event.target.value)
                }
              >
                {GENDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.filterField}>
              <span className={styles.filterLabel}>정렬</span>
              <select
                value={draftFilters.sort}
                className={styles.filterSelect}
                onChange={(event) => updateDraftFilter("sort", event.target.value)}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className={clsx(styles.filterField, styles.dateRangeField)}>
              <span className={styles.filterLabel}>일정기간</span>
              <div className={styles.dateRangeInputs}>
                <input
                  type="date"
                  value={draftFilters.startDate}
                  min={today}
                  className={styles.dateInput}
                  onChange={(event) => handleStartDateChange(event.target.value)}
                />
                <span className={styles.dateDivider}>~</span>
                <input
                  type="date"
                  value={draftFilters.endDate}
                  min={draftFilters.startDate || today}
                  className={styles.dateInput}
                  onChange={(event) => handleEndDateChange(event.target.value)}
                />
              </div>
            </div>
          </div>
        </form>

        <div className={styles.selectedFilterRow}>
          <div className={styles.selectedChipList} aria-label="선택된 필터">
            {selectedFilterChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                className={styles.selectedChip}
                onClick={() => removeFilter(chip.key)}
              >
                <span>{chip.label}</span>
                <CloseRoundedIcon fontSize="small" aria-hidden="true" />
              </button>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="md"
            className={styles.resetButton}
            onClick={handleResetAll}
          >
            전체 초기화
          </Button>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{resultTitle}</h2>
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
                <ScheduleCard key={getScheduleKey(schedule)} schedule={schedule} />
              ))}
            </ScheduleCardGrid>
          ) : (
            <div className={styles.noData}>조건에 맞는 일정이 없습니다.</div>
          ))}
      </section>
    </main>
  );
}

import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchScheduleDetail } from "../../features/schedule/api";

// 위젯 및 피처 불러오기
import ScheduleImageSlider from "../../features/schedule/ui/ScheduleImageSlider";
import ScheduleInfo from "../../features/schedule/ui/ScheduleInfo";
import ScheduleDailyPlan from "../../features/schedule/ui/ScheduleDailyPlan";
import ApplyScheduleButton from "../../features/schedule/ui/ApplyScheduleButton";

// 스타일
import styles from "./ScheduleDetail.module.css";

export default function ScheduleDetail() {
  const { scheduleId } = useParams();

  // 🌟 React Query 적용: 로딩 상태, 에러, 데이터 캐싱을 한 번에 관리
  const { data, isLoading, isError } = useQuery({
    queryKey: ["schedule", scheduleId],
    queryFn: () => fetchScheduleDetail(scheduleId),
    staleTime: 1000 * 60 * 5, // 5분 동안은 새로고침 없이 캐시 데이터 사용
  });

  if (isLoading) return <div className={styles.container}>로딩 중...</div>;
  if (isError)
    return (
      <div className={styles.container}>데이터를 불러오는 데 실패했습니다.</div>
    );
  if (!data || !data.schedule)
    return <div className={styles.container}>일정 정보가 없습니다.</div>;

  const { schedule, details, images } = data;

  return (
    <div className={styles.container}>
      {/* 1. 이미지 슬라이더 영역 */}
      <ScheduleImageSlider
        images={images}
        thumbnail={schedule.thumbnailImage}
      />

      {/* 2. 상세 정보 영역 */}
      <ScheduleInfo schedule={schedule} />

      {/* 3. 세부 일정 (Day-by-Day) */}
      {details && details.length > 0 && (
        <>
          <hr className={styles.divider} />
          <ScheduleDailyPlan details={details} />
        </>
      )}

      {/* 4. 하단 고정 신청 바 (Feature 렌더링) */}
      <footer className={styles.stickyFooter}>
        <div className={styles.footerInfo}>
          <span className={styles.recruitDeadline}>
            마감일: {schedule.recruitEndDate}
          </span>
        </div>

        {/* 🌟 분리해둔 기능(Feature) 컴포넌트 마운트 */}
        <ApplyScheduleButton status={schedule.status} />
      </footer>
    </div>
  );
}

import styles from "./Dashboard.module.css";
import { getDashboardData } from "../api";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const { data: dashboardData } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardData,
  });

  // dashboardData의 값이 없을 때 null 반환.
  if (!dashboardData) return null;

  // 오늘 회원 수와 누적 회원 수의 차이
  const userDiff =
    dashboardData.nowTotalUserCount - dashboardData.totalUserCount;

  // 오늘 일정 수와 누적 일정 수의 차이
  const scheduleDiff =
    dashboardData.nowTotalScheduleCount - dashboardData.totalScheduleCount;

  // 차이값에 따라 변동 없으면 -, 늘어나면 ▲, 줄어들면 ▼
  const getArrow = (value) => {
    if (value === 0) return "-";
    return value > 0 ? "▲" : "▼";
  };

  // 차이값에 따라 스타일 (색) 변경
  {
    /* 
    className={
    userDiff > 0
      ? styles.up
      : userDiff < 0
      ? styles.down
      : styles.neutral
    } 
  */
  }
  const getClassName = (value) => {
    if (value === 0) return styles.neutral;
    return value > 0 ? styles.up : styles.down;
  };

  return (
    <div className={styles.dashboard_wrap}>
      <div className={styles.dashboard_card_wrap}>
        <div className={styles.dashboard_card}>
          <div className={styles.icon}>👥</div>
          <div className={styles.card_content}>
            <span className={styles.label}>전체 회원 수</span>
            {/* .toLocaleString() - 천 단위 콤마*/}
            <h2>{dashboardData.nowTotalUserCount.toLocaleString()}</h2>
            <p className={getClassName(userDiff)}>
              {getArrow(userDiff)} {Math.abs(userDiff)}
            </p>
          </div>
        </div>

        <div className={styles.dashboard_card}>
          <div className={styles.icon}>📅</div>
          <div className={styles.card_content}>
            <span className={styles.label}>전체 일정 수</span>
            <h2>{dashboardData.nowTotalScheduleCount.toLocaleString()}</h2>
            <p className={getClassName(scheduleDiff)}>
              {getArrow(scheduleDiff)} {Math.abs(scheduleDiff)}
            </p>
          </div>
        </div>

        <div className={styles.dashboard_card}>
          <div className={styles.icon}>⭐</div>
          <div className={styles.card_content}>
            <span className={styles.label}>추천 일정 수</span>
            <h2>{dashboardData.recommendedScheduleCount.toLocaleString()}</h2>
          </div>
        </div>

        <div className={styles.dashboard_card}>
          <div className={styles.icon}>🚩</div>
          <div className={styles.card_content}>
            <div className={styles.statusRow}>
              <span>시작된 일정</span>
              <strong>{dashboardData.completedScheduleCount}</strong>
            </div>
            <div className={styles.statusRow}>
              <span>마감된 일정</span>
              <strong>{dashboardData.closedScheduleCount}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

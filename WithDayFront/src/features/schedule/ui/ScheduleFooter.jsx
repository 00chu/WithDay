import { formatDate } from "../../../shared/lib/dateUtile";
import styles from "../../../page/home/Home.module.css";

export default function ScheduleFooter({ schedule, actionSlot }) {
  return (
    <footer className={styles.stickyFooter}>
      <div className={styles.footerInfo}>
        <span className={styles.recruitDeadline}>
          {/* 공용 날짜 포맷 함수 활용 */}
          마감일: {formatDate(schedule.recruitEndDate)}
        </span>
      </div>

      {/* 🌟 외부(Page)에서 전달해준 '신청하기 버튼'이 이곳에 들어갑니다 */}
      {actionSlot}
    </footer>
  );
}

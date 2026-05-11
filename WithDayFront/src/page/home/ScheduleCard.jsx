import clsx from "clsx";
import PlaceIcon from "@mui/icons-material/Place";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import Button from "../../shared/ui/Button/Button";
import { getDDay, formatDateRange, dayjs } from "../../shared/lib/dateUtile";
import styles from "./Home.module.css";
import { useNavigate } from "react-router-dom";

export default function ScheduleCard({ schedule }) {
  const navigate = useNavigate();
  const dday = getDDay(schedule.startDate);
  const isFull = schedule.currentParticipants >= schedule.maxParticipants;
  const fillRatio = schedule.currentParticipants / schedule.maxParticipants;

  const CATEGORY_MAP = {
    travel: "여행",
    popup: "팝업",
    food: "식사",
    activity: "액티비티",
    culture: "문화",
    etc: "기타",
  };

  return (
    <div className={clsx(styles.card, { [styles.cardFull]: isFull })}>
      <div className={styles.cardHeader}>
        {/* 🌟 매핑 객체에 값이 없으면 원본 영어를 그대로 노출하도록 안전장치 추가 */}
        <span className={styles.badge}>
          {CATEGORY_MAP[schedule.category] || schedule.category}
        </span>
        {dday && (
          <span
            className={clsx(styles.dday, {
              [styles.ddayUrgent]:
                dday !== "D-Day" && parseInt(dday.replace("D-", "")) <= 3,
              [styles.ddayToday]: dday === "D-Day",
            })}
          >
            {dday}
          </span>
        )}
        <span className={styles.region}>
          <PlaceIcon
            fontSize="small"
            style={{
              marginRight: "4px",
              color: "var(--color-text-muted)",
              verticalAlign: "middle",
            }}
          />
          {schedule.region}
        </span>
      </div>

      <h3 className={styles.cardTitle}>{schedule.title}</h3>

      <div className={styles.cardInfo}>
        <span className={styles.date}>
          <CalendarTodayIcon
            fontSize="small"
            style={{
              marginRight: "4px",
              color: "var(--color-text-muted)",
              verticalAlign: "middle",
            }}
          />
          {formatDateRange(schedule.startDate, schedule.endDate)}
        </span>
        <span className={styles.createdAt}>
          {dayjs(schedule.createdAt).fromNow()} 등록
        </span>
      </div>

      <div className={styles.progressWrapper}>
        <div
          className={clsx(styles.progressBar, {
            [styles.progressBarFull]: isFull,
            [styles.progressBarHigh]: fillRatio >= 0.7 && !isFull,
          })}
          style={{ width: `${fillRatio * 100}%` }}
        />
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.participants}>
          모집 인원 <strong>{schedule.currentParticipants}</strong> /{" "}
          {schedule.maxParticipants}
          {isFull && <span className={styles.fullBadge}>마감</span>}
        </div>
        <Button
          variant={isFull ? "outline" : "accent"}
          size="md"
          disabled={isFull}
          onClick={() => navigate(`/schedule/${schedule.id}`)}
        >
          {isFull ? "마감됨" : "신청하기"}
        </Button>
      </div>
    </div>
  );
}

import clsx from "clsx";
import PlaceIcon from "@mui/icons-material/Place";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import GroupIcon from "@mui/icons-material/Group";
import { useNavigate } from "react-router-dom";
import { formatDateRange, getDDay } from "../../../shared/lib/dateUtile";
import defaultThumbnail from "../../../assets/hero.png";
import styles from "./ScheduleCard.module.css";

const CATEGORY_LABELS = {
  travel: "여행",
  popup: "팝업",
  food: "식사",
  activity: "액티비티",
  culture: "문화",
  etc: "기타",
};

const resolveThumbnail = (schedule) =>
  schedule?.thumbnailImage?.trim() ||
  schedule?.thumbnail?.trim() ||
  schedule?.imageUrl?.trim() ||
  defaultThumbnail;

export default function ScheduleCard({ schedule, className }) {
  const navigate = useNavigate();
  const currentParticipants = Number(schedule?.currentParticipants ?? 0);
  const maxParticipants = Number(schedule?.maxParticipants ?? 0);
  const isFull = maxParticipants > 0 && currentParticipants >= maxParticipants;
  const thumbnailSrc = resolveThumbnail(schedule);
  const locationText = [schedule?.region, schedule?.detailRegion]
    .filter(Boolean)
    .join(" · ");
  const categoryLabel =
    CATEGORY_LABELS[schedule?.category] ?? schedule?.category ?? "기타";
  const participantText = `${currentParticipants} / ${
    maxParticipants > 0 ? maxParticipants : "-"
  }명`;
  const dDayText = getDDay(schedule?.startDate) ?? "종료됨";
  const statusText = isFull ? "모집 마감" : dDayText;

  const handleCardClick = () => navigate(`/schedule/${schedule.id}`);
  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = defaultThumbnail;
  };

  return (
    <article
      className={clsx(
        styles.card,
        styles.cardInteractive,
        className,
        {
          [styles.cardFull]: isFull,
        },
      )}
      onClick={handleCardClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleCardClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className={styles.cardTop}>
        <div className={styles.ticketHeader}>
          <span className={styles.ticketBadge}>{categoryLabel}</span>
          <span
            className={clsx(styles.ticketStatus, {
              [styles.ticketStatusClosed]: isFull,
            })}
          >
            {statusText}
          </span>
        </div>

        <h3 className={styles.cardTitle}>{schedule?.title ?? "제목 없는 일정"}</h3>

        <div className={styles.participantRow}>
          <GroupIcon fontSize="small" className={styles.metaIcon} />
          <span className={styles.participantText}>{participantText}</span>
        </div>

        <div className={styles.metaList}>
          <span className={styles.metaItem}>
            <CalendarTodayIcon fontSize="small" className={styles.metaIcon} />
            <span className={styles.metaText}>
              {formatDateRange(schedule?.startDate, schedule?.endDate)}
            </span>
          </span>
          <span className={styles.metaItem}>
            <PlaceIcon fontSize="small" className={styles.metaIcon} />
            <span className={styles.metaText}>{locationText || "지역 미정"}</span>
          </span>
        </div>
      </div>

      <div className={styles.ticketDivider} aria-hidden="true" />

      <div className={styles.cardBottom}>
        <div className={styles.thumbnailWrap}>
          <img
            src={thumbnailSrc}
            alt={schedule?.title ?? "일정 썸네일"}
            className={styles.thumbnail}
            onError={handleImageError}
          />
        </div>
      </div>
    </article>
  );
}

import clsx from "clsx";
import PlaceIcon from "@mui/icons-material/Place";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import GroupIcon from "@mui/icons-material/Group";
import { formatDateRange } from "../../shared/lib/dateUtile";
import styles from "./Home.module.css";
import { useNavigate } from "react-router-dom";
import defaultThumbnail from "../../assets/hero.png";

const resolveThumbnail = (schedule) =>
  schedule?.thumbnailImage?.trim() ||
  schedule?.thumbnail?.trim() ||
  schedule?.imageUrl?.trim() ||
  defaultThumbnail;

export default function ScheduleCard({ schedule }) {
  const navigate = useNavigate();
  const currentParticipants = Number(schedule?.currentParticipants ?? 0);
  const maxParticipants = Number(schedule?.maxParticipants ?? 0);
  const isFull = maxParticipants > 0 && currentParticipants >= maxParticipants;
  const thumbnailSrc = resolveThumbnail(schedule);
  const locationText = [schedule?.region, schedule?.detailRegion]
    .filter(Boolean)
    .join(" · ");
  const regionLabel = schedule?.region?.trim() || "지역 미정";
  const participantText = `${currentParticipants} / ${
    maxParticipants > 0 ? maxParticipants : "-"
  }명`;

  const handleCardClick = () => navigate(`/schedule/${schedule.id}`);
  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = defaultThumbnail;
  };

  return (
    <article
      className={clsx(styles.card, styles.cardInteractive, {
        [styles.cardFull]: isFull,
      })}
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
      <div className={styles.cardContent}>
        <div className={styles.cardTopRow}>
          <span className={styles.regionChip}>{regionLabel}</span>
          <div className={styles.cardStatusRow}>
            <div className={styles.participantRow}>
              <GroupIcon fontSize="small" className={styles.metaIcon} />
              <span className={styles.participantText}>{participantText}</span>
            </div>
            {isFull && <span className={styles.fullBadge}>모집 마감</span>}
          </div>
        </div>

        <h3 className={styles.cardTitle}>
          {schedule?.title ?? "제목 없는 일정"}
        </h3>

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

      <div className={styles.cardDivider} />

      <div className={styles.thumbnailWrap}>
        <img
          src={thumbnailSrc}
          alt={schedule?.title ?? "일정 썸네일"}
          className={styles.thumbnail}
          onError={handleImageError}
        />
      </div>
    </article>
  );
}

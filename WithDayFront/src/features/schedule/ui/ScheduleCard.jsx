import clsx from "clsx";
import PlaceIcon from "@mui/icons-material/Place";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import GroupIcon from "@mui/icons-material/Group";
import { useNavigate } from "react-router-dom";
import { formatDateRange, getDDay } from "../../../shared/lib/dateUtile";
import styles from "./ScheduleCard.module.css";

const CATEGORY_LABELS = {
  travel: "여행",
  popup: "팝업",
  food: "식사",
  activity: "액티비티",
  culture: "문화",
  etc: "기타",
};

const defaultThumbnail = "/hero.png";

const resolveThumbnail = (schedule) =>
  schedule?.thumbnailImage?.trim() ||
  schedule?.thumbnail?.trim() ||
  schedule?.imageUrl?.trim() ||
  defaultThumbnail;

const formatCompactDate = (dateString) => {
  if (!dateString) {
    return "일정 미정";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "일정 미정";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).format(date);
};

const formatPriceLabel = (schedule) => {
  const price = Number(schedule?.totalPrice ?? 0);
  const costType = schedule?.costType;

  if (costType === "free" || price <= 0) {
    return "무료";
  }

  return `${price.toLocaleString("ko-KR")}원`;
};

export default function ScheduleCard({
  schedule,
  className,
  variant = "default",
}) {
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
  const isCompact = variant === "compact";
  const compactDescription =
    schedule?.description?.trim() ||
    [locationText, `${categoryLabel} 일정`].filter(Boolean).join(" · ");
  const compactDate = formatCompactDate(schedule?.startDate);
  const compactPrice = formatPriceLabel(schedule);

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
          [styles.cardCompact]: isCompact,
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
      {isCompact ? (
        <>
          <div className={clsx(styles.cardTop, styles.cardTopCompact)}>
            <div className={styles.compactMetaRow}>
              <span className={styles.compactLocation}>
                <PlaceIcon fontSize="inherit" className={styles.compactMetaIcon} />
                <span className={styles.compactLocationText}>
                  {locationText || "지역 미정"}
                </span>
              </span>
              <span className={styles.compactParticipantCount}>{participantText}</span>
            </div>

            <div className={styles.compactSummaryRow}>
              <span
                className={clsx(styles.compactStatusBadge, {
                  [styles.compactStatusBadgeClosed]: isFull,
                })}
              >
                {statusText}
              </span>
              <div className={styles.compactSummaryInfo}>
                <span className={styles.compactDate}>{compactDate}</span>
                <span className={styles.compactPrice}>{compactPrice}</span>
              </div>
            </div>

            <h3 className={clsx(styles.cardTitle, styles.compactTitle)}>
              {schedule?.title ?? "제목 없는 일정"}
            </h3>
            <p className={styles.compactDescription}>{compactDescription}</p>
          </div>

          <div className={styles.ticketDivider} aria-hidden="true" />

          <div className={clsx(styles.cardBottom, styles.cardBottomCompact)}>
            <div className={clsx(styles.thumbnailWrap, styles.thumbnailWrapCompact)}>
              <img
                src={thumbnailSrc}
                alt={schedule?.title ?? "일정 썸네일"}
                className={styles.thumbnail}
                onError={handleImageError}
              />
            </div>
          </div>
        </>
      ) : (
        <>
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

            <h3 className={styles.cardTitle}>
              {schedule?.title ?? "제목 없는 일정"}
            </h3>

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
        </>
      )}
    </article>
  );
}

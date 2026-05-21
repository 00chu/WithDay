import clsx from "clsx";
import PlaceIcon from "@mui/icons-material/Place";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import GroupIcon from "@mui/icons-material/Group";
import { useNavigate } from "react-router-dom";
import { dayjs, formatDateRange, getDDay } from "../../../shared/lib/dateUtile";
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
const RECRUITING_STATUS = "recruiting";
const URGENT_DAY_THRESHOLD = 3;

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

const resolveScheduleBadge = (schedule, isFull) => {
  const normalizedStatus = String(schedule?.status ?? "").trim().toLowerCase();
  const dDayText = getDDay(schedule?.startDate);
  const hasValidStartDate = dayjs(schedule?.startDate).isValid();
  const daysUntilStart = hasValidStartDate
    ? dayjs(schedule.startDate).startOf("day").diff(dayjs().startOf("day"), "day")
    : null;
  const isClosedByStatus =
    normalizedStatus && normalizedStatus !== RECRUITING_STATUS;

  if (isFull || isClosedByStatus || (daysUntilStart !== null && daysUntilStart < 0)) {
    return {
      state: "CLOSED",
      label: "모집 마감",
    };
  }

  if (daysUntilStart !== null && daysUntilStart <= URGENT_DAY_THRESHOLD) {
    return {
      state: "URGENT",
      label: dDayText ?? "마감 임박",
    };
  }

  return {
    state: "AVAILABLE",
    label: dDayText ?? "모집중",
  };
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
  const { state: badgeState, label: badgeLabel } = resolveScheduleBadge(
    schedule,
    isFull,
  );
  const thumbnailSrc = resolveThumbnail(schedule);
  const locationText = [schedule?.region, schedule?.detailRegion]
    .filter(Boolean)
    .join(" · ");
  const categoryLabel =
    CATEGORY_LABELS[schedule?.category] ?? schedule?.category ?? "기타";
  const participantText = `${currentParticipants} / ${
    maxParticipants > 0 ? maxParticipants : "-"
  }명`;
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
          [styles.cardFull]: badgeState === "CLOSED",
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
                className={clsx(
                  styles.badge,
                  styles.compactStatusBadge,
                  badgeState === "CLOSED" && styles.badgeClosed,
                  badgeState === "URGENT" && styles.badgeUrgent,
                  badgeState === "AVAILABLE" && styles.badgeAvailable,
                )}
              >
                {badgeLabel}
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
                className={clsx(
                  styles.badge,
                  styles.ticketStatus,
                  badgeState === "CLOSED" && styles.badgeClosed,
                  badgeState === "URGENT" && styles.badgeUrgent,
                  badgeState === "AVAILABLE" && styles.badgeAvailable,
                )}
              >
                {badgeLabel}
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

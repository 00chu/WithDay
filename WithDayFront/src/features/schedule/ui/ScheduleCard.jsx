import clsx from "clsx";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import GroupIcon from "@mui/icons-material/Group";
import PaidIcon from "@mui/icons-material/Paid";
import WcIcon from "@mui/icons-material/Wc";
import { useNavigate } from "react-router-dom";
import { formatDateRange, getDDay } from "../../../shared/lib/dateUtile";
import styles from "./ScheduleCard.module.css";

const GENDER_LIMIT_LABELS = {
  all: "성별 무관",
  male: "남성",
  female: "여성",
};

const COST_TYPE_LABELS = {
  per_person: "총액 1 / N",
  host_covered: "호스트 지불",
  free: "무료",
  custom: "인당 고정",
};

const defaultThumbnail = "/hero.png";

const resolveThumbnail = (schedule) =>
  schedule?.thumbnailImage?.trim() ||
  schedule?.thumbnail?.trim() ||
  schedule?.imageUrl?.trim() ||
  defaultThumbnail;

const resolveParticipantText = (schedule) => {
  const currentParticipants = Number(schedule?.currentParticipants ?? 0);
  const maxParticipants = Number(schedule?.maxParticipants ?? 0);

  return `${currentParticipants} / ${maxParticipants > 0 ? maxParticipants : "-"}명`;
};

const resolveGenderLimitLabel = (genderLimit) =>
  GENDER_LIMIT_LABELS[String(genderLimit ?? "").trim().toLowerCase()] ?? "성별 무관";

const resolvePriceText = (totalPrice, costType) => {
  const price = Number(totalPrice ?? 0);

  if (String(costType ?? "").trim().toLowerCase() === "free" || price <= 0) {
    return "무료";
  }

  return `${price.toLocaleString("ko-KR")}원`;
};

const resolveCostSummary = (schedule) => {
  const costTypeLabel =
    COST_TYPE_LABELS[String(schedule?.costType ?? "").trim().toLowerCase()] ??
    "비용 미정";
  const priceLabel = resolvePriceText(schedule?.totalPrice, schedule?.costType);

  if (priceLabel === "무료") {
    return "무료";
  }

  return `${costTypeLabel} ${priceLabel}`;
};

const resolveDeadline = (recruitEndDate) => {
  const dDay = getDDay(recruitEndDate);

  if (!dDay) {
    return {
      label: "일정 미정",
      isToday: false,
      isClosed: false,
    };
  }

  if (dDay === "D-Day") {
    return {
      label: "D-day",
      isToday: true,
      isClosed: false,
    };
  }

  if (dDay === "마감") {
    return {
      label: "마감",
      isToday: false,
      isClosed: true,
    };
  }

  return {
    label: dDay,
    isToday: false,
    isClosed: false,
  };
};

const INFO_ITEMS = [
  {
    key: "gender",
    icon: WcIcon,
    resolveText: (schedule) => resolveGenderLimitLabel(schedule?.genderLimit),
  },
  {
    key: "participants",
    icon: GroupIcon,
    resolveText: (schedule) => resolveParticipantText(schedule),
  },
  {
    key: "period",
    icon: CalendarTodayIcon,
    resolveText: (schedule) =>
      formatDateRange(schedule?.startDate, schedule?.endDate) ?? "일정 미정",
  },
  {
    key: "cost",
    icon: PaidIcon,
    resolveText: (schedule) => resolveCostSummary(schedule),
  },
];

export default function ScheduleCard({
  schedule,
  className,
  variant = "default",
}) {
  const navigate = useNavigate();
  const thumbnailSrc = resolveThumbnail(schedule);
  const deadline = resolveDeadline(schedule?.recruitEndDate);
  const isCompact = variant === "compact";
  const descriptionText = schedule?.description?.trim() || "일정 소개가 아직 등록되지 않았어요.";

  const handleCardClick = () => navigate(`/schedule/${schedule.id}`);

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = defaultThumbnail;
  };

  return (
    <article
      className={clsx(styles.card, styles.cardInteractive, className, {
        [styles.cardCompact]: isCompact,
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
      <div className={clsx(styles.cardTop, isCompact && styles.cardTopCompact)}>
        <div className={styles.headerRow}>
          <span
            className={clsx(
              styles.deadlineBadge,
              deadline.isToday && styles.deadlineBadgeToday,
              deadline.isClosed && styles.deadlineBadgeClosed,
              isCompact && styles.deadlineBadgeCompact,
            )}
          >
            {deadline.label}
          </span>

          <div className={styles.infoStack}>
            {INFO_ITEMS.map(({ key, icon: Icon, resolveText }) => (
              <span
                key={key}
                className={clsx(styles.infoLine, isCompact && styles.infoLineCompact)}
              >
                <Icon
                  fontSize="inherit"
                  className={clsx(styles.infoIcon, isCompact && styles.infoIconCompact)}
                />
                <span className={styles.infoText}>{resolveText(schedule)}</span>
              </span>
            ))}
          </div>
        </div>

        <div className={styles.bodySection}>
          <h3 className={clsx(styles.cardTitle, isCompact && styles.cardTitleCompact)}>
            {schedule?.title ?? "제목 없는 일정"}
          </h3>
          <p
            className={clsx(
              styles.cardDescription,
              isCompact && styles.cardDescriptionCompact,
            )}
          >
            {descriptionText}
          </p>
        </div>
      </div>

      <div className={styles.ticketDivider} aria-hidden="true" />

      <div className={clsx(styles.cardBottom, isCompact && styles.cardBottomCompact)}>
        <div className={clsx(styles.thumbnailWrap, isCompact && styles.thumbnailWrapCompact)}>
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

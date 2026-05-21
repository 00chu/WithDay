import clsx from "clsx";
import PlaceIcon from "@mui/icons-material/Place";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import GroupIcon from "@mui/icons-material/Group";
import WcIcon from "@mui/icons-material/Wc";
import PaidIcon from "@mui/icons-material/Paid";
import EventBusyIcon from "@mui/icons-material/EventBusy";
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

const resolveLocationText = (schedule) =>
  [schedule?.region, schedule?.detailRegion].filter(Boolean).join(" · ");

const resolveCategoryLabel = (category) =>
  CATEGORY_LABELS[category] ?? category ?? "기타";

const resolveParticipantText = (schedule) => {
  const currentParticipants = Number(schedule?.currentParticipants ?? 0);
  const maxParticipants = Number(schedule?.maxParticipants ?? 0);

  return `${currentParticipants} / ${maxParticipants > 0 ? maxParticipants : "-"}명`;
};

const resolveGenderLimitLabel = (genderLimit) =>
  GENDER_LIMIT_LABELS[String(genderLimit ?? "").trim().toLowerCase()] ?? "성별 무관";

const resolveCostTypeLabel = (costType) =>
  COST_TYPE_LABELS[String(costType ?? "").trim().toLowerCase()] ?? "비용 미정";

const resolveRecruitmentDeadline = (schedule) => {
  const dDay = getDDay(schedule?.recruitEndDate);

  if (!dDay) {
    return null;
  }

  return {
    label: dDay === "마감" ? "모집 마감" : `모집 ${dDay}`,
    isToday: dDay === "D-Day",
    isClosed: dDay === "마감",
  };
};

export default function ScheduleCard({
  schedule,
  className,
  variant = "default",
}) {
  const navigate = useNavigate();
  const thumbnailSrc = resolveThumbnail(schedule);
  const locationText = resolveLocationText(schedule);
  const categoryLabel = resolveCategoryLabel(schedule?.category);
  const participantText = resolveParticipantText(schedule);
  const schedulePeriodText = formatDateRange(schedule?.startDate, schedule?.endDate);
  const genderLimitText = resolveGenderLimitLabel(schedule?.genderLimit);
  const costTypeText = resolveCostTypeLabel(schedule?.costType);
  const recruitmentDeadline = resolveRecruitmentDeadline(schedule);
  const isCompact = variant === "compact";
  const compactDescription =
    schedule?.description?.trim() ||
    [locationText, `${categoryLabel} 일정`].filter(Boolean).join(" · ");

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
              <span className={styles.ticketBadge}>{categoryLabel}</span>
              {recruitmentDeadline && (
                <span
                  className={clsx(
                    styles.recruitmentDeadlineBadge,
                    styles.compactDeadlineBadge,
                    recruitmentDeadline.isToday && styles.recruitmentDeadlineToday,
                    recruitmentDeadline.isClosed && styles.recruitmentDeadlineClosed,
                  )}
                >
                  {recruitmentDeadline.label}
                </span>
              )}
            </div>

            <h3 className={clsx(styles.cardTitle, styles.compactTitle)}>
              {schedule?.title ?? "제목 없는 일정"}
            </h3>
            <p className={styles.compactDescription}>{compactDescription}</p>

            <div className={styles.compactInfoList}>
              {schedulePeriodText && (
                <span className={styles.compactInfoItem}>{schedulePeriodText}</span>
              )}
              <span className={styles.compactInfoItem}>{genderLimitText}</span>
              <span className={styles.compactInfoItem}>{costTypeText}</span>
            </div>
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
              {recruitmentDeadline && (
                <span
                  className={clsx(
                    styles.recruitmentDeadlineBadge,
                    recruitmentDeadline.isToday && styles.recruitmentDeadlineToday,
                    recruitmentDeadline.isClosed && styles.recruitmentDeadlineClosed,
                  )}
                >
                  {recruitmentDeadline.label}
                </span>
              )}
            </div>

            <h3 className={styles.cardTitle}>
              {schedule?.title ?? "제목 없는 일정"}
            </h3>

            <div className={styles.participantRow}>
              <GroupIcon fontSize="small" className={styles.metaIcon} />
              <span className={styles.participantText}>{participantText}</span>
            </div>

            <div className={styles.metaList}>
              {schedulePeriodText && (
                <span className={styles.metaItem}>
                  <CalendarTodayIcon fontSize="small" className={styles.metaIcon} />
                  <span className={styles.metaText}>{schedulePeriodText}</span>
                </span>
              )}
              <span className={styles.metaItem}>
                <EventBusyIcon fontSize="small" className={styles.metaIcon} />
                <span className={styles.metaText}>
                  {recruitmentDeadline?.label ?? "모집 종료일 미정"}
                </span>
              </span>
              <span className={styles.metaItem}>
                <WcIcon fontSize="small" className={styles.metaIcon} />
                <span className={styles.metaText}>{genderLimitText}</span>
              </span>
              <span className={styles.metaItem}>
                <PaidIcon fontSize="small" className={styles.metaIcon} />
                <span className={styles.metaText}>{costTypeText}</span>
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

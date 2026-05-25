import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { dayjs, getDDay } from "../../../shared/lib/dateUtile";
import styles from "./ScheduleCard.module.css";

const GENDER_LIMIT_LABELS = {
  all: "성별무관",
  male: "남자만",
  female: "여자만",
};

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

const isDefaultThumbnail = (src) => src === defaultThumbnail;

const resolveGenderLimitLabel = (genderLimit) =>
  GENDER_LIMIT_LABELS[
    String(genderLimit ?? "")
      .trim()
      .toLowerCase()
  ] ?? "전체";

const resolveCategoryLabel = (category) =>
  CATEGORY_LABELS[
    String(category ?? "")
      .trim()
      .toLowerCase()
  ] ?? "기타";

const resolveRegionLabel = (region) => region?.trim() || "지역 미정";

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

const resolveDeadlineDate = (schedule) =>
  schedule?.recruitEndDate ??
  schedule?.recruit_end_date ??
  schedule?.startDate ??
  schedule?.start_date ??
  null;

const resolvePeriodLines = (startDate, endDate) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  if (!start.isValid() && !end.isValid()) {
    return ["일정 미정"];
  }

  if (start.isValid() && !end.isValid()) {
    return [start.format("YYYY.MM.DD")];
  }

  if (!start.isValid() && end.isValid()) {
    return [end.format("YYYY.MM.DD")];
  }

  if (start.isSame(end, "day")) {
    return [start.format("YYYY.MM.DD")];
  }

  return [start.format("YYYY.MM.DD"), `~ ${end.format("YYYY.MM.DD")}`];
};

export default function ScheduleCard({
  schedule,
  className,
  variant = "default",
}) {
  const navigate = useNavigate();
  const thumbnailSrc = resolveThumbnail(schedule);
  const isFallbackThumbnail = isDefaultThumbnail(thumbnailSrc);
  const deadline = resolveDeadline(resolveDeadlineDate(schedule));
  const isCompact = variant === "compact";
  const descriptionText =
    schedule?.description?.trim() || "일정 소개가 아직 등록되지 않았어요.";
  const categoryLabel = resolveCategoryLabel(schedule?.category);
  const regionLabel = resolveRegionLabel(schedule?.region);
  const genderLabel = resolveGenderLimitLabel(schedule?.genderLimit);
  const periodLines = resolvePeriodLines(schedule?.startDate, schedule?.endDate);

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
              isCompact && styles.deadlineBadgeCompact
            )}
          >
            {deadline.label}
          </span>

          <div className={styles.infoStack}>
            <span className={clsx(styles.infoLine, isCompact && styles.infoLineCompact)}>
              <span className={styles.infoText}>{genderLabel}</span>
            </span>
            <span className={clsx(styles.infoLine, isCompact && styles.infoLineCompact)}>
              <span
                className={clsx(
                  styles.infoText,
                  styles.periodText,
                  periodLines.length > 1 && styles.periodTextMultiline
                )}
              >
                {periodLines.map((line) => (
                  <span key={line} className={styles.periodLine}>
                    {line}
                  </span>
                ))}
              </span>
            </span>
            <span className={clsx(styles.infoLine, isCompact && styles.infoLineCompact)}>
              <span className={styles.infoText}>{regionLabel}</span>
            </span>
          </div>
        </div>

        <div className={styles.bodySection}>
          <div className={styles.metaRow}>
            <span className={styles.categoryTag}>{categoryLabel}</span>
          </div>

          <h3
            className={clsx(
              styles.cardTitle,
              isCompact && styles.cardTitleCompact
            )}
          >
            {schedule?.title ?? "제목 없는 일정"}
          </h3>
          <p
            className={clsx(
              styles.cardDescription,
              isCompact && styles.cardDescriptionCompact
            )}
          >
            {descriptionText}
          </p>
        </div>
      </div>

      <div className={styles.ticketDivider} aria-hidden="true" />

      <div
        className={clsx(
          styles.cardBottom,
          isCompact && styles.cardBottomCompact
        )}
      >
        <div
          className={clsx(
            styles.thumbnailWrap,
            isCompact && styles.thumbnailWrapCompact
          )}
        >
          <img
            src={thumbnailSrc}
            alt={schedule?.title ?? "일정 썸네일"}
            className={clsx(
              styles.thumbnail,
              isFallbackThumbnail && styles.thumbnailFallback
            )}
            onError={handleImageError}
          />
        </div>
      </div>
    </article>
  );
}

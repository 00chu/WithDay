import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import { dayjs, getDDay } from "../../../shared/lib/dateUtile";
import styles from "./ScheduleCard.module.css";

/*
 * ScheduleCard는 홈 탭과 탐색 탭이 공유하는 일정 카드 컴포넌트다.
 * 페이지별 레이아웃은 className/variant로만 조정하고, 카드 내부의 데이터 해석과 표시 규칙은 이 파일에 모아둔다.
 */
const GENDER_LIMIT_LABELS = {
  all: "남·녀",
  male: "남",
  female: "여",
};

const CATEGORY_LABELS = {
  travel: "여행",
  popup: "팝업",
  food: "식사",
  activity: "액티비티",
  culture: "문화",
  etc: "기타",
};

const COST_TYPE_LABELS = {
  per_person: "총액 1/N",
  host_covered: "호스트 부담",
  free: "무료",
  custom: "인당 고정",
};

const defaultThumbnail = "/hero.png";

/*
 * 백엔드 응답 필드가 화면별로 조금씩 다를 수 있어 가능한 썸네일 후보를 순서대로 확인한다.
 * 최종 fallback을 고정 이미지로 두면 이미지가 없는 일정도 카드 레이아웃이 깨지지 않는다.
 */
const resolveThumbnail = (schedule) =>
  schedule?.thumbnailImage?.trim() ||
  schedule?.thumbnail?.trim() ||
  schedule?.imageUrl?.trim() ||
  defaultThumbnail;

const isDefaultThumbnail = (src) => src === defaultThumbnail;

// DB/API 값은 영문 코드이고, 카드에는 사용자가 읽기 쉬운 한글 라벨을 보여준다.
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

/*
 * 모집 마감일을 카드 좌측 배지로 변환한다.
 * getDDay는 날짜 차이를 D-n/D-Day/마감으로 계산하고, 여기서는 배지 색상에 필요한 boolean까지 함께 만든다.
 */
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

/*
 * 일정 리스트 응답은 recruitEndDate camelCase를 주지만, 일부 이전 응답이나 매퍼는 snake_case를 줄 수 있다.
 * 카드가 두 형태를 모두 이해하면 백엔드 응답 전환 중에도 화면이 덜 깨진다.
 */
const resolveDeadlineDate = (schedule) =>
  schedule?.recruitEndDate ??
  schedule?.recruit_end_date ??
  schedule?.startDate ??
  schedule?.start_date ??
  null;

/*
 * 카드 상단 날짜는 요청된 카드 전용 형식 MM.DD(ddd)로 고정한다.
 * 하루 일정은 한 줄, 여러 날 일정은 두 줄을 유지해 우측 정렬 레이아웃에서 줄바꿈을 예측 가능하게 만든다.
 */
const resolvePeriodLines = (startDate, endDate) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const formatCardDate = (value) => value.format("MM.DD(ddd)");

  if (!start.isValid() && !end.isValid()) {
    return ["일정 미정"];
  }

  if (start.isValid() && !end.isValid()) {
    return [formatCardDate(start)];
  }

  if (!start.isValid() && end.isValid()) {
    return [formatCardDate(end)];
  }

  if (start.isSame(end, "day")) {
    return [formatCardDate(start)];
  }

  return [formatCardDate(start), `~ ${formatCardDate(end)}`];
};

const resolveParticipantsLabel = (currentParticipants, maxParticipants) => {
  const current = Number.isFinite(Number(currentParticipants))
    ? Number(currentParticipants)
    : 0;
  const max = Number.isFinite(Number(maxParticipants))
    ? Number(maxParticipants)
    : 0;

  return `${current} / ${max}명`;
};

const resolveCostMeta = (costType, totalPrice) => {
  const typeLabel =
    COST_TYPE_LABELS[
      String(costType ?? "")
        .trim()
        .toLowerCase()
    ] ?? "비용 미정";

  if (totalPrice === null || totalPrice === undefined || totalPrice === "") {
    return {
      typeLabel,
      amountLabel: "금액 미정",
    };
  }

  const parsedPrice = Number(totalPrice);

  if (!Number.isFinite(parsedPrice)) {
    return {
      typeLabel,
      amountLabel: "금액 미정",
    };
  }

  return {
    typeLabel,
    amountLabel: `${parsedPrice.toLocaleString("ko-KR")}원`,
  };
};

export default function ScheduleCard({
  schedule,
  className,
  variant = "default",
}) {
  const navigate = useNavigate();

  /*
   * ScheduleCard에 전달되는 핵심 props:
   * - schedule: 백엔드 리스트 API에서 받은 일정 데이터
   * - variant: 홈 레일(compact)과 탐색 그리드(default)의 밀도 차이
   * - className: 페이지가 카드 외부 배치만 보강할 때 사용
   */
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
  const participantsLabel = resolveParticipantsLabel(
    schedule?.currentParticipants,
    schedule?.maxParticipants
  );
  const costMeta = resolveCostMeta(schedule?.costType, schedule?.totalPrice);
  const isBookmarked = Boolean(schedule?.isBookmarked);
  const BookmarkIcon = isBookmarked
    ? FavoriteRoundedIcon
    : FavoriteBorderRoundedIcon;

  /*
   * 카드 전체를 클릭 가능한 article로 처리한다.
   * 마우스 클릭뿐 아니라 Enter/Space 키도 지원해 키보드 접근성을 유지한다.
   */
  const handleCardClick = () => navigate(`/schedule/${schedule.id}`);

  /*
   * 외부 이미지가 삭제되었거나 URL이 깨진 경우 기본 이미지를 다시 넣는다.
   * onerror 루프를 막기 위해 핸들러를 먼저 null로 바꾼 뒤 fallback src를 지정한다.
   */
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
        <div className={styles.headerSection}>
          <div className={clsx(styles.infoRow, styles.topRow)}>
            <div className={styles.rowLeft}>
              <span
                className={clsx(styles.regionPill, isCompact && styles.regionPillCompact)}
              >
                {regionLabel}
              </span>
              <span
                className={clsx(styles.categoryPill, isCompact && styles.categoryPillCompact)}
              >
                {categoryLabel}
              </span>
            </div>
            <div className={styles.rowRight}>
              <span
                className={clsx(styles.softPill, styles.genderPill, isCompact && styles.softPillCompact)}
              >
                {genderLabel}
              </span>
              <span className={clsx(styles.metaText, isCompact && styles.metaTextCompact)}>
                {participantsLabel}
              </span>
              {/*
               * 카드의 하트는 액션 버튼이 아니라 "현재 저장 상태를 읽는 시각 신호"다.
               * 상세 화면에서만 토글하므로 여기서는 pointer-events를 끄고 아이콘 전환만 반영한다.
               */}
              <span
                className={clsx(
                  styles.bookmarkIndicator,
                  isBookmarked && styles.bookmarkIndicatorActive
                )}
                aria-label={isBookmarked ? "위시리스트에 저장된 일정" : "위시리스트에 저장되지 않은 일정"}
              >
                <BookmarkIcon className={styles.bookmarkIcon} />
              </span>
            </div>
          </div>

          <div className={clsx(styles.infoRow, styles.middleRow)}>
            <div className={styles.rowLeft}>
              <span
                className={clsx(
                  styles.softPill,
                  deadline.isToday && styles.deadlinePillToday,
                  deadline.isClosed && styles.deadlinePillClosed,
                  isCompact && styles.softPillCompact
                )}
              >
                {deadline.label}
              </span>
            </div>
            <div className={clsx(styles.rowRight, styles.dateGroup)}>
              <span
                className={clsx(
                  styles.dateText,
                  periodLines.length > 1 && styles.dateTextMultiline,
                  isCompact && styles.dateTextCompact
                )}
              >
                {periodLines.map((line) => (
                  <span key={line} className={styles.periodLine}>
                    {line}
                  </span>
                ))}
              </span>
            </div>
          </div>

          <div className={clsx(styles.infoRow, styles.contentRow)}>
            <div className={styles.rowLeft}>
              <h3
                className={clsx(
                  styles.cardTitle,
                  isCompact && styles.cardTitleCompact
                )}
              >
                {schedule?.title ?? "제목 없는 일정"}
              </h3>
            </div>
            <div className={clsx(styles.rowRight, styles.costGroup)}>
              <span className={clsx(styles.costText, isCompact && styles.costTextCompact)}>
                <span className={styles.costTypeLine}>{costMeta.typeLabel}</span>
                <span className={styles.costAmountLine}>{costMeta.amountLabel}</span>
              </span>
            </div>
          </div>
        </div>

        <p
          className={clsx(
            styles.cardDescription,
            isCompact && styles.cardDescriptionCompact
          )}
        >
          {descriptionText}
        </p>
      </div>

      <div className={styles.ticketDivider} aria-hidden="true" />

      <div
        className={clsx(
          styles.cardBottom,
          isCompact && styles.cardBottomCompact
        )}
      >
        {/*
         * 썸네일 영역의 실제 비율은 CSS module의 aspect-ratio가 담당한다.
         * 이미지 태그는 width/height 100%와 object-fit으로 박스를 채우기만 한다.
         */}
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

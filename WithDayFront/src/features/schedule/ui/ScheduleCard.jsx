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
 * 카드 우측 날짜 영역은 좁은 화면에서 잘리지 않도록 시작일/종료일을 줄 단위로 나눈다.
 * 하루 일정은 한 줄만 보여주고, 여러 날 일정은 "시작일"과 "~ 종료일" 두 줄로 표시한다.
 */
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
        <div className={styles.headerRow}>
          {/*
           * 좌측 배지는 모집 마감 상태를 빠르게 보여준다.
           * deadline 상태에 따라 today/closed 클래스를 조합해 같은 DOM 구조에서 색상만 바꾼다.
           */}
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

          {/*
           * 우측 정보 스택은 성별 조건, 일정 기간, 지역을 오른쪽 정렬로 보여준다.
           * 날짜는 periodLines를 map으로 렌더링해 모바일에서도 긴 "start ~ end" 문자열이 한 줄로 잘리지 않게 한다.
           */}
          <div className={styles.headerRight}>
            {/*
             * 카드의 하트는 액션 버튼이 아니라 "현재 저장 상태를 빠르게 읽는 배지"다.
             * 실제 토글은 상세 화면에서만 허용하므로 pointer-events를 끄고 카드 클릭 동선과 충돌하지 않게 둔다.
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

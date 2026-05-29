import { memo, useMemo } from "react";
import clsx from "clsx";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditCalendarOutlinedIcon from "@mui/icons-material/EditCalendarOutlined";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import Button from "../../../../shared/ui/Button/Button";
import styles from "./JoinedScheduleCard.module.css";

const resolvePrimaryAction = (item) => {
  if (item.myRole === "host") {
    return {
      key: "manage",
      label: "일정 관리",
      variant: "primary",
      icon: EditCalendarOutlinedIcon,
    };
  }

  if (item.dbStatus === "APPROVED") {
    return {
      key: "detail",
      label: "상세보기",
      variant: "accent",
      icon: VisibilityOutlinedIcon,
    };
  }

  if (item.dbStatus === "PENDING") {
    return {
      key: "cancel",
      label: "신청 취소",
      variant: "outline",
      icon: CloseRoundedIcon,
      destructive: true,
    };
  }

  if (item.dbStatus === "REJECTED" || item.dbStatus === "KICKED") {
    return {
      key: "delete",
      label: "내역 삭제",
      variant: "outline",
      icon: DeleteOutlineOutlinedIcon,
      destructive: true,
    };
  }

  return {
    key: "detail",
    label: "상세보기",
    variant: "outline",
    icon: VisibilityOutlinedIcon,
  };
};

const resolveSecondaryAction = (item) => {
  if (item.myRole === "host") {
    return null;
  }

  if (item.dbStatus === "PENDING") {
    return {
      key: "detail",
      label: "상세보기",
      variant: "accent",
      icon: VisibilityOutlinedIcon,
    };
  }

  return null;
};

const resolveStatusLabel = (item) => {
  if (item.myRole === "host") return "호스트";
  if (item.dbStatus === "APPROVED") return "참여 확정";
  if (item.dbStatus === "PENDING") return "승인 대기";
  if (item.dbStatus === "CANCELED") return "참여 취소";
  if (item.dbStatus === "REJECTED") return "거절됨";
  if (item.dbStatus === "KICKED") return "강퇴됨";
  return "상태 없음";
};

function JoinedScheduleCard({ item, onAction, isActionLoading = false }) {
  const primaryAction = useMemo(() => resolvePrimaryAction(item), [item]);
  const secondaryAction = useMemo(() => resolveSecondaryAction(item), [item]);

  const renderActionButton = (action) => {
    if (!action) {
      return null;
    }

    const ActionIcon = action.icon;

    return (
      <Button
        key={action.key}
        variant={action.variant}
        size="md"
        className={clsx(styles.actionButton, {
          [styles.primaryButton]: action.key === "detail",
          [styles.manageButton]: action.key === "manage",
          [styles.dangerButton]: action.destructive,
        })}
        disabled={isActionLoading}
        onClick={(event) => {
          event.stopPropagation();
          onAction(item, action.key);
        }}
        aria-label={`${item.title} ${action.label}`}
      >
        <ActionIcon fontSize="small" />
        {action.label}
      </Button>
    );
  };

  return (
    <article
      className={clsx(styles.card, {
        [styles.cardDisabled]:
          item.dbStatus === "REJECTED" || item.dbStatus === "KICKED",
      })}
      aria-label={`${item.title} 일정 카드`}
    >
      <div className={styles.thumbnailWrap}>
        {item.hasThumbnail ? (
          <img
            src={item.thumbnailSrc}
            alt={`${item.title} 썸네일`}
            className={styles.thumbnail}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src = "/hero.png";
            }}
          />
        ) : (
          <div className={styles.thumbnailPlaceholder} aria-hidden="true">
            <span>wit</span>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.topRow}>
          <div className={styles.badgeGroup}>
            <span className={styles.categoryBadge}>{item.category}</span>
            <span className={styles.dDayBadge}>{item.dDay}</span>
            <span
              className={clsx(
                styles.phaseBadge,
                styles[`phase-${item.schedulePhaseTone}`]
              )}
            >
              {item.schedulePhase}
            </span>
            <span
              className={clsx(
                styles.statusBadge,
                styles[`status-${item.participationStatusTone}`]
              )}
            >
              {resolveStatusLabel(item)}
            </span>
          </div>

          <span className={styles.locationPill}>
            <PlaceRoundedIcon fontSize="small" />
            {item.location}
          </span>
        </div>

        <div className={styles.titleBlock}>
          <h3 className={styles.title}>{item.title}</h3>
        </div>

        <dl className={styles.infoList}>
          <div className={styles.infoItem}>
            <dt className={styles.infoLabel}>
              <CalendarTodayRoundedIcon fontSize="small" />
            </dt>
            <dd className={styles.infoValue}>{item.date}</dd>
          </div>
          <div className={styles.infoItem}>
            <dt className={styles.infoLabel}>
              <Groups2RoundedIcon fontSize="small" />
            </dt>
            <dd className={styles.infoValue}>
              모집된 인원 : {item.currentPeople} / {item.maxPeople}
            </dd>
          </div>
        </dl>

        <div className={styles.actions}>
          {renderActionButton(primaryAction)}
          {renderActionButton(secondaryAction)}
        </div>
      </div>
    </article>
  );
}

export default memo(JoinedScheduleCard);

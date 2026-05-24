import { memo, useCallback } from "react";
import clsx from "clsx";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditCalendarOutlinedIcon from "@mui/icons-material/EditCalendarOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import PlaceIcon from "@mui/icons-material/Place";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import Button from "../../../../shared/ui/Button/Button";
import {
  getParticipationStatusMeta,
} from "../../model/constants";
import styles from "../Participation.module.css";

const ACTION_ICON_MAP = {
  manage: EditCalendarOutlinedIcon,
  view: VisibilityOutlinedIcon,
  cancel: CancelOutlinedIcon,
  delete: DeleteOutlineOutlinedIcon,
  disabled: BlockOutlinedIcon,
};

function ParticipationCard({ item, onAction, isActionLoading = false }) {
  const meta = getParticipationStatusMeta(item.dbStatus, item.myRole);
  const ActionIcon = ACTION_ICON_MAP[meta.actionType] ?? BlockOutlinedIcon;

  const handleClick = useCallback(() => {
    onAction(item);
  }, [item, onAction]);

  return (
    <div
      className={clsx(styles.card, {
        [styles.cardDisabled]: meta.cardDisabled,
      })}
    >
      <div className={styles.cardHeader}>
        <div className={styles.tags}>
          <span className={styles.categoryBadge}>{item.category}</span>
          <span className={styles.dDayBadge}>{item.dDay}</span>
          <span className={styles.phaseBadge}>{item.schedulePhase}</span>
          <span className={clsx(styles.statusBadge, styles[meta.badgeClass])}>
            {meta.badgeText}
          </span>
        </div>

        <span className={styles.location}>
          <PlaceIcon fontSize="small" className={styles.inlineIcon} />
          {item.location}
        </span>
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{item.title}</h3>
        <div className={styles.cardDate}>
          <CalendarTodayIcon fontSize="small" className={styles.inlineIcon} />
          {item.date}
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.cardFooter}>
        <div className={styles.peopleInfo}>
          <PeopleOutlineOutlinedIcon
            fontSize="small"
            className={styles.inlineIcon}
          />
          모집 인원{" "}
          <span className={styles.highlight}>{item.currentPeople}</span> /{" "}
          {item.maxPeople}
        </div>

        <Button
          variant={meta.buttonVariant}
          size="sm"
          className={clsx(styles.actionBtn, {
            [styles.pendingBtn]: meta.actionType === "disabled",
          })}
          disabled={meta.isDisabled || isActionLoading}
          onClick={handleClick}
        >
          <ActionIcon fontSize="small" />
          {meta.buttonText}
        </Button>
      </div>
    </div>
  );
}

export default memo(ParticipationCard);

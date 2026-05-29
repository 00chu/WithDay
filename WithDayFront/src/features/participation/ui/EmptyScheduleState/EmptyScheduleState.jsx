import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import Button from "../../../../shared/ui/Button/Button";
import styles from "./EmptyScheduleState.module.css";

function EmptyScheduleState({ title, description, actionLabel, onAction }) {
  return (
    <div className={styles.emptyState} role="status" aria-live="polite">
      <div className={styles.iconWrap} aria-hidden="true">
        <ExploreOutlinedIcon />
      </div>
      <strong className={styles.title}>{title}</strong>
      <p className={styles.description}>{description}</p>
      {onAction ? (
        <Button
          variant="accent"
          size="md"
          className={styles.actionButton}
          onClick={onAction}
          aria-label={actionLabel}
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export default EmptyScheduleState;

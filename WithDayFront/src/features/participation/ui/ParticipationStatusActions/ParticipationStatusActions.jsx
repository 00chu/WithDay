import Button from "../../../../shared/ui/Button/Button";
import styles from "../HostParticipationList/HostParticipationList.module.css";

const ACTIONS_BY_STATUS = {
  PENDING: [
    {
      label: "승인",
      status: "APPROVED",
      variant: "accent",
    },
    {
      label: "거절",
      status: "REJECTED",
      variant: "outline",
    },
  ],
  APPROVED: [
    {
      label: "추방 하기",
      status: "CANCELLED",
      variant: "outline",
    },
  ],
};

function ParticipationStatusActions({
  participationId,
  scheduleId,
  email,
  status,
  disabled = false,
  onAction,
}) {
  const actions = ACTIONS_BY_STATUS[status] ?? [];

  if (actions.length === 0) {
    return (
      <span className={styles.actionNote}>변경 가능한 상태가 아닙니다.</span>
    );
  }

  return (
    <div className={styles.actionGroup}>
      {actions.map((action) => (
        <Button
          key={action.status}
          type="button"
          variant={action.variant}
          size="sm"
          disabled={disabled}
          onClick={() =>
            onAction({
              participationId,
              scheduleId,
              email,
              status: action.status,
              reason: "",
            })
          }
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}

export default ParticipationStatusActions;

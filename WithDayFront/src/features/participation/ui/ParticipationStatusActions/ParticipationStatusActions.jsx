import Button from "../../../../shared/ui/Button/Button";
import styles from "../HostParticipationList/HostParticipationList.module.css";

/*
 * 호스트가 신청자 상태별로 수행할 수 있는 액션 목록이다.
 * PENDING은 승인/거절이 가능하고, APPROVED는 승인 취소(CANCELLED)만 가능하다.
 * 이 UI 규칙은 사용자가 가능한 버튼만 보게 하기 위한 것이며, 최종 상태 전이 검증은 백엔드 enum 규칙에서 다시 수행한다.
 */
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

  /*
   * 이미 거절/취소/강퇴된 상태는 화면에서 더 이상 바꿀 수 있는 액션을 제공하지 않는다.
   * 버튼을 숨기는 대신 안내 문구를 보여줘 호스트가 "왜 버튼이 없는지" 이해할 수 있게 한다.
   */
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
            /*
             * 카드 컴포넌트는 UI 이벤트만 만들고, 실제 API 호출은 ScheduleDetail의 handleApplicantAction으로 올린다.
             * 상위에서 확인창, mutation, 토스트, 캐시 무효화를 한 번에 관리하기 위해서다.
             */
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

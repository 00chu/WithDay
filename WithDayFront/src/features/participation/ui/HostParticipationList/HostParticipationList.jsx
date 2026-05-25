import clsx from "clsx";
import Button from "../../../../shared/ui/Button/Button";
import { HOST_APPLICANT_STATUS_FILTERS } from "../../model/constants";
import HostParticipationCard from "../HostParticipationCard/HostParticipationCard";
import styles from "./HostParticipationList.module.css";
import participationStyles from "../Participation.module.css";

/*
 * 일정 상세 페이지에서 호스트에게만 보이는 신청자 관리 영역이다.
 * 목록 조회, 상태 필터, 신청자 카드 렌더링을 담당하고 실제 승인/거절 API 호출은 상위 ScheduleDetail로 위임한다.
 */
function HostParticipationList({
  items,
  loading,
  errorMessage,
  emptyMessage,
  hostEmail,
  onItemAction,
  activeStatus,
  onStatusChange,
  isActionLoading = false,
}) {
  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <h2 className={styles.title}>신청자 관리</h2>
          <p className={styles.description}>신청자 목록을 불러오는 중입니다.</p>
        </div>
        <div className={participationStyles.stateBox}>
          신청자 목록을 불러오는 중입니다.
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <h2 className={styles.title}>신청자 관리</h2>
          <p className={styles.description}>
            호스트 전용 신청자 관리 영역입니다.
          </p>
        </div>
        <div className={clsx(participationStyles.stateBox, participationStyles.errorState)}>
          {errorMessage}
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>신청자 관리</h2>
        <p className={styles.description}>
          현재 일정에 신청한 사용자를 확인하고 상태를 변경할 수 있습니다.
        </p>
      </div>

      <div className={styles.filterGroup}>
        {HOST_APPLICANT_STATUS_FILTERS.map((filter) => (
          /*
           * 필터를 바꾸면 ScheduleDetail의 applicantStatus가 바뀌고,
           * react-query key에 status가 포함되어 해당 상태의 신청자 목록을 다시 조회한다.
           */
          <Button
            key={filter.value}
            type="button"
            variant={activeStatus === filter.value ? "accent" : "outline"}
            size="sm"
            onClick={() => onStatusChange(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {!items || items.length === 0 ? (
        <div className={participationStyles.stateBox}>{emptyMessage}</div>
      ) : (
        <div className={participationStyles.listContainer}>
          {items.map((item) => (
            <HostParticipationCard
              key={item.participationId}
              item={item}
              hostEmail={hostEmail}
              onAction={onItemAction}
              isActionLoading={isActionLoading}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default HostParticipationList;

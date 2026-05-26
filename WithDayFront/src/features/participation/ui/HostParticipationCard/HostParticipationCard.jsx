import clsx from "clsx";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import { PARTICIPATION_STATUS_META } from "../../model/constants";
import ParticipationStatusActions from "../ParticipationStatusActions/ParticipationStatusActions";
import styles from "../Participation.module.css";
import hostStyles from "../HostParticipationList/HostParticipationList.module.css";

/*
 * 호스트가 일정 상세 화면에서 신청자 한 명을 관리할 때 보는 카드다.
 * ParticipationCard가 "내 일정" 관점의 카드라면,
 * 이 컴포넌트는 "호스트가 다른 사용자를 심사/관리"하는 관점의 카드다.
 *
 * 화면 흐름:
 * 1. useScheduleApplicantsQuery가 신청자 목록 조회
 * 2. mapper가 applicant row를 정규화
 * 3. HostParticipationList가 목록을 순회
 * 4. 이 카드가 신청자별 배지/버튼을 렌더링
 * 5. 버튼 클릭 시 onAction으로 ScheduleDetail에 이벤트 전달
 * 일정 상세 페이지에서 호스트가 보는 신청자 카드다.
 * 신청자 개인정보 표시와 상태별 액션 버튼 렌더링을 담당하고,
 * 실제 승인/거절 API 호출은 ScheduleDetail의 handleApplicantAction으로 위임한다.
 */
function HostParticipationCard({
  item,
  hostEmail,
  onAction,
  isActionLoading,
  isReadOnly = false,
}) {
  /*
   * 신청자 카드도 상태별로 배지 색과 문구가 달라져야 하므로,
   * 참여 카드와 같은 메타 사전을 재사용한다.
   * 이 덕분에 같은 상태(PENDING, APPROVED 등)는 화면 위치가 달라도 일관된 색/텍스트를 유지한다.
   *
   * 신청자의 현재 상태에 맞는 배지 문구와 색상을 가져온다.
   * 알 수 없는 상태가 내려와도 default 메타를 사용해 화면이 깨지지 않게 한다.
   */
  const meta = PARTICIPATION_STATUS_META[item.status] ?? PARTICIPATION_STATUS_META.default;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.tags}>
          <span className={styles.categoryBadge}>신청자</span>
          <span className={clsx(styles.statusBadge, styles[meta.badgeClass])}>
            {meta.badgeText}
          </span>
        </div>

        <span className={styles.location}>
          <PersonOutlineOutlinedIcon fontSize="small" className={styles.inlineIcon} />
          {item.nickname}
        </span>
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{item.nickname}</h3>
        <div className={styles.cardDate}>
          <EmailOutlinedIcon fontSize="small" className={styles.inlineIcon} />
          {item.email}
        </div>
        <div className={hostStyles.meta}>
          <AccessTimeOutlinedIcon fontSize="small" className={styles.inlineIcon} />
          신청일 {item.createdAt || "-"}
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.cardFooter}>
        <div className={hostStyles.actionNote}>
          <AccessTimeOutlinedIcon fontSize="small" className={styles.inlineIcon} />
          상태 변경은 호스트만 가능합니다.
        </div>

        {/*
         * 이 하위 컴포넌트는 현재 상태에 따라 어떤 버튼을 보여줄지를 결정한다.
         * 예를 들어 PENDING이면 승인/거절, APPROVED면 강퇴 버튼이 나온다.
         *
         * 버튼 클릭 이후 실제 체인은 아래와 같다.
         * - ParticipationStatusActions onAction 호출
         * - ScheduleDetail.handleApplicantAction 실행
         * - useUpdateParticipationStatusMutation 호출
         * - 성공 시 applicants / mySchedules / schedule-detail 캐시 invalidate
         *
         * 버튼 목록은 ParticipationStatusActions가 상태별로 결정한다.
         * hostEmail은 백엔드에서 "이 요청자가 일정 호스트인지" 검증할 때 사용되므로 액션 payload에 포함한다.
         */}
        <ParticipationStatusActions
          participationId={item.participationId}
          scheduleId={item.scheduleId}
          email={hostEmail}
          status={item.status}
          disabled={isActionLoading}
          isReadOnly={isReadOnly}
          onAction={onAction}
        />
      </div>
    </div>
  );
}

export default HostParticipationCard;

import clsx from "clsx";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import { PARTICIPATION_STATUS_META } from "../../model/constants";
import ParticipationStatusActions from "../ParticipationStatusActions/ParticipationStatusActions";
import styles from "../Participation.module.css";
import hostStyles from "../HostParticipationList/HostParticipationList.module.css";

/*
 * 일정 상세 페이지에서 호스트가 보는 신청자 카드다.
 * 신청자 개인정보 표시와 상태별 액션 버튼 렌더링을 담당하고,
 * 실제 승인/거절 API 호출은 ScheduleDetail의 handleApplicantAction으로 위임한다.
 */
function HostParticipationCard({ item, hostEmail, onAction, isActionLoading }) {
  /*
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
         * 버튼 목록은 ParticipationStatusActions가 상태별로 결정한다.
         * hostEmail은 백엔드에서 "이 요청자가 일정 호스트인지" 검증할 때 사용되므로 액션 payload에 포함한다.
         */}
        <ParticipationStatusActions
          participationId={item.participationId}
          scheduleId={item.scheduleId}
          email={hostEmail}
          status={item.status}
          disabled={isActionLoading}
          onAction={onAction}
        />
      </div>
    </div>
  );
}

export default HostParticipationCard;

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

/*
 * 내 일정 페이지에서 참여중/신청중/호스팅 탭의 각 일정을 보여주는 카드다.
 * 이 컴포넌트는 화면 표시와 버튼 클릭 이벤트 전달만 담당하고,
 * 실제 취소/삭제/상세 이동 분기는 MySchedulePage의 handleScheduleAction에서 처리한다.
 */
function ParticipationCard({ item, onAction, isActionLoading = false }) {
  /*
   * dbStatus(PENDING, APPROVED, REJECTED 등)와 myRole(host/participant)을 조합해
   * 카드 배지, 버튼 문구, 버튼 종류, 비활성 여부를 결정한다.
   * 상태 해석을 constants에 모아둔 이유는 카드 UI가 상태 분기 로직으로 길어지는 것을 막기 위해서다.
   */
  const meta = getParticipationStatusMeta(item.dbStatus, item.myRole);
  const ActionIcon = ACTION_ICON_MAP[meta.actionType] ?? BlockOutlinedIcon;

  /*
   * 카드 버튼을 누르면 item 전체를 상위로 넘긴다.
   * 상위 페이지는 item.dbStatus와 item.myRole을 보고 상세 이동, 신청 취소, 내역 삭제 중 하나를 선택한다.
   */
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
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

        {/*
         * mutation이 진행 중일 때는 같은 참여 내역에 대한 중복 요청을 막기 위해 버튼을 비활성화한다.
         * meta.isDisabled는 상태상 액션이 불가능한 경우이고, isActionLoading은 네트워크 요청 중인 경우다.
         */}
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

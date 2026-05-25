import { memo } from "react";
import clsx from "clsx";
import ParticipationCard from "../ParticipationCard/ParticipationCard";
import styles from "../Participation.module.css";

/*
 * 내 일정 페이지의 리스트 상태를 담당하는 컴포넌트다.
 * loading/error/empty/data 상태를 한 곳에서 처리해서 MySchedulePage는 데이터 조회와 액션 분기에만 집중하게 한다.
 */
function ParticipationList({
  items,
  loading,
  errorMessage,
  emptyMessage,
  onItemAction,
  isActionLoading = false,
}) {
  /*
   * react-query가 데이터를 불러오는 동안 보여주는 상태다.
   * 기존 목록을 억지로 렌더링하지 않고 로딩 문구를 보여줘 사용자가 탭 변경/초기 진입 상태를 구분할 수 있게 한다.
   */
  if (loading) {
    return (
      <div className={styles.listContainer}>
        <div className={styles.stateBox}>
          내 일정 정보를 불러오는 중입니다.
        </div>
      </div>
    );
  }

  /*
   * API 오류는 리스트 내부에서 카드 대신 표시한다.
   * 페이지 전체를 깨지 않게 하면 탭이나 다른 UI는 유지되고, 사용자는 실패 원인을 해당 영역에서 바로 볼 수 있다.
   */
  if (errorMessage) {
    return (
      <div className={styles.listContainer}>
        <div className={clsx(styles.stateBox, styles.errorState)}>
          {errorMessage}
        </div>
      </div>
    );
  }

  /*
   * 조회는 성공했지만 현재 탭에 보여줄 일정이 없는 상태다.
   * emptyMessage는 로그인 여부나 탭 종류에 따라 상위에서 결정한다.
   */
  if (!items || items.length === 0) {
    return (
      <div className={styles.listContainer}>
        <div className={styles.stateBox}>{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className={styles.listContainer}>
      {items.map((item) => (
        /*
         * 각 카드의 버튼 클릭은 onItemAction으로 올린다.
         * 리스트는 반복 렌더링만 담당하고, 신청 취소/삭제 같은 도메인 액션은 상위 페이지가 처리한다.
         */
        <ParticipationCard
          key={item.id}
          item={item}
          onAction={onItemAction}
          isActionLoading={isActionLoading}
        />
      ))}
    </div>
  );
}

export default memo(ParticipationList);

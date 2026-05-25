import { memo } from "react";
import clsx from "clsx";
import Button from "../../../../shared/ui/Button/Button";
import styles from "../Participation.module.css";

/*
 * 내 일정 페이지의 참여 탭 버튼 묶음이다.
 * 탭 정의(PARTICIPATION_TABS)는 model/constants에 두고, 이 컴포넌트는 현재 탭 표시와 탭 변경 이벤트만 담당한다.
 */
function ParticipationTabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className={styles.tabWrap}>
      {tabs.map((tab) => (
        /*
         * activeTab과 tab.value가 같으면 active 스타일을 붙인다.
         * 실제 목록 필터링은 MySchedulePage가 activeTab으로 currentItems를 선택하면서 처리한다.
         */
        <Button
          key={tab.value}
          variant="outline"
          size="md"
          className={clsx(styles.tabBtn, {
            [styles.active]: activeTab === tab.value,
          })}
          onClick={() => onTabChange(tab.value)}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}

export default memo(ParticipationTabs);

import { memo } from "react";
import clsx from "clsx";
import styles from "./ParticipationTabs.module.css";

/*
 * 내 일정 화면의 최상단 탭 네비게이션이다.
 * 이 컴포넌트는 "현재 어떤 탭이 활성화되어 있는가"를 시각적으로 보여주고,
 * 탭 변경 이벤트를 상위 페이지로 전달하는 역할만 맡는다.
 *
 * 실제 데이터 전환은 여기서 하지 않는다.
 * 탭 값을 받은 MySchedulePage가 현재 배열(currentItems)과 emptyMessage를 다시 계산한다.
 * 내 일정 페이지의 참여 탭 버튼 묶음이다.
 * 탭 정의(PARTICIPATION_TABS)는 model/constants에 두고, 이 컴포넌트는 현재 탭 표시와 탭 변경 이벤트만 담당한다.
 */
function ParticipationTabs({ tabs, counts = {}, activeTab, onTabChange }) {
  return (
    <div className={styles.tabList} role="tablist" aria-label="내 일정 탭">
      {tabs.map((tab) => (
        <button
          type="button"
          key={tab.value}
          role="tab"
          aria-selected={activeTab === tab.value}
          className={clsx(styles.tabButton, {
            [styles.tabButtonActive]: activeTab === tab.value,
          })}
          onClick={() => onTabChange(tab.value)}
        >
          <span className={styles.tabLabel}>{tab.label}</span>
          <span className={styles.tabCount}>{counts[tab.value] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}

export default memo(ParticipationTabs);

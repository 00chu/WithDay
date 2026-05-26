import { memo } from "react";
import clsx from "clsx";
import Button from "../../../../shared/ui/Button/Button";
import styles from "../Participation.module.css";

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
function ParticipationTabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className={styles.tabWrap}>
      {tabs.map((tab) => (
        /*
         * 버튼 클릭 자체는 아주 단순하지만, 그 뒤의 화면 흐름은 상위에서 이어진다.
         * 1. 사용자가 탭 버튼 클릭
         * 2. onTabChange(tab.value) 호출
         * 3. MySchedulePage의 activeTab state 변경
         * 4. currentItems / emptyMessage 재계산
         * 5. 같은 query 결과 안에서 다른 배열을 렌더링
         *
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

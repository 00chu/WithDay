import styles from "../../../page/home/Home.module.css";
import clsx from "clsx";

/*
 * 화면에 보여줄 한글 label과 API에 전달할 영문 id를 분리한다.
 * 백엔드 schedule.category 값은 travel/food 같은 코드이므로, 버튼 표시 문자열을 그대로 API에 보내지 않는다.
 */
const CATEGORIES = [
  { id: "all", label: "전체" },
  { id: "travel", label: "여행" },
  { id: "popup", label: "팝업" },
  { id: "food", label: "식사" },
  { id: "activity", label: "액티비티" },
  { id: "culture", label: "문화" },
  { id: "etc", label: "기타" },
];

/*
 * 탐색 탭의 카테고리 필터 UI다.
 * activeCategory는 현재 선택된 영문 id이고, onCategoryChange는 ExplorePage의 상태를 바꿔 react-query 재조회로 이어진다.
 */
export default function CategoryFilter({ activeCategory, onCategoryChange }) {
  return (
    <div className={styles.categoryList}>
      {CATEGORIES.map((category) => (
        <button
          key={category.id}
          type="button"
          className={clsx(styles.categoryChip, {
            // 비교할 때는 화면 label이 아니라 API 값과 같은 영문 id를 사용한다.
            [styles.categoryChipActive]: activeCategory === category.id,
          })}
          onClick={() => {
            // 클릭 시 영문 id를 부모로 전달해 GET /schedules?category=... 필터로 이어지게 한다.
            onCategoryChange(category.id);
          }}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}

import styles from "../../../page/home/Home.module.css";
import clsx from "clsx";

// 🌟 화면에 보여줄 글자(label)와 데이터 통신용 값(id)을 분리
const CATEGORIES = [
  { id: "all", label: "전체" },
  { id: "travel", label: "여행" },
  { id: "popup", label: "팝업" },
  { id: "food", label: "식사" },
  { id: "activity", label: "액티비티" },
  { id: "culture", label: "문화" },
  { id: "etc", label: "기타" },
];

export default function CategoryFilter({ activeCategory, onCategoryChange }) {
  return (
    <div className={styles.categoryList}>
      {CATEGORIES.map((category) => (
        <button
          key={category.id}
          type="button"
          className={clsx(styles.categoryChip, {
            // 비교할 때는 영문 id로 비교
            [styles.categoryChipActive]: activeCategory === category.id,
          })}
          onClick={() => {
            // 클릭 시 영문 id를 부모로 전달
            onCategoryChange(category.id);
          }}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}

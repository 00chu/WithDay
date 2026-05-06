import clsx from "clsx";
import styles from "../../../page/home/Home.module.css";

const CATEGORIES = ["전체", "여행", "팝업", "식사", "액티비티", "문화", "취미"];

export default function CategoryFilter({ activeCategory, onCategoryChange }) {
  return (
    <div className={styles.categoryList}>
      {CATEGORIES.map((category) => (
        <button
          key={category}
          type="button"
          className={clsx(styles.categoryChip, {
            [styles.categoryChipActive]: activeCategory === category,
          })}
          onClick={() => onCategoryChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

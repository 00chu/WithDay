import styles from "./WishlistPage.module.css";

export default function WishlistPage() {
  return (
    <section className={styles.container}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>WISHLIST</p>
        <h2 className={styles.title}>위시리스트</h2>
        <p className={styles.description}>
          저장한 일정들을 모아보는 화면은 다음 단계에서 연결할 수 있도록
          자리만 먼저 열어두었습니다.
        </p>
      </div>
    </section>
  );
}

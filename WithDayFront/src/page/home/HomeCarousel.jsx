import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import styles from "./Home.module.css";

const AUTO_PLAY_DELAY = 4500;

const CAROUSEL_ITEMS = [
  {
    id: "withday-coast",
    image: "/hero.png",
    title: "지도에는 없는 길, 우리라는 이름으로 걷다",
    description: "지금 시작하면 함께할 사람이 더 빨리 보입니다.",
  },
  {
    id: "withday-night",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80",
    title: "오늘의 일정은 누군가의 위트가 됩니다",
    description: "가볍게 식사부터, 주말 여행까지 한 번에 둘러보세요.",
  },
  {
    id: "withday-museum",
    image:
      "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1400&q=80",
    title: "취향이 닿는 순간, 일정은 더 쉬워집니다",
    description: "탐색 탭으로 이어지는 일정들을 홈에서 먼저 추천합니다.",
  },
];

export default function HomeCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideCount = useMemo(() => CAROUSEL_ITEMS.length, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentIndex((previousIndex) => (previousIndex + 1) % slideCount);
    }, AUTO_PLAY_DELAY);

    return () => window.clearInterval(timer);
  }, [slideCount]);

  const currentItem = CAROUSEL_ITEMS[currentIndex];

  return (
    <section className={styles.heroSection}>
      <div className={styles.carousel}>
        <div
          className={styles.carouselTrack}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {CAROUSEL_ITEMS.map((item) => (
            <article className={styles.carouselSlide} key={item.id}>
              <img
                src={item.image}
                alt={item.title}
                className={styles.carouselImage}
              />
            </article>
          ))}
        </div>
      </div>

      <div className={styles.carouselFooter}>
        <div className={styles.carouselTextWrap}>
          <p className={styles.carouselCaption}>{currentItem.title}</p>
          <p className={styles.carouselSubcaption}>{currentItem.description}</p>
        </div>
        <div className={styles.carouselDots}>
          {CAROUSEL_ITEMS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={clsx(styles.carouselDot, {
                [styles.carouselDotActive]: index === currentIndex,
              })}
              onClick={() => setCurrentIndex(index)}
              aria-label={`${index + 1}번 배너로 이동`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

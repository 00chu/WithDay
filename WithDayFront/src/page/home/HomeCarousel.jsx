import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import styles from "./Home.module.css";
import heroImage from "../../assets/hero.png";

const AUTO_PLAY_DELAY = 4000;

const CAROUSEL_ITEMS = [
  {
    id: "local-hero",
    image: heroImage,
    eyebrow: "이번 주 추천",
    title: "함께 가면 더 좋은 일정들을 둘러보세요",
    description: "마감이 가까운 일정을 홈에서 먼저 확인할 수 있어요.",
  },
  {
    id: "jeju-trip",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
    eyebrow: "여행 추천",
    title: "바다와 풍경이 좋은 일정부터 먼저 만나보세요",
    description: "지역 필터와 탐색 탭을 함께 쓰면 더 빠르게 찾을 수 있어요.",
  },
  {
    id: "city-meetup",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=80",
    eyebrow: "주말 모임",
    title: "식사, 팝업, 액티비티까지 카테고리별로 한눈에",
    description: "홈은 추천 중심, 탐색은 전체 보기 중심으로 구성되어 있어요.",
  },
];

export default function HomeCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideCount = useMemo(() => CAROUSEL_ITEMS.length, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideCount);
    }, AUTO_PLAY_DELAY);

    return () => window.clearInterval(timer);
  }, [slideCount]);

  return (
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
            <div className={styles.carouselOverlay}>
              <p className={styles.carouselEyebrow}>{item.eyebrow}</p>
              <h3 className={styles.carouselTitle}>{item.title}</h3>
              <p className={styles.carouselDescription}>{item.description}</p>
            </div>
          </article>
        ))}
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
  );
}

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import styles from "./Home.module.css";

const AUTO_PLAY_DELAY = 4500;

const CAROUSEL_ITEMS = [
  {
    id: "withday-night",
    image: "/carousel.png",
    title: "지도에는 없는 길, 우리라는 이름으로 걷다",
    description: "가볍게 식사부터, 주말 여행까지 한 번에 둘러보세요.",
  },
  {
    id: "withday-museum",
    image:
      "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1400&q=80",
    title: "취향이 닿는 순간, 일정은 더 쉬워집니다",
    description: "탐색 탭으로 이어지는 일정들을 홈에서 먼저 추천합니다.",
  },
  {
    id: "withday-travel",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    title: "이번 주말 같이 떠나는 근교 여행",
    description: "양양과 강릉처럼 가볍게 다녀올 일정을 만나보세요.",
  },
  {
    id: "withday-dining",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80",
    title: "퇴근 후 모이는 맛집 번개",
    description: "한 끼 식사도 부담 없이 함께할 사람을 찾을 수 있어요.",
  },
  {
    id: "withday-activity",
    image:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1400&q=80",
    title: "몸을 움직이는 액티비티 모집",
    description: "러닝, 서핑, 클라이밍처럼 활기 있는 일정을 둘러보세요.",
  },
  {
    id: "withday-culture",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80",
    title: "전시와 공연으로 채우는 하루",
    description: "취향 맞는 사람과 문화 일정을 더 편하게 계획해보세요.",
  },
  {
    id: "withday-gathering",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=80",
    title: "새로운 사람을 만나는 소규모 모임",
    description: "카페 대화부터 동네 산책까지 자연스러운 만남을 준비했어요.",
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

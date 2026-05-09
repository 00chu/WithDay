import { useState } from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import styles from "../../../page/schedule/ScheduleDetail.module.css";

export default function ScheduleImageSlider({ images = [], thumbnail }) {
  const [currentImg, setCurrentImg] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // isThumbnail이 1(true)인 이미지를 가장 앞으로 정렬한 뒤 URL 추출
  const imageUrls =
    images.length > 0
      ? [...images]
          .sort((a, b) => b.isThumbnail - a.isThumbnail)
          .map((img) => img.imageUrl)
      : thumbnail
      ? [thumbnail]
      : ["https://placehold.co/800x400?text=No+Image"];

  const nextSlide = () =>
    setCurrentImg((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  const prevSlide = () =>
    setCurrentImg((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));

  const lightboxSlides = imageUrls.map((url) => ({ src: url }));

  return (
    <section className={styles.imageSection}>
      <div className={styles.slider}>
        <img
          src={imageUrls[currentImg]}
          alt="일정 이미지"
          className={styles.mainImage}
          onClick={() => setIsViewerOpen(true)}
          style={{ cursor: "pointer" }}
        />
        {imageUrls.length > 1 && (
          <>
            <button className={styles.prevBtn} onClick={prevSlide}>
              <ChevronLeftIcon />
            </button>
            <button className={styles.nextBtn} onClick={nextSlide}>
              <ChevronRightIcon />
            </button>
            <div className={styles.indicator}>
              {currentImg + 1} / {imageUrls.length}
            </div>
          </>
        )}
      </div>

      {/* Lightbox 줌 기능 포함 */}
      <Lightbox
        open={isViewerOpen}
        close={() => setIsViewerOpen(false)}
        index={currentImg}
        slides={lightboxSlides}
        plugins={[Zoom]}
        zoom={{
          maxZoomPixelRatio: 5,
          zoomInMultiplier: 2,
          doubleTapDelay: 300,
          doubleClickDelay: 300,
        }}
        on={{ view: ({ index }) => setCurrentImg(index) }}
      />
    </section>
  );
}

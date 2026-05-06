import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import Button from "../../shared/ui/Button/Button";
import PlaceIcon from "@mui/icons-material/Place";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PeopleIcon from "@mui/icons-material/People";
import PaymentsIcon from "@mui/icons-material/Payments";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import VisibilityIcon from "@mui/icons-material/Visibility";
import styles from "./ScheduleDetail.module.css";

import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

export default function ScheduleDetail() {
  const { scheduleId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentImg, setCurrentImg] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    const fetchScheduleDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:10400/schedules/${scheduleId}`,
        );
        setData(response.data);
      } catch (err) {
        console.error("일정 상세 조회 실패:", err);
        setError("데이터를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleDetail();
  }, [scheduleId]);

  if (loading) return <div className={styles.container}>로딩 중...</div>;
  if (error) return <div className={styles.container}>{error}</div>;
  if (!data || !data.schedule)
    return <div className={styles.container}>일정 정보가 없습니다.</div>;

  const schedule = data.schedule;
  const details = data.details || [];
  const rawImages = data.images || [];

  // isThumbnail이 1인 이미지를 가장 앞으로 정렬한 뒤 URL 추출
  const imageUrls =
    rawImages.length > 0
      ? [...rawImages]
          .sort((a, b) => b.isThumbnail - a.isThumbnail)
          .map((img) => img.imageUrl)
      : schedule.thumbnailImage
        ? [schedule.thumbnailImage]
        : ["https://placehold.co/800x400?text=No+Image"];

  const nextSlide = () =>
    setCurrentImg((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  const prevSlide = () =>
    setCurrentImg((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));

  const handleApply = () => {
    const confirmJoin = window.confirm("이 일정에 참여 신청을 하시겠습니까?");
    if (confirmJoin) {
      alert("신청이 완료되었습니다! 주최자의 승인을 기다려주세요.");
    }
  };

  const lightboxSlides = imageUrls.map((url) => ({ src: url }));

  const displayStartTime = schedule.startDate || "미정";
  const displayEndTime = schedule.endDate || "미정";

  const costTypeMap = {
    per_person: "총액 1/N",
    host_covered: "호스트 부담",
    free: "무료",
    custom: "인당 고정 금액",
  };

  return (
    <div className={styles.container}>
      {/* 1. 이미지 영역 */}
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
      </section>

      <div className={styles.contentWrapper}>
        {/* 2. 제목 및 요약 정보 */}
        <section className={styles.headerSection}>
          <div className={styles.badgeWrapper}>
            <span className={styles.categoryBadge}>{schedule.category}</span>
            <span
              className={
                schedule.status === "recruiting"
                  ? styles.statusOpen
                  : styles.statusClosed
              }
            >
              {schedule.status === "recruiting" ? "모집중" : "모집종료"}
            </span>
          </div>
          <h1 className={styles.title}>{schedule.title}</h1>
          <div className={styles.metaInfo}>
            <span>
              <VisibilityIcon fontSize="small" /> {schedule.viewCount}
            </span>
            <span>
              <PlaceIcon fontSize="small" /> {schedule.region}
            </span>
          </div>
        </section>

        <hr className={styles.divider} />

        {/* 3. 상세 조건 */}
        <section className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <CalendarTodayIcon className={styles.icon} />
            <div>
              <p className={styles.label}>일정 기간</p>
              <p className={styles.value}>
                {displayStartTime} ~ {displayEndTime}
              </p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <PeopleIcon className={styles.icon} />
            <div>
              <p className={styles.label}>모집 인원 / 조건</p>
              <p className={styles.value}>
                {schedule.currentParticipants} / {schedule.maxParticipants}명
                (최소 {schedule.minParticipants}명)
              </p>
              <p className={styles.subValue}>
                {schedule.genderLimit === "all"
                  ? "성별 무관"
                  : schedule.genderLimit}{" "}
                | {schedule.ageMin}세 ~ {schedule.ageMax}세
              </p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <PaymentsIcon className={styles.icon} />
            <div>
              <p className={styles.label}>예상 비용</p>
              <p className={styles.value}>
                총{" "}
                {schedule.totalPrice ? schedule.totalPrice.toLocaleString() : 0}
                원
              </p>
              <p className={styles.subValue}>
                정산 방식: {costTypeMap[schedule.costType] || schedule.costType}
              </p>
            </div>
          </div>
        </section>

        <hr className={styles.divider} />

        {/* 4. 본문 상세 설명 */}
        <section className={styles.descriptionSection}>
          <h2 className={styles.subTitle}>상세 설명</h2>
          <p
            className={styles.descriptionText}
            style={{ whiteSpace: "pre-wrap" }}
          >
            {schedule.description}
          </p>
        </section>

        <hr className={styles.divider} />

        {/* 5. 세부 일정 */}
        {details.length > 0 && (
          <section className={styles.descriptionSection}>
            <h2 className={styles.subTitle}>세부 일정 (Day-by-Day)</h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                marginTop: "1rem",
              }}
            >
              {details.map((detail) => (
                <div
                  key={detail.id}
                  style={{
                    padding: "1rem",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 0.5rem 0",
                      color: "#1976d2",
                      fontSize: "1.1rem",
                    }}
                  >
                    Day {detail.dayNumber}
                  </h3>
                  <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem" }}>
                    {detail.title}
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      color: "#555",
                      fontSize: "0.95rem",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {detail.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <footer className={styles.stickyFooter}>
        <div className={styles.footerInfo}>
          <span className={styles.recruitDeadline}>
            마감일: {schedule.recruitEndDate}
          </span>
        </div>
        <Button
          variant={schedule.status === "recruiting" ? "accent" : "outline"}
          size="md"
          disabled={schedule.status !== "recruiting"}
          onClick={handleApply}
        >
          {schedule.status === "recruiting" ? "참여 신청하기" : "모집 종료"}
        </Button>
      </footer>

      {/* 🌟 7. Lightbox Zoom 옵션 추가 */}
      <Lightbox
        open={isViewerOpen}
        close={() => setIsViewerOpen(false)}
        index={currentImg}
        slides={lightboxSlides}
        plugins={[Zoom]}
        zoom={{
          maxZoomPixelRatio: 5, // 강제로 줌 배율을 높임 (기본적으로 원본보다 커지지 않으려는 성질을 무시)
          zoomInMultiplier: 2, // + 버튼 클릭 시 2배씩 확대
          doubleTapDelay: 300, // 모바일 더블탭 딜레이
          doubleClickDelay: 300, // PC 더블클릭 딜레이
        }}
        on={{ view: ({ index }) => setCurrentImg(index) }}
      />
    </div>
  );
}

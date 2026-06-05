import Pagination from "../../../shared/ui/Pagination/Pagination";
import styles from "./ScheduleList.module.css";
import { Link } from "react-router-dom";

const ScheduleList = ({ scheduleList = [], page, setPage, totalPage }) => {
  return (
    <div className={styles.scheduleList}>
      <label className={styles.scheduleCount}>총 {scheduleList.length}건</label>

      <ul className={styles.scheduleHeader}>
        <li style={{ flex: 3 }}>일정명</li>
        <li style={{ flex: 2 }}>지역</li>
        <li style={{ flex: 1 }}>작성자</li>
        <li style={{ flex: 1 }}>상태</li>
        <li style={{ flex: 1 }}>공개여부</li>
        <li style={{ flex: 2 }}>등록일</li>
        <li style={{ flex: 0.5 }}>관리</li>
      </ul>

      <ul className={styles.scheduleWrap}>
        {scheduleList.length > 0 ? (
          scheduleList.map((schedule) => (
            <ScheduleItem key={`schedule-${schedule.id}`} schedule={schedule} />
          ))
        ) : (
          <h3 className={styles.resultNone}>조회 결과가 없습니다.</h3>
        )}

        <div>
          <Pagination
            page={page}
            setPage={setPage}
            totalPage={totalPage ?? 0}
            naviSize={5}
          />
        </div>
      </ul>
    </div>
  );
};

const ScheduleItem = ({ schedule }) => {
  const statusMap = {
    recruiting: "모집중",
    closed: "마감",
    canceled: "취소",
    completed: "완료",
  };

  const publicMap = {
    1: "공개",
    0: "비공개",
  };

  return (
    <ul className={styles.scheduleItem}>
      <li style={{ flex: 3 }}>
        <Link to={`/schedule/${schedule.id}`} className={styles.scheduleLink}>
          {schedule.title}
        </Link>
      </li>
      <li style={{ flex: 2 }}>
        {schedule.region} {schedule.detailRegion}
      </li>
      <li style={{ flex: 1 }}>{schedule.nickname}</li>
      <li style={{ flex: 1 }}>
        {statusMap[schedule.status] ?? schedule.status}
      </li>
      <li style={{ flex: 1 }}>{publicMap[schedule.isPublic] ?? "-"}</li>
      <li style={{ flex: 2 }}>{schedule.createdAt?.slice(0, 10)}</li>
      <li style={{ flex: 0.5 }}>
        <ScheduleMenu schedule={schedule} />
      </li>

      {/* 모바일 */}
      <div className={styles.mobileCard}>
        <div className={styles.mobileHeader}>
          <strong>
            <Link
              to={`/schedule/${schedule.id}`}
              className={styles.scheduleLink}
            >
              <strong>{schedule.title}</strong>
            </Link>
          </strong>
        </div>

        <div className={styles.mobileInfo}>
          <span>
            지역 : {schedule.region} {schedule.detailRegion}
          </span>
          <span>작성자 : {schedule.nickname}</span>
          <span>상태 : {statusMap[schedule.status] ?? schedule.status}</span>
          <span>공개여부 : {publicMap[schedule.isPublic] ?? "-"}</span>
          <span>등록일 : {schedule.createdAt?.slice(0, 10)}</span>
        </div>
      </div>
    </ul>
  );
};

import { useState } from "react";

const ScheduleMenu = ({ schedule }) => {
  const [open, setOpen] = useState(false);

  const handleTogglePublic = () => {
    const nextValue = schedule.isPublic === 1 ? 0 : 1;

    console.log("공개 여부 변경", schedule.id, nextValue);

    // API 연결
    // updateSchedulePublic(schedule.id, nextValue)
  };

  const handleDelete = () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) {
      return;
    }

    console.log("삭제", schedule.id);

    // API 연결
    // deleteSchedule(schedule.id)
  };

  return (
    <div className={styles.menuWrapper}>
      <button
        type="button"
        className={styles.menuButton}
        onClick={() => setOpen((prev) => !prev)}
      >
        ⋮
      </button>

      {open && (
        <div className={styles.dropdown}>
          <button
            type="button"
            className={styles.dropdownItem}
            onClick={handleTogglePublic}
          >
            {schedule.isPublic === 1 ? "비공개 전환" : "공개 전환"}
          </button>

          <button
            type="button"
            className={`${styles.dropdownItem} ${styles.deleteItem}`}
            onClick={handleDelete}
          >
            일정 삭제
          </button>
        </div>
      )}
    </div>
  );
};

export default ScheduleList;

import { Input, TextArea } from "../../shared/ui/Form/Form";
import styles from "./WriteSchedule.module.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { ko } from "date-fns/locale";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";

registerLocale("ko", ko);

const WriteSchedule = () => {
  const [post, setPost] = useState({
    title: "",
    description: "",
    category: "",
    region: "",
    detailRegion: "",
    startDate: new Date(),
    endDate: new Date(),
    recruitmentPeriod: new Date(),
    maxParticipants: "",
    minAge: "",
    maxAge: "",
    gender: "",
    cost: "",
    costSharing: "",
    thumbnail: "",
  });

  const [schedule, setSchedule] = useState([]);

  const categories = ["전체", "여행", "팝업", "식사", "액티비티"];

  const categoryOptions = categories.map((item, index) => ({
    value: index,
    label: item,
  }));

  /* 시 */
  const regions = [];

  const regionOptions = regions.map((item, index) => ({
    value: index,
    label: item,
  }));

  useEffect(() => {
    axios.get().then(regions).catch();

    const regionOptions = regions.map((item, index) => ({
      value: index,
      label: item,
    }));
  }, []);

  /* 군, 구 */

  const detailRegions = [];

  const detailRegionOptions = regions.map((item, index) => ({
    value: index,
    label: item,
  }));

  /* 시 선택되면 세부 지역 불러옴 */
  useEffect(() => {
    axios.get().then(detailRegions).catch();

    const detailRegionOptions = detailRegions.map((item, index) => ({
      value: index,
      label: item,
    }));
  }, [post.region]);

  return (
    <>
      <header className={styles.header}>
        <BackButton />
      </header>
      <main className={styles.main}>
        <div className={styles.content_wrap}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            autoComplete="off"
          >
            <div className={styles.input_content_wrap}>
              <h2 className={styles.input_title}>기본 정보</h2>
              <ul className={`${styles.input_wrap} ${styles.title}`}>
                <li>
                  <label htmlFor="title">Title</label>
                </li>
                <li>
                  <Input
                    type="text"
                    name="title"
                    id="title"
                    placeholder="Title"
                    value={post.title}
                    onChange={(e) => {
                      setPost({ ...post, title: e.target.value });
                    }}
                  ></Input>
                </li>
              </ul>
              <ul className={`${styles.input_wrap} ${styles.description}`}>
                <li>
                  <label htmlFor="description">Description</label>
                </li>
                <li>
                  <TextArea
                    name="description"
                    id="description"
                    placeholder="description"
                    value={post.description}
                    onChange={(e) => {
                      setPost({ ...post, description: e.target.value });
                    }}
                  ></TextArea>
                </li>
              </ul>
              <ul className={`${styles.input_wrap} ${styles.category}`}>
                <li>
                  <label htmlFor="category">Category</label>
                </li>
                <li>
                  <select>
                    {categoryOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </li>
              </ul>
              <ul className={`${styles.input_wrap} ${styles.region}`}>
                <li>
                  <label htmlFor="region">Region</label>
                </li>
                <li>
                  <select>
                    <option value="">시/도</option>
                    {regionOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </li>
              </ul>
              <ul className={`${styles.input_wrap} ${styles.detailRegion}`}>
                <li>
                  <label htmlFor="detailRegion">DetailRegion</label>
                </li>
                <li>
                  <select>
                    <option value="">시/군/구</option>
                    {detailRegionOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </li>
              </ul>
            </div>
            <div className={styles.input_content_wrap}>
              <h2 className={styles.input_title}>일정 정보</h2>
              <CalendarRange
                post={post}
                setPost={setPost}
                months={1}
                direction="horizontal"
              />
              <ul
                className={`${styles.input_wrap} ${styles.recruitmentPeriod}`}
              >
                <li>
                  <label>모집 마감일</label>
                </li>
                <li>
                  <DatePicker
                    locale="ko"
                    selected={post.recruitmentPeriod}
                    onChange={(date) =>
                      setPost((prev) => ({
                        ...prev,
                        recruitmentPeriod: date,
                      }))
                    }
                    // 마감일은 일정 시작일 하루 전 날까지
                    maxDate={post.startDate - 1}
                    dateFormat="yyyy년 MM월 dd일"
                    placeholderText="날짜 선택"
                    customInput={
                      <button className={styles.dateButton}>
                        <span>📅</span>
                        {post.recruitmentPeriod
                          ? post.recruitmentPeriod.toLocaleDateString()
                          : "날짜 선택"}
                      </button>
                    }
                  />
                </li>
              </ul>
            </div>
            <div className={styles.input_content_wrap}>
              <h2 className={styles.input_title}>상세 일정</h2>
              <ScheduleTable schedule={schedule} setSchedule={setSchedule} />
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button className={styles.backButton} onClick={() => navigate(-1)}>
      {"<"}
    </button>
  );
};

const CalendarRange = ({ post, setPost }) => {
  const [state, setState] = useState([
    {
      startDate: post.startDate || new Date(),
      endDate: post.endDate || new Date(),
      key: "selection",
    },
  ]);

  const handleChange = (item) => {
    const selection = item.selection;

    setState([selection]);

    setPost((prev) => ({
      ...prev,
      startDate: selection.startDate,
      endDate: selection.endDate,
    }));
  };

  return (
    <div className={styles.calendarWrapper}>
      <DateRange
        locale={ko}
        ranges={state}
        onChange={handleChange}
        moveRangeOnFirstSelection={false}
        editableDateInputs={true}
        showMonthAndYearPickers={true}
        months={1}
        direction="horizontal"
      />

      <div className={styles.dateWrap}>
        <ul className={`${styles.input_wrap} ${styles.duringDate}`}>
          <li>
            <label>일정</label>
          </li>
          <li>
            <p>시작일: {post.startDate?.toLocaleDateString()}</p>
            <p>종료일: {post.endDate?.toLocaleDateString()}</p>
          </li>
        </ul>
      </div>
    </div>
  );
};

const ScheduleTable = ({ schedule, setSchedule }) => {
  const handleChange = (rowIndex, colIndex, value) => {
    setSchedule((prev) =>
      prev.map((row, i) =>
        i === rowIndex
          ? row.map((cell, j) => (j === colIndex ? value : cell))
          : row,
      ),
    );
  };

  return (
    <>
      <div className={styles.scheduleTableWrap}>
        <table className={styles.scheduleTable}>
          <thead>
            <tr>
              <th>번호</th>
              <th>일정 종류</th>
              <th>일정 제목</th>
              <th>일정 소개</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((row, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                {row.map((cell, j) => (
                  <td className={styles.scheduleTd} key={j}>
                    {j === 2 ? (
                      <textarea
                        className={styles.scheduleTextarea}
                        value={cell}
                        onChange={(e) => handleChange(i, j, e.target.value)}
                      />
                    ) : (
                      <input
                        type="text"
                        className={styles.scheduleInput}
                        value={cell}
                        onChange={(e) => handleChange(i, j, e.target.value)}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        className={styles.scheduleAddBtn}
        onClick={() => {
          schedule.length <= 20
            ? setSchedule((prev) => [...prev, ["", "", ""]])
            : null;
        }}
      >
        +
      </button>
      <button
        className={styles.scheduleMinusBtn}
        onClick={() => {
          schedule.length > 0 ? setSchedule((prev) => prev.slice(0, -1)) : null;
        }}
      >
        -
      </button>
    </>
  );
};

export default WriteSchedule;

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
    minParticipants: 2,
    maxParticipants: 100,
    minAge: 0,
    maxAge: 100,
    gender: "all",
    cost: 0,
    costSharing: 0,
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
                  <label htmlFor="title">일정명</label>
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
                  <label htmlFor="description">일정 설명</label>
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
                  <label htmlFor="category">일정 종류</label>
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
                  <label htmlFor="region">지역(시/도)</label>
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
                  <label htmlFor="detailRegion">지역(시/군/구)</label>
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
              <h2 className={styles.input_title}>인원 정보</h2>
              <div>
                <ul className={`${styles.input_wrap} ${styles.peopleInfo}`}>
                  <li>최소 인원</li>
                  <li>
                    <Input
                      type="number"
                      name="minParticipants"
                      id="minParticipants"
                      placeholder="최소 인원"
                      min={2}
                      max={100}
                      value={post.minParticipants}
                      onChange={(e) => {
                        setPost({ ...post, minParticipants: e.target.value });
                      }}
                    ></Input>
                  </li>
                </ul>
                <ul className={`${styles.input_wrap} ${styles.peopleInfo}`}>
                  <li>최대 인원</li>
                  <li>
                    <Input
                      type="number"
                      name="maxParticipants"
                      id="maxParticipants"
                      placeholder="최대 인원"
                      min={2}
                      max={100}
                      value={post.maxParticipants}
                      onChange={(e) => {
                        setPost({ ...post, maxParticipants: e.target.value });
                      }}
                    ></Input>
                  </li>
                </ul>
                <ul className={`${styles.input_wrap} ${styles.peopleInfo}`}>
                  <li>최소 연령</li>
                  <li>
                    <Input
                      type="number"
                      name="minAge"
                      id="minAge"
                      placeholder="최소 연령"
                      min={0}
                      max={100}
                      value={post.minAge}
                      onChange={(e) => {
                        setPost({ ...post, minAge: e.target.value });
                      }}
                    ></Input>
                  </li>
                </ul>
                <ul className={`${styles.input_wrap} ${styles.peopleInfo}`}>
                  <li>최대 연령</li>
                  <li>
                    <Input
                      type="number"
                      name="maxAge"
                      id="maxAge"
                      placeholder="최대 연령"
                      min={0}
                      max={100}
                      value={post.maxAge}
                      onChange={(e) => {
                        setPost({ ...post, maxAge: e.target.value });
                      }}
                    ></Input>
                  </li>
                </ul>

                <ul className={`${styles.input_wrap} ${styles.genderInfo}`}>
                  <li>성별 제한</li>
                  <li>
                    <div className={styles.genderWrap}>
                      <label>
                        <input
                          type="radio"
                          name="gender"
                          value="all"
                          checked={post.gender === "all"}
                          onChange={(e) =>
                            setPost((prev) => ({
                              ...prev,
                              gender: e.target.value,
                            }))
                          }
                        />
                        성별 무관
                      </label>
                    </div>
                    <div className={styles.genderWrap}>
                      <label>
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={post.gender === "male"}
                          onChange={(e) =>
                            setPost((prev) => ({
                              ...prev,
                              gender: e.target.value,
                            }))
                          }
                        />
                        남성
                      </label>
                    </div>
                    <div className={styles.genderWrap}>
                      <label>
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={post.gender === "female"}
                          onChange={(e) =>
                            setPost((prev) => ({
                              ...prev,
                              gender: e.target.value,
                            }))
                          }
                        />
                        여성
                      </label>
                    </div>
                  </li>
                </ul>
              </div>
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
              <ScheduleTable
                startDate={post.startDate}
                endDate={post.endDate}
                schedule={schedule}
                setSchedule={setSchedule}
              />
            </div>
            <div className={styles.input_content_wrap}>
              <h2 className={styles.input_title}>정산 방식</h2>
              <ul className={`${styles.input_wrap} ${styles.cost_wrap}`}>
                <li>총액</li>
                <li className={styles.cost}>
                  <input
                    type="number"
                    className={styles.cost_input}
                    value={post.cost}
                    onChange={(e) =>
                      setPost((prev) => ({
                        ...prev,
                        cost: e.target.value,
                      }))
                    }
                  />
                  <span className={styles.won}>₩</span>
                </li>
              </ul>
              <ul
                className={`${styles.input_wrap} ${styles.cost_sharing_wrap}`}
              >
                <li>정산 방식</li>
                <li className={styles.cost_sharing_content}>
                  <div className={styles.cost_sharing}>
                    <label>
                      <input
                        type="radio"
                        name="costSharing"
                        value="per_person"
                        checked={post.costSharing === "per_person"}
                        onChange={(e) =>
                          setPost((prev) => ({
                            ...prev,
                            costSharing: e.target.value,
                          }))
                        }
                      />
                      총액 1 / N<div>총액을 인원수만큼 나누어 지불합니다.</div>
                    </label>
                  </div>
                  <div className={styles.cost_sharing}>
                    <label>
                      <input
                        type="radio"
                        name="costSharing"
                        value="host_covered"
                        checked={post.costSharing === "host_covered"}
                        onChange={(e) =>
                          setPost((prev) => ({
                            ...prev,
                            costSharing: e.target.value,
                          }))
                        }
                      />
                      호스트 지불<div>호스트가 모든 비용을 지불합니다.</div>
                    </label>
                  </div>
                  <div className={styles.cost_sharing}>
                    <label>
                      <input
                        type="radio"
                        name="costSharing"
                        value="free"
                        checked={post.costSharing === "free"}
                        onChange={(e) =>
                          setPost((prev) => ({
                            ...prev,
                            costSharing: e.target.value,
                          }))
                        }
                      />
                      무료<div>무료로 일정을 진행합니다.</div>
                    </label>
                  </div>
                  <div className={styles.cost_sharing}>
                    <label>
                      <input
                        type="radio"
                        name="costSharing"
                        value="custom"
                        checked={post.costSharing === "custom"}
                        onChange={(e) =>
                          setPost((prev) => ({
                            ...prev,
                            costSharing: e.target.value,
                          }))
                        }
                      />
                      인당 고정 금액
                      <div>정해진 금액을 인원만큼 추가합니다.</div>
                    </label>
                  </div>
                </li>
              </ul>
            </div>
            <div className={styles.input_content_wrap}>
              <div className={styles.title_wrap}>
                <h2 className={styles.input_title}>첨부 이미지</h2>
                <label>{"(최대 3장, 첫 이미지는 썸네일 이미지)"}</label>
              </div>
              <AddThumbnail />
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

const ScheduleTable = ({ startDate, endDate, schedule, setSchedule }) => {
  const getDays = (startDate, endDate) => {
    const diff = endDate - startDate;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1; // ⭐ +1 중요
  };

  useEffect(() => {
    const days = getDays(startDate, endDate);

    setSchedule((prev) => {
      const newArr = [...prev];

      while (newArr.length < days) {
        newArr.push(["", ""]);
      }

      return newArr.slice(0, days);
    });
  }, [startDate, endDate]);

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
              <th>일차</th>
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
                    {j === 0 ? (
                      <input
                        type="text"
                        className={styles.scheduleInput}
                        value={cell}
                        onChange={(e) => handleChange(i, j, e.target.value)}
                      />
                    ) : (
                      <textarea
                        className={styles.scheduleTextarea}
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
    </>
  );
};

const AddThumbnail = () => {
  const [images, setImages] = useState([]);

  const handleDrop = (e) => {
    e.preventDefault();

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (images.length >= 3) {
      alert("최대 3장까지 가능합니다.");
      return;
    }

    const url = URL.createObjectURL(file);
    setImages((prev) => [...prev, url]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className={styles.imageZone}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={styles.dropZone}
      >
        이미지를 여기에 드롭하세요
      </div>

      <div className={styles.previewGrid}>
        {images.map((img, i) => (
          <div key={i} className={styles.imageWrap}>
            <img src={img} alt={`preview-${i}`} className={styles.image} />

            <button
              onClick={() =>
                setImages((prev) => prev.filter((_, idx) => idx !== i))
              }
              className={styles.deleteBtn}
            >
              X
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WriteSchedule;

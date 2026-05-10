import { Input, TextArea } from "../../shared/ui/Form/Form";
import styles from "./WriteSchedule.module.css";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { ko } from "date-fns/locale";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import Button from "../../shared/ui/Button/Button";
import { useQuery } from "@tanstack/react-query";
import { getDetailRegion, getRegion } from "../../features/region/api";
import { insertSchedule } from "../../features/schedule/api";
import { useAuthStore } from "../../features/auth/store/authStore";

import { insertSchema } from "../../features/schedule/validation/insertSchema";

registerLocale("ko", ko);

const WriteSchedule = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log(useAuthStore.getState().user);
  }, []);

  const [post, setPost] = useState({
    memberEmail: useAuthStore.getState().user.email,
    title: "",
    description: "",
    category: "",
    region: "",
    detailRegion: "",
    chatLink: "",
    startDate: new Date(),
    endDate: new Date(),
    recruitStartDate: new Date(),
    recruitEndDate: new Date(),
    minParticipants: null,
    maxParticipants: null,
    ageMin: null,
    ageMax: null,
    genderLimit: "all",
    totalPrice: "",
    costType: 0,
    thumbnail: "",
  });

  const [images, setImages] = useState([]); // 출력용
  const [files, setFiles] = useState([]); // 업로드용

  const [detailSchedule, setDetailSchedule] = useState([]);

  const categories = ["전체", "여행", "팝업", "식사", "액티비티"]; //카테고리에서뽑아오기

  /* 시 */
  const { data: regions = [] } = useQuery({
    // 이거 주석은 저쪽거 참고
    queryKey: ["region"],
    queryFn: getRegion,
  });

  /* 군, 구 */
  const { data: detailRegions = [] } = useQuery({
    queryKey: ["detailRegion", post.region],
    queryFn: () => getDetailRegion(post.region),
    enabled: !!post.region, // 👈 선택됐을 때만 호출
  });

  const formatNumber = (value) => {
    if (!value) return "";
    return Number(value).toLocaleString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(post);
    console.log(detailSchedule);
    console.log(images);

    try {
      // 검증
      await insertSchema.validate(
        {
          post,
          files,
          detailSchedule,
        },
        { abortEarly: false },
      );

      // transform 적용된 최종 데이터
      const payload = insertSchema.cast({
        post,
        files,
        detailSchedule,
      });

      const res = await insertSchedule(payload, images, detailSchedule);

      console.log(res);
    } catch (err) {
      if (err.name === "ValidationError") {
        err.inner.forEach((e) => {
          console.log(e.path, e.message);
        });
      } else {
        console.error(err);
      }
    }
  };

  return (
    <>
      <header className={styles.header}>
        <BackButton />
      </header>
      <main className={styles.main}>
        <div className={styles.contentWrap}>
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className={styles.inputContentWrap}>
              <h2 className={styles.inputTitle}>기본 정보</h2>
              <ul className={`${styles.inputWrap} ${styles.title}`}>
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
              <ul className={`${styles.inputWrap} ${styles.description}`}>
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
              <ul className={`${styles.inputWrap} ${styles.category}`}>
                <li>
                  <label htmlFor="category">일정 종류</label>
                </li>
                <li>
                  <select
                    onChange={(e) =>
                      setPost({
                        ...post,
                        category: e.target.value,
                      })
                    }
                  >
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </li>
              </ul>
              <ul className={`${styles.inputWrap} ${styles.region}`}>
                <li>
                  <label htmlFor="region">지역(시/도)</label>
                </li>
                <li>
                  <select
                    value={post.region || ""}
                    onChange={(e) =>
                      setPost({
                        ...post,
                        region: e.target.value,
                      })
                    }
                  >
                    <option value="">시/도</option>
                    {regions?.map((item) => (
                      <option key={item.regionId} value={item.regionName}>
                        {item.regionName}
                      </option>
                    ))}
                  </select>
                </li>
              </ul>
              <ul className={`${styles.inputWrap} ${styles.detailRegion}`}>
                <li>
                  <label htmlFor="detailRegion">지역(시/군/구)</label>
                </li>
                <li>
                  <select
                    value={post.detailRegion || ""}
                    onChange={(e) =>
                      setPost({
                        ...post,
                        detailRegion: e.target.value,
                      })
                    }
                  >
                    <option value="">시/군/구</option>
                    {detailRegions?.map((item) => (
                      <option key={item.detailId} value={item.detailName}>
                        {item.detailName}
                      </option>
                    ))}
                  </select>
                </li>
              </ul>
              <ul className={`${styles.inputWrap} ${styles.link}`}>
                <li>
                  <label htmlFor="link">오픈 채팅 링크</label>
                </li>
                <li>
                  <Input
                    type="text"
                    name="link"
                    id="link"
                    placeholder="Link"
                    value={post.chatLink}
                    onChange={(e) => {
                      setPost({ ...post, chatLink: e.target.value });
                    }}
                  ></Input>
                </li>
              </ul>
            </div>
            <div className={styles.inputContentWrap}>
              <h2 className={styles.inputTitle}>인원 정보</h2>
              <div>
                <ul className={`${styles.inputWrap} ${styles.peopleInfo}`}>
                  <li>최소 인원</li>
                  <li>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      name="minParticipants"
                      placeholder={2}
                      value={post.minParticipants ?? ""}
                      onChange={(e) => {
                        const onlyNumber = e.target.value.replace(
                          /[^0-9]/g,
                          "",
                        );

                        setPost({
                          ...post,
                          minParticipants:
                            onlyNumber === "" ? null : Number(onlyNumber),
                        });
                      }}
                      onBlur={() => {
                        let value = post.minParticipants;

                        if (value == null) return;

                        // 범위 보정
                        if (value < 2) value = 2;
                        if (value > 100) value = 100;

                        // max보다 크면 max로 맞춤
                        if (
                          post.maxParticipants &&
                          value > post.maxParticipants
                        ) {
                          value = post.maxParticipants;
                        }

                        setPost({ ...post, minParticipants: value });
                      }}
                    />
                    <span>명</span>
                  </li>
                </ul>
                <ul className={`${styles.inputWrap} ${styles.peopleInfo}`}>
                  <li>최대 인원</li>
                  <li>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      name="maxParticipants"
                      placeholder={100}
                      value={post.maxParticipants ?? ""}
                      onChange={(e) => {
                        const onlyNumber = e.target.value.replace(
                          /[^0-9]/g,
                          "",
                        );

                        setPost({
                          ...post,
                          maxParticipants:
                            onlyNumber === "" ? null : Number(onlyNumber),
                        });
                      }}
                      onBlur={() => {
                        let value = post.maxParticipants;

                        if (value == null) return;

                        // 범위 보정
                        if (value < 2) value = 2;
                        if (value > 100) value = 100;

                        // min보다 작으면 min으로 맞춤
                        if (
                          post.minParticipants &&
                          value < post.minParticipants
                        ) {
                          value = post.minParticipants;
                        }

                        setPost({ ...post, maxParticipants: value });
                      }}
                    />
                    <span>명</span>
                  </li>
                </ul>
                <ul className={`${styles.inputWrap} ${styles.peopleInfo}`}>
                  <li>최소 연령</li>
                  <li>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      name="ageMin"
                      id="ageMin"
                      placeholder="15"
                      value={post.ageMin ?? ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const onlyNumber = raw.replace(/[^0-9]/g, "");

                        if (onlyNumber === "") {
                          setPost({ ...post, ageMin: null });
                          return;
                        }

                        setPost({ ...post, ageMin: Number(onlyNumber) });
                      }}
                      onBlur={() => {
                        let value = post.ageMin;

                        if (value == null) return;

                        // 범위 보정
                        if (value < 15) value = 15;
                        if (value > 100) value = 100;

                        // max보다 크면 max로 맞춤
                        if (post.ageMax && value > post.ageMax) {
                          value = post.ageMax;
                        }

                        setPost({ ...post, ageMin: value });
                      }}
                    />
                    <span>세</span>
                  </li>
                </ul>
                <ul className={`${styles.inputWrap} ${styles.peopleInfo}`}>
                  <li>최대 연령</li>
                  <li>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      name="ageMax"
                      id="ageMax"
                      placeholder="100"
                      value={post.ageMax ?? ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const onlyNumber = raw.replace(/[^0-9]/g, "");

                        if (onlyNumber === "") {
                          setPost({ ...post, ageMax: null });
                          return;
                        }

                        setPost({ ...post, ageMax: Number(onlyNumber) });
                      }}
                      onBlur={() => {
                        let value = post.ageMax;

                        if (value == null) return;

                        // 범위 보정
                        if (value < 15) value = 15;
                        if (value > 100) value = 100;

                        // min보다 작으면 min으로 맞춤
                        if (post.ageMin && value < post.ageMin) {
                          value = post.ageMin;
                        }

                        setPost({ ...post, ageMax: value });
                      }}
                    />
                    <span>세</span>
                  </li>
                </ul>

                <ul className={`${styles.inputWrap} ${styles.genderInfo}`}>
                  <li>성별 제한</li>
                  <li>
                    <Button
                      variant={
                        post.genderLimit === "all" ? "primary" : "outline"
                      }
                      onClick={() =>
                        setPost((prev) => ({
                          ...prev,
                          genderLimit: "all",
                        }))
                      }
                    >
                      성별 무관
                    </Button>
                    <Button
                      variant={
                        post.genderLimit === "male" ? "primary" : "outline"
                      }
                      onClick={() =>
                        setPost((prev) => ({
                          ...prev,
                          genderLimit: "male",
                        }))
                      }
                    >
                      남성
                    </Button>
                    <Button
                      variant={
                        post.genderLimit === "female" ? "primary" : "outline"
                      }
                      onClick={() =>
                        setPost((prev) => ({
                          ...prev,
                          genderLimit: "female",
                        }))
                      }
                    >
                      여성
                    </Button>
                  </li>
                </ul>
              </div>
            </div>
            <div className={styles.inputContentWrap}>
              <h2 className={styles.inputTitle}>일정 정보</h2>
              <CalendarRange
                post={post}
                setPost={setPost}
                months={1}
                direction="horizontal"
              />
              <ul className={`${styles.inputWrap} ${styles.recruitmentPeriod}`}>
                <li>
                  <label>모집 마감일</label>
                </li>
                <li>
                  <DatePicker
                    locale="ko"
                    selected={post.recruitEndDate}
                    onChange={(date) =>
                      setPost((prev) => ({
                        ...prev,
                        recruitEndDate: date,
                      }))
                    }
                    // 마감일은 일정 시작일 하루 전 날까지
                    minDate={new Date()}
                    maxDate={post.startDate}
                    dateFormat="yyyy년 MM월 dd일"
                    placeholderText="날짜 선택"
                    customInput={
                      <button className={styles.dateButton}>
                        <span>📅</span>
                        {post.recruitEndDate
                          ? post.recruitEndDate.toLocaleDateString()
                          : "날짜 선택"}
                      </button>
                    }
                  />
                </li>
              </ul>
            </div>
            <div className={styles.inputContentWrap}>
              <h2 className={styles.inputTitle}>상세 일정</h2>
              <ScheduleTable
                startDate={post.startDate}
                endDate={post.endDate}
                detailSchedule={detailSchedule}
                setDetailSchedule={setDetailSchedule}
              />
            </div>
            <div className={styles.inputContentWrap}>
              <h2 className={styles.inputTitle}>정산 방식</h2>
              <ul className={`${styles.inputWrap} ${styles.costWrap}`}>
                <li>총액</li>
                <li className={styles.cost}>
                  <input
                    type="text"
                    className={styles.costInput}
                    value={formatNumber(post.totalPrice)}
                    placeholder="금액"
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");

                      if (!isNaN(raw)) {
                        setPost((prev) => ({
                          ...prev,
                          totalPrice: raw,
                        }));
                      }
                    }}
                  />
                  <span className={styles.won}>₩</span>
                </li>
              </ul>
              <ul className={`${styles.inputWrap} ${styles.costSharingWrap}`}>
                <li>정산 방식</li>
                <li className={styles.costSharingContent}>
                  <div className={styles.costSharing}>
                    <Button
                      variant={
                        post.costType === "per_person" ? "primary" : "outline"
                      }
                      onClick={() =>
                        setPost((prev) => ({
                          ...prev,
                          costType: "per_person",
                        }))
                      }
                    >
                      총액 1 / N
                      <div className={styles.desc}>
                        총액을 인원수만큼 나누어 지불합니다.
                      </div>
                    </Button>
                    <Button
                      variant={
                        post.costType === "host_covered" ? "primary" : "outline"
                      }
                      onClick={() =>
                        setPost((prev) => ({
                          ...prev,
                          costType: "host_covered",
                        }))
                      }
                    >
                      호스트 지불
                      <div className={styles.desc}>
                        호스트가 모든 비용을 지불합니다.
                      </div>
                    </Button>
                    <Button
                      variant={post.costType === "free" ? "primary" : "outline"}
                      onClick={() =>
                        setPost((prev) => ({
                          ...prev,
                          costType: "free",
                        }))
                      }
                    >
                      무료
                      <div className={styles.desc}>
                        무료로 일정을 진행합니다.
                      </div>
                    </Button>
                    <Button
                      variant={
                        post.costType === "custom" ? "primary" : "outline"
                      }
                      onClick={() =>
                        setPost((prev) => ({
                          ...prev,
                          costType: "custom",
                        }))
                      }
                    >
                      인당 고정 금액
                      <div className={styles.desc}>
                        정해진 금액을 인원만큼 추가합니다.
                      </div>
                    </Button>
                  </div>
                </li>
              </ul>
            </div>
            <div className={styles.inputContentWrap}>
              <div className={styles.titleWrap}>
                <h2 className={styles.inputTitle}>첨부 이미지</h2>
                <label>{"(최대 3장, 첫 이미지는 썸네일 이미지)"}</label>
              </div>
              <AddThumbnail
                images={images}
                setImages={setImages}
                files={files}
                setFiles={setFiles}
              />
            </div>
            <div className={styles.registButtonWrap}>
              <Button type="submit">등록</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  navigate(-1);
                }}
              >
                취소
              </Button>
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
        minDate={new Date()}
      />

      <div className={styles.dateWrap}>
        <ul className={`${styles.inputWrap} ${styles.duringDate}`}>
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

const ScheduleTable = ({
  startDate,
  endDate,
  detailSchedule,
  setDetailSchedule,
}) => {
  const getDays = (startDate, endDate) => {
    const diff = endDate - startDate;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  useEffect(() => {
    const days = getDays(startDate, endDate);

    const arr = Array.from({ length: days }, (_, i) => ({
      dayNumber: i + 1,
      title: "",
      description: "",
    }));

    setDetailSchedule(arr);
  }, [startDate, endDate]);

  const handleChange = (index, key, value) => {
    setDetailSchedule((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
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
            {detailSchedule.map((row, i) => (
              <tr key={i}>
                <td>{row.dayNumber}</td>

                <td>
                  <input
                    className={styles.scheduleInput}
                    value={row.title}
                    onChange={(e) => handleChange(i, "title", e.target.value)}
                  />
                </td>

                <td>
                  <textarea
                    className={styles.scheduleTextarea}
                    value={row.description}
                    onChange={(e) =>
                      handleChange(i, "description", e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

const AddThumbnail = ({ images, setImages, files, setFiles }) => {
  const fileInputRef = useRef(null);

  const addImage = (file) => {
    if (!file) return;

    if (images.length >= 3) {
      alert("최대 3장까지 가능합니다.");
      return;
    }

    const url = URL.createObjectURL(file);

    // 기존 그대로 (UI용)
    setImages((prev) => [...prev, url]);

    // 🔥 추가 (업로드용)
    setFiles((prev) => [...prev, file]);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    const filesArr = Array.from(e.dataTransfer.files);
    const availableSlots = 3 - images.length;

    if (availableSlots <= 0) {
      alert("최대 3장까지 업로드 가능합니다.");
      return;
    }

    filesArr.slice(0, availableSlots).forEach(addImage);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const filesArr = Array.from(e.target.files);
    const availableSlots = 3 - images.length;

    if (availableSlots <= 0) {
      alert("최대 3장까지 업로드 가능합니다.");
      return;
    }

    const selectedFiles = filesArr.slice(0, availableSlots);

    if (filesArr.length > availableSlots) {
      alert(`최대 3장까지 가능합니다. ${availableSlots}장만 추가됩니다.`);
    }

    selectedFiles.forEach(addImage);
  };

  // 🔥 여기만 수정 (files도 같이 삭제)
  const handleDelete = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    return () => {
      images.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  return (
    <div className={styles.imageZone}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
        className={styles.dropZone}
      >
        이미지를 여기에 드롭하거나 클릭하세요
      </div>

      <input
        type="file"
        multiple
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <div className={styles.previewGrid}>
        {images.map((img, i) => (
          <div key={i} className={styles.imageWrap}>
            <img src={img} alt={`preview-${i}`} className={styles.image} />

            <button
              onClick={() => handleDelete(i)}
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

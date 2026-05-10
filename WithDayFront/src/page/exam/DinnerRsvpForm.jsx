// 1. React Query: 서버 데이터 페칭, 캐싱, 동기화, 로딩/에러 상태를 우아하게 관리합니다.
import { useQuery, useMutation } from "@tanstack/react-query";

// 2. React Hook Form: 렌더링을 최소화하면서 복잡한 폼 상태와 유효성 검사를 쉽게 처리합니다.
import { useForm } from "react-hook-form";

// 3. Yup: 직관적인 스키마를 통해 데이터 유효성 검증 규칙을 만듭니다. (Hook Form과 연동)
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// 4. Day.js: 무거운 Moment.js를 대체하는 아주 가볍고 사용하기 쉬운 날짜/시간 처리 라이브러리입니다.
import dayjs from "dayjs";

// 5. clsx: 조건에 따라 여러 CSS 클래스 이름들을 깔끔하게 조합해 줍니다.
import clsx from "clsx";

import styles from "./DinnerRsvpForm.module.css";

// --- [Yup] 폼 데이터 유효성 검사 스키마 정의 ---
// 친구에게 설명 포인트: "if문을 여러 개 쓸 필요 없이, 이 스키마 하나로 에러 메시지까지 세팅 끝!"
const schema = yup.object({
  name: yup
    .string()
    .required("이름을 입력해주세요.")
    .min(2, "이름은 2글자 이상이어야 합니다."),
  attending: yup.boolean().required(),
  // 참석할 경우에만 하고 싶은 말을 필수로 받는 조건부 로직도 가능합니다.
  comments: yup.string().max(50, "50자 이내로 적어주세요."),
});

// 가상의 API 함수 (React Query 설명용)
const fetchDinnerInfo = async () => {
  // 실제로는 fetch('/api/dinner') 등이 들어갑니다.
  return { date: "2026-04-14T19:00:00Z", location: "종로구 삼겹살집" };
};
const submitRsvp = async (data) => {
  console.log("서버로 전송된 데이터:", data);
  return "제출 성공!";
};

export default function DinnerRsvpForm() {
  // --- [React Query] 서버 데이터 읽기 (GET) ---
  // 친구에게 설명 포인트: "로딩 상태(isLoading)나 에러 처리를 직접 state로 만들 필요가 없어!"
  const { data: dinnerInfo, isLoading } = useQuery({
    queryKey: ["dinnerInfo"],
    queryFn: fetchDinnerInfo,
  });

  // --- [React Query] 서버 데이터 쓰기/수정 (POST/PUT) ---
  const mutation = useMutation({
    mutationFn: submitRsvp,
    onSuccess: () => alert("성공적으로 제출되었습니다!"),
  });

  // --- [React Hook Form + Yup] 폼 제어 및 유효성 검사 연결 ---
  // 친구에게 설명 포인트: "onChange, value state를 일일이 만들지 않아도 register 하나로 연결돼."
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange", // 입력할 때마다 유효성 검사 실행
  });

  // 현재 참석 여부(attending)의 값을 실시간으로 관찰합니다.
  const isAttending = watch("attending");

  if (isLoading)
    return <div className={styles.loading}>정보를 불러오는 중...</div>;

  return (
    <div className={styles.container}>
      {/* --- [Day.js] 날짜 포맷팅 --- */}
      {/* 친구에게 설명 포인트: "복잡한 Date 객체 대신, dayjs(날짜).format() 이면 원하는 형태가 바로 나와." */}
      <h2 className={styles.title}>
        프로젝트 랩업 회식 안내 <br />
        <span className={styles.dateInfo}>
          일시:{" "}
          {dayjs(dinnerInfo?.date).format("YYYY년 MM월 DD일 (ddd) A h시 m분")}
        </span>
      </h2>

      <form onSubmit={handleSubmit(mutation.mutate)} className={styles.form}>
        <div className={styles.formGroup}>
          <label>이름</label>
          <input
            type="text"
            // Hook Form의 register로 input을 폼에 등록
            {...register("name")}
            // --- [clsx] 조건부 클래스 적용 ---
            // 친구에게 설명 포인트: "className={`input ${error ? 'error' : ''}`} 처럼 지저분하게 안 써도 돼."
            className={clsx(styles.input, {
              [styles.inputError]: errors.name, // errors.name이 존재할 때만 적용됨
            })}
            placeholder="이름을 입력하세요"
          />
          {/* Yup에서 정의한 에러 메시지가 자동으로 출력됨 */}
          {errors.name && (
            <p className={styles.errorText}>{errors.name.message}</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>참석 여부</label>
          <select {...register("attending")} className={styles.input}>
            <option value="true">참석합니다!</option>
            <option value="false">아쉽지만 불참합니다.</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>남기실 말씀 (알레르기 등)</label>
          <textarea
            {...register("comments")}
            className={styles.textarea}
            placeholder="예: 땅콩 알레르기가 있어요."
          />
          {errors.comments && (
            <p className={styles.errorText}>{errors.comments.message}</p>
          )}
        </div>

        {/* clsx를 활용하여 폼의 유효성(isValid)과 참석 여부(isAttending)에 따라 버튼 색상을 다르게 렌더링 */}
        <button
          type="submit"
          disabled={!isValid || mutation.isPending}
          className={clsx(styles.submitBtn, {
            [styles.btnAttending]: isAttending === "true",
            [styles.btnNotAttending]: isAttending === "false",
            [styles.btnDisabled]: !isValid,
          })}
        >
          {mutation.isPending ? "제출 중..." : "제출하기"}
        </button>
      </form>
    </div>
  );
}

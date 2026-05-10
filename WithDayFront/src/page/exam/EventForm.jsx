// EventForm.jsx
import React from "react";

// [1. react-query] 서버 데이터 페칭과 로딩/에러 상태, 캐싱을 알아서 관리해줍니다.
import { useQuery } from "@tanstack/react-query";

// [2. react-hook-form] 폼의 상태(입력값, 에러 등)를 관리하고 불필요한 리렌더링을 막아줍니다.
import { useForm } from "react-hook-form";

// [3. yup] 입력된 값이 우리가 원하는 규칙에 맞는지(유효성) 검사하는 스키마를 만듭니다.
import * as yup from "yup";

// react-hook-form과 yup을 연결해주는 다리 역할입니다.
import { yupResolver } from "@hookform/resolvers/yup";

// [4. dayjs] 지저분한 날짜/시간 데이터를 원하는 포맷으로 아주 쉽게 변환해줍니다.
import dayjs from "dayjs";

// [5. clsx] 조건에 따라 CSS 클래스 이름들을 지저분하지 않게 합쳐줍니다.
import clsx from "clsx";

import styles from "./EventForm.module.css";

// 가상의 API 호출 함수 (실제로는 axios나 fetch 사용)
const fetchEventData = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        title: "2026 프론트엔드 최신 동향 세미나",
        date: "2026-05-15T14:00:00Z", // 서버에서 오는 알아보기 힘든 날짜 형식
      });
    }, 1000);
  });
};

// [Yup] 유효성 검사 규칙 설정
// 친구에게 설명할 포인트: "비밀번호는 몇 자 이상, 이메일은 이메일 형식이어야 한다는 규칙을 여기서 다 정해!"
const schema = yup.object().shape({
  name: yup.string().required("이름을 입력해주세요."),
  email: yup
    .string()
    .email("올바른 이메일 형식이 아닙니다.")
    .required("이메일을 입력해주세요."),
});

export default function EventForm() {
  // [React Query] 데이터 가져오기
  // 친구에게 설명할 포인트: "로딩 중인지, 에러가 났는지 우리가 따로 state로 만들 필요 없이 isLoading이 다 알려줘!"
  const {
    data: eventData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["eventDetails"],
    queryFn: fetchEventData,
  });

  // [React Hook Form] 폼 세팅
  // 친구에게 설명할 포인트: "yupResolver를 쓰면 아까 만든 yup 규칙을 이 폼에 찰떡같이 적용시켜줘."
  const {
    register, // input 태그에 연결해서 상태를 추적하게 해주는 함수
    handleSubmit, // 제출 버튼 눌렀을 때 실행될 함수를 감싸주는 래퍼
    formState: { errors, isValid }, // 현재 폼의 에러 상태와 유효성 통과 여부
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange", // 타이핑할 때마다 유효성 검사 실행
  });

  // 제출 완료 시 실행될 함수
  const onSubmit = (formData) => {
    console.log("제출된 데이터:", formData);
    alert(`${formData.name}님 신청이 완료되었습니다!`);
  };

  // 서버 데이터를 받아오기 전 화면
  if (isLoading) return <div>세미나 정보를 불러오는 중입니다...</div>;

  // 에러 발생 시 화면
  if (isError) return <div>세미나 정보를 불러오는 데 실패했습니다.</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>{eventData.title}</h2>
        {/* [Dayjs] 지저분한 서버 날짜(2026-05-15T14:00:00Z)를 보기 좋게 변환 */}
        {/* 친구에게 설명할 포인트: "dayjs() 안에 날짜 넣고 format()만 쓰면 끝이야!" */}
        <p className={styles.dateInfo}>
          일시: {dayjs(eventData.date).format("YYYY년 MM월 DD일 HH:mm")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* 이름 입력 영역 */}
        <div className={styles.formGroup}>
          <label>이름</label>
          <input
            {...register("name")} // react-hook-form에 이 input을 등록!
            // [clsx] 에러가 있으면 inputError 클래스를 추가하고, 없으면 기본 input 클래스만 적용
            className={clsx(styles.input, {
              [styles.inputError]: errors.name,
            })}
            placeholder="홍길동"
          />
          {/* 에러 메시지가 있으면 출력 */}
          {errors.name && (
            <span className={styles.errorText}>{errors.name.message}</span>
          )}
        </div>

        {/* 이메일 입력 영역 */}
        <div className={styles.formGroup}>
          <label>이메일</label>
          <input
            {...register("email")}
            className={clsx(styles.input, {
              [styles.inputError]: errors.email,
            })}
            placeholder="example@test.com"
          />
          {errors.email && (
            <span className={styles.errorText}>{errors.email.message}</span>
          )}
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={!isValid} // 모든 조건(yup)을 만족하지 않으면 버튼 비활성화
          // [clsx] isValid(유효성 통과 여부)에 따라 버튼 색상을 다르게 적용
          className={clsx(
            styles.submitBtn,
            isValid ? styles.btnActive : styles.btnDisabled,
          )}
        >
          신청하기
        </button>
      </form>
    </div>
  );
}

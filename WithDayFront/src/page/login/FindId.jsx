import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { findIdSchema } from "../../features/auth/validation/authSchema";

import FormField from "../../shared/ui/Form/FormField";
import { Input } from "../../shared/ui/Form/Form";
import Button from "../../shared/ui/Button/Button";
import styles from "./Find.module.css";

const FindId = () => {
  const navigate = useNavigate();

  const [foundEmail, setFoundEmail] = useState(null);

  // React Hook Form(useForm으로 사용) 초기화 및 설정.
  // findIdSchema 규칙대로 닉네임, 전화번호를 검사함.
  const {
    register, // 아래 UI에서 nickname, phone 값을 가져올 명찰
    handleSubmit, // findIdSchema 검사를 통과하면 onSubmit 함수를 실행시켜 줌
    setValue, // 전화번호 자동 하이픈 적용 시 input 값을 코드로 직접 넣기 위해 사용
    formState: { errors }, // findIdSchema 규칙 실패 시 에러 문구를 가져옴
  } = useForm({
    resolver: yupResolver(findIdSchema),
    mode: "onSubmit", // 아이디 찾기 버튼을 눌렀을 때만 검사
  });

  // 전화번호 입력값에서 숫자만 남기고 010-1234-5678 형태로 바꿔주는 함수
  const formatPhoneNumber = (value) => {
    const onlyNumbers = value.replace(/\D/g, "").slice(0, 11);

    if (onlyNumbers.length <= 3) {
      return onlyNumbers;
    }

    if (onlyNumbers.length <= 7) {
      return `${onlyNumbers.slice(0, 3)}-${onlyNumbers.slice(3)}`;
    }

    return `${onlyNumbers.slice(0, 3)}-${onlyNumbers.slice(3, 7)}-${onlyNumbers.slice(7)}`;
  };

  // 아이디 찾기 버튼을 눌렀을 때 실행되는 함수
  // handleSubmit이 findIdSchema 검사를 먼저 통과시킨 뒤 이 함수를 실행함.
  const onSubmit = (data) => {
    // data: react-hook-form이 UI에서 얻은 값 { nickname, phone }을 가진 객체

    console.log("아이디 찾기 입력값:", data);

    // TODO: 백엔드 연결 시 이 부분을 아이디 찾기 API 호출로 교체
    // 예: findIdUser(data).then((res) => setFoundEmail(res.maskedEmail));
    setFoundEmail("wi******@gmail.com");
  };

  return (
    <div className={styles.findPage}>
      <div className={styles.findCard}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate("/login")}
        >
          ‹ 로그인으로 돌아가기
        </button>

        <div className={styles.findHeader}>
          <p className={styles.findEyebrow}>WITHDAY ACCOUNT</p>
          <h1 className={styles.findTitle}>아이디 찾기</h1>
          <p className={styles.findSubtitle}>
            가입 시 입력한 닉네임과 전화번호로 아이디를 찾을 수 있어요.
          </p>
        </div>

        {!foundEmail ? (
          <form className={styles.findForm} onSubmit={handleSubmit(onSubmit)}>
            <FormField label="닉네임" error={errors.nickname}>
              <Input
                type="text"
                placeholder="닉네임을 입력해주세요"
                maxLength={20}
                {...register("nickname")}
              />
            </FormField>

            <FormField label="전화번호" error={errors.phone}>
              <Input
                type="tel"
                inputMode="numeric"
                placeholder="010-1234-5678"
                {...register("phone")}
                onChange={(e) => {
                  const formattedPhone = formatPhoneNumber(e.target.value);
                  setValue("phone", formattedPhone, {
                    shouldValidate: true,
                  });
                }}
              />
            </FormField>

            <Button type="submit" variant="primary" size="lg" fullWidth>
              아이디 찾기
            </Button>
          </form>
        ) : (
          <div className={styles.resultBox}>
            <div className={styles.resultIcon}>✓</div>

            <h2 className={styles.resultTitle}>가입된 아이디를 찾았어요</h2>
            <p className={styles.resultDesc}>
              개인정보 보호를 위해 이메일 일부만 보여드려요.
            </p>

            <div className={styles.emailResult}>{foundEmail}</div>

            <div className={styles.resultActions}>
              <Button
                type="button"
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => navigate("/login")}
              >
                로그인하기
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => navigate("/find-pw")}
              >
                비밀번호 찾기
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindId;

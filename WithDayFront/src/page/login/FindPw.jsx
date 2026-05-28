import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import {
  findPwEmailSchema,
  findPwCodeSchema,
  findPwResetSchema,
} from "../../features/auth/validation/authSchema";

import FormField from "../../shared/ui/Form/FormField";
import { Input } from "../../shared/ui/Form/Form";
import Button from "../../shared/ui/Button/Button";
import styles from "./Find.module.css";

const FindPw = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [serverAuthCode, setServerAuthCode] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);

  // 1단계: 이메일 입력 폼
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
  } = useForm({
    resolver: yupResolver(findPwEmailSchema),
    mode: "onSubmit",
  });

  // 2단계: 인증번호 입력 폼
  const {
    register: registerCode,
    handleSubmit: handleSubmitCode,
    setValue: setCodeValue,
    formState: { errors: codeErrors },
  } = useForm({
    resolver: yupResolver(findPwCodeSchema),
    mode: "onSubmit",
  });

  // 3단계: 새 비밀번호 입력 폼
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: resetErrors },
  } = useForm({
    resolver: yupResolver(findPwResetSchema),
    mode: "onSubmit",
  });

  // 인증번호 전송 버튼을 눌렀을 때 실행되는 함수
  // handleSubmitEmail이 findPwEmailSchema 검사를 먼저 통과시킨 뒤 이 함수를 실행함.
  const handleSendAuthCode = (data) => {
    // data: { email }

    // TODO: 백엔드 연결 시 이메일 인증번호 전송 API로 교체
    // 예: sendPasswordResetCode(data.email)
    const tempCode = "123456";

    setVerifiedEmail(data.email);
    setServerAuthCode(tempCode);

    alert(`임시 인증번호는 ${tempCode} 입니다.`);
    setStep(2);
  };

  // 인증번호 확인 버튼을 눌렀을 때 실행되는 함수
  // findPwCodeSchema는 6자리 숫자 형식만 검사하고, 실제 일치 여부는 여기서 비교함.
  const handleVerifyAuthCode = (data) => {
    // data: { authCode }

    if (data.authCode !== serverAuthCode) {
      alert("인증번호가 일치하지 않습니다.");
      return;
    }

    setStep(3);
  };

  // 비밀번호 재설정 버튼을 눌렀을 때 실행되는 함수
  // handleSubmitReset이 findPwResetSchema 검사를 먼저 통과시킨 뒤 이 함수를 실행함.
  const handleResetPassword = (data) => {
    // data: { newPassword, newPasswordConfirm }

    console.log("비밀번호 재설정 이메일:", verifiedEmail);
    console.log("새 비밀번호 입력값:", data);

    // TODO: 백엔드 연결 시 비밀번호 재설정 API로 교체
    // 예: resetPassword({ email: verifiedEmail, newPassword: data.newPassword })
    setStep(4);
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
          <h1 className={styles.findTitle}>비밀번호 찾기</h1>
          <p className={styles.findSubtitle}>
            이메일 인증 후 새 비밀번호를 설정할 수 있어요.
          </p>
        </div>

        {step < 4 && (
          <div className={styles.findStepBar}>
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`${styles.findStepDot} ${
                  step >= stepNumber ? styles.findStepDotActive : ""
                }`}
              >
                {stepNumber}
              </div>
            ))}
          </div>
        )}

        {step === 1 && (
          <form
            className={styles.findForm}
            onSubmit={handleSubmitEmail(handleSendAuthCode)}
          >
            <FormField
              label="이메일"
              error={emailErrors.email}
              helperText="가입한 이메일 주소를 입력해주세요."
            >
              <Input
                type="email"
                placeholder="example@withday.com"
                {...registerEmail("email")}
              />
            </FormField>

            <Button type="submit" variant="primary" size="lg" fullWidth>
              인증번호 전송
            </Button>
          </form>
        )}

        {step === 2 && (
          <form
            className={styles.findForm}
            onSubmit={handleSubmitCode(handleVerifyAuthCode)}
          >
            <FormField
              label="인증번호"
              error={codeErrors.authCode}
              helperText="이메일로 전송된 인증번호 6자리를 입력해주세요."
            >
              <Input
                type="text"
                inputMode="numeric"
                placeholder="인증번호 6자리"
                maxLength={6}
                {...registerCode("authCode")}
                onChange={(e) => {
                  const onlyNumbers = e.target.value.replace(/\D/g, "");
                  setCodeValue("authCode", onlyNumbers, {
                    shouldValidate: true,
                  });
                }}
              />
            </FormField>

            <Button type="submit" variant="primary" size="lg" fullWidth>
              인증번호 확인
            </Button>

            <button
              type="button"
              className={styles.textButton}
              onClick={() => {
                setStep(1);
                setServerAuthCode("");
                setVerifiedEmail("");
                setCodeValue("authCode", "");
              }}
            >
              이메일 다시 입력하기
            </button>
          </form>
        )}

        {step === 3 && (
          <form
            className={styles.findForm}
            onSubmit={handleSubmitReset(handleResetPassword)}
          >
            <FormField label="새 비밀번호" error={resetErrors.newPassword}>
              <div className={styles.passwordInputWrap}>
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder="새 비밀번호를 입력해주세요"
                  style={{ paddingRight: "40px" }}
                  {...registerReset("newPassword")}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPw((prev) => !prev)}
                >
                  {showPw ? (
                    <VisibilityOffIcon fontSize="small" />
                  ) : (
                    <VisibilityIcon fontSize="small" />
                  )}
                </button>
              </div>
            </FormField>

            <FormField
              label="새 비밀번호 확인"
              error={resetErrors.newPasswordConfirm}
            >
              <div className={styles.passwordInputWrap}>
                <Input
                  type={showPwConfirm ? "text" : "password"}
                  placeholder="새 비밀번호를 다시 입력해주세요"
                  style={{ paddingRight: "40px" }}
                  {...registerReset("newPasswordConfirm")}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPwConfirm((prev) => !prev)}
                >
                  {showPwConfirm ? (
                    <VisibilityOffIcon fontSize="small" />
                  ) : (
                    <VisibilityIcon fontSize="small" />
                  )}
                </button>
              </div>
            </FormField>

            <Button type="submit" variant="primary" size="lg" fullWidth>
              비밀번호 재설정
            </Button>
          </form>
        )}

        {step === 4 && (
          <div className={styles.resultBox}>
            <div className={styles.resultIcon}>✓</div>

            <h2 className={styles.resultTitle}>비밀번호가 변경되었어요</h2>
            <p className={styles.resultDesc}>
              새 비밀번호로 다시 로그인해주세요.
            </p>

            <Button
              type="button"
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate("/login")}
            >
              로그인하러 가기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindPw;

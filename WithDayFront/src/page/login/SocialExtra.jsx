import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// useQuery: 데이터를 가져올 때(Read) 사용. (예: 내 프로필 보기, 게시글 목록 가져오기)
// useMutation: 데이터를 바꾸거나 보낼 때(Create, Update, Delete) 사용. (예: 로그인하기, 회원가입하기, 게시글 삭제하기)
// 둘다 그때 사용하는 이유는 그것에 특화된 리엑트 쿼리들이라서
import { useMutation, useQuery } from "@tanstack/react-query";

import DaumPostcode from "react-daum-postcode"; // 카카오(다음)에서 제공하는 "주소 검색" 모달 띄우기용 라이브러리

import {
  Snackbar,
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { socialExtraSchema } from "../../features/auth/validation/authSchema";
import { fetchTerms, socialSignupUser } from "../../features/auth/api"; // axios 대신에 api.js로 빼서 백엔드와 소통

import FormField from "../../shared/ui/Form/FormField";
import { Input } from "../../shared/ui/Form/Form";
import Button from "../../shared/ui/Button/Button";
import styles from "./Auth.module.css";

const SocialExtra = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 현재 페이지 정보 저장. URL에 숨겨서 넘긴 state를 꺼내 쓸 수 있음. (빈 값 에러를 막기 위해 꺼낼 땐 location.state?. 로 접근)
  // 달력에서 미래 날짜를 선택하지 못하게 하기 위해 현재 날짜를 "YYYY-MM-DD" 형태로 뽑아냄. (HTML의 달력(date)은 반드시 "YYYY-MM-DD" 모양을 사용)
  // 순서(값은 예시) -> new Date(): Wed May 13 2026 17:35:00 GMT+0900 (한국 표준시), .toISOString(): "2026-05-13T08:35:00.000Z", .split("T"): ["2026-05-13", "08:35:00.000Z"], [0]: "2026-05-13"
  const todayDate = new Date().toISOString().split("T")[0];

  // 알림창(토스트, 기존 윈도우의 alert대신 사용) state
  const [toast, setToast] = useState({
    open: false, // 알림창을 띄울지 말지 (true면 띄움)
    message: "", // 알림창에 적힐 글씨
    severity: "success", // 알림창의 디자인 테마 (색상, 아이콘)
  });

  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false); // 주소 검색창을 킬지 끌지 정하는 state
  const [openTerms, setOpenTerms] = useState(null); // 약관 팝업용 state(어떤 약관을 열었는지 문자열로 저장, null / "TOS" / "PRIVACY" / "MARKETING")

  // 페이지 접속하자마자 구글 정보를 들고 (개발자가 만든)순서에 맞게 왔는지 검사함.
  useEffect(() => {
    // location.state: 로그인페이지에서 넘긴 구글 정보가 담긴 state.
    // location.state?.googleData: location.state에 googleData라는 구글 정보가 담김.
    // 이때 둘중 하나라도 없으면 접근 금지. 돌려보냄
    if (!location.state || !location.state.googleData) {
      alert("잘못된 접근입니다. 다시 로그인해주세요.");
      // replace: true 옵션으로 뒤로가기 버튼을 망가뜨려서 이 불법 페이지로 못 돌아오게 막음!
      navigate("/login", { replace: true });
    }
  }, [location, navigate]);

  // 보따리에서 구글이 던져준 4가지 정보(이메일, 이름, ID, 프사)를 변수에 고이 모셔둠
  const googleData = location.state?.googleData || {};

  const handleCloseToast = (event, reason) => {
    if (reason === "clickaway") return;
    setToast((prev) => ({ ...prev, open: false }));
  };

  // 📋 React Hook Form 초기화 (약관 기본값 false)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(socialExtraSchema),
    mode: "onChange",
    defaultValues: {
      agreeTos: false,
      agreePrivacy: false,
      agreeMarketing: false,
    },
  });

  // 약관 전체동의 로직 (Signup.jsx랑 완전히 똑같음)
  const allAgreed =
    watch("agreeTos") && watch("agreePrivacy") && watch("agreeMarketing");
  const handleAgreeAll = (e) => {
    const isChecked = e.target.checked;
    setValue("agreeTos", isChecked, { shouldValidate: true });
    setValue("agreePrivacy", isChecked, { shouldValidate: true });
    setValue("agreeMarketing", isChecked, { shouldValidate: true });
  };

  // 약관 데이터 불러오기 (GET)
  const { data: termsData } = useQuery({
    queryKey: ["terms"],
    queryFn: fetchTerms,
  });

  // 모달창 헬퍼 함수들
  const getTermTitle = (type) => {
    if (type === "TOS") return "이용약관";
    if (type === "PRIVACY") return "개인정보 수집 및 이용";
    if (type === "MARKETING") return "마케팅 정보 수신";
    return "약관";
  };

  const getTermContent = (type) => {
    if (!termsData) return "약관 데이터를 불러오는 중입니다...";
    const term = termsData.find((t) => t.type === type);
    return term ? term.content : "약관 내용이 없습니다.";
  };

  // 주소 검색 헬퍼 함수
  const handleCompletePostcode = (data) => {
    let fullAddress = data.address;
    let extraAddress = "";
    if (data.addressType === "R") {
      if (data.bname !== "") extraAddress += data.bname;
      if (data.buildingName !== "")
        extraAddress +=
          extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
      fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
    }
    setValue("postcode", data.zonecode);
    setValue("address", fullAddress);
    setIsPostcodeOpen(false);
  };

  // 🚀 최종 소셜 가입 통신 (POST)
  const mutation = useMutation({
    mutationFn: socialSignupUser,
    onSuccess: () => {
      // 💡 [UX 핵심] 가입 끝나자마자 0초 만에 로그인 페이지로 쏘면서, 보따리에 성공 축하 쪽지를 넣음!
      navigate("/login", {
        state: {
          toastMessage: "회원가입이 완료되었습니다! 다시 로그인해주세요.",
        },
      });
    },
    onError: (error) => {
      const errMsg = error.response?.data || "가입에 실패했습니다.";
      setToast({ open: true, message: errMsg, severity: "error" });
    },
  });

  // 유저가 [추가 정보 입력 완료] 찐 최종 제출 버튼을 눌렀을 때!
  const onSubmit = (data) => {
    // 💡 [조립의 시간]
    // 유저가 방금 친 폼 데이터(생일, 주소 등)와 아까 킵해둔 구글 데이터(이메일 등)를 하나의 객체로 완벽하게 합체!
    const signupData = {
      user: {
        // --- 구글에서 가져온 거 ---
        email: googleData.email,
        nickname: googleData.nickname,
        providerId: googleData.providerId,
        profileImage: googleData.profileImage,
        // --- 방금 유저가 쓴 거 ---
        birthday: data.birthday,
        gender: data.gender,
        phone: data.phone,
        postcode: data.postcode,
        address: data.address,
        detailAddress: data.detailAddress,
      },
      terms: {
        TOS: data.agreeTos,
        PRIVACY: data.agreePrivacy,
        MARKETING: data.agreeMarketing,
      },
    };

    // 여긴 파일 전송이 없기 때문에! Signup처럼 복잡한 FormData나 Blob을 안 쓰고
    // 방금 조립한 예쁜 JSON 객체(signupData)를 그대로 서버로 쏩니다.
    mutation.mutate(signupData);
  };

  /* 🎨 UI (JSX) 시작: 일반 가입폼과 비슷하지만 이메일/비번/이미지 칸이 삭제된 다이어트 버전 */
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>조금만 더 알려주세요!</h1>
          <p className={styles.subtitle}>
            원활한 서비스 이용을 위해 필수 정보를 입력해주세요.
          </p>
        </div>

        {/* handleSubmit이 에러가 없으면 onSubmit 조립/발송 함수를 실행시킴 */}
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <FormField label="생년월일" error={errors.birthday}>
            <Input type="date" max={todayDate} {...register("birthday")} />
          </FormField>

          <FormField label="성별" error={errors.gender}>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input type="radio" value="1" {...register("gender")} /> 남
              </label>
              <label className={styles.radioLabel}>
                <input type="radio" value="2" {...register("gender")} /> 여
              </label>
            </div>
          </FormField>

          <FormField label="전화번호" error={errors.phone}>
            <Input
              type="tel"
              placeholder="010-1234-5678"
              {...register("phone")}
            />
          </FormField>

          <FormField label="주소" error={errors.postcode || errors.address}>
            <div className={`${styles.inputRow} ${styles.marginBottom8}`}>
              <div className={styles.flex1}>
                {/* 우편번호와 기본주소는 readOnly로 막아두어 무조건 버튼을 누르게 강제함 */}
                <Input
                  type="text"
                  placeholder="우편번호"
                  readOnly
                  {...register("postcode")}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPostcodeOpen(true)}
              >
                주소 검색
              </Button>
            </div>
            <div className={styles.marginBottom8}>
              <Input
                type="text"
                placeholder="기본 주소"
                readOnly
                {...register("address")}
              />
            </div>
            <Input
              type="text"
              placeholder="상세 주소를 입력해주세요"
              {...register("detailAddress")}
              error={errors.detailAddress}
            />
          </FormField>

          {/* 약관 동의 영역 */}
          <div className={styles.termsContainer}>
            <label className={styles.termLabelAll}>
              <input
                type="checkbox"
                checked={allAgreed}
                onChange={handleAgreeAll}
              />
              <span className={styles.termText}>이용약관 전체 동의합니다.</span>
            </label>

            <label className={styles.termLabel}>
              <input type="checkbox" {...register("agreeTos")} />
              <span className={styles.termText}>
                [필수] 이용약관에 동의합니다.
              </span>
              <span
                className={styles.termLink}
                onClick={(e) => {
                  e.preventDefault();
                  setOpenTerms("TOS");
                }}
              >
                보기
              </span>
            </label>
            {errors.agreeTos && (
              <p className={styles.termError}>{errors.agreeTos.message}</p>
            )}

            <label className={styles.termLabel}>
              <input type="checkbox" {...register("agreePrivacy")} />
              <span className={styles.termText}>
                [필수] 개인정보 수집 및 이용에 동의합니다.
              </span>
              <span
                className={styles.termLink}
                onClick={(e) => {
                  e.preventDefault();
                  setOpenTerms("PRIVACY");
                }}
              >
                보기
              </span>
            </label>
            {errors.agreePrivacy && (
              <p className={styles.termError}>{errors.agreePrivacy.message}</p>
            )}

            <label className={styles.termLabel}>
              <input type="checkbox" {...register("agreeMarketing")} />
              <span className={styles.termText}>
                [선택] 마케팅 정보 수신에 동의합니다.
              </span>
              <span
                className={styles.termLink}
                onClick={(e) => {
                  e.preventDefault();
                  setOpenTerms("MARKETING");
                }}
              >
                보기
              </span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "가입 처리 중..." : "추가 정보 입력 완료"}
          </Button>
        </form>
      </div>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ bottm: "80px !important" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={isPostcodeOpen}
        onClose={() => setIsPostcodeOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          주소 검색
          <IconButton onClick={() => setIsPostcodeOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <DaumPostcode
            onComplete={handleCompletePostcode}
            style={{ width: "100%", height: "400px" }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={openTerms !== null}
        onClose={() => setOpenTerms(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: "bold",
          }}
        >
          {openTerms ? getTermTitle(openTerms) : ""}
          <IconButton onClick={() => setOpenTerms(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <pre className={styles.termPre}>
            {openTerms ? getTermContent(openTerms) : ""}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SocialExtra;

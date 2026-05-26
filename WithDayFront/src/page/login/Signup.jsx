import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import { signupSchema } from "../../features/auth/validation/authSchema";
import {
  signupUser,
  fetchTerms,
  sendEmailVerification,
} from "../../features/auth/api"; // axios 대신에 api.js로 빼서 백엔드와 소통

import FormField from "../../shared/ui/Form/FormField";
import { Input } from "../../shared/ui/Form/Form";
import Button from "../../shared/ui/Button/Button";
import styles from "./Auth.module.css";

const Signup = () => {
  const navigate = useNavigate();
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
  const [openTerms, setOpenTerms] = useState(null); // 약관 팝업용 state(어떤 약관을 열었는지 문자열로 저장, null / "TOS" / "PRIVACY" / "MARKETING" / "NOTIFICATION")

  const [showPw, setShowPw] = useState(false); // 비밀번호 보임/숨김 결정하는 state
  const [showPwConfirm, setShowPwConfirm] = useState(false); // 비밀번호 확인 보임/숨김 결정하는 state

  const [step, setStep] = useState(1); // 회원가입 단계 결정하는 state (1: 약관동의, 2: 계정정보, 3: 기본정보, 4: 관심사 선택, 5: 회원가입 완료)

  const [mailAuth, setMailAuth] = useState(0); // 현재 이메일 인증 상태 state (0: 인증번호 안보낸 상태, 1: 인증번호 보내는중, 2: 인증번호 발송 완료 및 타이머 작동, 3: 인증 성공)
  const [mailAuthCode, setMailAuthCode] = useState(null); // 백엔드에서 생성한 이메일 인증 번호 state
  const [mailAuthInput, setMailAuthInput] = useState(""); // 유저가 인증번호 입력창에 입력한 번호 state

  const [time, setTime] = useState(180); // 인증번호 타이머의 남은 시간 state (180초)
  const timerRef = useRef(null); // 시간(180초) 자체는 state로 화면에 렌더링하고, 이 ref는 나중에 타이머를 끌 때 필요한 타이머 ID만 화면 렌더링 영향 없이 담아두는 용도

  // 회원가입 완료 단계(step이 5)가 되면 3초 뒤에 로그인 화면으로 이동하는 useEffect
  useEffect(() => {
    // step이 5일 때(회원가입 완료 단계)
    if (step === 5) {
      // 3초(3000ms) 뒤에 로그인 화면으로 이동하는 타이머 설정
      const timer = setTimeout(() => {
        navigate("/login", {
          state: {
            toastMessage: "회원가입이 완료되었습니다! 다시 로그인해주세요.", 
          },
        });
      }, 3000);

      // 회원가입 완료 단계에서 페이지를 떠나거나(step이 5가 아니게 되거나) 컴포넌트가 사라질 때 타이머 정지 (안그러면 3초 뒤에 갑자기 로그인 화면으로 이동하는 버그 발생)
      return () => clearTimeout(timer);
    }
  }, [step, navigate]);

  // 알림창 끄기버튼(X표시) 누르거나 시간 지나면 닫히게(UI 하단의 Snackbar 태그에 있는 autoHideDuration 속성으로 시간이 되면 자동으로 닫힘.)하는 함수,
  // reason: 알림창(토스트)가 닫히는 이유, event: 여기선 안쓰긴 하는데 마우스의 x,y 좌표및 어떤 html태그를 클릭했는지등의 정보를 가짐
  const handleCloseToast = (event, reason) => {
    // reason 즉 닫히는 이유가 바깥 클릭이면 닫히는 걸 막음.
    if (reason === "clickaway") {
      return;
    }
    setToast((prev) => ({ ...prev, open: false })); // 기존상태 유지하게하고, 토스트의 open을 false로 해야 알람이 닫힘.
  };

  // React Hook Form(useForm으로 사용) 초기화 및 설정. 이때 yup이 보안 규칙을 정해놓고 가지고 있는데 그걸 가져올거임.
  const {
    register, // 아래의 UI에서 email, pw등을 가져올 명찰
    handleSubmit, // 에러(signupSchema 규칙 틀림)가 있으면 통과 안시켜주고, 규칙을 다 지키면 진짜 제출 함수(onSubmit)를 실행시켜 줌.
    setValue, // 직접 타이핑하지 않고도 코드를 통해 강제로 값을 넣기위해 사용.
    getValues, // 인증번호 전송을 눌렀을때 렌더링없이(watch처럼 렌더링이 필요없기에) email input칸에 있는값을 백엔드로 보낼때 사용.
    watch, // 특정 입력창(체크박스등도 포함)을 보고 값이 바뀔때마다 화면에 반영함(렌더링). 여기선 약관 4개를 다 체크하면 전체체크에도 자동으로 체크되게 만들때 사용.
    trigger, // 특정 입력창의 yup 검사를 강제로 실행시킴. 여기선 다음 step로 넘어갈 때 그 step에서 검사해야할 입력창들의 yup 검사를 실행시키는 데 사용.
    formState: { errors }, // 에러(signupSchema 규칙 틀림)발생시 에러문구를 signupSchema에서 가져옴.
  } = useForm({
    resolver: yupResolver(signupSchema), // authSchema(yup)의 signupSchema 규칙대로 검사한다고 지정
    mode: "onChange", // 로그인때는 onSubmit이었지만 이번엔 완전히 반대로 타이핑 할때마다 실시간으로 검사함.
    // 약관 체크박스는 처음에 모두 false(체크해제) 상태로 시작
    defaultValues: {
      agreeTos: false,
      agreePrivacy: false,
      agreeMarketing: false,
      agreeNotification: false,
    },
  }); // 여기서 세팅한 폼은 UI의 <form onSubmit={handleSubmit(onSubmit)}> 와 연결되어 검사 통과 시 onSubmit 함수로 데이터를 넘겨주고 mutation.mutate를 통해 백엔드로 값을 보냄.

  // 다음으로 버튼을 눌렀을 때 step 이동 로직
  const handleNextStep = async () => {
    let isStepValid = false;

    if (step === 1) {
      // 1단계: 약관 필수 항목 2개만 검사 (이용약관 동의, 개인정보 수집 및 이용 동의)
      isStepValid = await trigger(["agreeTos", "agreePrivacy"]);
    } else if (step === 2) {
      // 2단계: 계정 정보 검사 (이메일, 비밀번호, 비밀번호 확인)
      isStepValid = await trigger(["email", "password", "passwordConfirm"]);

      // 2단계에서 이메일 인증이 안되어 있으면 다음 step으로 못 넘어가게 막음. (isStepValid가 true여도 mailAuth가 3이 아니면 막음)
      if (isStepValid && mailAuth !== 3) {
        // 토스트 세팅
        setToast({
          open: true,
          message: "이메일 인증을 완료해주세요.",
          severity: "warning",
        });
        return; // 함수 종료 (다음으로 못 넘어감)
      }
    } else if (step === 3) {
      // 3단계: 기본 정보 검사 (닉네임, 생년월일, 성별, 전화번호, 주소)
      isStepValid = await trigger([
        "nickname",
        "birthday",
        "gender",
        "phone",
        "postcode",
        "address",
        "detailAddress",
      ]);
    }

    // 검사가 통과(isStepValid가 true)하면 step을 1 증가시켜서 다음 step으로 넘어가게 함.
    if (isStepValid) {
      setStep((prev) => prev + 1);
    }
  };

  // watch로 4개의 체크박스를 실시간으로 확인하여 4개 다 true면 allAgreed도 true가 됨.
  const allAgreed =
    watch("agreeTos") &&
    watch("agreePrivacy") &&
    watch("agreeMarketing") &&
    watch("agreeNotification");

  // 전체 동의 체크박스를 클릭했을 때
  const handleAgreeAll = (e) => {
    const isChecked = e.target.checked; // 전체동의 박스가 체크(true)인지 체크해제(false)인지 저장.
    // setValue(target이름, 넣을 값(value), 추가 옵션 객체(options))를 통해 강제로 나머지 4개 박스의 값을 똑같이 isChecked로 바꿈.
    // shouldValidate를 써서 yup의 검사를 다시함. 이유: setValue는 watch처럼 값이 바뀐다고 렌더링되지 않음. setValue만으로는 yup 검사를 하지않음.
    setValue("agreeTos", isChecked, { shouldValidate: true });
    setValue("agreePrivacy", isChecked, { shouldValidate: true });
    setValue("agreeMarketing", isChecked, { shouldValidate: true });
    setValue("agreeNotification", isChecked, { shouldValidate: true });
  };

  // 백엔드에서 약관 데이터 가져오기(useQuery니까 페이지 들어가자마자 데이터 가져옴)
  // 백엔드에서 가져온 데이터(data)를 termsData라고 부를거임.
  const { data: termsData } = useQuery({
    queryKey: ["terms"], // fetchTerms로 가져온 데이터를 terms라고 저장.
    queryFn: fetchTerms, // api.js에 있는 fetchTerms로 GET 요청 함수 실행해서 백엔드에서 약관 정보를 가져옴.
  });

  // 백엔드/코드에서 쓰는 약관 이름(TOS 등)을 한글로 바꿔주는 함수 (약관 제목용)
  const getTermTitle = (type) => {
    if (type === "TOS") {
      return "이용약관";
    } else if (type === "PRIVACY") {
      return "개인정보 수집 및 이용";
    } else if (type === "MARKETING") {
      return "마케팅 정보 수신";
    } else if (type === "NOTIFICATION") {
      return "알림 수신";
    } else {
      return "약관"; // 앞의 TOS, PRIVACY등이 안들어왔을때 빈칸이나 에러 대신 약관을 씀.
    }
  };

  // 모달창 띄울 때 넘겨받은 데이터(openTerms state)와 같은 내용(백엔드에서 받아온 termsData)을 찾는 함수 (약관 내용용)
  const getTermContent = (type) => {
    // 페이지 들어와서 useQuery로 데이터 가져오는중일때 (termsData가 비어있음 -> false)
    if (!termsData) {
      return "약관 데이터를 불러오는 중입니다...";
    }
    // openTerms state에 설정된 값과 termsData와 같은 것을 찾아서 term에 저장
    const term = termsData.find((t) => {
      return t.type === type;
    });
    // term은 이용약관 데이터를 다 가지고 있음. 그중 내용을 띄움.
    return term ? term.content : "약관 내용이 없습니다.";
  };

  // 회원가입 mutation (백엔드 통신)
  const mutation = useMutation({
    mutationFn: signupUser, // api.js에 있는 signupUser로 POST 요청 함수 실행해서 백엔드로 회원가입 정보를 보냄
    // 통신 성공시
    onSuccess: () => {
      setStep(5); // 회원가입 완료 단계로 이동
    },
    // 통신 실패시
    onError: (error) => {
      // 서버가 준 에러 메세지를 알림창에 띄움
      const errMsg = error.response?.data || "회원가입에 실패했습니다."; // 백엔드 기본 응답(예: "이미 있는 이메일입니다.") or 커스텀"실패"메세지
      setToast({ open: true, message: errMsg, severity: "error" }); // 알림창(토스트) 세팅
    },
  });

  // 주소 찾기 팝업에서 주소를 클릭했을 때 실행되는 함수
  const handleCompletePostcode = (data) => {
    let fullAddress = data.address; // 카카오가 준 기본 주소 (예: "경기 성남시 분당구 판교역로 166")
    let extraAddress = ""; // 괄호 안에 들어갈 추가 주소 (아파트 이름, 동이름등)

    // R: Road(도로명 주소), J: Jibun(지번 주소) / 도로명 주소일 때 괄호 치고 (법정동, 건물명) 이런식으로 씀.
    if (data.addressType === "R") {
      if (data.bname !== "") {
        extraAddress += data.bname; // 위에서 extraAddress가 괄호에 들어간다 했음. 법정동 이름(예: 백현동)
      }
      if (data.buildingName !== "") {
        extraAddress +=
          extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName; // buildingName: 건물 이름(예: 카카오 판교아지트) / extraAddress가 비어있지 않으면 (~~, 건물이름)으로 들어가고 비어있으면 (건물이름)만 들어감.
      }
      fullAddress += extraAddress !== "" ? ` (${extraAddress})` : ""; // fullAddress + extraAddress 했을때 비어있지 않으면 -> 최종 완성: 인천 남동구 구월동 (ㅇㅇ아파트)
    }

    // 폼(input) 안에 있는 postcode, address에 setValue로 값을 넣음.
    setValue("postcode", data.zonecode); // 카카오가 준 우편번호
    setValue("address", fullAddress); // 최종 완성된 주소
    setIsPostcodeOpen(false); // 주소 찾았으니 팝업은 닫음.
  };

  // 인증번호 전송 버튼을 눌렀을 때
  const handleSendMail = async () => {
    const emailValue = getValues("email"); // 이메일 input에 적힌 글씨를 getValues로 가져옴.
    // emailValue가 비어있으면
    if (!emailValue) {
      // 토스트 세팅
      setToast({
        open: true,
        message: "이메일을 먼저 입력해주세요.",
        severity: "warning",
      });
      return;
    }

    // 여기서는 MailAuth(0)으로 기본값이니 전송 시작 전
    setTime(180); // 180초 세팅
    setMailAuthCode(null); // 인증번호 초기화
    // 현재 타이머가 있다면(이전에 작동한 타이머)
    if (timerRef.current) {
      window.clearInterval(timerRef.current); // 타이머 정지
    }

    setMailAuth(1); // 인증번호 전송중인 상태
    // 토스트 세팅
    setToast({
      open: true,
      message: "인증번호를 발송 중입니다...",
      severity: "info",
    });

    try {
      // 백엔드에 이메일 보내주고 응답 기다림(await)
      const res = await sendEmailVerification(emailValue);

      // 토스트 세팅(await가 끝나야 이 코드가 작동)
      setToast({
        open: true,
        message: "이메일로 인증번호가 발송되었습니다!",
        severity: "success",
      });
      setMailAuthCode(String(res)); // 백엔드가 보내준 인증번호를 문자로 바꿔서 state에 저장
      console.log("백엔드에서 온 인증번호:", res); // 콘솔에 백엔드에서 온 인증번호 찍어보기 (개발자용, 유저는 못봄)
      setMailAuth(2); // 인증번호 발송 완료 및 타이머 작동 상태

      // 1초(1000ms)마다 1씩 값을 내리는 타이머 작동
      timerRef.current = window.setInterval(() => {
        setTime((prev) => {
          // 시간이 0이 되면(prev가 1포함인데 prev가 2에서 1이 되고 1초(1000ms)가 지나니 if문에 도착했을때가 실제 시간이 0일때가 됨.)
          if (prev <= 1) {
            window.clearInterval(timerRef.current); // 타이머 정지
            // 토스트 세팅
            setToast({
              open: true,
              message: "인증 시간이 만료되었습니다. 다시 시도해주세요.",
              severity: "warning",
            });
            setMailAuthCode(null); // 인증번호 초기화
            setMailAuth(0); // 전송 시작 전으로 되돌림
            return 0;
          }
          // setTime(time - 1)이라고 쓰면, 계속 180 - 1 = 179초만 화면에 띄움. 이유(time은 state 값이라서 현재 함수에서 계속 180초로 기억함. 값을 빼도 다시 180초로 기억함.)
          return prev - 1; // 1초 감소
        });
      }, 1000);
    } catch (err) {
      // 토스트 세팅 (err일때)
      setToast({
        open: true,
        message: "이메일 발송에 실패했습니다. 이메일을 확인해주세요.",
        severity: "error",
      });
      setMailAuth(0); // 전송 시작 전으로 되돌림
    }
  };

  // 인증하기 버튼을 눌렀을 때(이메일 인증번호)
  const handleVerifyCode = () => {
    // 인증번호(mailAuthCode)와 입력한 값(mailAuthInput)이 같고 입력한 값이 빈칸이 아닐때
    if (mailAuthCode === mailAuthInput && mailAuthInput !== "") {
      setMailAuth(3); // 인증 성공 상태
      window.clearInterval(timerRef.current); // 인증 성공했으니 타이머 정지
      // 토스트 세팅
      setToast({
        open: true,
        message: "이메일 인증이 완료되었습니다.",
        severity: "success",
      });
    } else {
      // 토스트 세팅(인증번호가 틀렸을때)
      setToast({
        open: true,
        message: "인증코드가 올바르지 않습니다.",
        severity: "error",
      });
    }
  };

  // 180초를 3:00 처럼 분:초 형태로 바꿔주는 함수
  const showTime = () => {
    const min = Math.floor(time / 60);
    const sec = String(time % 60).padStart(2, "0"); // .padStart(2, "0"): 초가 한자리 숫자면 앞에 0 붙여서 2자리로 만듬 (예: 3 -> 03)
    return `${min}:${sec}`;
  };

  // 회원가입 완료 버튼을 눌렀을 때
  const onSubmit = (data) => {
    // 사진(파일)과 글씨(데이터)를 한 번에 백엔드로 보내려면 FormData라는 객체로 묶어서 보내야함. 일반 JSON 통신으로는 글씨 데이터는 보낼수 있지만 파일은 보낼수 없기 때문에
    const formData = new FormData();

    // 백엔드의 SignupRequestDTO 모양에 맞춰서 객체를 만듬.
    const signupData = {
      user: {
        email: data.email,
        password: data.password,
        nickname: data.nickname,
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
        MARKETING: data.agreeMarketing || false, // false는 체크 안한 상태, true는 체크한 상태.
        NOTIFICATION: data.agreeNotification || false, // false는 체크 안한 상태, true는 체크한 상태.
      },
    };

    // formData 객체에 데이터를 넣은건데 그냥 넣으면 백엔드에서 문자열로 인식함.
    // 그래서 JSON.stringify(signupData)로 객체를 JSON 문자열로 바꾸고,
    // new Blod([...])로 문자열을 마치 하나의 파일덩어리(Blob)처럼 감싸버림.
    // { type: "application/json" }은 백엔드에 JSON 파일이라고 알려주는 역할.
    formData.append(
      "signupData",
      new Blob([JSON.stringify(signupData)], { type: "application/json" }),
    );

    // 프로필 사진 파일을 넣어줌. data.profileImage는 FileList 형태로 되어있어서, 여러값이 들어있을 수 있는데 그 중 0번째 값을 실제 파일로 넣어줌.
    if (data.profileImage && data.profileImage[0]) {
      formData.append("profileImage", data.profileImage[0]);
    }

    mutation.mutate(formData); // formData 객체를 mutation.mutate로 백엔드로 보냄. (api.js의 signupUser 함수로 POST 요청)
  };

  return (
    <div className={styles.signupPage}>
      <div className={styles.formSection}>
        <div className={styles.formCard}>
          {step < 5 && (
            <nav className={styles.signupStepper} aria-label="회원가입 단계">
              {["약관 동의", "계정 정보", "기본 정보", "관심사 선택"].map((label, index) => {
                const stepNumber = index + 1;
                return (
                  <div
                    key={label}
                    className={`${styles.signupStep} ${
                      step === stepNumber ? styles.signupStepActive : ""
                    } ${step > stepNumber ? styles.signupStepDone : ""}`}
                  >
                    <div className={styles.signupStepNumber}>
                      <span>{stepNumber}</span>
                    </div>
                    <div className={styles.signupStepLabel}>{label}</div>
                  </div>
                );
              })}
              <div className={`${styles.signupStep} ${step === 5 ? styles.signupStepActive : ""}`}>
                <div className={styles.signupStepNumber}><span>5</span></div>
                <div className={styles.signupStepLabel}>가입 완료</div>
              </div>
            </nav>
          )}

          {/* handleSubmit(onSubmit): HTML 기본 제출 기능을 막고(이게 없으면 html의 form은 누르면 바로 sumbit하려함), React Hook Form의 검증을 거친 후 onSubmit을 실행시킴 */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 1 && (
              <div className={styles.flowSection}>
                <div className={styles.flowHero}>
                  <p className={styles.flowEyebrow}>WITHDAY SIGN UP</p>
                  <h2 className={styles.flowTitle}>약관 동의 후 가입을 시작합니다</h2>
                </div>

                <label className={`${styles.panel} ${styles.panelStrong} ${styles.checkCard} ${styles.checkCardStrong}`}>
                  <span className={styles.checkInput}>
                    <input
                      type="checkbox"
                      checked={allAgreed} // 전체 동의 박스는 allAgreed가 true면 체크, false면 체크해제
                      onChange={handleAgreeAll} // 전체 동의 박스를 클릭했을 때 handleAgreeAll 함수 실행
                    />
                  </span>
                  <span className={styles.checkBody}>
                    <span className={styles.checkTitle}>약관 전체 동의</span>
                  </span>
                </label>

                <div className={styles.stackMd} style={{ marginTop: '16px' }}>
                  <label className={`${styles.panel} ${styles.panelInteractive} ${styles.checkCard}`}>
                    <span className={styles.checkInput}>
                      <input type="checkbox" {...register("agreeTos")} />
                    </span>
                    <span className={styles.checkBody}>
                      <span className={styles.checkHeader}>
                        <span className={styles.checkTitle}>서비스 이용약관</span>
                        <span className={styles.badge}>필수</span>
                      </span>
                      <span
                        className={styles.flowLinkText}
                        onClick={(e) => {
                          e.preventDefault(); // '보기' 클릭해도 체크박스 체크 안되게 막음
                          setOpenTerms("TOS"); // openTerms state에 "TOS"를 넣어서 이용약관 모달이 열리게 함.
                        }}
                      >
                        자세히 보기
                      </span>
                      {/* errors.agreeTos가 있으면 에러메세지 띄움 */}
                      {errors.agreeTos && <span className={styles.errorText}>{errors.agreeTos.message}</span>}
                    </span>
                  </label>

                  <label className={`${styles.panel} ${styles.panelInteractive} ${styles.checkCard}`}>
                    <span className={styles.checkInput}>
                      <input type="checkbox" {...register("agreePrivacy")} />
                    </span>
                    <span className={styles.checkBody}>
                      <span className={styles.checkHeader}>
                        <span className={styles.checkTitle}>개인정보 수집 및 이용</span>
                        <span className={styles.badge}>필수</span>
                      </span>
                      <span
                        className={styles.flowLinkText}
                        onClick={(e) => {
                          e.preventDefault(); // '보기' 클릭해도 체크박스 체크 안되게 막음
                          setOpenTerms("PRIVACY"); // openTerms state에 "PRIVACY"를 넣어서 개인정보 수집 및 이용 모달이 열리게 함.
                        }}
                      >
                        자세히 보기
                      </span>
                      {/* errors.agreePrivacy가 있으면 에러메세지 띄움 */}
                      {errors.agreePrivacy && <span className={styles.errorText}>{errors.agreePrivacy.message}</span>}
                    </span>
                  </label>

                  <label className={`${styles.panel} ${styles.panelInteractive} ${styles.checkCard}`}>
                    <span className={styles.checkInput}>
                      <input type="checkbox" {...register("agreeMarketing")} />
                    </span>
                    <span className={styles.checkBody}>
                      <span className={styles.checkHeader}>
                        <span className={styles.checkTitle}>마케팅 정보 수신</span>
                        <span className={styles.badge} style={{ background: '#e9ecef', color: '#666' }}>선택</span>
                      </span>
                      <span
                        className={styles.flowLinkText}
                        onClick={(e) => {
                          e.preventDefault(); // '보기' 클릭해도 체크박스 체크 안되게 막음
                          setOpenTerms("MARKETING"); // openTerms state에 "MARKETING"를 넣어서 마케팅 정보 수신 모달이 열리게 함.
                        }}
                      >
                        자세히 보기
                      </span>
                    </span>
                  </label>

                  <label className={`${styles.panel} ${styles.panelInteractive} ${styles.checkCard}`}>
                    <span className={styles.checkInput}>
                      <input type="checkbox" {...register("agreeNotification")} />
                    </span>
                    <span className={styles.checkBody}>
                      <span className={styles.checkHeader}>
                        <span className={styles.checkTitle}>앱 푸시 알림 수신</span>
                        <span className={styles.badge} style={{ background: '#e9ecef', color: '#666' }}>선택</span>
                      </span>
                      <span
                        className={styles.flowLinkText}
                        onClick={(e) => {
                          e.preventDefault(); // '보기' 클릭해도 체크박스 체크 안되게 막음
                          setOpenTerms("NOTIFICATION"); // openTerms state에 "NOTIFICATION"를 넣어서 마케팅 정보 수신 모달이 열리게 함.
                        }}
                      >
                        자세히 보기
                      </span>
                    </span>
                  </label>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className={styles.flowSection}>
                <div className={styles.flowHero}>
                  <p className={styles.flowEyebrow}>WITHDAY SIGN UP</p>
                  <h2 className={styles.flowTitle}>계정 정보를 입력해주세요</h2>
                </div>
                
                <div className={styles.inputSpace}>
                  {/* FormField: 폼 UI의 일관성을 위해 만든 공통 컴포넌트. label과 error 객체만 props로 던져주면, 내부의 children(<Input>)과 조합하여 라벨-입력창-에러메세지 세트를 자동으로 완성해줌. */}
                  <FormField label="이메일" error={errors.email}>
                    <div className={styles.inputRow}>
                      <div className={styles.flex1}>
                        {/* {...register('email')}: 이 input창을 폼(useForm)이 값을 추적해서, yup(보안규칙)의 'email'규칙과 연결시킴 */}
                        <Input
                          type="email"
                          placeholder="example@withday.com"
                          // 이전 프로젝트에서는 {...register("")} 대신 아래 주석과 같이 사용했었음. 이번엔 react-hook-form 라이브러리를 활용해서 함.
                          // name="email"
                          // value={member.email}
                          // onChange={(e) => {
                          //   setMember({ ...member, [e.target.name]: e.target.value });
                          // }}
                          {...register("email")}
                          readOnly={mailAuth > 0} // 이메인 인증하기를 한 번이라도 클릭했으면(mailAuth > 0), 이메일 주소를 수정하지 못하게 readOnly로 바꿈.
                        />
                      </div>
                      <Button
                        type="button"
                        variant="primary"
                        onClick={handleSendMail}
                        disabled={mailAuth === 1 || mailAuth === 3} // 인증번호를 보내는중(mailAuth === 1)이거나 인증이 완료된 상태(mailAuth === 3)이면 disabled로 버튼 비활성화.
                        style={{ width: 'auto', fontSize: '13px' }}
                      >
                        {mailAuth >= 2 ? "재전송" : "인증번호 전송"}
                      </Button>
                    </div>
                  </FormField>

                  {/* 조건부 렌더링: 인증번호를 발송했을 때(mailAuth > 1)만 이 UI가 보임 */}
                  {mailAuth > 1 && (
                    <FormField label="인증번호 확인">
                      <div className={styles.inputRowCenter}>
                        <div className={styles.authInputWrap}>
                          <Input
                            type="text"
                            placeholder="인증코드 6자리"
                            value={mailAuthInput}
                            onChange={(e) => {
                              setMailAuthInput(e.target.value); // 입력한 값 실시간 저장
                            }}
                            disabled={mailAuth === 3} // 인증 완료(mailAuth === 3)면 disabled로 비활성화
                            style={{ paddingRight: "60px" }} // 타이머 자리 만큼 패딩 추가
                          />
                          {/* 인증 완료(mailAuth === 3)되기 전까지만 타이머를 보임. */}
                          {mailAuth !== 3 && <span className={styles.timerText}>{showTime()}</span>}
                        </div>
                        <Button
                          type="button"
                          variant="primary"
                          onClick={handleVerifyCode}
                          disabled={mailAuth === 3 || !mailAuthInput} // 인증 완료(mailAuth === 3)이거나 입력한 인증번호가 없으면(!mailAuthInput) disabled
                          style={{ width: 'auto', fontSize: '13px' }}
                        >
                          인증하기
                        </Button>
                      </div>
                      {/* 인증 완료(mailAuth === 3)되면 나오는 성공 텍스트 */}
                      {mailAuth === 3 && <p className={styles.successText}>✔ 이메일 인증이 완료되었습니다.</p>}
                    </FormField>
                  )}

                  <FormField label="비밀번호" error={errors.password}>
                    <div className={styles.pwInputWrap}>
                      <Input
                        type={showPw ? "text" : "password"} // showPw가 true면 글씨가 보이게, false면 가려지게
                        placeholder="8자리 이상"
                        {...register("password")}
                        style={{ paddingRight: "40px" }} // 눈아이콘 자리만큼 패딩 추가
                      />
                      {/* 비밀번호 표시/숨기기 아이콘 */}
                      <div
                        className={styles.pwIcon}
                        onClick={() => {
                          setShowPw(!showPw);
                        }}
                      >
                        {showPw ? (
                          <VisibilityOffIcon fontSize="small" />
                        ) : (
                          <VisibilityIcon fontSize="small" />
                        )}
                      </div>
                    </div>
                  </FormField>

                  <FormField label="비밀번호 확인" error={errors.passwordConfirm}>
                    <div className={styles.pwInputWrap}>
                      <Input
                        type={showPwConfirm ? "text" : "password"} // showPwConfirm가 true면 글씨가 보이게, false면 가려지게
                        placeholder="비밀번호를 다시 입력하세요"
                        {...register("passwordConfirm")}
                        style={{ paddingRight: "40px" }} // 눈아이콘 자리만큼 패딩 추가
                      />
                      {/* 비밀번호 표시/숨기기 아이콘 */}
                      <div
                        className={styles.pwIcon}
                        onClick={() => setShowPwConfirm(!showPwConfirm)}
                      >
                        {showPwConfirm ? (
                          <VisibilityOffIcon fontSize="small" />
                        ) : (
                          <VisibilityIcon fontSize="small" />
                        )}
                      </div>
                    </div>
                  </FormField>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className={styles.flowSection}>
                <div className={styles.flowHero}>
                  <p className={styles.flowEyebrow}>WITHDAY SIGN UP</p>
                  <h2 className={styles.flowTitle}>기본 정보를 입력해주세요</h2>
                </div>

                <div className={styles.stackLg}>
                  <FormField label="닉네임" error={errors.nickname}>
                    <Input type="text" placeholder="멋진 닉네임" {...register("nickname")} />
                  </FormField>

                  <FormField label="프로필 이미지" error={errors.profileImage}>
                    {/* type이 file이면 내 컴퓨터의 탐색기 창이 열림. accept="image/*"로 이미지만 선택 가능하게 필터링 */}
                    <Input type="file" accept="image/*" {...register("profileImage")} style={{ padding: '10px 14px' }} />
                  </FormField>

                  <FormField label="생년월일" error={errors.birthday}>
                    {/* max 속성을 오늘 날짜로 설정해서 미래의 날짜 선택 안되게함*/}
                    <Input type="date" max={todayDate} {...register("birthday")} />
                  </FormField>

                  <FormField label="성별" error={errors.gender}>
                    <div className={styles.radioGroup}>
                      {/* 둘 중 하나만 선택되는 라디오 버튼. 백엔드 규칙에 맞게 1(남자), 2(여자) 값 */}
                      <label className={styles.radioLabel}>
                        <input type="radio" value="1" {...register("gender")} /> 남
                      </label>
                      <label className={styles.radioLabel}>
                        <input type="radio" value="2" {...register("gender")} /> 여
                      </label>
                    </div>
                  </FormField>

                  <FormField label="전화번호" error={errors.phone}>
                    <Input type="tel" placeholder="010-1234-5678" {...register("phone")} />
                  </FormField>

                  <FormField label="주소" error={errors.postcode || errors.address}>
                    <div className={`${styles.inputRow} ${styles.marginBottom8}`}>
                      <div className={styles.flex1}>
                        <Input
                          type="text"
                          placeholder="우편번호"
                          readOnly // 주소 검색 버튼을 눌러서 우편번호가 자동으로 입력되게 함. 직접 타이핑을 막음.
                          {...register("postcode")}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        style={{ width: 'auto', fontSize: '13px' }}
                        onClick={() => {
                          setIsPostcodeOpen(true); // 주소 검색 버튼을 누르면 주소 검색 모달이 열리게 함.
                        }}
                      >
                        주소 검색
                      </Button>
                    </div>
                    <div className={styles.marginBottom8}>
                      <Input
                        type="text"
                        placeholder="기본 주소"
                        readOnly // 주소 검색 버튼을 눌러서 주소가 자동으로 입력되게 함. 직접 타이핑을 막음.
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
                </div>
              </div>
            )}

            {step === 4 && (
              <div className={styles.flowSectionWide}>
                <div className={styles.flowHero}>
                  <p className={styles.flowEyebrow}>WITHDAY SIGN UP</p>
                  <h2 className={styles.flowTitle}>관심사를 선택해주세요</h2>
                </div>
                <div className={styles.interestsContainer}>
                  <p>여기에 DB에서 불러온 관심사 칩(Chip)들이 들어갈 예정입니다!</p>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className={styles.completeArea}>
                <div className={styles.flowHero}>
                  <p className={styles.flowEyebrow}>WITHDAY SIGN UP</p>
                  <h2 className={styles.completeTitle}>가입이 완료되었습니다!</h2>
                  <p className={styles.autoRedirectText}>
                    잠시 후 로그인 페이지로 자동 이동합니다...
                  </p>
                </div>
                <div className={styles.celebration}>
                  <div className={`${styles.confetti} ${styles.c1}`} />
                  <div className={`${styles.confetti} ${styles.c2}`} />
                  <div className={`${styles.confetti} ${styles.c3}`} />
                  <div className={`${styles.confetti} ${styles.c4} ${styles.confettiWarning}`} />
                  <div className={styles.checkCircle}>
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {step < 5 && (
              <div className={styles.signupActions}>
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setStep((prev) => prev - 1)}
                  >
                    이전
                  </Button>
                )}

                {step < 4 ? (
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={handleNextStep}
                  >
                    다음으로
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? "가입하는 중..." : "회원가입 완료"}
                  </Button>
                )}
              </div>
            )}
          </form>

          {step < 5 && (
            <p className={styles.linkText} style={{ marginTop: '24px' }}>
              이미 계정이 있으신가요?{" "}
              <span className={styles.linkClickable} onClick={() => navigate("/login")}>
                로그인하기
              </span>
            </p>
          )}
        </div>
      </div>

      <div className={styles.imageSection}>
        <img 
          src="/withday_signup_bg.jpg" 
          alt="WithDay Background" 
          className={styles.bgImage} 
        />
        
        <div className={styles.imageOverlay}>
          <p className={styles.overlayLogo}>WITHDAY</p>
          <h1 className={styles.overlayTitle}>누군가와<br/>함께 떠나는 설렘</h1>
          {/* 소제목 삭제 완료 */}
        </div>
      </div>

      {/* MUI 알림창: toast 상태에 따라 화면 하단에 나타났다가 3초(autoHideDuration={3000ms}) 후 사라짐 */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ bottom: "80px !important" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      {/* 주소 검색 모달: isPostcodeOpen state에 따라 열리고 닫힘. 
          작은 화면에서는 꽉 찬 모달, 큰 화면에서는 적당한 크기의 모달이 됨. */}
      <Dialog
        open={isPostcodeOpen} // 주소 검색창 열릴지 말지 결정하는 state
        onClose={() => setIsPostcodeOpen(false)} // 주소 검색창 닫는 함수
        maxWidth="sm"
        fullWidth 
      >
        {/* DialogTitle(제목)의 sx prop으로 스타일링 */}
        <DialogTitle
          sx={{
            m: 0, // margin: 0
            p: 2, // padding: 2 (MUI의 spacing 단위, 기본적으로 8px이므로 16px)
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
        {/* DialogContent(내용)의 sx prop으로 스타일링, dividers는 구분선(가로줄)을 생성 */}
        <DialogContent dividers sx={{ p: 0 }}>
          {/* DaumPostcode 컴포넌트 */}
          <DaumPostcode
            onComplete={handleCompletePostcode} // 주소 선택 완료 시 실행되는 함수
            style={{ width: "100%", height: "400px" }}
          />
        </DialogContent>
      </Dialog>

      {/* 약관 모달: openTerms state에 따라 열리고 닫힘. 
          (openTerms에는 "TOS", "PRIVACY", "MARKETING" 중 하나가 들어감.) */}
      <Dialog
        open={openTerms !== null} // openTerms가 null이 아니면 약관 모달이 열림.
        onClose={() => setOpenTerms(null)}
        maxWidth="sm"
        fullWidth
      >
        {/* DialogTitle(제목)의 sx prop으로 스타일링, dividers는 구분선(가로줄)을 생성 */}
        <DialogTitle
          sx={{
            m: 0, // margin: 0
            p: 2, // padding: 2 (MUI의 spacing 단위, 기본적으로 8px이므로 16px)
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: "bold",
          }}
        >
          {/* openTerms가 null이 아니면 getTermTitle(openTerms)로 약관 제목을 띄움. null이면 빈칸. */}
          {openTerms ? getTermTitle(openTerms) : ""}
          <IconButton onClick={() => setOpenTerms(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        {/* DialogContent(내용)의 sx prop으로 스타일링 */}
        <DialogContent dividers>
          {/* pre 태그: 띄어쓰기나 줄바꿈(\n)을 무시하지 않고 있는 그대로 살려서 그려주는 HTML 태그 */}
          <pre className={styles.termPre}>
            {/* openTerms가 null이 아니면 getTermContent(openTerms)로 약관 내용을 띄움. null이면 빈칸. */}
            {openTerms ? getTermContent(openTerms) : ""}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Signup;
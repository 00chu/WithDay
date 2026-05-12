import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 담당하는 내비게이션 훅
import { useForm } from 'react-hook-form'; // 폼 상태(입력값, 에러 등)를 전역으로 관리해주는 핵심 훅
import { yupResolver } from '@hookform/resolvers/yup'; // Yup 규칙을 useForm이 이해할 수 있게 연결해주는 어댑터
import { useMutation, useQuery } from '@tanstack/react-query'; // 서버에 데이터를 '보낼 때(Mutation)', '가져올 때(Query)' 쓰는 훅

import DaumPostcode from 'react-daum-postcode'; // 카카오(다음)에서 제공하는 '주소 검색' 모달 띄우기용 라이브러리
import { Snackbar, Alert, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'; // MUI 컴포넌트: 알림창(Snackbar, Alert)과 팝업창(Dialog)
import CloseIcon from '@mui/icons-material/Close'; // 팝업창 닫기(X) 버튼 아이콘

import VisibilityIcon from '@mui/icons-material/Visibility'; // 비밀번호 보이기 아이콘
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'; // 비밀번호 숨기기 아이콘

import { signupSchema } from '../../features/auth/validation/authSchema'; // 우리가 만든 가입용 유효성 검사 규칙
import { signupUser, fetchTerms, sendEmailVerification } from '../../features/auth/api'; // 백엔드랑 통신하는 함수들
import FormField from '../../shared/ui/Form/FormField'; // [팀장님 래퍼 컴포넌트] 라벨과 에러 글씨를 예쁘게 묶어줌
import { Input } from '../../shared/ui/Form/Form'; // [팀장님 컴포넌트] 디자인이 들어간 기본 입력창
import Button from '../../shared/ui/Button/Button'; // [팀장님 컴포넌트] 디자인 버튼
import styles from './Auth.module.css'; // 이 화면 전용 CSS 스타일

const Signup = () => {
  const navigate = useNavigate(); // 이동 티켓
  // 💡 달력에서 미래 날짜를 선택하지 못하게 하려고 오늘 날짜를 "YYYY-MM-DD" 형태로 뽑아냄
  const todayDate = new Date().toISOString().split('T')[0]; 

  // [UI 상태 관리] 화면에 보이는 팝업/알림창들을 열고 닫는 스위치들
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' }); // 하단 알림창
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false); // 주소 찾기 팝업 스위치
  const [openTerms, setOpenTerms] = useState(null); // 약관 팝업 스위치 (어떤 약관을 열었는지 글자로 저장)

  const [showPw, setShowPw] = useState(false); // 첫 번째 비번 눈알 스위치
  const [showPwConfirm, setShowPwConfirm] = useState(false); // 두 번째 비번(확인용) 눈알 스위치
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false); // 유저가 [가입 완료] 버튼을 한 번이라도 눌렀는지 기억함 (에러 띄울 때 씀)

  // 📧 [이메일 인증 전용 상태들]
  // mailAuth: 현재 진행 단계 (0: 아무것도 안함, 1: 서버로 발송중, 2: 발송완료 및 타이머 도는중, 3: 인증 완벽히 성공!)
  const [mailAuth, setMailAuth] = useState(0); 
  const [mailAuthCode, setMailAuthCode] = useState(null); // 백엔드가 몰래 보내준 '진짜 정답 번호'
  const [mailAuthInput, setMailAuthInput] = useState(''); // 유저가 입력창에 열심히 치고 있는 번호
  
  const [time, setTime] = useState(180); // 180초 = 3분 타이머의 남은 시간
  // useRef: 값이 변해도 화면을 다시 그리지(렌더링) 않는 변수. 타이머(setInterval)의 고유 ID를 저장하는 '리모컨' 역할
  const timerRef = useRef(null); 

  // 하단 알림창 닫는 함수
  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') return;
    setToast((prev) => ({ ...prev, open: false }));
  };

  // 📋 React Hook Form: 폼 관리를 맡김
  const { register, handleSubmit, setValue, getValues, watch, formState: { errors } } = useForm({
    resolver: yupResolver(signupSchema), // yup 규칙대로 감시
    mode: 'onChange', // 타이핑할 때마다 실시간으로 에러를 잡아내거나 지워줌
    defaultValues: { // 약관 체크박스는 처음에 모두 false(체크해제) 상태로 시작
      agreeTos: false,
      agreePrivacy: false,
      agreeMarketing: false
    }
  });

  // 💡 [전체 동의 로직] watch로 3개의 체크박스를 째려보고 있다가, 3개 다 true면 allAgreed도 true가 됨
  const allAgreed = watch('agreeTos') && watch('agreePrivacy') && watch('agreeMarketing'); 
  // '전체 동의' 체크박스를 클릭했을 때 발동!
  const handleAgreeAll = (e) => {
    const isChecked = e.target.checked; // 현재 눌린 전체동의 박스가 true인지 false인지
    // setValue를 통해 강제로 나머지 3개 박스의 값을 똑같이 맞춰버림 (shouldValidate를 켜서 에러 메시지도 즉시 없애줌)
    setValue('agreeTos', isChecked, { shouldValidate: true });
    setValue('agreePrivacy', isChecked, { shouldValidate: true });
    setValue('agreeMarketing', isChecked, { shouldValidate: true });
  };

  // 📝 백엔드에서 약관 데이터 가져오기 (GET)
  const { data: termsData } = useQuery({ queryKey: ['terms'], queryFn: fetchTerms });

  // 모달창 띄울 때 넘겨받은 타입(TOS 등)에 따라 한글 제목을 돌려주는 헬퍼 함수
  const getTermTitle = (type) => {
    if (type === 'TOS') return '이용약관';
    if (type === 'PRIVACY') return '개인정보 수집 및 이용';
    if (type === 'MARKETING') return '마케팅 정보 수신';
    return '약관';
  };

  // 모달창 띄울 때 넘겨받은 타입에 해당하는 진짜 '내용'을 서버 데이터에서 찾아오는 함수
  const getTermContent = (type) => {
    if (!termsData) return '약관 데이터를 불러오는 중입니다...';
    const term = termsData.find(t => t.type === type);
    return term ? term.content : '약관 내용이 없습니다.';
  };

  // 🚀 [핵심] 최종 회원가입 백엔드 요청 (POST)
  const mutation = useMutation({
    mutationFn: signupUser, // api.js에 있는 회원가입 전송 함수
    onSuccess: () => {
      // 통신 성공! 딜레이 없이 즉시 로그인 페이지로 보내면서, 
      // location.state(보따리) 안에 'toastMessage'라는 이름으로 성공 쪽지를 써서 보냄!
      navigate('/login', { state: { toastMessage: '환영합니다! 회원가입이 완료되었습니다.' } });
    },
    onError: (error) => {
      // 실패하면 서버가 보낸 에러 메시지를 꺼내서 알림창에 띄움
      const errMsg = error.response?.data || '회원가입에 실패했습니다.';
      setToast({ open: true, message: errMsg, severity: 'error' });
    }
  });

  // 🏠 주소 찾기 팝업에서 유저가 주소를 딱! 클릭했을 때 실행되는 함수
  const handleCompletePostcode = (data) => {
    let fullAddress = data.address; // 카카오가 준 기본 주소
    let extraAddress = ''; // 괄호 안에 들어갈 추가 주소 (예: 아파트 이름)

    // 법정동이나 건물 이름이 있으면 조립해줌
    if (data.addressType === 'R') {
      if (data.bname !== '') extraAddress += data.bname;
      if (data.buildingName !== '') extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
      fullAddress += extraAddress !== '' ? ` (${extraAddress})` : ''; // 최종 완성: 인천 남동구 구월동 (ㅇㅇ아파트)
    }

    // 폼 안에 있는 postcode, address 필드에 조립한 값을 억지로 쑤셔넣음
    setValue('postcode', data.zonecode); 
    setValue('address', fullAddress); 
    setIsPostcodeOpen(false); // 주소 찾았으니 팝업은 닫아줌
  };

  // ✉️ [인증번호 전송] 버튼을 눌렀을 때
  const handleSendMail = async () => {
    const emailValue = getValues('email'); // 현재 이메일 칸에 적힌 글씨 가져오기
    if (!emailValue) { // 빈칸이면 욕먹음
      setToast({ open: true, message: '이메일을 먼저 입력해주세요.', severity: 'warning' });
      return;
    }

    // 전송 시작 전: 3분 타이머 초기화, 예전 정답 삭제, 혹시 돌고 있는 예전 타이머 정지
    setTime(180); 
    setMailAuthCode(null);
    if (timerRef.current) window.clearInterval(timerRef.current);

    setMailAuth(1); // 상태변경 -> 버튼 글씨가 '발송 중...'으로 바뀜
    setToast({ open: true, message: '인증번호를 발송 중입니다...', severity: 'info' });

    try {
      // 백엔드에 이메일 쏘고 응답 기다림
      const res = await sendEmailVerification(emailValue); 
      setToast({ open: true, message: '이메일로 인증번호가 발송되었습니다!', severity: 'success' });
      setMailAuthCode(String(res)); // 백엔드가 보내준 진짜 정답(숫자)을 문자로 바꿔서 숨겨둠
      setMailAuth(2); // 상태변경 -> 이제 유저가 입력할 차례!

      // 1초(1000ms)마다 1씩 숫자를 깎는 시한폭탄 타이머 가동
      timerRef.current = window.setInterval(() => {
        setTime((prev) => {
          if (prev <= 1) { // 시간이 0이 되면
            window.clearInterval(timerRef.current); // 타이머 멈춤
            setToast({ open: true, message: '인증 시간이 만료되었습니다. 다시 시도해주세요.', severity: 'warning' });
            setMailAuthCode(null); // 정답 폭파
            setMailAuth(0); // 다시 처음부터 해라!
            return 0;
          }
          return prev - 1; // 1초 감소
        });
      }, 1000);
    } catch (err) {
      setToast({ open: true, message: '이메일 발송에 실패했습니다. 이메일을 확인해주세요.', severity: 'error' });
      setMailAuth(0);
    }
  };

  // ✅ [인증하기] 버튼을 눌렀을 때
  const handleVerifyCode = () => {
    // 내가 입력한 값(mailAuthInput)과 숨겨둔 정답(mailAuthCode)이 완벽히 똑같다면?
    if (mailAuthCode === mailAuthInput && mailAuthInput !== "") {
      setMailAuth(3); // 상태변경 -> 인증 완벽히 통과! 쾅쾅!
      window.clearInterval(timerRef.current);  // 타이머는 이제 필요없으니 끔
      setToast({ open: true, message: '이메일 인증이 완료되었습니다.', severity: 'success' });
    } else {
      setToast({ open: true, message: '인증코드가 올바르지 않습니다.', severity: 'error' });
    }
  };

  // 180초를 3:00 처럼 사람이 보기 예쁜 분:초 형태로 바꿔주는 계산 함수
  const showTime = () => {
    const min = Math.floor(time / 60);
    const sec = String(time % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  // 📝 폼에서 [회원가입 완료] 찐 최종 제출 버튼을 눌렀을 때
  const onSubmit = (data) => {
    setIsSubmitAttempted(true); // "나 지금 가입 시도했음" 상태로 변경 (에러 메시지 띄우는 조건이 됨)

    // 인증 안 뚫고 몰래 가입 누르면 여기서 차단당함
    if (mailAuth !== 3) {
      setToast({ open: true, message: '이메일 인증을 완료해주세요.', severity: 'warning' });
      return;
    }

    /* 💡 [초핵심] 사진(파일)과 글씨(데이터)를 한 번에 백엔드로 보내려면 FormData라는 박스를 써야 합니다!
       일반 JSON 통신으로는 파일을 보낼 수 없기 때문입니다. */
    const formData = new FormData();
    
    // 백엔드의 SignupRequestDTO 모양에 똑같이 맞춰서 객체를 조립함
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
        MARKETING: data.agreeMarketing || false 
      }
    };

    // 박스 첫 번째 칸: 조립한 텍스트 덩어리를 문자열로 바꾸고(JSON.stringify), 이걸 또 파일 같은 덩어리(Blob)로 바꿔서 '얘는 json 데이터야' 하고 명찰을 달아 넣어줌
    formData.append('signupData', new Blob([JSON.stringify(signupData)], { type: 'application/json' }));
    
    // 박스 두 번째 칸: 유저가 넣은 프로필 사진 진짜 파일 원본을 그대로 넣어줌
    if (data.profileImage && data.profileImage[0]) {
      formData.append('profileImage', data.profileImage[0]);
    }

    // 백엔드로 박스 배달 출발!
    mutation.mutate(formData);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>WithDay 시작하기</h1>
          <p className={styles.subtitle}>새로운 동행을 찾아 떠나볼까요?</p>
        </div>

        {/* handleSubmit이 에러가 없으면 onSubmit 함수를 실행시켜줌 */}
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          
          <FormField label="이메일" error={errors.email}>
            <div className={styles.inputRow}>
              <div className={styles.flex1}>
                {/* 메일을 한 번이라도 보냈으면(mailAuth > 0), 이메일 주소를 수정하지 못하게 readOnly로 꽁꽁 묶어버림! */}
                <Input type="email" placeholder="example@withday.com" {...register('email')} readOnly={mailAuth > 0} />
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleSendMail} disabled={mailAuth === 1 || mailAuth === 3}>
                {mailAuth >= 2 ? "재전송" : "인증번호 전송"}
              </Button>
            </div>
            {/* 가입 버튼 눌렀는데 인증 통과 못했으면 에러 띄움 */}
            {isSubmitAttempted && mailAuth !== 3 && <p className={styles.errorText}>이메일 인증을 완료해주세요.</p>}
          </FormField>

          {/* 💡 조건부 렌더링: 인증번호를 발송했을 때(mailAuth > 1)만 이 UI가 화면에 나타남! */}
          {mailAuth > 1 && (
            <FormField label="인증번호 확인">
              <div className={styles.inputRowCenter}>
                <div className={styles.authInputWrap}>
                  <Input 
                    type="text" 
                    placeholder="인증코드 6자리" 
                    value={mailAuthInput} 
                    onChange={(e) => setMailAuthInput(e.target.value)} // 유저가 입력한 값을 실시간 저장
                    disabled={mailAuth === 3} // 인증 완료되면 더 못 건드리게 막음
                    style={{ paddingRight: '60px' }} // 타이머 숫자 자리 확보
                  />
                  {/* 인증 완료되기 전까지만 3:00 타이머 숫자를 보여줌 */}
                  {mailAuth !== 3 && <span className={styles.timerText}>{showTime()}</span>}
                </div>
                <Button type="button" variant="primary" size="sm" onClick={handleVerifyCode} disabled={mailAuth === 3 || !mailAuthInput}>
                  인증하기
                </Button>
              </div>
              {/* 통과하면 짜잔! 하고 나오는 성공 텍스트 */}
              {mailAuth === 3 && <p className={styles.successText}>✔ 이메일 인증이 완료되었습니다.</p>}
            </FormField>
          )}

          <FormField label="비밀번호" error={errors.password}>
            <div className={styles.pwInputWrap}>
              <Input type={showPw ? "text" : "password"} placeholder="8자리 이상" {...register('password')} style={{ paddingRight: '40px' }} />
              <div className={styles.pwIcon} onClick={() => setShowPw(!showPw)}>
                {showPw ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
              </div>
            </div>
          </FormField>
          
          <FormField label="비밀번호 확인" error={errors.passwordConfirm}>
            <div className={styles.pwInputWrap}>
              <Input type={showPwConfirm ? "text" : "password"} placeholder="비밀번호를 다시 입력하세요" {...register('passwordConfirm')} style={{ paddingRight: '40px' }} />
              <div className={styles.pwIcon} onClick={() => setShowPwConfirm(!showPwConfirm)}>
                {showPwConfirm ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
              </div>
            </div>
          </FormField>

          <FormField label="닉네임" error={errors.nickname}>
            <Input type="text" placeholder="멋진 닉네임" {...register('nickname')} />
          </FormField>
          
          <FormField label="프로필 이미지" error={errors.profileImage}>
            {/* type이 file이면 내 컴퓨터의 탐색기 창이 열림. accept="image/*"로 이미지만 선택 가능하게 필터링 */}
            <Input type="file" accept="image/*" {...register('profileImage')} />
          </FormField>
          
          <FormField label="생년월일" error={errors.birthday}>
            {/* max 속성으로 내일 날짜 선택 원천 봉쇄! */}
            <Input type="date" max={todayDate} {...register('birthday')} />
          </FormField>
          
          <FormField label="성별" error={errors.gender}>
            <div className={styles.radioGroup}>
              {/* 둘 중 하나만 선택되는 라디오 버튼. 백엔드 규칙에 맞게 1(남자), 2(여자) 값이 전송됨 */}
              <label className={styles.radioLabel}><input type="radio" value="1" {...register('gender')} /> 남</label>
              <label className={styles.radioLabel}><input type="radio" value="2" {...register('gender')} /> 여</label>
            </div>
          </FormField>
          
          <FormField label="전화번호" error={errors.phone}>
            <Input type="tel" placeholder="010-1234-5678" {...register('phone')} />
          </FormField>

          <FormField label="주소" error={errors.postcode || errors.address}>
            <div className={`${styles.inputRow} ${styles.marginBottom8}`}>
              <div className={styles.flex1}>
                {/* readOnly: 키보드로 타자를 못 치게 막고, 무조건 주소 검색 버튼을 누르도록 유도 */}
                <Input type="text" placeholder="우편번호" readOnly {...register('postcode')} />
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsPostcodeOpen(true)}>주소 검색</Button>
            </div>
            <div className={styles.marginBottom8}>
              <Input type="text" placeholder="기본 주소" readOnly {...register('address')} />
            </div>
            <Input type="text" placeholder="상세 주소를 입력해주세요" {...register('detailAddress')} error={errors.detailAddress} />
          </FormField>

          <div className={styles.termsContainer}>
            <label className={styles.termLabelAll}>
              <input type="checkbox" checked={allAgreed} onChange={handleAgreeAll} />
              <span className={styles.termText}>이용약관 전체 동의합니다.</span>
            </label>

            <label className={styles.termLabel}>
              <input type="checkbox" {...register('agreeTos')} />
              <span className={styles.termText}>[필수] 이용약관에 동의합니다.</span>
              {/* 약관 '보기' 글씨. e.preventDefault()로 이걸 눌러도 체크박스가 체크 안 되게 막고, 모달만 열리게 함! */}
              <span className={styles.termLink} onClick={(e) => { e.preventDefault(); setOpenTerms('TOS'); }}>보기</span>
            </label>
            {errors.agreeTos && <p className={styles.termError}>{errors.agreeTos.message}</p>}

            <label className={styles.termLabel}>
              <input type="checkbox" {...register('agreePrivacy')} />
              <span className={styles.termText}>[필수] 개인정보 수집 및 이용에 동의합니다.</span>
              <span className={styles.termLink} onClick={(e) => { e.preventDefault(); setOpenTerms('PRIVACY'); }}>보기</span>
            </label>
            {errors.agreePrivacy && <p className={styles.termError}>{errors.agreePrivacy.message}</p>}

            <label className={styles.termLabel}>
              <input type="checkbox" {...register('agreeMarketing')} />
              <span className={styles.termText}>[선택] 마케팅 정보 수신에 동의합니다.</span>
              <span className={styles.termLink} onClick={(e) => { e.preventDefault(); setOpenTerms('MARKETING'); }}>보기</span>
            </label>
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth disabled={mutation.isPending}>
            {mutation.isPending ? '가입하는 중...' : '회원가입 완료'}
          </Button>
        </form>
        <p className={styles.linkText}>
          이미 계정이 있으신가요? <span className={styles.linkClickable} onClick={() => navigate('/login')}>로그인하기</span>
        </p>
      </div>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={handleCloseToast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }}>{toast.message}</Alert>
      </Snackbar>

      <Dialog open={isPostcodeOpen} onClose={() => setIsPostcodeOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          주소 검색
          <IconButton onClick={() => setIsPostcodeOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <DaumPostcode onComplete={handleCompletePostcode} style={{ width: '100%', height: '400px' }} />
        </DialogContent>
      </Dialog>

      <Dialog open={openTerms !== null} onClose={() => setOpenTerms(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
          {openTerms ? getTermTitle(openTerms) : ''}
          <IconButton onClick={() => setOpenTerms(null)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {/* pre 태그: 띄어쓰기나 줄바꿈(\n)을 무시하지 않고 있는 그대로 살려서 그려주는 고마운 HTML 태그! */}
          <pre className={styles.termPre}>
            {openTerms ? getTermContent(openTerms) : ''}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Signup;
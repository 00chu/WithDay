import * as yup from 'yup';

// 💡 상수(Constant) 설정: 유지보수를 편하게 하기 위해 나이 제한을 상단 변수로 뺍니다.
// 이렇게 하면 나중에 기획팀에서 "나이 제한을 20세로 바꿔주세요!"라고 요청했을 때,
// 코드 아래쪽을 다 뒤질 필요 없이 여기 숫자만 '20'으로 1초 만에 바꾸면 끝납니다.
const MIN_AGE = 18;

// ==========================================
// 1. 회원가입용 검사 규칙 (Schema)
// ==========================================
export const signupSchema = yup.object().shape({
  
  // string(): 문자열 타입이어야 함
  // required(): 값이 비어있으면 안 됨 (필수값)
  // email(): 문자열 안에 '@'와 '.'이 규칙에 맞게 들어있는지 자동으로 정규식 검사를 해줌
  email: yup.string()
    .required('이메일은 필수 입력입니다.')
    .email('올바른 이메일 형식이 아닙니다.'),
    
  password: yup.string()
    .required('비밀번호는 필수 입력입니다.')
    .min(8, '비밀번호는 최소 8자리 이상이어야 합니다.'),
    
  // 💡 [핵심] 비밀번호 확인 로직
  // yup.ref('password')는 바로 위에 있는 'password' 필드의 현재 값을 거울처럼 실시간으로 참조합니다.
  // oneOf([A, B])는 "입력값이 배열 안에 있는 A나 B 중 하나와 무조건 같아야 해!"라는 뜻입니다.
  // 즉, 아래 코드는 "입력값이 password 필드의 값과 완벽히 똑같아야만 통과시켜줄게!"라는 의미입니다.
  passwordConfirm: yup.string()
    .oneOf([yup.ref('password'), null], '비밀번호가 일치하지 않습니다.')
    .required('비밀번호 확인을 입력해주세요.'),

  nickname: yup.string()
    .required('닉네임을 입력해주세요.'),
  
  // 💡 생년월일 & 만 나이 검사 (Custom Validation 로직)
  // 기본 제공 함수가 없을 때는 '.test()' 함수를 써서 우리가 직접 검사 규칙을 만듭니다.
  // 형태: .test('규칙이름', '실패시 에러메시지', (현재입력값) => { 검사로직(참/거짓 반환) })
  birthday: yup.string()
    .required('생년월일을 선택해주세요.')
    
    // 검사 1: 미래의 날짜인지 방어
    .test('is-past', '미래의 날짜는 선택할 수 없습니다.', (value) => {
      if (!value) return false; // 값이 아예 없으면 에러(false) 반환
      
      // 오늘 날짜를 "YYYY-MM-DD" 형태로 만듭니다.
      const today = new Date().toISOString().split('T')[0]; 
      
      // 문자열끼리 비교합니다. (예: "2026-05-12" <= "2026-05-16")
      // 입력값이 오늘이거나 과거여야만 통과(true) 시켜줍니다.
      return value <= today; 
    })
    
    // 검사 2: 만 나이 계산법 적용
    .test('is-old-enough', `만 ${MIN_AGE}세 이상만 가입 가능합니다.`, (value) => {
      if (!value) return false;
      
      const today = new Date();
      const birthDate = new Date(value); // 유저가 선택한 "YYYY-MM-DD"를 Date 객체로 변환
      
      // 올해 연도 - 태어난 연도 = 일단 단순 나이를 구합니다.
      let age = today.getFullYear() - birthDate.getFullYear();
      
      // 월(Month)끼리 빼서 생일이 지났는지 확인합니다.
      const monthDifference = today.getMonth() - birthDate.getMonth();
      
      // 생일 달이 아직 안 왔거나(음수), 달은 같은데 날짜가 아직 안 지났다면 생일이 안 지난 겁니다.
      // 이 경우 아직 한 살을 더 먹지 않았으므로 나이에서 1을 빼줍니다. (정확한 만 나이 계산)
      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      // 계산된 만 나이가 기준(18)보다 크거나 같아야만 최종 통과(true)!
      return age >= MIN_AGE; 
    }),
    
  gender: yup.string().required('성별을 선택해주세요.'),
  phone: yup.string().required('전화번호를 입력해주세요.'),
  postcode: yup.string().required('우편번호를 검색해주세요.'),
  address: yup.string().required('주소를 입력해주세요.'),
  detailAddress: yup.string().required('상세 주소를 입력해주세요.'),

  // 💡 체크박스(Boolean) 검사 로직
  // 체크박스는 true(체크됨) 아니면 false(체크안됨) 값만 가집니다.
  agreeTos: yup.boolean()
    // 필수로 동의해야 하므로, 값이 무조건 'true'여야만 통과시킵니다.
    .oneOf([true], '[필수] 이용약관 동의는 필수입니다.')
    .required(),
    
  agreePrivacy: yup.boolean()
    .oneOf([true], '[필수] 개인정보 수집 및 이용 동의는 필수입니다.')
    .required(),
    
  // 선택 항목(마케팅 동의)은 필수(required)가 아니므로, 체크를 안 했을 때의 기본값(default)만 false로 잡아줍니다.
  agreeMarketing: yup.boolean().default(false)
});


// ==========================================
// 2. 로그인용 검사 규칙 (Schema)
// ==========================================
export const loginSchema = yup.object().shape({
  email: yup.string()
    .required('이메일을 입력해주세요.')
    .email('올바른 이메일 형식이 아닙니다.'),
  password: yup.string()
    .required('비밀번호를 입력해주세요.')
});


// ==========================================
// 3. 소셜 로그인 추가 정보용 검사 규칙 (Schema)
// ==========================================
export const socialExtraSchema = yup.object().shape({
  // 💡 구글에서 이메일, 닉네임, 프사를 받아오기 때문에 해당 검사는 제외되었습니다.
  
  birthday: yup.string()
    .required('생년월일을 선택해주세요.')
    .test('is-past', '미래의 날짜는 선택할 수 없습니다.', (value) => {
      if (!value) return false;
      const today = new Date().toISOString().split('T')[0];
      return value <= today; 
    })
    .test('is-old-enough', `만 18세 이상만 가입 가능합니다.`, (value) => {
      if (!value) return false;
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();
      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 18; 
    }),
    
  gender: yup.string().required('성별을 선택해주세요.'),
  phone: yup.string().required('전화번호를 입력해주세요.'),
  postcode: yup.string().required('우편번호를 검색해주세요.'),
  address: yup.string().required('주소를 입력해주세요.'),
  detailAddress: yup.string().required('상세 주소를 입력해주세요.'),

  agreeTos: yup.boolean().oneOf([true], '[필수] 이용약관 동의는 필수입니다.').required(),
  agreePrivacy: yup.boolean().oneOf([true], '[필수] 개인정보 수집 및 이용 동의는 필수입니다.').required(),
  agreeMarketing: yup.boolean().default(false)
});
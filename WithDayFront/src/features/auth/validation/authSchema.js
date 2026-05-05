import * as yup from 'yup';

// 💡 나이 제한 상수 (원하는 나이로 언제든 변경 가능!)
const MIN_AGE = 18;

// 1. 회원가입용 검사 규칙
export const signupSchema = yup.object().shape({
  email: yup.string().required('이메일은 필수 입력입니다.').email('올바른 이메일 형식이 아닙니다.'),
  password: yup.string().required('비밀번호는 필수 입력입니다.').min(8, '비밀번호는 최소 8자리 이상이어야 합니다.'),
  nickname: yup.string().required('닉네임을 입력해주세요.'),
  
  // 💡 생년월일 검사 대폭 강화!
  birthday: yup.string()
    .required('생년월일을 선택해주세요.')
    .test('is-past', '미래의 날짜는 선택할 수 없습니다.', (value) => {
      if (!value) return false;
      const today = new Date().toISOString().split('T')[0];
      return value <= today; 
    })
    // 💡 나이 제한 검사 로직 추가 (만 나이 계산법 적용)
    .test('is-old-enough', `만 ${MIN_AGE}세 이상만 가입 가능합니다.`, (value) => {
      if (!value) return false;
      
      const today = new Date();
      const birthDate = new Date(value);
      
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();
      
      // 생일이 아직 안 지났으면 한 살 빼기 (정확한 만 나이 계산)
      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age >= MIN_AGE;
    }),
    
  gender: yup.string().required('성별을 선택해주세요.'),
  phone: yup.string().required('전화번호를 입력해주세요.'),
  postcode: yup.string().required('우편번호를 검색해주세요.'),
  address: yup.string().required('주소를 입력해주세요.'),
  detailAddress: yup.string().required('상세 주소를 입력해주세요.'),

  agreeTos: yup.boolean()
    .oneOf([true], '[필수] 이용약관 동의는 필수입니다.')
    .required(),
    
  agreePrivacy: yup.boolean()
    .oneOf([true], '[필수] 개인정보 수집 및 이용 동의는 필수입니다.')
    .required(),
    
  agreeMarketing: yup.boolean().default(false)
});

// 2. 로그인용 검사 규칙
export const loginSchema = yup.object().shape({
  email: yup.string().required('이메일을 입력해주세요.').email('올바른 이메일 형식이 아닙니다.'),
  password: yup.string().required('비밀번호를 입력해주세요.')
});
import * as yup from 'yup';

// 1. 회원가입용 검사 규칙
export const signupSchema = yup.object().shape({
  email: yup.string().required('이메일은 필수 입력입니다.').email('올바른 이메일 형식이 아닙니다.'),
  password: yup.string().required('비밀번호는 필수 입력입니다.').min(8, '비밀번호는 최소 8자리 이상이어야 합니다.'),
  nickname: yup.string().required('닉네임을 입력해주세요.'),
  birthday: yup.string()
    .required('생년월일을 선택해주세요.')
    .test('is-past', '미래의 날짜는 선택할 수 없습니다.', (value) => {
      if (!value) return false;
      const today = new Date().toISOString().split('T')[0];
      return value <= today; 
    }),
  gender: yup.string().required('성별을 선택해주세요.'),
  phone: yup.string().required('전화번호를 입력해주세요.'),
  postcode: yup.string().required('우편번호를 검색해주세요.'),
  address: yup.string().required('주소를 입력해주세요.'),
  detailAddress: yup.string().required('상세 주소를 입력해주세요.'),

  // 💡 필수 약관: 반드시 true여야 함을 명시
  agreeTos: yup.boolean()
    .oneOf([true], '[필수] 이용약관 동의는 필수입니다.')
    .required(),
    
  agreePrivacy: yup.boolean()
    .oneOf([true], '[필수] 개인정보 수집 및 이용 동의는 필수입니다.')
    .required(),
    
  // 💡 선택 약관
  agreeMarketing: yup.boolean().default(false)
});

// 2. 로그인용 검사 규칙
export const loginSchema = yup.object().shape({
  email: yup.string().required('이메일을 입력해주세요.').email('올바른 이메일 형식이 아닙니다.'),
  password: yup.string().required('비밀번호를 입력해주세요.')
});
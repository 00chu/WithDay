import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@tanstack/react-query';

// 💡 MUI Snackbar, Alert 불러오기
import { Snackbar, Alert } from '@mui/material';

// 💡 Zustand 스토어 불러오기
import { useAuthStore } from '../../features/auth/store/authStore';

// 💡 구글 로그인 컴포넌트와 해독기 임포트 추가!
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

import { loginSchema } from '../../features/auth/validation/authSchema';
import { loginUser } from '../../features/auth/api';
import FormField from '../../shared/ui/Form/FormField';
import { Input } from '../../shared/ui/Form/Form';
import Button from '../../shared/ui/Button/Button';
import styles from './Auth.module.css';

const Login = () => {
  const navigate = useNavigate();
  
  // 💡 Zustand에서 로그인 함수 가져오기
  const setLogin = useAuthStore((state) => state.setLogin);

  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'error',
  });

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') return;
    setToast((prev) => ({ ...prev, open: false }));
  };

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onSubmit', 
  });

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      const { token, user } = data;
      setLogin(token, user); 

      setToast({
        open: true,
        message: '로그인에 성공했습니다! 환영합니다.',
        severity: 'success'
      });

      setTimeout(() => {
        navigate('/');
      }, 1000);
    },
    onError: (error) => {
      const errMsg = error.response?.data?.message || error.response?.data || error.message;
      setToast({
        open: true,
        message: `로그인 실패: ${typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg}`,
        severity: 'error'
      });
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  // 💡 구글 로그인 성공 시 실행될 함수 추가!
  const handleGoogleSuccess = (credentialResponse) => {
    // 1. 구글이 던져준 암호화된 토큰
    const encryptedToken = credentialResponse.credential;
    
    // 2. 토큰 내부 해독!
    const decodedPayload = jwtDecode(encryptedToken);
    
    // 3. 어떤 정보가 들어있는지 콘솔로 확인
    console.log("🔑 구글에서 넘어온 암호화된 토큰 원본: ", encryptedToken);
    console.log("🔓 해독된 유저 정보: ", decodedPayload);
    
    // TODO: 확인이 끝나면 다음 파트에서 이 정보를 백엔드로 보낼 예정입니다!
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>WithDay 로그인</h1>
          <p className={styles.subtitle}>당신의 여행 일정을 확인해보세요.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <FormField label="이메일" error={errors.email}>
            <Input type="email" placeholder="이메일을 입력하세요" {...register('email')} />
          </FormField>

          <FormField label="비밀번호" error={errors.password}>
            <Input type="password" placeholder="비밀번호를 입력하세요" {...register('password')} />
          </FormField>

          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            fullWidth 
            disabled={mutation.isPending}
          >
            {mutation.isPending ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        {/* 💡 구글 로그인 버튼 배치 (일반 로그인 버튼과 간격을 조금 둠) */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              console.log('구글 로그인 창 닫힘 또는 실패');
            }}
          />
        </div>

        <p className={styles.linkText}>
          아직 계정이 없으신가요? <span onClick={() => navigate('/signup')}>회원가입하기</span>
        </p>
      </div>

      <Snackbar 
        open={toast.open} 
        autoHideDuration={3000} 
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Login;
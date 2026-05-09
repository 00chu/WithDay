import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@tanstack/react-query';

import { Snackbar, Alert } from '@mui/material';

import { useAuthStore } from '../../features/auth/store/authStore';

import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

import { loginSchema } from '../../features/auth/validation/authSchema';
// 💡 googleLoginUser 임포트 추가
import { loginUser, googleLoginUser } from '../../features/auth/api';
import FormField from '../../shared/ui/Form/FormField';
import { Input } from '../../shared/ui/Form/Form';
import Button from '../../shared/ui/Button/Button';
import styles from './Auth.module.css';

const Login = () => {
  const navigate = useNavigate();
  
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

  // 일반 로그인 Mutation
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

  // 💡 구글 로그인 전용 Mutation
  const googleMutation = useMutation({
    mutationFn: googleLoginUser,
    onSuccess: (data) => {
      const { token, user } = data;
      setLogin(token, user); 

      setToast({
        open: true,
        message: '구글 계정으로 로그인되었습니다!',
        severity: 'success'
      });

      setTimeout(() => {
        navigate('/');
      }, 1000);
    },
    onError: (error) => {
      setToast({
        open: true,
        message: '구글 로그인 실패. 다시 시도해주세요.',
        severity: 'error'
      });
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  // 💡 구글 로그인 성공 시 백엔드로 데이터 쏘기
  const handleGoogleSuccess = (credentialResponse) => {
    const decodedPayload = jwtDecode(credentialResponse.credential);
    
    // 콘솔 출력 삭제, 백엔드로 보낼 객체 생성
    const googleData = {
      email: decodedPayload.email,
      nickname: decodedPayload.name,
      providerId: decodedPayload.sub,
      profileImage: decodedPayload.picture
    };

    // 백엔드로 발송
    googleMutation.mutate(googleData);
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
            disabled={mutation.isPending || googleMutation.isPending}
          >
            {mutation.isPending ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setToast({
                open: true,
                message: '구글 로그인 창이 닫혔거나 실패했습니다.',
                severity: 'error'
              });
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
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@tanstack/react-query';

import { Snackbar, Alert } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import { useAuthStore } from '../../features/auth/store/authStore';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

import { loginSchema } from '../../features/auth/validation/authSchema';
import { loginUser, googleLoginUser } from '../../features/auth/api';
import FormField from '../../shared/ui/Form/FormField';
import { Input } from '../../shared/ui/Form/Form';
import Button from '../../shared/ui/Button/Button';
import styles from './Auth.module.css';

const Login = () => {
  const navigate = useNavigate();
  const setLogin = useAuthStore((state) => state.setLogin);

  const [toast, setToast] = useState({ open: false, message: '', severity: 'error' });
  const [showPw, setShowPw] = useState(false); 

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
      setToast({ open: true, message: '로그인에 성공했습니다! 환영합니다.', severity: 'success' });
      setTimeout(() => navigate('/'), 1000);
    },
    onError: (error) => {
      const errMsg = error.response?.data?.message || error.response?.data || error.message;
      setToast({ open: true, message: `로그인 실패: ${typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg}`, severity: 'error' });
    }
  });

  const googleMutation = useMutation({
    mutationFn: googleLoginUser,
    onSuccess: (data, variables) => { // variables는 우리가 방금 구글로그인API로 던졌던 구글 정보!
      
      // 💡 백엔드에서 "등록 안 된 유저야!" 라고 신호를 줬을 때
      if (data.isRegistered === false) {
        setToast({ 
          open: true, 
          message: '환영합니다! 원활한 이용을 위해 추가 정보를 입력해주세요.', 
          severity: 'info' 
        });
        
        // 구글이 준 데이터를 보따리(state)에 싸서 페이지 이동시킵니다!
        setTimeout(() => navigate('/signup/extra', { state: { googleData: variables } }), 1000);

      } else {
        // 기존 회원이면 정상 로그인 처리
        const { token, user } = data;
        setLogin(token, user); 
        setToast({ open: true, message: '구글 계정으로 로그인되었습니다!', severity: 'success' });
        setTimeout(() => navigate('/'), 1000);
      }
    },
    onError: (error) => {
      setToast({ open: true, message: '구글 로그인 실패. 다시 시도해주세요.', severity: 'error' });
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  const handleGoogleSuccess = (credentialResponse) => {
    const decodedPayload = jwtDecode(credentialResponse.credential);
    const googleData = {
      email: decodedPayload.email,
      nickname: decodedPayload.name,
      providerId: decodedPayload.sub,
      profileImage: decodedPayload.picture
    };
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
            <div className={styles.pwInputWrap}>
              <Input 
                type={showPw ? "text" : "password"} 
                placeholder="비밀번호를 입력하세요" 
                {...register('password')} 
              />
              <div className={styles.pwIcon} onClick={() => setShowPw(!showPw)}>
                {showPw ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
              </div>
            </div>
          </FormField>

          <Button type="submit" variant="primary" size="lg" fullWidth disabled={mutation.isPending || googleMutation.isPending}>
            {mutation.isPending ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        <div className={styles.googleLoginWrap}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setToast({ open: true, message: '구글 로그인 창이 닫혔거나 실패했습니다.', severity: 'error' })}
          />
        </div>

        <p className={styles.linkText}>
          아직 계정이 없으신가요? <span className={styles.linkClickable} onClick={() => navigate('/signup')}>회원가입하기</span>
        </p>
      </div>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={handleCloseToast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }}>{toast.message}</Alert>
      </Snackbar>
    </div>
  );
};

export default Login;
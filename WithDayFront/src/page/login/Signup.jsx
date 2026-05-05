import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@tanstack/react-query';

import DaumPostcode from 'react-daum-postcode';
import { Snackbar, Alert, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { signupSchema } from '../../features/auth/validation/authSchema';
import { signupUser } from '../../features/auth/api';
import FormField from '../../shared/ui/Form/FormField';
import { Input } from '../../shared/ui/Form/Form';
import Button from '../../shared/ui/Button/Button';
import styles from './Auth.module.css'; 

const Signup = () => {
  const navigate = useNavigate();

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') return;
    setToast((prev) => ({ ...prev, open: false }));
  };

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(signupSchema),
    mode: 'onBlur', 
  });

  const mutation = useMutation({
    mutationFn: signupUser,
    onSuccess: () => {
      setToast({ open: true, message: '환영합니다! 회원가입이 완료되었습니다.', severity: 'success' });
      setTimeout(() => navigate('/login'), 1500);
    },
    onError: (error) => {
      const errMsg = error.response?.data?.message || error.response?.data || error.message;
      setToast({ open: true, message: `회원가입 실패: ${errMsg}`, severity: 'error' });
    }
  });

  const handleCompletePostcode = (data) => {
    let fullAddress = data.address; 
    let extraAddress = ''; 

    if (data.addressType === 'R') {
      if (data.bname !== '') extraAddress += data.bname;
      if (data.buildingName !== '') extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
      fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
    }

    setValue('postcode', data.zonecode);
    setValue('address', fullAddress); 
    setIsPostcodeOpen(false);

    if (window.naver && window.naver.maps) {
      window.naver.maps.Service.geocode({ query: data.address }, function(status, response) {
        if (status === window.naver.maps.Service.Status.ERROR) {
          setToast({ open: true, message: '좌표 변환 중 오류가 발생했습니다.', severity: 'error' });
          return;
        }
        
        if (response.v2.meta.totalCount > 0) {
          const item = response.v2.addresses[0];
          setValue('lat', parseFloat(item.y)); 
          setValue('lng', parseFloat(item.x)); 
          setToast({ open: true, message: '주소와 좌표가 성공적으로 입력되었습니다.', severity: 'success' });
        } else {
          setToast({ open: true, message: '정확한 좌표를 찾을 수 없는 주소입니다.', severity: 'warning' });
        }
      });
    } else {
      setToast({ open: true, message: '네이버 지도 API를 불러오지 못했습니다.', severity: 'error' });
    }
  };

  const onSubmit = (data) => {
    const { profileImage, ...restData } = data;
    
    // 💡 1. FormData 객체 생성
    const formData = new FormData();

    // 💡 2. 회원가입 데이터 객체 생성
    const signupData = {
      user: {
        ...restData,
        provider: 'local',
        lat: data.lat ? parseFloat(data.lat) : 0.0, 
        lng: data.lng ? parseFloat(data.lng) : 0.0, 
      },
      termsList: [] 
    };

    // 💡 3. JSON 데이터를 Blob으로 감싸서 'signupData'라는 이름으로 추가
    formData.append("signupData", new Blob([JSON.stringify(signupData)], {
      type: "application/json"
    }));

    // 💡 4. 파일 데이터 추가 (profileImage는 FileList이므로 [0]번 접근)
    if (profileImage && profileImage[0]) {
      formData.append("profileImage", profileImage[0]);
    }

    // 💡 5. 완성된 formData 전송
    mutation.mutate(formData);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>WithDay 시작하기</h1>
          <p className={styles.subtitle}>새로운 동행을 찾아 떠나볼까요?</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <FormField label="이메일" error={errors.email}>
            <Input type="email" placeholder="example@withday.com" {...register('email')} />
          </FormField>
          <FormField label="비밀번호" error={errors.password}>
            <Input type="password" placeholder="8자리 이상" {...register('password')} />
          </FormField>
          <FormField label="닉네임" error={errors.nickname}>
            <Input type="text" placeholder="멋진 닉네임" {...register('nickname')} />
          </FormField>
          <FormField label="프로필 이미지" error={errors.profileImage}>
            <Input type="file" accept="image/*" {...register('profileImage')} />
          </FormField>
          <FormField label="생년월일" error={errors.birthday}>
            <Input type="date" {...register('birthday')} />
          </FormField>
          <FormField label="성별" error={errors.gender}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <label><input type="radio" value="1" {...register('gender')} /> 남</label>
              <label><input type="radio" value="2" {...register('gender')} /> 여</label>
            </div>
          </FormField>
          <FormField label="전화번호" error={errors.phone}>
            <Input type="tel" placeholder="010-1234-5678" {...register('phone')} />
          </FormField>

          <FormField label="주소" error={errors.postcode || errors.address}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <Input type="text" placeholder="우편번호" readOnly {...register('postcode')} />
              <Button type="button" variant="outline" size="sm" onClick={() => setIsPostcodeOpen(true)}>주소 검색</Button>
            </div>
            <Input type="text" placeholder="기본 주소" readOnly {...register('address')} style={{ marginBottom: '8px' }}/>
            <Input type="text" placeholder="상세 주소를 입력해주세요" {...register('detailAddress')} error={errors.detailAddress} />
          </FormField>

          <input type="hidden" {...register('lat')} />
          <input type="hidden" {...register('lng')} />

          <Button type="submit" variant="primary" size="lg" fullWidth disabled={mutation.isPending}>
            {mutation.isPending ? '가입하는 중...' : '회원가입 완료'}
          </Button>
        </form>
        <p className={styles.linkText}>이미 계정이 있으신가요? <span onClick={() => navigate('/login')}>로그인하기</span></p>
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
    </div>
  );
};

export default Signup;
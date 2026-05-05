import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQuery } from '@tanstack/react-query';

import DaumPostcode from 'react-daum-postcode';
import { Snackbar, Alert, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { signupSchema } from '../../features/auth/validation/authSchema';
import { signupUser, fetchTerms } from '../../features/auth/api';
import FormField from '../../shared/ui/Form/FormField';
import { Input } from '../../shared/ui/Form/Form';
import Button from '../../shared/ui/Button/Button';
import styles from './Auth.module.css'; 

const Signup = () => {
  const navigate = useNavigate();

  const todayDate = new Date().toISOString().split('T')[0];

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
  
  const [openTerms, setOpenTerms] = useState(null);

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') return;
    setToast((prev) => ({ ...prev, open: false }));
  };

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(signupSchema),
    mode: 'onChange', 
    defaultValues: {
      agreeTos: false,
      agreePrivacy: false,
      agreeMarketing: false
    }
  });

  const { data: termsData } = useQuery({
    queryKey: ['terms'],
    queryFn: fetchTerms
  });

  const getTermTitle = (type) => {
    if (type === 'TOS') return '이용약관';
    if (type === 'PRIVACY') return '개인정보 수집 및 이용';
    if (type === 'MARKETING') return '마케팅 정보 수신';
    return '약관';
  };

  const getTermContent = (type) => {
    if (!termsData) return '약관 데이터를 불러오는 중입니다...';
    const term = termsData.find(t => t.type === type);
    return term ? term.content : '약관 내용이 없습니다.';
  };

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
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    
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

    formData.append('signupData', new Blob([JSON.stringify(signupData)], { type: 'application/json' }));
    
    if (data.profileImage && data.profileImage[0]) {
      formData.append('profileImage', data.profileImage[0]);
    }

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
            <Input type="date" max={todayDate} {...register('birthday')} />
          </FormField>
          <FormField label="성별" error={errors.gender}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <label style={{ cursor: 'pointer' }}><input type="radio" value="1" {...register('gender')} /> 남</label>
              <label style={{ cursor: 'pointer' }}><input type="radio" value="2" {...register('gender')} /> 여</label>
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

          <div className={styles.termsContainer}>
            <label className={styles.termLabel}>
              <input type="checkbox" {...register('agreeTos')} />
              <span className={styles.termText}>[필수] 이용약관에 동의합니다.</span>
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
        <p className={styles.linkText}>이미 계정이 있으신가요? <span onClick={() => navigate('/login')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>로그인하기</span></p>
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
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit', margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#333' }}>
            {openTerms ? getTermContent(openTerms) : ''}
          </pre>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Signup;
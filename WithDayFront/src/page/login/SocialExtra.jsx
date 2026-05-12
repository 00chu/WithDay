import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQuery } from '@tanstack/react-query';

import DaumPostcode from 'react-daum-postcode';
import { Snackbar, Alert, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { socialExtraSchema } from '../../features/auth/validation/authSchema';
import { fetchTerms, socialSignupUser } from '../../features/auth/api'; 

import FormField from '../../shared/ui/Form/FormField';
import { Input } from '../../shared/ui/Form/Form';
import Button from '../../shared/ui/Button/Button';
import styles from './Auth.module.css'; 

const SocialExtra = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const todayDate = new Date().toISOString().split('T')[0];

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
  const [openTerms, setOpenTerms] = useState(null);

  useEffect(() => {
    if (!location.state || !location.state.googleData) {
      alert("잘못된 접근입니다. 다시 로그인해주세요.");
      navigate('/login', { replace: true });
    }
  }, [location, navigate]);

  const googleData = location.state?.googleData || {}; 

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') return;
    setToast((prev) => ({ ...prev, open: false }));
  };

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(socialExtraSchema),
    mode: 'onChange', 
    defaultValues: {
      agreeTos: false,
      agreePrivacy: false,
      agreeMarketing: false
    }
  });

  const allAgreed = watch('agreeTos') && watch('agreePrivacy') && watch('agreeMarketing');
  const handleAgreeAll = (e) => {
    const isChecked = e.target.checked;
    setValue('agreeTos', isChecked, { shouldValidate: true });
    setValue('agreePrivacy', isChecked, { shouldValidate: true });
    setValue('agreeMarketing', isChecked, { shouldValidate: true });
  };

  const { data: termsData } = useQuery({ queryKey: ['terms'], queryFn: fetchTerms });

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

  const mutation = useMutation({
    mutationFn: socialSignupUser,
    onSuccess: () => {
      // 💡 딜레이 없이 즉시 로그인 페이지로 가면서 보따리에 성공 메시지 담기!
      navigate('/login', { state: { toastMessage: '회원가입이 완료되었습니다! 다시 로그인해주세요.' } });
    },
    onError: (error) => {
      const errMsg = error.response?.data || '가입에 실패했습니다.';
      setToast({ open: true, message: errMsg, severity: 'error' });
    }
  });

  const onSubmit = (data) => {
    const signupData = {
      user: {
        email: googleData.email,
        nickname: googleData.nickname,
        providerId: googleData.providerId,
        profileImage: googleData.profileImage,
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
        MARKETING: data.agreeMarketing
      }
    };

    mutation.mutate(signupData); 
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>조금만 더 알려주세요!</h1>
          <p className={styles.subtitle}>원활한 서비스 이용을 위해 필수 정보를 입력해주세요.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          
          <FormField label="생년월일" error={errors.birthday}>
            <Input type="date" max={todayDate} {...register('birthday')} />
          </FormField>
          
          <FormField label="성별" error={errors.gender}>
            <div className={styles.radioGroup}>
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
            {mutation.isPending ? '가입 처리 중...' : '추가 정보 입력 완료'}
          </Button>
        </form>
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
          <pre className={styles.termPre}>
            {openTerms ? getTermContent(openTerms) : ''}
          </pre>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default SocialExtra;
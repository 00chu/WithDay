import clsx from "clsx";
import styles from "./MyPageEdit.module.css";
import Cropper from "react-easy-crop";
import { uploadMypageProfileImage } from "../../features/user/mypage/api";
import { getCroppedImg } from "../../features/user/mypage/getCroppedImg";
import { useAuthStore } from "../../features/auth/store/authStore";
import { useState } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMypageEdit } from "../../features/user/mypage/useMypageEdit";
import EditCalendarOutlinedIcon from "@mui/icons-material/EditCalendarOutlined";
import {
  EyeClosedIcon,
  EyeIcon,
  LockIcon,
  BellIcon,
  BellOffIcon,
  UserRoundIcon,
  MessageCircleIcon,
  TagsIcon,
} from "lucide-react";

const MyPageEdit = () => {
  // authStore에서 로그인 유저 정보 가져오기
  const user = useAuthStore((state) => state.user);
  const email = user?.email;
  const navigate = useNavigate();
  const { editQuery, updateMutation } = useMypageEdit();
  console.log("editQuery.data", editQuery.data);
  const [nickname, setNickname] = useState("단이");
  const [showPw, setShowPw] = useState([false, false, false]);
  const [isNotiOn, setIsNotiOn] = useState(true);

  //사진 편집
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");

  const [intro, setIntro] = useState(
    "안녕하세요 단이입니다. 평소 여행을 다니면서 여행기록을 남기는 걸 좋아해요.",
  );

  const maxLength = 8;
  const maxIntroLength = 50;

  const passwordFields = [
    {
      label: "기존 비밀번호",
      placeholder: "현재 비밀번호를 입력하세요",
      key: "current",
    },
    {
      label: "새 비밀번호",
      placeholder: "새 비밀번호를 입력하세요",
      key: "newPw",
    },
    {
      label: "새 비밀번호 확인",
      placeholder: "새 비밀번호를 다시 입력하세요",
      key: "confirm",
    },
  ];

  const togglePassword = (idx) => {
    const newShowPw = [...showPw];
    newShowPw[idx] = !newShowPw[idx];
    setShowPw(newShowPw);
  };

  const [pwState, setPwState] = useState({
    current: "",
    newPw: "",
    confirm: "",
  });

  const handleNicknameChange = (e) => {
    if (e.target.value.length <= maxLength) setNickname(e.target.value);
  };

  const handleIntroChange = (e) => {
    if (e.target.value.length <= maxIntroLength) setIntro(e.target.value);
  };

  const isMatch = pwState.newPw === pwState.confirm && pwState.confirm !== "";
  const isError = pwState.confirm !== "" && !isMatch;
  const handlePwChange = (e, field) =>
    setPwState({ ...pwState, [field]: e.target.value });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nickname: "",
      phone: "",
      gender: "",
      intro: "",
      profileImage: "",
      interestIds: [],
      notificationAgreed: false,
      currentPassword: "",
      newPassword: "",
      newPasswordConfirm: "",
    },
  });

  // 백엔드에서 가져온 데이터로 초기값 세팅
  useEffect(() => {
    if (!editQuery.data) return;

    reset({
      nickname: editQuery.data.nickname ?? "",
      phone: editQuery.data.phone ?? "",
      gender: editQuery.data.gender ?? "",
      intro: editQuery.data.intro ?? "",
      profileImage: editQuery.data.profileImage ?? "",
      interestIds: editQuery.data.selectedInterestIds ?? [],
      notificationAgreed: editQuery.data.notificationAgreed ?? false,
      currentPassword: "",
      newPassword: "",
      newPasswordConfirm: "",
    });
    setNickname(editQuery.data.nickname ?? "");
    setIntro(editQuery.data.intro ?? "");
    setIsNotiOn(editQuery.data.notificationAgreed ?? false);
    setProfilePreview(editQuery.data.profileImage ?? "");
  }, [editQuery.data, reset]);

  const selectedInterestIds = watch("interestIds") ?? [];
  const notificationAgreed = watch("notificationAgreed");
  const profileImage = watch("profileImage");

  const isLocalUser = editQuery.data?.provider === "local";

  const handleToggleInterest = (interestId) => {
    const current = selectedInterestIds;

    if (current.includes(interestId)) {
      setValue(
        "interestIds",
        current.filter((id) => id !== interestId),
        { shouldValidate: true }
      );
      return;
    }

    setValue("interestIds", [...current, interestId], {
      shouldValidate: true,
    });
  };

  const validateForm = (formData) => {
    if (!formData.nickname.trim()) {
      alert("닉네임을 입력해주세요.");
      return false;
    }

    if (!formData.phone.trim()) {
      alert("연락처를 입력해주세요.");
      return false;
    }

    if (!formData.gender) {
      alert("성별을 선택해주세요.");
      return false;
    }

    if (!formData.interestIds || formData.interestIds.length === 0) {
      alert("관심사를 1개 이상 선택해주세요.");
      return false;
    }

    if (isLocalUser) {
      const hasCurrentPassword = !!formData.currentPassword;
      const hasNewPassword = !!formData.newPassword;
      const hasNewPasswordConfirm = !!formData.newPasswordConfirm;

      const wantsToChangePassword =
        hasCurrentPassword || hasNewPassword || hasNewPasswordConfirm;

      if (wantsToChangePassword) {
        if (!hasCurrentPassword || !hasNewPassword || !hasNewPasswordConfirm) {
          alert("비밀번호 변경 정보를 모두 입력해주세요.");
          return false;
        }

        if (formData.newPassword.length < 8) {
          alert("새 비밀번호는 8자 이상 입력해주세요.");
          return false;
        }

        if (formData.newPassword !== formData.newPasswordConfirm) {
          alert("새 비밀번호가 일치하지 않습니다.");
          return false;
        }
      }
    }
    return true;
  };

  // 이미지 편집
  const handleProfileFileChange = (e) => {

    const file = e.target.files?.[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setCropModalOpen(true);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    e.target.value = "";
  };

  const handleCropComplete = (_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const handleSaveCroppedImage = async () => {
    try {
      if (!selectedImage || !croppedAreaPixels) return;
      const croppedFile = await getCroppedImg(selectedImage, croppedAreaPixels);
      const result = await uploadMypageProfileImage(croppedFile);
      const imageUrl = result.profileImage;
      setProfilePreview(imageUrl);
      setValue("profileImage", imageUrl, { shouldValidate: true });
      setCropModalOpen(false);
      setSelectedImage(null);
      alert("프로필 이미지가 변경되었습니다.");
    } catch (error) {
      console.error(error);
      alert("프로필 이미지 변경 중 오류가 발생했습니다.");
    }
  };

  const onSubmit = () => {
    const formData = {
      nickname,
      phone: watch("phone"),
      gender: watch("gender"),
      intro,
      profileImage: watch("profileImage"),
      interestIds: selectedInterestIds,
      notificationAgreed: isNotiOn,

      currentPassword: pwState.current,
      newPassword: pwState.newPw,
      newPasswordConfirm: pwState.confirm,
    };

    if (!validateForm(formData)) return;

    const payload = {
      nickname: formData.nickname,
      phone: formData.phone,
      gender: Number(formData.gender),
      intro: formData.intro,
      profileImage: formData.profileImage,
      interestIds: formData.interestIds,
      notificationAgreed: formData.notificationAgreed,

      currentPassword: isLocalUser ? formData.currentPassword : "",
      newPassword: isLocalUser ? formData.newPassword : "",
      newPasswordConfirm: isLocalUser ? formData.newPasswordConfirm : "",
    };

    updateMutation.mutate(payload, {
      onSuccess: () => {
        alert("프로필이 수정되었습니다.");
        navigate("/mypage");
      },
      onError: (error) => {
        const message =
          error?.response?.data || "프로필 수정 중 오류가 발생했습니다.";
        alert(message);
      },
    });
  };

  if (!email) {
    return <div className={styles.container}>로그인이 필요합니다.</div>;
  }

  if (editQuery.isLoading) {
    return <div className={styles.container}>불러오는 중...</div>;
  }

  if (editQuery.isError) {
    return (
      <div className={styles.container}>
        마이페이지 수정 정보를 불러오지 못했습니다.
      </div>
    );
  }
  return (
    <div className={styles.container}>
      <h1 className={styles.headerTitle}>회원 정보 수정</h1>
      <div className={styles.content}>
        <div className={styles.profile}>
          <img
            src={profilePreview || editQuery.data?.profileImage || "/danE.jpg"}
            alt="프로필"
            className={styles.avatar}
          />
          <label className={styles.retouch_btn}>
            <EditCalendarOutlinedIcon />
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleProfileFileChange}
            />
          </label>
          <div className={styles.name}>{editQuery.data?.nickname}</div>
          <div className={styles.email}>{editQuery.data?.email}</div>
        </div>

        <div className={styles.formSide}>
          {/* 1. 닉네임 */}
          <div className={styles.group}>
            <div className={styles.groupTitle}>
              <UserRoundIcon size={18} />닉네임</div>
            <div className={styles.inputRow}>
              <span className={styles.fieldLabel}>닉네임</span>
              <div className={styles.inputWrapper}>
                <input
                  className={styles.input_name}
                  value={nickname}
                  maxLength={maxLength}
                  onChange={handleNicknameChange}
                />
                <span className={styles.charCount}>
                  {nickname.length} / {maxLength}
                </span>
              </div>
            </div>
          </div>

          {/* 2. 인사말 */}
          <div className={styles.group}>
            <div className={styles.groupTitle}>
              <MessageCircleIcon size={18} />
              <span>인사말</span>
            </div>
            <div className={styles.inputRow}>
              <span
                className={styles.fieldLabel}
                style={{ alignSelf: "flex-start", marginTop: "14px" }}
              >
                소갯말
              </span>
              <div className={styles.textareaContainer}>
                <textarea
                  className={styles.textarea}
                  value={intro}
                  maxLength={maxIntroLength}
                  onChange={handleIntroChange}
                  placeholder="나를 소개하는 문구를 입력하세요."
                />
                <span className={styles.charCountInside}>
                  {intro.length} / {maxIntroLength}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.groupTitle}>
            <TagsIcon size={18} />
            <span>관심사</span>
          </div>
          <div className={styles.groupTitle}>
            <span>주소</span>
          </div>
          <div className={styles.groupTitle}>
            <span>연락처</span>
          </div>

          {/* 3. 비밀번호 */}
          {isLocalUser && (
            <div className={styles.group}>
              <div className={styles.groupTitle}>
                <LockIcon size={18} />
                <span>비밀번호</span>
              </div>

              {passwordFields.map((field, i) => (
                <div className={styles.inputRow} key={i}>
                  <span className={styles.fieldLabel}>{field.label}</span>
                  <div className={styles.inputWrapper}>
                    <LockIcon className={styles.iconStart} size={20} />
                    <input
                      className={styles.input}
                      type={showPw[i] ? "text" : "password"}
                      placeholder={field.placeholder}
                      value={pwState[field.key]}
                      onChange={(e) => handlePwChange(e, field.key)}
                    />
                    <div
                      className={styles.iconEnd}
                      onClick={() => togglePassword(i)}
                    >
                      {showPw[i] ?
                        <EyeIcon size={20} />
                        :
                        <EyeClosedIcon size={20} />}
                    </div>
                  </div>
                </div>
              ))}
              <div className={styles.messageWrapper}>
                {isError ? (
                  <span className={styles.errorMsg}>
                    비밀번호가 일치하지 않습니다.
                  </span>
                ) : (
                  <span />
                )}
                <span className={styles.pw_text}>영문, 숫자 포함 8자 이상</span>
              </div>
            </div>
          )}

          {!isLocalUser && (
            <div className={styles.group}>
              <div className={styles.groupTitle}>비밀번호</div>
              <span className={styles.pw_text}>
                구글 로그인 계정은 비밀번호 변경을 지원하지 않습니다.
              </span>
            </div>
          )}
          {/* 4. 알림 설정 */}
          <div className={styles.group}>
            <div className={styles.groupTitle}>
              <BellIcon size={18} />
              <span>알림 설정</span></div>
            <div className={styles.inputRow}>
              <span className={styles.fieldLabel}>알림 수신 동의</span>
              <div className={styles.notiRow}>
                <span>위트 신청, 승인, 일정 관련 알림을 받아볼 수 있어요.</span>
                <button
                  type="button"
                  className={`${styles.notificationSwitch} ${isNotiOn ? styles.notificationSwitchOn : ""}`}
                  onClick={() => setIsNotiOn(!isNotiOn)}
                  aria-checked={isNotiOn}
                  role="switch"
                >
                  <div className={styles.notificationSwitchThumb}>
                    {isNotiOn ? (
                      <BellIcon
                        className={`${styles.notificationSwitchIcon} ${styles.iconOn}`}
                      />
                    ) : (
                      <BellOffIcon
                        className={`${styles.notificationSwitchIcon} ${styles.iconOff}`}
                      />
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnCancel}`}
              onClick={() => navigate(-1)}
            >
              취소
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSave}`}
              onClick={handleSubmit(onSubmit)}
              disabled={updateMutation.isPending}
            >
              저장하기
            </button>
          </div>

          {cropModalOpen && (
            <div className={styles.cropOverlay}>
              <div className={styles.cropModal}>
                <h3 className={styles.cropTitle}>프로필 이미지 조정</h3>

                <div className={styles.cropArea}>
                  <Cropper
                    image={selectedImage}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={handleCropComplete}
                  />
                </div>

                <div className={styles.zoomBox}>
                  <span>확대</span>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                  />
                </div>

                <div className={styles.cropButtons}>
                  <button
                    type="button"
                    className={styles.btnCancel}
                    onClick={() => {
                      setCropModalOpen(false);
                      setSelectedImage(null);
                    }}
                  >
                    취소
                  </button>

                  <button
                    type="button"
                    className={styles.btnSave}
                    onClick={handleSaveCroppedImage}
                  >
                    적용하기
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPageEdit;

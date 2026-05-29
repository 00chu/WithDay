import { useState } from "react";
import styles from "./MyPageEdit.module.css";
import { useNavigate } from "react-router-dom";
import EditCalendarOutlinedIcon from "@mui/icons-material/EditCalendarOutlined";
import {
  EyeClosedIcon,
  EyeIcon,
  LockIcon,
  BellIcon,
  BellOffIcon,
} from "lucide-react";

const MyPageEdit = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("단이");
  const [showPw, setShowPw] = useState([false, false, false]);
  const [isNotiOn, setIsNotiOn] = useState(true);
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

  return (
    <div className={styles.container}>
      <h1 className={styles.headerTitle}>회원 정보 수정</h1>
      <div className={styles.content}>
        <div className={styles.profile}>
          <img src="/danE.jpg" alt="프로필" className={styles.avatar} />
          <div className={styles.retouch_btn}>
            <EditCalendarOutlinedIcon />
          </div>
          <div className={styles.name}>단이</div>
          <div className={styles.email}>tiaqhfl@naver.com</div>
        </div>

        <div className={styles.formSide}>
          {/* 1. 닉네임 */}
          <div className={styles.group}>
            <div className={styles.groupTitle}>1. 닉네임</div>
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

          {/* 2. 비밀번호 */}
          <div className={styles.group}>
            <div className={styles.groupTitle}>2. 비밀번호</div>
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
                    {showPw[i] ? (
                      <EyeIcon size={20} />
                    ) : (
                      <EyeClosedIcon size={20} />
                    )}
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

          {/* 3. 인사말 */}
          <div className={styles.group}>
            <div className={styles.groupTitle}>3. 인사말</div>
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

          {/* 4. 알림 설정 */}
          <div className={styles.group}>
            <div className={styles.groupTitle}>4. 알림 설정</div>
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
              className={`${styles.btn} ${styles.btnCancel}`}
              onClick={() => navigate(-1)}
            >
              취소
            </button>
            <button className={`${styles.btn} ${styles.btnSave}`}>
              저장하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPageEdit;

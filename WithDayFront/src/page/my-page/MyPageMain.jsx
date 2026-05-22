import styles from "./MyPageMain.module.css";
import EditCalendarOutlinedIcon from '@mui/icons-material/EditCalendarOutlined';
import { useAuthStore } from "../../features/auth/store/authStore";
import Button from "../../shared/ui/Button/Button";
import { Coffee, Earth, FerrisWheel, Heart, Store, Utensils } from "lucide-react";

const MyPageMain = () => {
  const user = useAuthStore((state) => state.user);

  console.log(user);



  return (
    <div>
      <section>
        <div className={styles.profile_Box}>
          <div className={styles.profile_wrapper}>
            <div className={styles.profile}>
              <div className={styles.image_wrapper}>
                <img src="/danE.jpg" alt="우리딥 고양이" className={styles.danE}></img>
                <div className={styles.retouch_btn}>
                  <EditCalendarOutlinedIcon />
                </div>
              </div>
            </div>
            <div className={styles.profile_text}>
              <span className={styles.dan}>단이</span>
              <span className={styles.email}>tiaqhfl@nate.com</span>
            </div>
            {/*오른쪽 데이터들*/}
            <div className={styles.profile_summary}>
              <div className={styles.summary}>
                <span>MY Track</span>
                <span>6회</span>
              </div>
              <div className={styles.summary}>
                <span>Like Wits</span>
                <span>12명</span>
              </div>
              <div className={styles.summary}>
                <span>withDay 가입일</span>
                <span>3년</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className={styles.Inter_container}>
          <div className={styles.Interest}>Interest | 나의 관심사</div>
          <div className={styles.int_boxs}>
            <div className={styles.int_btn}>
              <Earth size={18} /> <span>여행</span>
            </div>
            <div className={styles.int_btn}>
              <Utensils size={18} /> <span>식사</span>
            </div>
            <div className={styles.int_btn}>
              <Coffee size={18} /> <span>문화</span>
            </div>
            <div className={styles.int_btn}>
              <Store size={18} /> <span>팝업</span>
            </div>
            <div className={styles.int_btn}>
              <FerrisWheel size={18} /> <span>액티비티</span>
            </div>
          </div>
          <div className={styles.intro_box}>
            <div className={styles.intro}>
              <span>소갯말</span>
            </div>
            <div className={styles.intro_text}>
              <span>안녕하세요 단이입니다.평소 여행을 다니면서 여행기록을 남기는 걸 좋아해요.<br></br>
                조용하고 힐링되는 그런 곳을 즐겨 다닙니다.  저와 비슷한 위트님이 계시다면 같이 여행 다니면 좋을 것 같아요♡
              </span>
            </div>
          </div>
          <div className={styles.log_container}>
            <div className={styles.log_title}>
              <div>My Wit Log | 나의 위트 로그</div>
            </div>
            <div className={styles.scroll_wrapper}>
              <div className={styles.log_box}>
                <img src="/dog.jpg" alt="넘의집 강아디" className={styles.dog}></img>
                <img src="/dog.jpg" alt="넘의집 강아디" className={styles.dog}></img>
                <img src="/dog.jpg" alt="넘의집 강아디" className={styles.dog}></img>
                <img src="/dog.jpg" alt="넘의집 강아디" className={styles.dog}></img>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Button
        size="sm"
        variant="primary"
        onClick={() => useAuthStore.getState().setLogout()}
      >
        로그아웃
      </Button>
    </div>
  );
};

export default MyPageMain;


/*
    <div
      style={{
        padding: "40px 20px",
        fontFamily: "sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <style>{`
        @keyframes rainbow-move {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      <h2 style={{ fontSize: "2rem", marginBottom: "10px" }}>
        φ(゜▽゜*)♪ 마이페이지
      </h2>
      <p style={{ color: "#666", margin: "5px 0" }}>
        빠른 시일 내에 완공 될 예정입니다.
      </p>
      <p style={{ color: "#999", marginBottom: "30px", fontSize: "0.9rem" }}>
        양해해주셔서 감사합니다. - WithDay 일동
      </p>

      <div
        style={{
          background: "#f8fafc",
          padding: "25px",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          border: "1px solid #e2e8f0",
        }}
      >
        <p style={{ fontSize: "1.1rem", margin: "12px 0", color: "#334155" }}>
          어서오세요 닉네임:{" "}
          <span style={rainbowTextStyle}>{user.nickname}</span>님
        </p>
        <p style={{ fontSize: "1.1rem", margin: "12px 0", color: "#334155" }}>
          이메일: <span style={rainbowTextStyle}>{user.email}</span>
        </p>
        <Button
          size="sm"
          variant="primary"
          onClick={() => useAuthStore.getState().setLogout()}
        >
          로그아웃
        </Button>
      </div>
      </div>
      */
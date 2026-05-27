import styles from "./MyPageMain.module.css";
import EditCalendarOutlinedIcon from "@mui/icons-material/EditCalendarOutlined";
import { useAuthStore } from "../../features/auth/store/authStore";
import Button from "../../shared/ui/Button/Button";
import { useNavigate } from "react-router-dom";
import {
  Coffee,
  Earth,
  FerrisWheel,
  Heart,
  Store,
  Utensils,
  MapPin,
  Calendar,
  User,
} from "lucide-react";

const MyPageMain = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  return (
    <div>
      <section>
        <div className={styles.profile_Box}>
          <div className={styles.profile_wrapper}>
            <div className={styles.profile}>
              <div className={styles.image_wrapper}>
                <img
                  src="/danE.jpg"
                  alt="우리딥 고양이"
                  className={styles.danE}
                ></img>
                <div
                  className={styles.retouch_btn}
                  onClick={() => navigate(`/mypage/edit/${user.email}`)}
                >
                  <EditCalendarOutlinedIcon />
                </div>
              </div>
            </div>
            <div className={styles.profile_text}>
              <span className={styles.dan}>단이</span>
              <span className={styles.email}>tiaqhfl@nate.com</span>
              <Button
                className={styles.logout}
                size="sm"
                variant="primary"
                onClick={() => useAuthStore.getState().setLogout()}
              >
                로그아웃
              </Button>
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
              <span>
                안녕하세요 단이입니다.평소 여행을 다니면서 여행기록을 남기는 걸
                좋아해요.<br></br>
                조용하고 힐링되는 그런 곳을 즐겨 다닙니다. 저와 비슷한 위트님이
                계시다면 같이 여행 다니면 좋을 것 같아요♡
              </span>
            </div>
          </div>

          <div className={styles.log_container}>
            <div className={styles.log_title}>
              <div className={styles.Interest}>My Wit Log | 나의 위트 로그</div>
            </div>
            <div className={styles.scroll_wrapper}>
              <div className={styles.log_box}>
                <div className={styles.log_card}>
                  <img
                    src="/dog.jpg"
                    alt="넘의집 강아디"
                    className={styles.dog}
                  ></img>

                  {/* 이미지 하단 정보*/}
                  <div className={styles.card_bottom}>
                    <h3 className={styles.card_title}>
                      우리 같이 강아지 산책 가실 분
                    </h3>
                    <div className={styles.card_info_row}>
                      <div className={styles.card_info_item}>
                        <MapPin size={13} /> <span>서울 특별시</span>
                      </div>
                      <div className={styles.card_divider}></div>
                      <div className={styles.card_info_item}>
                        <Calendar size={13} /> <span>2026년 4월</span>
                      </div>
                      <div className={styles.card_divider}></div>
                      <div className={styles.card_info_item}>
                        <User size={13} /> <span>위트 3명</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.log_card}>
                  <img
                    src="/dog.jpg"
                    alt="넘의집 강아디"
                    className={styles.dog}
                  />
                  <div className={styles.card_bottom}>
                    <h3 className={styles.card_title}>강아지 카페 가실 분</h3>
                    <div className={styles.card_info_row}>
                      <div className={styles.card_info_item}>
                        <MapPin size={13} /> <span>제주특별자치도</span>
                      </div>
                      <div className={styles.card_divider}></div>
                      <div className={styles.card_info_item}>
                        <Calendar size={13} /> <span>2026년 5월</span>
                      </div>
                      <div className={styles.card_divider}></div>
                      <div className={styles.card_info_item}>
                        <User size={13} /> <span>위트 2명</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MyPageMain;

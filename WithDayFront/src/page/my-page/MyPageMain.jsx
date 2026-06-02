import styles from "./MyPageMain.module.css";
import EditCalendarOutlinedIcon from "@mui/icons-material/EditCalendarOutlined";
import { useAuthStore } from "../../features/auth/store/authStore";
import Button from "../../shared/ui/Button/Button";
import { useNavigate } from "react-router-dom";
import { useMypage } from "../../features/user/mypage/useMypage";
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
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { mypageQuery } = useMypage();

  console.log("mypageQuery 전체:", mypageQuery);

  if (mypageQuery.isLoading) {
    return <div>불러오는 중...</div>;
  }


  const mypage = mypageQuery.data;

  const nickname = mypage?.nickname || "닉네임";
  const email = mypage?.email || user?.email || "이메일 정보 없음";
  const profileImage = mypage?.profileImage || "/default-profile-240.png";
  const interests =
    mypage?.interests ??
    mypage?.interestNames ??
    mypage?.allInterests ??
    [];
  const selectedInterestIds = mypage?.selectedInterestIds ?? [];
  const allInterests = mypage?.allInterests ?? [];

  const selectedInterests = allInterests.filter((interest) =>
    selectedInterestIds.map(Number).includes(Number(interest.interestId ?? interest.id))
  );
  const intro =
    mypage?.intro ||
    "아직 등록된 소개글이 없습니다. 회원정보 수정에서 소개글을 작성해보세요.";
  const getInterestIcon = (interestName) => {
    switch (interestName) {
      case "여행":
        return <Earth size={18} />;
      case "식사":
        return <Utensils size={18} />;
      case "카페":
      case "문화":
        return <Coffee size={18} />;
      case "팝업":
        return <Store size={18} />;
      case "액티비티":
        return <FerrisWheel size={18} />;
      default:
        return <Heart size={18} />;
    }
  };

  return (
    <div>
      <section>
        <div className={styles.profile_Box}>
          <div className={styles.profile_wrapper}>
            <div className={styles.profile}>
              <div className={styles.image_wrapper}>
                <img
                  src={profileImage}
                  alt="프로필"
                  className={styles.profile_img}
                />
                <div
                  className={styles.retouch_btn}
                  onClick={() => navigate(`/mypage/edit/${user.email}`)}
                >
                  <EditCalendarOutlinedIcon />
                </div>
              </div>
            </div>
            <div className={styles.profile_text}>
              <span className={styles.my_nickname}>{nickname}</span>
              <span className={styles.my_email}>{email}</span>
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
                <span>함께한 일정</span>
                <span>2회</span>
                <span>참여가 완료된 일정 수</span>
              </div>
              <div className={styles.summary}>
                <span>만난 위트 수</span>
                <span>12명</span>
                <span>함께 만난 위트 수</span>
              </div>
              <div className={styles.summary}>
                <span>가입일</span>
                <span>2026.06.01</span>
                <span>처음 가입한 날짜</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className={styles.Inter_container}>
          <div className={styles.Interest}>Interest | 나의 관심사</div>

          <div className={styles.int_boxs}>
            {selectedInterests.length > 0 ? (
              selectedInterests.map((interest) => {
                const interestId = Number(interest.interestId ?? interest.id);
                const interestName = interest.interestName ?? interest.name;

                return (
                  <div className={styles.int_btn} key={interestId}>
                    {getInterestIcon(interestName)}
                    <span>{interestName}</span>
                  </div>
                );
              })
            ) : (
              <div className={styles.emptyInterest}>
                아직 선택한 관심사가 없습니다.
              </div>
            )}
          </div>

          <div className={styles.intro_box}>
            <div className={styles.intro}>
              <span>소갯말</span>
            </div>
            <div className={styles.intro_text}>
              <span>
                {intro}
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
                <div className={styles.emptyLogCard}>
                  <div className={styles.emptyLogIllustration}>
                    <MapPin size={26} className={styles.emptyPinLeft} />
                    <div className={styles.emptySuitcase}>▣</div>
                    <MapPin size={22} className={styles.emptyPinRight} />
                  </div>

                  <div className={styles.emptyLogTitle}>
                    아직 더 많은 위트 로그가 없어요.
                  </div>

                  <div className={styles.emptyLogDesc}>
                    새로운 일정에 참여하면 이곳에 기록돼요.
                  </div>

                  <button
                    type="button"
                    className={styles.emptyLogButton}
                    onClick={() => navigate("/explore")}
                  >
                    일정 보러가기
                  </button>
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

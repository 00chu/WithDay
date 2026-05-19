import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ChatIcon from "@mui/icons-material/Chat";
import PersonIcon from "@mui/icons-material/Person";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./BottomNav.module.css";
import { getAuthUser } from "../../features/auth/lib/getAuthUser";

const getTabValue = (pathname) => {
  if (pathname.startsWith("/explore")) {
    return 1;
  }
  if (pathname.startsWith("/write")) {
    return 2;
  }
  if (pathname.startsWith("/my-schedule")) {
    return 3;
  }
  if (pathname.startsWith("/login")) {
    return 4;
  }
  return 0;
};

export default function BottomNav() {
  const navigate = useNavigate();
  const loginUser = getAuthUser();
  const location = useLocation();
  const value = getTabValue(location.pathname);

  // 탭이 클릭될 때마다 실행될 함수
  const handleChange = (event, newValue) => {
    // 탭 인덱스(0~4)에 따라 알맞은 주소로 이동시키기
    switch (newValue) {
      case 0:
        navigate("/"); // 홈으로 이동
        break;
      case 1:
        navigate("/explore");
        break;
      case 2:
        navigate("/write"); // 추가 페이지
        break;
      case 3:
        navigate("/my-schedule");
        break;
      case 4: {
        if (loginUser && loginUser.email) {
          //마이페이지or로그인 보내기
          navigate(`/mypage/${loginUser.email}`);
        } else {
          navigate("/login");
        }
        break;
      }

      default:
        break;
    }
  };

  return (
    <div className={styles.wrapper}>
      <BottomNavigation
        className={styles.innerNav}
        value={value}
        onChange={handleChange}
        showLabels
      >
        <BottomNavigationAction label="홈" icon={<HomeIcon />} />
        <BottomNavigationAction label="탐색" icon={<SearchIcon />} />
        <BottomNavigationAction
          icon={<AddCircleIcon className={styles.addBtn} />}
        />
        <BottomNavigationAction label="내 일정" icon={<ChatIcon />} />
        <BottomNavigationAction label="마이" icon={<PersonIcon />} />
      </BottomNavigation>
    </div>
  );
}

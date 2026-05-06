import React, { useState } from "react";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ChatIcon from "@mui/icons-material/Chat";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";
import styles from "./BottomNav.module.css";

export default function BottomNav() {
  const [value, setValue] = useState(0);
  const navigate = useNavigate();

  // 탭이 클릭될 때마다 실행될 함수
  const handleChange = (event, newValue) => {
    setValue(newValue); // 클릭된 탭에 색깔이 들어오도록 상태 업데이트
    
    // 탭 인덱스(0~4)에 따라 알맞은 주소로 이동시키기
    switch (newValue) {
      case 0:
        navigate("/"); // 홈으로 이동
        break;
      case 1:
        // navigate("/search"); // 나중에 탐색 페이지 생기면 주석 해제
        break;
      case 2:
        // navigate("/add"); // 추가 페이지
        break;
      case 3:
        // navigate("/chat"); // 채팅 페이지
        break;
      case 4:
        navigate("/login"); // 마이 탭 누르면 로그인으로 이동
        break;
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
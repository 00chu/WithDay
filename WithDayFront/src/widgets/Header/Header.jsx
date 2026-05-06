import { useState } from "react";
import styles from "./Header.module.css";
import { IconButton, Menu, MenuItem, Button } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const REGIONS = [
  { label: "서울", value: "SEOUL" },
  { label: "경기", value: "GYEONGGI" },
  { label: "인천", value: "INCHEON" },
  { label: "부산", value: "BUSAN" },
  { label: "대구", value: "DAEGU" },
  { label: "광주", value: "GWANGJU" },
  { label: "대전", value: "DAEJEON" },
  { label: "울산", value: "ULSAN" },
  { label: "세종", value: "SEJONG" },
  { label: "강원", value: "GANGWON" },
  { label: "경북", value: "GYEONGBUK" },
  { label: "경남", value: "GYEONGNAM" },
  { label: "전북", value: "JEONBUK" },
  { label: "전남", value: "JEONNAM" },
  { label: "충북", value: "CHUNGBUK" },
  { label: "충남", value: "CHUNGNAM" },
  { label: "제주", value: "JEJU" },
];

export default function Header() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]); // 🌟 초기값을 객체로 설정

  const handleOpen = (e) => setAnchorEl(e.currentTarget);

  const handleClose = (region) => {
    // 🌟 region이 객체로 들어오므로 .label을 저장하도록 수정
    if (region && region.label) {
      setSelectedRegion(region);
    }
    setAnchorEl(null);
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {/* 지역 선택 버튼 */}
        <Button
          onClick={handleOpen}
          endIcon={<KeyboardArrowDownIcon />}
          className={styles.regionBtn}
        >
          {selectedRegion.label} {/* 🌟 .label 출력 */}
        </Button>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => handleClose(null)}
          // 🌟 메뉴가 너무 길어질 경우를 대비해 최대 높이 설정 (현업 필수)
          PaperProps={{
            style: {
              maxHeight: 300,
              width: "15ch",
            },
          }}
        >
          {REGIONS.map((region) => (
            <MenuItem
              key={region.value}
              onClick={() => handleClose(region)}
              selected={region.value === selectedRegion.value} // 🌟 현재 선택된 지역 표시
            >
              {region.label}
            </MenuItem>
          ))}
        </Menu>
      </div>

      <div className={styles.right}>
        <IconButton>
          <NotificationsIcon />
        </IconButton>
      </div>
    </header>
  );
}

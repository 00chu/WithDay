import { useState } from "react";
import styles from "./Header.module.css";
import { IconButton, Menu, MenuItem, Button } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useQuery } from "@tanstack/react-query";
import { getRegion } from "../../features/region/api";

const DEFAULT_REGION_OPTION = { label: "전체", value: "" };

const normalizeRegionValue = (value) => value?.trim() ?? "";

export default function Header({ selectedRegion, onRegionChange }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const { data: regions = [] } = useQuery({
    queryKey: ["header-region-options"],
    queryFn: getRegion,
    staleTime: 1000 * 60 * 10,
  });

  const regionOptions = [
    DEFAULT_REGION_OPTION,
    ...regions.map((region) => ({
      label: region.regionName,
      value: normalizeRegionValue(region.regionName),
    })),
  ];

  const selectedRegionValue = normalizeRegionValue(selectedRegion);
  const selectedRegionOption =
    regionOptions.find((region) => region.value === selectedRegionValue) ??
    DEFAULT_REGION_OPTION;

  const handleOpen = (e) => setAnchorEl(e.currentTarget);

  const handleClose = (region) => {
    if (region) {
      onRegionChange(normalizeRegionValue(region.value));
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
          {selectedRegionOption.label}
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
          {regionOptions.map((region) => (
            <MenuItem
              key={region.value}
              onClick={() => handleClose(region)}
              selected={region.value === selectedRegionOption.value}
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

import { useRef } from "react";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

export default function CommonSelect({
  label,
  value,
  onChange,
  options = [],
  fullWidth = true,
  size = "medium",
}) {
  const selectRef = useRef(null);

  return (
    <FormControl
      fullWidth={fullWidth}
      size={size}
      sx={{
        // select 전체 박스 (div) 속성
        "& .MuiOutlinedInput-root": {
          borderRadius: "8px",

          // mui outlined 스타일 테두리
          "& fieldset": {
            borderColor: "var(--color-primary)",
          },

          // mui outlined 스타일 테두리 - hover
          "&:hover fieldset": {
            borderColor: "var(--color-primary)",
          },

          // mui outlined 스타일 테두리 - focus
          "&.Mui-focused fieldset": {
            borderColor: "var(--color-primary)",
            borderWidth: "2px",
          },
        },

        // InputLabel 기본 글자색
        "& .MuiInputLabel-root": {
          color: "var(--color-primary)",
        },

        // InputLabel 글자색 - focus
        "& .MuiInputLabel-root.Mui-focused": {
          color: "var(--color-primary)",
        },

        // 드롭다운 화솔표 색
        "& .MuiSelect-icon": {
          color: "var(--color-primary)",
        },
      }}
    >
      <InputLabel shrink>{label}</InputLabel>

      {/* mui select - 내부 상태를 따로 관리하는 제어 컴포넌트 */}
      <Select
        ref={selectRef}
        value={value}
        label={label}
        displayEmpty
        renderValue={(selected) => {
          if (!selected) {
            return <span style={{ color: "#999" }}>{label}</span>;
          }

          return options.find((o) => o.value === selected)?.label;
        }}
        onChange={(e) => {
          onChange?.(e);

          // 선택 후 포커스 제거
          setTimeout(() => {
            //focus를 잡고 있는 내부 버튼/div요소를 ref로 직접 해제
            selectRef.current?.blur();
          }, 0);
        }}
        MenuProps={{
          // select 버튼 눌러도 스크롤 바 고정되게
          disableScrollLock: true,
        }}
      >
        {options
          .filter((option) => option.value !== "")
          .map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
}

import Popover from "@mui/material/Popover";
import NotificationList from "./NotificationList";

export default function NotificationPopover({ open, anchorEl, handleClose }) {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl} // 팝오버 컴포넌트가 붙을 기준 DOM 요소
      onClose={handleClose}
      anchorOrigin={{
        // 기준 DOM 요소의 어느 위치에 붙을지 설정
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        // 자신의 어느 위치를 기준점으로 사용할지 결정
        vertical: "top",
        horizontal: "right",
      }}
      slotProps={{
        paper: {
          //popover 내부 실제 박스 (paper)를 꾸미는 부분
          sx: {
            mt: 3,
            width: 480,
            maxWidth: "95vw",
            maxHeight: 600,
            overflowY: "auto",
            borderRadius: 2,
          },
        },
      }}
    >
      <NotificationList onClose={handleClose} />
    </Popover>
  );
}

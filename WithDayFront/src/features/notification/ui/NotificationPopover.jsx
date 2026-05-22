import Popover from "@mui/material/Popover";
import NotificationList from "./NotificationList";

export default function NotificationPopover({ open, anchorEl, handleClose }) {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      slotProps={{
        // 위치
        paper: {
          sx: {
            mt: 3, // 아래로
            width: 360,
            maxWidth: "90vw",
            borderRadius: 2,
          },
        },
      }}
    >
      <NotificationList onClose={handleClose} />
    </Popover>
  );
}

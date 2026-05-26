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
